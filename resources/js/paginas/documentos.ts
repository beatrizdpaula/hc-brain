/* =========================================================
   TELA DOCUMENTOS
   Pasta escolhida, busca, tipo e modo de exibição ficam no
   estado compartilhado — ao voltar para cá, a navegação continua
   exatamente de onde parou.
   ========================================================= */

import {
    aparenciaPorTipo,
    carregarDocumentos,
    type Documento,
} from "../dados/documentos.ts";
import { alvoMaisProximo, campo, dado, porId, selecao, todos } from "../comum/dom.ts";
import {
    atualizarSecao,
    observarEstado,
    obterSecao,
    type VisualizacaoDocumentos,
} from "../comum/estado.ts";
import { escapar, plural } from "../comum/formato.ts";
import { desenharIcones, icone } from "../comum/icones.ts";
import { showModal } from "../comum/modal.ts";
import { iniciarPagina } from "../comum/shell.ts";

iniciarPagina("documentos");

const grid = porId("documentsGrid");
const menu = porId("folderMenu");
const busca = campo("documentSearch");
const tipo = selecao("documentType");
const contador = porId("counter");
const alternadorDeVisao = porId("documentViewToggle");
const selecionarTodos = porId("selectAll");

const { pastas, documentos: documentosData } = await carregarDocumentos();

let selecaoAtiva = false;

function documentosFiltrados(): Documento[] {
    const estado = obterSecao("documentos");
    const termo = estado.busca.toLowerCase().trim();

    return documentosData.filter(
        (item) =>
            (!termo || item.nome.toLowerCase().includes(termo)) &&
            (estado.tipo === "all" || item.tipo === estado.tipo) &&
            (estado.pasta === "Todas" || item.pasta === estado.pasta),
    );
}

function renderMenu(): void {
    const { pasta } = obterSecao("documentos");

    menu.innerHTML = pastas
        .map(
            (item) => `
        <button type="button" class="${item.nome === pasta ? "active" : ""}" data-folder="${escapar(item.nome)}">
          ${icone(item.nome === "Todas" ? "folder-open" : "folder")}
          <span>${escapar(item.rotulo)}</span>
          <small>${item.total}</small>
        </button>
      `,
        )
        .join("");

    todos("[data-folder]", menu).forEach((botao) => {
        botao.addEventListener("click", () =>
            atualizarSecao("documentos", { pasta: dado(botao, "folder") }),
        );
    });

    desenharIcones(menu);
}

function renderGrid(): void {
    const estado = obterSecao("documentos");
    const itens = documentosFiltrados();

    porId("currentFolder").textContent =
        pastas.find((item) => item.nome === estado.pasta)?.rotulo ?? estado.pasta;

    grid.classList.toggle("list-view", estado.visualizacao === "list");
    todos("[data-document-view]", alternadorDeVisao).forEach((botao) => {
        botao.classList.toggle(
            "active",
            dado(botao, "documentView") === estado.visualizacao,
        );
    });

    contador.textContent = plural(itens.length, "item encontrado", "itens encontrados");

    grid.innerHTML = itens.length
        ? itens
              .map((item) => {
                  const aparencia = aparenciaPorTipo[item.tipo];
                  return `
            <article class="document-card${selecaoAtiva ? " selecionado" : ""}" data-name="${escapar(item.exibicao)}">
              <span class="icone-quadro ${aparencia.cor}">${icone(aparencia.icone)}</span>
              <div class="document-info">
                <h3 title="${escapar(item.exibicao)}">${escapar(item.exibicao)}</h3>
                <p>${escapar(item.detalhe)}</p>
              </div>
              <button type="button" class="icon-button document-more" data-options="${escapar(item.exibicao)}" aria-label="Opções de ${escapar(item.exibicao)}">
                ${icone("ellipsis-vertical")}
              </button>
            </article>
          `;
              })
              .join("")
        : `<div class="empty-state">Nenhum documento corresponde à pasta e aos filtros atuais.</div>`;

    todos(".document-card", grid).forEach((card) => {
        card.addEventListener("click", (evento) => {
            if (alvoMaisProximo(evento, ".document-more")) return;
            showModal(
                dado(card, "name"),
                "Este arquivo ou pasta será aberto diretamente do banco de documentos na versão final.",
            );
        });
    });

    todos("[data-options]", grid).forEach((botao) => {
        botao.addEventListener("click", (evento) => {
            evento.stopPropagation();
            showModal(
                `Opções: ${dado(botao, "options")}`,
                "Aqui estarão disponíveis as opções Abrir, Baixar, Renomear, Favoritar, Compartilhar e Excluir.",
            );
        });
    });

    desenharIcones(grid);
}

function aplicarEstadoNosControles(): void {
    const estado = obterSecao("documentos");
    if (busca.value !== estado.busca) busca.value = estado.busca;
    tipo.value = estado.tipo;
}

busca.addEventListener("input", () =>
    atualizarSecao("documentos", { busca: busca.value }),
);
tipo.addEventListener("change", () => atualizarSecao("documentos", { tipo: tipo.value }));

alternadorDeVisao.addEventListener("click", (evento) => {
    const botao = alvoMaisProximo(evento, "[data-document-view]");
    if (botao) {
        atualizarSecao("documentos", {
            visualizacao: dado(botao, "documentView") as VisualizacaoDocumentos,
        });
    }
});

porId("newFolder").addEventListener("click", () => {
    showModal(
        "Nova pasta",
        "Na versão final, você poderá criar uma nova pasta e configurar suas permissões.",
    );
});

porId("uploadFile").addEventListener("click", () => {
    showModal(
        "Enviar arquivo",
        "Na versão final, será possível selecionar arquivos do computador e enviá-los para o banco central.",
    );
});

selecionarTodos.addEventListener("click", () => {
    selecaoAtiva = !selecaoAtiva;
    selecionarTodos.textContent = selecaoAtiva ? "Desmarcar todos" : "Selecionar todos";
    todos(".document-card", grid).forEach((card) => {
        card.classList.toggle("selecionado", selecaoAtiva);
    });
});

todos("[data-special]").forEach((botao) => {
    botao.addEventListener("click", () => {
        if (dado(botao, "special") === "explore") return;
        showModal(
            botao.textContent?.trim() ?? "Em breve",
            "Esta área exibirá os documentos correspondentes quando o sistema estiver conectado ao banco de dados.",
        );
    });
});

observarEstado(["documentos"], () => {
    aplicarEstadoNosControles();
    renderMenu();
    renderGrid();
});

aplicarEstadoNosControles();
renderMenu();
renderGrid();
