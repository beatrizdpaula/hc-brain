/* =========================================================
   TELA PESQUISA
   Termo, escopo e filtros ficam no estado compartilhado: quem
   pesquisa no Início cai aqui com o resultado pronto, e as
   buscas recentes valem para todas as telas.
   ========================================================= */

import {
    carregarPesquisa,
    scopeToType,
    type ResultadoPesquisa,
} from "../dados/pesquisa.ts";
import { combina, termoDeBusca } from "../comum/busca.ts";
import { campo, dado, enviarComEnter, porId, selecao, todos } from "../comum/dom.ts";
import { atualizarSecao, observarEstado, obterSecao } from "../comum/estado.ts";
import { escapar, plural } from "../comum/formato.ts";
import { desenharIcones, icone } from "../comum/icones.ts";
import { showModal } from "../comum/modal.ts";
import { iniciarPagina } from "../comum/shell.ts";

iniciarPagina("pesquisa");

const entrada = campo("advancedSearchInput");
const resultados = porId("advancedResults");
const recentes = porId("recentSearches");
const limpar = porId("clearSearch");
const resultType = selecao("resultType");
const resultArea = selecao("resultArea");
const resultPeriod = selecao("resultPeriod");

const HOJE = new Date();
HOJE.setHours(0, 0, 0, 0);

// Quem chega do Início já trouxe o termo no estado, mas o HTML da tela nasce
// na versão "Buscas recentes". Sem este ajuste antes do await, o primeiro
// quadro mostra o cabeçalho errado e o aviso de carregamento das buscas
// recentes, e tudo salta de lugar quando os dados chegam.
prepararChegada();

const researchData = await carregarPesquisa();

function dataDoItem(item: ResultadoPesquisa): Date | null {
    const encontrado = item.meta.match(/(\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4})/);
    if (!encontrado) return null;
    const partes = encontrado[1].replace(/-/g, "/").split("/");
    if (partes.length !== 3) return null;
    return new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
}

function filtrar(): ResultadoPesquisa[] {
    const { termo, escopo, tipo, area, periodo } = obterSecao("pesquisa");
    const palavras = termoDeBusca(termo);

    const inicioSemana = new Date(HOJE);
    inicioSemana.setDate(HOJE.getDate() - HOJE.getDay());
    const inicioMes = new Date(HOJE.getFullYear(), HOJE.getMonth(), 1);

    return researchData.filter((item) => {
        const texto = [item.title, item.text, item.type, item.area].join(" ");
        const data = dataDoItem(item);

        let periodoOk = true;
        if (periodo !== "Qualquer período" && data) {
            if (periodo === "Hoje")
                periodoOk = data.toDateString() === HOJE.toDateString();
            else if (periodo === "Esta semana")
                periodoOk = data >= inicioSemana && data <= HOJE;
            else if (periodo === "Este mês")
                periodoOk = data >= inicioMes && data <= HOJE;
        }

        return (
            combina(texto, palavras) &&
            (tipo === "Tudo" || item.type === tipo) &&
            (area === "Todas" || item.area === area) &&
            (escopo === "Tudo" || item.type === scopeToType[escopo]) &&
            periodoOk
        );
    });
}

/**
 * Alinha a tela ao termo que já está no estado antes de os dados chegarem,
 * para o carregamento acontecer no lugar certo em vez de a página se
 * reorganizar na frente de quem acabou de clicar.
 */
function prepararChegada(): void {
    aplicarEstadoNosControles();

    const busca = obterSecao("pesquisa").termo.trim();

    // O número só é conhecido depois dos dados; um "0" aqui viraria outro
    // valor em seguida.
    porId("resultCount").textContent = "";

    if (!busca) return;

    recentes.hidden = true;
    limpar.hidden = false;
    porId("resultsTitle").textContent = "Resultados encontrados";
    resultados.innerHTML = `<div class="estado-carregando">Procurando por “${escapar(busca)}”…</div>`;
}

function renderRecentes(): void {
    const { recentes: lista } = obterSecao("pesquisa");

    recentes.innerHTML = lista.length
        ? lista
              .map(
                  (item) => `
            <button type="button" class="recent-card" data-query="${escapar(item.termo)}">
              <span class="recent-card-icon">${icone("search")}</span>
              <span class="recent-card-texto">
                <strong>${escapar(item.termo)}</strong>
                <small>${escapar(item.contexto)}</small>
              </span>
              <span class="recent-card-seta">${icone("arrow-right")}</span>
            </button>
          `,
              )
              .join("")
        : `<div class="empty-state">Nenhuma busca recente por aqui ainda.</div>`;

    todos("[data-query]", recentes).forEach((botao) => {
        botao.addEventListener("click", () =>
            atualizarSecao("pesquisa", { termo: dado(botao, "query") }),
        );
    });

    desenharIcones(recentes);
}

