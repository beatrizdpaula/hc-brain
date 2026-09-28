/* =========================================================
   TELA PROJETOS
   A carteira de projetos vem da API. O prazo é lido a partir de
   `diasRestantes`, calculado no servidor — o navegador não sabe
   qual é a data de referência do sistema.
   ========================================================= */

import {
    carregarProjetos,
    tagDaPrioridade,
    tagDoStatusDeProjeto,
    type Projeto,
} from "../dados/projetos.ts";
import type { CorTag } from "../dados/empresas.ts";
import { campo, dado, porId, selecao, todos } from "../comum/dom.ts";
import { escapar, plural } from "../comum/formato.ts";
import { desenharIcones, icone } from "../comum/icones.ts";
import { showModal } from "../comum/modal.ts";
import { iniciarPagina } from "../comum/shell.ts";

iniciarPagina("projetos");

const grid = porId("projetosGrid");
const busca = campo("projetoSearch");
const statusFiltro = selecao("projetoStatusFilter");
const areaFiltro = selecao("projetoAreaFilter");

const projetos = await carregarProjetos();

// As áreas do filtro saem dos próprios projetos: uma área nova na base
// aparece aqui sem ninguém editar a lista.
for (const area of [...new Set(projetos.map((projeto) => projeto.area))].sort()) {
    const opcao = document.createElement("option");
    opcao.value = area;
    opcao.textContent = area;
    areaFiltro.appendChild(opcao);
}

/** Como o prazo é lido: atrasado, apertado ou tranquilo. */
function prazo(projeto: Projeto): { texto: string; cor: CorTag } {
    if (projeto.diasRestantes < 0) {
        return { texto: `${Math.abs(projeto.diasRestantes)} dias em atraso`, cor: "red" };
    }
    if (projeto.diasRestantes <= 30) {
        return { texto: `Faltam ${projeto.diasRestantes} dias`, cor: "yellow" };
    }
    return { texto: `Entrega em ${projeto.prazo}`, cor: "gray" };
}

function projetosFiltrados(): Projeto[] {
    const termo = busca.value.toLowerCase().trim();

    return projetos.filter((projeto) => {
        const texto =
            `${projeto.nome} ${projeto.descricao} ${projeto.responsavel} ${projeto.empresa ?? ""}`.toLowerCase();
        return (
            (!termo || texto.includes(termo)) &&
            (statusFiltro.value === "Todos" || projeto.status === statusFiltro.value) &&
            (areaFiltro.value === "Todas" || projeto.area === areaFiltro.value)
        );
    });
}

function renderKpis(): void {
    const emAndamento = projetos.filter(
        (projeto) => projeto.status === "Em andamento",
    ).length;
    const atrasados = projetos.filter((projeto) => projeto.diasRestantes < 0).length;
    const progressoMedio = projetos.length
        ? Math.round(
              projetos.reduce((soma, projeto) => soma + projeto.progresso, 0) /
                  projetos.length,
          )
        : 0;

    const cartoes = [
        ["Projetos ativos", String(projetos.length), "na carteira da HC"],
        ["Em andamento", String(emAndamento), "com entrega prevista"],
        ["Progresso médio", `${progressoMedio}%`, "da carteira inteira"],
        [
            "Fora do prazo",
            String(atrasados),
            atrasados ? "exigem atenção" : "tudo em dia",
        ],
    ];

    porId("projetosKpis").innerHTML = cartoes
        .map(
            ([rotulo, valor, apoio]) => `
        <div class="projeto-kpi">
          <span>${rotulo}</span>
          <strong>${valor}</strong>
          <small>${apoio}</small>
        </div>
      `,
        )
        .join("");
}

function renderProjetos(): void {
    const filtrados = projetosFiltrados();
    porId("projetosCount").textContent = plural(filtrados.length, "projeto", "projetos");

    grid.innerHTML = filtrados.length
        ? filtrados
              .map((projeto) => {
                  const limite = prazo(projeto);
                  return `
            <article class="projeto-card" data-projeto-id="${escapar(projeto.id)}">
              <div class="projeto-card-top">
                <span class="icone-quadro purple">${icone("rocket")}</span>
                <div class="projeto-card-tags">
                  <span class="tag ${tagDoStatusDeProjeto[projeto.status] ?? "gray"}">${escapar(projeto.status)}</span>
                  <span class="tag ${tagDaPrioridade[projeto.prioridade] ?? "gray"}">${escapar(projeto.prioridade)}</span>
                </div>
              </div>

              <h3>${escapar(projeto.nome)}</h3>
              <p class="projeto-card-descricao">${escapar(projeto.descricao)}</p>

              <div class="projeto-progresso">
                <div class="projeto-progresso-topo">
                  <span>Progresso</span>
                  <strong>${projeto.progresso}%</strong>
                </div>
                <div class="barra"><span style="width:${projeto.progresso}%"></span></div>
              </div>

              <dl class="projeto-card-meta">
                <div><dt>Responsável</dt><dd>${escapar(projeto.responsavel)}</dd></div>
                <div><dt>Área</dt><dd>${escapar(projeto.area)}</dd></div>
                <div><dt>Cliente</dt><dd>${escapar(projeto.empresa ?? "Interno")}</dd></div>
              </dl>

              <footer class="projeto-card-footer">
                <span class="tag ${limite.cor}">${limite.texto}</span>
              </footer>
            </article>
          `;
              })
              .join("")
        : `<div class="empty-state">Nenhum projeto encontrado com os filtros atuais.</div>`;

    todos("[data-projeto-id]", grid).forEach((card) => {
        card.addEventListener("click", () => {
            const projeto = projetos.find(
                (registro) => registro.id === dado(card, "projetoId"),
            );
            if (!projeto) return;

            showModal(
                projeto.nome,
                [
                    projeto.descricao,
                    "",
                    `Status: ${projeto.status} · prioridade ${projeto.prioridade}`,
                    `Responsável: ${projeto.responsavel} (${projeto.area})`,
                    `Cliente: ${projeto.empresa ?? "projeto interno"}`,
                    `Período: ${projeto.inicio} até ${projeto.prazo}`,
                    `Progresso: ${projeto.progresso}%`,
                ].join("\n"),
            );
        });
    });

    desenharIcones(grid);
}

for (const controle of [busca, statusFiltro, areaFiltro]) {
    controle.addEventListener("input", renderProjetos);
}

porId("clearProjetoFilters").addEventListener("click", () => {
    busca.value = "";
    statusFiltro.value = "Todos";
    areaFiltro.value = "Todas";
    renderProjetos();
});

renderKpis();
renderProjetos();
