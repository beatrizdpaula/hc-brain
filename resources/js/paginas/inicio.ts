/* =========================================================
   TELA INÍCIO
   Painel de entrada. Todo número aqui é uma contagem da base —
   cadastrar um cliente ou registrar uma reunião muda o que esta
   tela mostra, que é o ponto de ela existir.
   ========================================================= */

import {
    carregarInicio,
    type ContadoresDoInicio,
    type ItemDeAtividade,
} from "../dados/projetos.ts";
import type { CorTag } from "../dados/empresas.ts";
import { campo, dado, porId, todos } from "../comum/dom.ts";
import { atualizarSecao } from "../comum/estado.ts";
import { escapar, numero } from "../comum/formato.ts";
import { desenharIcones, icone, type NomeDeIcone } from "../comum/icones.ts";
import { caminhoDaPagina } from "../comum/paginas.ts";
import { iniciarPagina } from "../comum/shell.ts";

interface Atalho {
    pagina: string;
    icone: NomeDeIcone;
    cor: CorTag;
    titulo: string;
    texto: string;
}

interface Metrica {
    chave: keyof ContadoresDoInicio;
    icone: NomeDeIcone;
    cor: CorTag;
    rotulo: string;
}

iniciarPagina("inicio");

const ATALHOS: Atalho[] = [
    {
        pagina: "pesquisa",
        icone: "search",
        cor: "blue",
        titulo: "Encontrar conhecimento",
        texto: "Localize documentos, decisões, responsáveis e históricos.",
    },
    {
        pagina: "sofia-ia",
        icone: "sparkles",
        cor: "purple",
        titulo: "Perguntar à Sofia",
        texto: "Transforme perguntas em respostas e resumos.",
    },
    {
        pagina: "reunioes",
        icone: "calendar-days",
        cor: "green",
        titulo: "Ver reuniões",
        texto: "Aberturas, transferências, dúvidas e alinhamentos por empresa.",
    },
    {
        pagina: "clientes",
        icone: "building-2",
        cor: "yellow",
        titulo: "Empresas & sócios",
        texto: "Empresa, sócio responsável, fontes e reuniões vinculadas.",
    },
    {
        pagina: "documentos",
        icone: "folder-open",
        cor: "blue",
        titulo: "Explorar documentos",
        texto: "Navegue pelas pastas e arquivos da empresa.",
    },
    {
        pagina: "projetos",
        icone: "trending-up",
        cor: "purple",
        titulo: "Acompanhar projetos",
        texto: "Progresso, prazos e responsáveis de cada iniciativa.",
    },
];

const METRICAS: Metrica[] = [
    {
        chave: "empresas",
        icone: "building-2",
        cor: "blue",
        rotulo: "Empresas na carteira",
    },
    {
        chave: "reunioes",
        icone: "calendar",
        cor: "green",
        rotulo: "Reuniões registradas",
    },
    {
        chave: "documentos",
        icone: "folder",
        cor: "purple",
        rotulo: "Documentos e pastas",
    },
    { chave: "fontes", icone: "database", cor: "blue", rotulo: "Fontes vinculadas" },
    {
        chave: "treinamentos",
        icone: "graduation-cap",
        cor: "yellow",
        rotulo: "Conteúdos de capacitação",
    },
    { chave: "projetos", icone: "rocket", cor: "purple", rotulo: "Projetos em curso" },
    {
        chave: "processos",
        icone: "workflow",
        cor: "green",
        rotulo: "Processos documentados",
    },
    { chave: "usuarios", icone: "users", cor: "blue", rotulo: "Pessoas com acesso" },
];

const AREAS: { chave: keyof ContadoresDoInicio; pagina: string; rotulo: string }[] = [
    { chave: "empresas", pagina: "clientes", rotulo: "Empresas e sócios" },
    { chave: "reunioes", pagina: "reunioes", rotulo: "Reuniões registradas" },
    { chave: "documentos", pagina: "documentos", rotulo: "Documentos comerciais" },
    { chave: "projetos", pagina: "projetos", rotulo: "Projetos em andamento" },
    { chave: "processos", pagina: "processos", rotulo: "Processos internos" },
    { chave: "treinamentos", pagina: "treinamentos", rotulo: "Conteúdos de treinamento" },
];

porId("atalhosGrid").innerHTML = ATALHOS.map(
    (atalho) => `
    <a class="card shortcut" href="${caminhoDaPagina(atalho.pagina)}">
      <span class="icone-quadro ${atalho.cor}">${icone(atalho.icone)}</span>
      <h3>${escapar(atalho.titulo)}</h3>
      <p class="muted">${escapar(atalho.texto)}</p>
    </a>
  `,
).join("");

const { contadores, atividade } = await carregarInicio();

porId("inicioMetrics").innerHTML = METRICAS.map(
    (metrica) => `
    <div class="metric">
      <span class="icone-quadro ${metrica.cor}">${icone(metrica.icone)}</span>
      <strong class="metric-number">${numero(contadores[metrica.chave])}</strong>
      <span class="metric-label">${escapar(metrica.rotulo)}</span>
    </div>
  `,
).join("");

porId("atividadeRecente").innerHTML = atividade.length
    ? atividade.map(linhaDeAtividade).join("")
    : `<div class="empty-state">Nada registrado ainda.</div>`;

porId("areasAcessadas").innerHTML = AREAS.map(
    (area) => `
    <a class="list-item area-item" href="${caminhoDaPagina(area.pagina)}">
      <span>${escapar(area.rotulo)}</span>
      <span class="tag">${numero(contadores[area.chave])}</span>
    </a>
  `,
).join("");

function linhaDeAtividade(item: ItemDeAtividade): string {
    return `
    <a class="list-item atividade" href="${caminhoDaPagina(item.destino)}">
      <span class="atividade-topo">
        <strong>${escapar(item.titulo)}</strong>
        <span class="tag gray">${escapar(item.etiqueta)}</span>
      </span>
      <span class="atividade-detalhe">${escapar(item.detalhe)}</span>
      <span class="atividade-quando">${escapar(item.quando)}</span>
    </a>
  `;
}

desenharIcones();

// A busca do hero leva o termo para a tela de Pesquisa já aplicado.
function pesquisar(termo: string): void {
    atualizarSecao("pesquisa", (atual) => ({
        ...atual,
        termo,
        recentes: [
            { termo, contexto: "Início" },
            ...atual.recentes.filter((item) => item.termo !== termo),
        ].slice(0, 6),
    }));
    window.location.href = caminhoDaPagina("pesquisa");
}

porId<HTMLFormElement>("heroSearchForm").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const termo = campo("heroSearchInput").value.trim();
    if (termo) pesquisar(termo);
});

// A navegação só pinta a outra tela alguns instantes depois do clique. Sem
// marcar a pílula escolhida, ela fica parada no estado de foco do navegador e
// a espera parece travamento.
todos("[data-search]").forEach((botao) => {
    botao.addEventListener("click", () => {
        botao.setAttribute("aria-busy", "true");
        pesquisar(dado(botao, "search"));
    });
});