function renderResultados(): void {
    const { termo, recentes: lista } = obterSecao("pesquisa");
    const busca = termo.trim();
    const encontrados = filtrar();

    recentes.hidden = busca !== "";
    // Sem termo não há o que limpar: o × ficava aceso num campo vazio.
    limpar.hidden = busca === "";
    porId("resultsTitle").textContent = busca
        ? "Resultados encontrados"
        : "Buscas recentes";
    porId("resultCount").textContent = busca
        ? plural(encontrados.length, "resultado", "resultados")
        : plural(lista.length, "consulta", "consultas");

    if (!busca) {
        resultados.innerHTML = "";
        return;
    }

    if (!encontrados.length) {
        resultados.innerHTML = `
      <div class="empty-state">
        Nenhum resultado para “${escapar(busca)}”. Tente outro termo ou limpe os filtros.
      </div>
    `;
        return;
    }

    resultados.innerHTML = encontrados
        .map(
            (item) => `
        <button type="button" class="result-card" data-result="${escapar(item.title)}">
          <span class="result-type">${escapar(item.type)} • ${escapar(item.area)}</span>
          <h3>${escapar(item.title)}</h3>
          <p>${escapar(item.text)}</p>
          <span class="result-meta">${escapar(item.meta)}</span>
        </button>
      `,
        )
        .join("");

    todos("[data-result]", resultados).forEach((item) => {
        item.addEventListener("click", () => showModal(dado(item, "result")));
    });
}

function aplicarEstadoNosControles(): void {
    const { termo, escopo, tipo, area, periodo } = obterSecao("pesquisa");
    // Só reescreve o campo quando o valor realmente mudou, para não
    // mexer no cursor de quem está digitando.
    if (entrada.value !== termo) entrada.value = termo;
    resultType.value = tipo;
    resultArea.value = area;
    resultPeriod.value = periodo;

    todos(".search-chip[data-scope]").forEach((chip) => {
        chip.classList.toggle("active", chip.dataset.scope === escopo);
    });
}

function registrarBusca(termo: string): void {
    if (!termo.trim()) return;
    atualizarSecao("pesquisa", (atual) => ({
        ...atual,
        recentes: [
            { termo, contexto: "Pesquisa" },
            ...atual.recentes.filter((item) => item.termo !== termo),
        ].slice(0, 6),
    }));
}

const formulario = porId<HTMLFormElement>("advancedSearchForm");

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    atualizarSecao("pesquisa", { termo: entrada.value });
    registrarBusca(entrada.value);
});

enviarComEnter(entrada, formulario);

entrada.addEventListener("input", () =>
    atualizarSecao("pesquisa", { termo: entrada.value }),
);

porId("clearSearch").addEventListener("click", () => {
    atualizarSecao("pesquisa", { termo: "" });
    entrada.focus();
});

resultType.addEventListener("change", () =>
    atualizarSecao("pesquisa", { tipo: resultType.value }),
);
resultArea.addEventListener("change", () =>
    atualizarSecao("pesquisa", { area: resultArea.value }),
);
resultPeriod.addEventListener("change", () =>
    atualizarSecao("pesquisa", { periodo: resultPeriod.value }),
);

todos(".search-chip[data-scope]").forEach((chip) => {
    chip.addEventListener("click", () =>
        atualizarSecao("pesquisa", { escopo: dado(chip, "scope") }),
    );
});

porId("clearFilters").addEventListener("click", () => {
    atualizarSecao("pesquisa", {
        escopo: "Tudo",
        tipo: "Tudo",
        area: "Todas",
        periodo: "Qualquer período",
    });
});

porId("researchHelp").addEventListener("click", () => {
    showModal(
        "Como pesquisar",
        "Digite o nome de uma empresa, sócio, documento, projeto ou reunião. Use os filtros para encontrar resultados específicos.",
    );
});

observarEstado(["pesquisa"], () => {
    aplicarEstadoNosControles();
    renderRecentes();
    renderResultados();
});

aplicarEstadoNosControles();
renderRecentes();
renderResultados();
