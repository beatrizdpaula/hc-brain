/* =========================================================
   TELA TREINAMENTOS
   Mesma base de conteúdos usada no detalhe da empresa e nas
   respostas da Sofia. Os filtros ficam salvos no estado.
   ========================================================= */

import {
    aparenciaPorTipo,
    carregarTreinamentos,
    type ConteudoTreinamento,
} from "../dados/treinamentos.ts";
import { campo, dado, porId, selecao, todos } from "../comum/dom.ts";
import { atualizarSecao, observarEstado, obterSecao } from "../comum/estado.ts";
import { escapar, plural } from "../comum/formato.ts";
import { desenharIcones, icone } from "../comum/icones.ts";
import { showModal } from "../comum/modal.ts";
import { iniciarPagina } from "../comum/shell.ts";

iniciarPagina("treinamentos");

const grid = porId("trainingContentGrid");
const busca = campo("trainingSearch");
const tipo = selecao("trainingTypeFilter");
const nivel = selecao("trainingLevelFilter");

const { conteudos: treinamentoData, historico } = await carregarTreinamentos();

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
            if (!item) return;
            showModal(
                item.titulo,
                [
                    item.descricao,
                    "",
                    `Categoria: ${item.categoria}`,
                    item.nivel !== "Todos" ? `Nível: ${item.nivel}` : null,
                    item.processo ? `Processo relacionado: ${item.processo}` : null,
                    item.trilha ? `Trilha: ${item.trilha}` : null,
                ]
                    .filter((linha) => linha !== null)
                    .join("\n"),
            );
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

observarEstado(["treinamentos"], renderConteudos);

renderConteudos();
renderHistorico();
