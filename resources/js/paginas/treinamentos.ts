/* =========================================================
   TELA TREINAMENTOS
   Mesma base de conteúdos usada no detalhe da empresa e nas
   respostas da Sofia. Os filtros ficam salvos no estado.
   ========================================================= */

import {
    aparenciaPorTipo,
    cadastrarTreinamento,
    carregarTreinamentos,
    excluirTreinamento,
    NIVEIS_DE_TREINAMENTO,
    salvarTreinamento,
    TIPOS_DE_TREINAMENTO,
    type ConteudoTreinamento,
    type DadosDeTreinamento,
} from "../dados/treinamentos.ts";
import { campo, dado, porId, selecao, todos } from "../comum/dom.ts";
import { atualizarSecao, observarEstado, obterSecao } from "../comum/estado.ts";
import { escapar, plural } from "../comum/formato.ts";
import { abrirFormulario } from "../comum/formulario.ts";
import { desenharIcones, icone } from "../comum/icones.ts";
import { iniciarPagina } from "../comum/shell.ts";

iniciarPagina("treinamentos");

const grid = porId("trainingContentGrid");
const busca = campo("trainingSearch");
const tipo = selecao("trainingTypeFilter");
const nivel = selecao("trainingLevelFilter");

let { conteudos: treinamentoData, historico } = await carregarTreinamentos();

async function abrirFormularioDe(item?: ConteudoTreinamento): Promise<void> {
    const salvou = await abrirFormulario({
        titulo: item ? "Editar conteúdo" : "Novo conteúdo",
        campos: [
            {
                nome: "titulo",
                rotulo: "Título",
                valor: item?.titulo,
                obrigatorio: true,
                largo: true,
            },
            {
                nome: "descricao",
                rotulo: "Descrição",
                tipo: "longo",
                valor: item?.descricao,
                obrigatorio: true,
                largo: true,
            },
            {
                nome: "tipo",
                rotulo: "Tipo",
                tipo: "selecao",
                valor: item?.tipo ?? "Curso",
                opcoes: TIPOS_DE_TREINAMENTO.map((tipo) => ({
                    valor: tipo,
                    rotulo: tipo,
                })),
            },
            {
                nome: "nivel",
                rotulo: "Nível",
                tipo: "selecao",
                valor: item?.nivel ?? "Todos",
                opcoes: NIVEIS_DE_TREINAMENTO.map((nivel) => ({
                    valor: nivel,
                    rotulo: nivel === "Todos" ? "Todos os níveis" : nivel,
                })),
            },
            {
                nome: "categoria",
                rotulo: "Categoria",
                valor: item?.categoria,
                obrigatorio: true,
            },
            {
                nome: "cursos",
                rotulo: "Cursos",
                valor: item?.cursos ?? "",
                dica: "Só para trilhas: \u201c6 cursos\u201d.",
            },
            {
                nome: "trilha",
                rotulo: "Trilha",
                valor: item?.trilha ?? "",
                dica: "A trilha de que este conteúdo faz parte, se houver.",
            },
            {
                nome: "processo",
                rotulo: "Processo relacionado",
                valor: item?.processo ?? "",
            },
        ],
        excluir: item
            ? {
                  confirmacao: `Excluir "${item.titulo}" da base de treinamentos? Essa ação não pode ser desfeita.`,
                  aoExcluir: () => excluirTreinamento(item.id),
              }
            : undefined,
        async aoSalvar(valores) {
            const dados: DadosDeTreinamento = {
                titulo: valores.texto("titulo"),
                tipo: valores.texto("tipo"),
                categoria: valores.texto("categoria"),
                nivel: valores.texto("nivel"),
                descricao: valores.texto("descricao"),
                trilha: valores.texto("trilha") || null,
                cursos: valores.texto("cursos") || null,
                processo: valores.texto("processo") || null,
            };

            await (item
                ? salvarTreinamento(item.id, dados)
                : cadastrarTreinamento(dados));
        },
    });

    if (salvou) {
        ({ conteudos: treinamentoData, historico } = await carregarTreinamentos());
        renderConteudos();
        renderHistorico();
    }
}

