/* =========================================================
   TELA PROCESSOS
   Cada procedimento é um acordeão: o resumo fica sempre visível
   e as etapas aparecem quando alguém abre. Usa <details>, então
   abre e fecha sem JavaScript e já é acessível pelo teclado.
   ========================================================= */

import { carregarProcessos, type Processo } from "../dados/projetos.ts";
import { campo, porId, selecao } from "../comum/dom.ts";
import { escapar, plural } from "../comum/formato.ts";
import { desenharIcones, icone } from "../comum/icones.ts";
import { iniciarPagina } from "../comum/shell.ts";

iniciarPagina("processos");

const lista = porId("processosLista");
const busca = campo("processoSearch");
const areaFiltro = selecao("processoAreaFilter");

const processos = await carregarProcessos();

for (const area of [...new Set(processos.map((processo) => processo.area))].sort()) {
    const opcao = document.createElement("option");
    opcao.value = area;
    opcao.textContent = area;
    areaFiltro.appendChild(opcao);
}

function processosFiltrados(): Processo[] {
    const termo = busca.value.toLowerCase().trim();

    return processos.filter((processo) => {
        const texto =
            `${processo.nome} ${processo.descricao} ${processo.responsavel} ${processo.etapas.join(" ")}`.toLowerCase();
        return (
            (!termo || texto.includes(termo)) &&
            (areaFiltro.value === "Todas" || processo.area === areaFiltro.value)
        );
    });
}

function renderProcessos(): void {
    const filtrados = processosFiltrados();
    porId("processosCount").textContent = plural(
        filtrados.length,
        "processo",
        "processos",
    );

    lista.innerHTML = filtrados.length
        ? filtrados
              .map(
                  (processo) => `
            <details class="processo">
              <summary class="processo-resumo">
                <span class="icone-quadro blue">${icone("workflow")}</span>
                <span class="processo-texto">
                  <strong>${escapar(processo.nome)}</strong>
                  <span>${escapar(processo.descricao)}</span>
                </span>
                <span class="processo-tags">
                  <span class="tag gray">${escapar(processo.area)}</span>
                  <span class="tag">${plural(processo.etapas.length, "etapa", "etapas")}</span>
                </span>
                <span class="processo-seta">${icone("chevron-down")}</span>
              </summary>

              <div class="processo-corpo">
                <ol class="processo-etapas">
                  ${processo.etapas.map((etapa) => `<li>${escapar(etapa)}</li>`).join("")}
                </ol>

                <dl class="processo-meta">
                  <div><dt>Responsável</dt><dd>${escapar(processo.responsavel)}</dd></div>
                  <div><dt>Frequência</dt><dd>${escapar(processo.frequencia)}</dd></div>
                  <div><dt>Revisado em</dt><dd>${escapar(processo.atualizadoEm)}</dd></div>
                </dl>
              </div>
            </details>
          `,
              )
              .join("")
        : `<div class="empty-state">Nenhum processo encontrado com os filtros atuais.</div>`;

    desenharIcones(lista);
}

for (const controle of [busca, areaFiltro]) {
    controle.addEventListener("input", renderProcessos);
}

porId("clearProcessoFilters").addEventListener("click", () => {
    busca.value = "";
    areaFiltro.value = "Todas";
    renderProcessos();
});

renderProcessos();
