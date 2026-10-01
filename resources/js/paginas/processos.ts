/* =========================================================
   TELA PROCESSOS
   Cada procedimento é um acordeão: o resumo fica sempre visível
   e as etapas aparecem quando alguém abre. Usa <details>, então
   abre e fecha sem JavaScript e já é acessível pelo teclado.
   ========================================================= */

import {
    cadastrarProcesso,
    carregarProcessos,
    excluirProcesso,
    salvarProcesso,
    type DadosDeProcesso,
    type Processo,
} from "../dados/projetos.ts";
import { campo, dado, porId, selecao, todos } from "../comum/dom.ts";
import { escapar, plural } from "../comum/formato.ts";
import { abrirFormulario } from "../comum/formulario.ts";
import { desenharIcones, icone } from "../comum/icones.ts";
import { iniciarPagina } from "../comum/shell.ts";

iniciarPagina("processos");

const lista = porId("processosLista");
const busca = campo("processoSearch");
const areaFiltro = selecao("processoAreaFilter");

let processos = await carregarProcessos();

function preencherAreas(): void {
    const escolhida = areaFiltro.value;
    const areas = [...new Set(processos.map((processo) => processo.area))].sort();

    areaFiltro.innerHTML = [
        `<option value="Todas">Todas as áreas</option>`,
        ...areas.map(
            (area) => `<option value="${escapar(area)}">${escapar(area)}</option>`,
        ),
    ].join("");

    areaFiltro.value = areas.includes(escolhida) ? escolhida : "Todas";
}

async function abrirFormularioDe(processo?: Processo): Promise<void> {
    const salvou = await abrirFormulario({
        titulo: processo ? "Editar processo" : "Novo processo",
        campos: [
            {
                nome: "nome",
                rotulo: "Nome",
                valor: processo?.nome,
                obrigatorio: true,
                largo: true,
            },
            {
                nome: "descricao",
                rotulo: "Descrição",
                tipo: "longo",
                valor: processo?.descricao,
                obrigatorio: true,
                largo: true,
            },
            {
                nome: "area",
                rotulo: "Área",
                valor: processo?.area,
                obrigatorio: true,
            },
            {
                nome: "responsavel",
                rotulo: "Responsável",
                valor: processo?.responsavel,
                obrigatorio: true,
            },
            {
                nome: "frequencia",
                rotulo: "Frequência",
                valor: processo?.frequencia,
                obrigatorio: true,
                dica: "Mensal, a cada contratação, sob demanda...",
            },
            {
                nome: "etapas",
                rotulo: "Etapas",
                tipo: "linhas",
                valor: processo?.etapas.join("\n"),
                obrigatorio: true,
                largo: true,
                dica: "Uma etapa por linha, na ordem em que são executadas.",
            },
        ],
        excluir: processo
            ? {
                  confirmacao: `Excluir o processo "${processo.nome}"? Essa ação não pode ser desfeita.`,
                  aoExcluir: () => excluirProcesso(processo.id),
              }
            : undefined,
        async aoSalvar(valores) {
            const dados: DadosDeProcesso = {
                nome: valores.texto("nome"),
                descricao: valores.texto("descricao"),
                area: valores.texto("area"),
                responsavel: valores.texto("responsavel"),
                frequencia: valores.texto("frequencia"),
                etapas: valores.linhas("etapas"),
            };

            await (processo
                ? salvarProcesso(processo.id, dados)
                : cadastrarProcesso(dados));
        },
    });

    if (salvou) await recarregar();
}

async function recarregar(): Promise<void> {
    processos = await carregarProcessos();
    preencherAreas();
    renderProcessos();
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

                <div class="processo-acoes">
                  <button class="secondary" type="button" data-processo-id="${escapar(processo.id)}">
                    Editar processo
                  </button>
                </div>
              </div>
            </details>
          `,
              )
              .join("")
        : `<div class="empty-state">Nenhum processo encontrado com os filtros atuais.</div>`;

    todos("[data-processo-id]", lista).forEach((botao) => {
        botao.addEventListener("click", () => {
            const processo = processos.find(
                (registro) => registro.id === dado(botao, "processoId"),
            );
            if (processo) void abrirFormularioDe(processo);
        });
    });

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

porId("novoProcesso").addEventListener("click", () => void abrirFormularioDe());

preencherAreas();
renderProcessos();