function conteudosFiltrados(): ConteudoTreinamento[] {
    const estado = obterSecao("treinamentos");
    const termo = estado.busca.toLowerCase().trim();

    return treinamentoData.filter((item) => {
        const texto =
            `${item.titulo} ${item.descricao} ${item.categoria} ${item.tipo} ${item.processo ?? ""} ${item.trilha ?? ""}`.toLowerCase();
        return (
            (!termo || texto.includes(termo)) &&
            (estado.tipo === "Todos" || item.tipo === estado.tipo) &&
            (estado.nivel === "Todos" ||
                item.nivel === "Todos" ||
                item.nivel === estado.nivel)
        );
    });
}

function renderConteudos(): void {
    const estado = obterSecao("treinamentos");
    const filtrados = conteudosFiltrados();

    porId("trainingContentCount").textContent = plural(filtrados.length, "item", "itens");

    grid.innerHTML = filtrados.length
        ? filtrados
              .map((item) => {
                  const aparencia = aparenciaPorTipo[item.tipo];
                  return `
            <article class="training-card" data-training-id="${escapar(item.id)}">
              <div class="training-card-top">
                <span class="icone-quadro ${aparencia.cor}">${icone(aparencia.icone)}</span>
                <span class="tag ${aparencia.cor}">${escapar(item.tipo)}</span>
              </div>
              <h3>${escapar(item.titulo)}</h3>
              <p>${escapar(item.descricao)}</p>
              <div class="training-meta">
                <span class="tag gray">${escapar(item.categoria)}</span>
                ${item.nivel !== "Todos" ? `<span class="tag gray">${escapar(item.nivel)}</span>` : ""}
                ${item.cursos ? `<span class="tag blue">${escapar(item.cursos)}</span>` : ""}
              </div>
            </article>
          `;
              })
              .join("")
        : `<div class="empty-state">Nenhum conteúdo encontrado com os filtros atuais.</div>`;

    todos("[data-training-id]", grid).forEach((card) => {
        card.addEventListener("click", () => {
            const item = treinamentoData.find(
                (registro) => registro.id === dado(card, "trainingId"),
            );
            if (item) void abrirFormularioDe(item);
        });
    });

    if (busca.value !== estado.busca) busca.value = estado.busca;
    tipo.value = estado.tipo;
    nivel.value = estado.nivel;

    desenharIcones(grid);
}

function renderHistorico(): void {
    porId("trainingHistoryCount").textContent = plural(
        historico.length,
        "registro",
        "registros",
    );

    porId("trainingHistory").innerHTML = historico
        .map(
            (item) => `
        <tr>
          <td>
            <strong>${escapar(item.pessoa)}</strong>
            <small>${escapar(item.empresa)}</small>
          </td>
          <td>${escapar(item.conteudo)}</td>
          <td>
            <div class="training-progresso">
              <div class="barra ${item.progresso === 100 ? "verde" : ""}">
                <span style="width:${item.progresso}%"></span>
              </div>
              <span>${item.progresso}%</span>
            </div>
          </td>
          <td><span class="tag ${item.progresso === 100 ? "green" : "yellow"}">${escapar(item.status)}</span></td>
          <td>${escapar(item.data)}</td>
        </tr>
      `,
        )
        .join("");
}

busca.addEventListener("input", () =>
    atualizarSecao("treinamentos", { busca: busca.value }),
);
tipo.addEventListener("change", () =>
    atualizarSecao("treinamentos", { tipo: tipo.value }),
);
nivel.addEventListener("change", () =>
    atualizarSecao("treinamentos", { nivel: nivel.value }),
);
porId("clearTrainingFilters").addEventListener("click", () => {
    atualizarSecao("treinamentos", { busca: "", tipo: "Todos", nivel: "Todos" });
});

porId("novoTreinamento").addEventListener("click", () => void abrirFormularioDe());

observarEstado(["treinamentos"], renderConteudos);

renderConteudos();
renderHistorico();
