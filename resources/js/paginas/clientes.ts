/* =========================================================
   TELA EMPRESAS & CLIENTES
   Lista o banco central. Cada empresa abre em uma página própria
   (/clientes/{id}), mantendo busca e modo de exibição salvos para
   quando você voltar.
   ========================================================= */

import { carregarEmpresas, type Empresa } from "../dados/empresas.ts";
import { alvoMaisProximo, campo, dado, porId, todos } from "../comum/dom.ts";
import {
    atualizarSecao,
    observarEstado,
    obterSecao,
    type VisualizacaoLista,
} from "../comum/estado.ts";
import { escapar, iniciais } from "../comum/formato.ts";
import { desenharIcones, icone } from "../comum/icones.ts";
import { caminhoDaPagina } from "../comum/paginas.ts";
import { iniciarPagina } from "../comum/shell.ts";

iniciarPagina("clientes");

const lista = porId("empresasList");
const grid = porId("empresasGrid");
const busca = campo("empresaSearch");

const empresas = await carregarEmpresas();

function empresasFiltradas(): Empresa[] {
    const termo = obterSecao("empresas").busca.toLowerCase().trim();
    return empresas.filter((empresa) => {
        const texto =
            `${empresa.nome} ${empresa.setor} ${empresa.socio.nome} ${empresa.status}`.toLowerCase();
        return !termo || texto.includes(termo);
    });
}

function renderEmpresaCard(empresa: Empresa): string {
    return `
    <a class="empresa-card" href="${caminhoDaPagina("cliente", { id: empresa.id })}">
      <div class="empresa-card-top">
        <span class="empresa-avatar">${iniciais(empresa.nome)}</span>
        <span class="tag ${empresa.statusTag}">${escapar(empresa.status)}</span>
      </div>

      <h3>${escapar(empresa.nome)}</h3>
      <span class="empresa-setor">${escapar(empresa.setor)}</span>

      <div class="empresa-socio-line">
        <strong>${escapar(empresa.socio.nome)}</strong>
        ${escapar(empresa.socio.cargo)} • sócio responsável
      </div>

      <dl class="empresa-stats-row">
        <div><dt>Reuniões</dt><dd>${empresa.totalReunioes}</dd></div>
        <div><dt>Fontes</dt><dd>${empresa.fontes.length}</dd></div>
        <div><dt>Última</dt><dd>${escapar(empresa.ultimaReuniao?.tipo ?? "—")}</dd></div>
      </dl>
    </a>
  `;
}

function renderEmpresaListItem(empresa: Empresa): string {
    return `
    <a class="empresa-list-item" href="${caminhoDaPagina("cliente", { id: empresa.id })}">
      <span class="empresa-avatar empresa-list-avatar">${iniciais(empresa.nome)}</span>
      <span class="empresa-list-main">
        <span class="empresa-list-name">
          <strong>${escapar(empresa.nome)}</strong>
          <span class="tag ${empresa.statusTag}">${escapar(empresa.status)}</span>
        </span>
        <span class="empresa-list-sub">${escapar(empresa.setor)} • ${escapar(empresa.socio.nome)} — ${escapar(empresa.socio.cargo)}</span>
      </span>
      <span class="empresa-list-info">
        <strong>${empresa.totalReunioes}</strong>
        ${empresa.totalReunioes === 1 ? "reunião" : "reuniões"}
      </span>
      <span class="empresa-list-info hide-mobile">
        <strong>${empresa.fontes.length}</strong>
        documentos e fontes
      </span>
      <span class="empresa-list-action">${icone("chevron-right")}</span>
    </a>
  `;
}

function renderEmpresas(): void {
    const estado = obterSecao("empresas");
    const filtradas = empresasFiltradas();
    const vazio = `<div class="empty-state">Nenhuma empresa encontrada.</div>`;

    grid.innerHTML = filtradas.length ? filtradas.map(renderEmpresaCard).join("") : vazio;
    lista.innerHTML = filtradas.length
        ? filtradas.map(renderEmpresaListItem).join("")
        : vazio;

    grid.classList.toggle("hidden-view", estado.visualizacao !== "cards");
    lista.classList.toggle("hidden-view", estado.visualizacao !== "list");

    todos("[data-empresa-view]").forEach((botao) => {
        botao.classList.toggle(
            "active",
            dado(botao, "empresaView") === estado.visualizacao,
        );
    });

    if (busca.value !== estado.busca) busca.value = estado.busca;

    desenharIcones(lista);
}

busca.addEventListener("input", () => atualizarSecao("empresas", { busca: busca.value }));

porId("empresaViewToggle").addEventListener("click", (evento) => {
    const botao = alvoMaisProximo(evento, "[data-empresa-view]");
    if (botao) {
        atualizarSecao("empresas", {
            visualizacao: dado(botao, "empresaView") as VisualizacaoLista,
        });
    }
});

observarEstado(["empresas"], renderEmpresas);
renderEmpresas();
