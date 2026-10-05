/* =========================================================
   TELA PROJETOS
   A carteira de projetos vem da API. O prazo é lido a partir de
   `diasRestantes`, calculado no servidor — o navegador não sabe
   qual é a data de referência do sistema.
   ========================================================= */

import {
    cadastrarProjeto,
    carregarProjetos,
    excluirProjeto,
    PRIORIDADES_DE_PROJETO,
    salvarProjeto,
    STATUS_DE_PROJETO,
    tagDaPrioridade,
    tagDoStatusDeProjeto,
    type DadosDeProjeto,
    type Projeto,
} from "../dados/projetos.ts";
import { carregarEmpresas, type CorTag } from "../dados/empresas.ts";
import { combina, termoDeBusca } from "../comum/busca.ts";
import { campo, dado, porId, selecao, todos } from "../comum/dom.ts";
import { dataCurta, escapar, plural } from "../comum/formato.ts";
import { abrirFormulario } from "../comum/formulario.ts";
import { desenharIcones, icone } from "../comum/icones.ts";
import { iniciarPagina } from "../comum/shell.ts";

iniciarPagina("projetos");

const grid = porId("projetosGrid");
const busca = campo("projetoSearch");
const statusFiltro = selecao("projetoStatusFilter");
const areaFiltro = selecao("projetoAreaFilter");

let projetos = await carregarProjetos();
const empresas = await carregarEmpresas();

// As áreas do filtro saem dos próprios projetos: uma área nova na base
// aparece aqui sem ninguém editar a lista.
function preencherAreas(): void {
    const escolhida = areaFiltro.value;
    const areas = [...new Set(projetos.map((projeto) => projeto.area))].sort();

    areaFiltro.innerHTML = [
        `<option value="Todas">Todas as áreas</option>`,
        ...areas.map(
            (area) => `<option value="${escapar(area)}">${escapar(area)}</option>`,
        ),
    ].join("");

    // Editar um projeto pode apagar a última área de um nome; se a que estava
    // filtrada sumiu, o filtro volta para "Todas" em vez de esconder tudo.
    areaFiltro.value = areas.includes(escolhida) ? escolhida : "Todas";
}

/** Como o prazo é lido: atrasado, apertado ou tranquilo. */
function prazo(projeto: Projeto): { texto: string; cor: CorTag } {
    if (projeto.diasRestantes < 0) {
        return { texto: `${Math.abs(projeto.diasRestantes)} dias em atraso`, cor: "red" };
    }
    if (projeto.diasRestantes <= 30) {
        return { texto: `Faltam ${projeto.diasRestantes} dias`, cor: "yellow" };
    }
    return { texto: `Entrega em ${dataCurta(projeto.prazo)}`, cor: "gray" };
}

function dadosDoFormulario(valores: {
    texto(nome: string): string;
    numero(nome: string): number;
}): DadosDeProjeto {
    return {
        nome: valores.texto("nome"),
        descricao: valores.texto("descricao"),
        status: valores.texto("status"),
        prioridade: valores.texto("prioridade"),
        responsavel: valores.texto("responsavel"),
        area: valores.texto("area"),
        progresso: valores.numero("progresso"),
        inicio: valores.texto("inicio"),
        prazo: valores.texto("prazo"),
        empresaId: valores.texto("empresaId") || null,
    };
}

async function abrirFormularioDe(projeto?: Projeto): Promise<void> {
    const salvou = await abrirFormulario({
        titulo: projeto ? "Editar projeto" : "Novo projeto",
        campos: [
            {
                nome: "nome",
                rotulo: "Nome",
                valor: projeto?.nome,
                obrigatorio: true,
                largo: true,
            },
            {
                nome: "descricao",
                rotulo: "Descrição",
                tipo: "longo",
                valor: projeto?.descricao,
                obrigatorio: true,
                largo: true,
            },
            {
                nome: "status",
                rotulo: "Status",
                tipo: "selecao",
                valor: projeto?.status ?? "Planejado",
                opcoes: STATUS_DE_PROJETO.map((status) => ({
                    valor: status,
                    rotulo: status,
                })),
            },
            {
                nome: "prioridade",
                rotulo: "Prioridade",
                tipo: "selecao",
                valor: projeto?.prioridade ?? "Média",
                opcoes: PRIORIDADES_DE_PROJETO.map((prioridade) => ({
                    valor: prioridade,
                    rotulo: prioridade,
                })),
            },
            {
                nome: "responsavel",
                rotulo: "Responsável",
                valor: projeto?.responsavel,
                obrigatorio: true,
            },
            {
                nome: "area",
                rotulo: "Área",
                valor: projeto?.area,
                obrigatorio: true,
                dica: "Uma área nova passa a aparecer no filtro.",
            },
            {
                nome: "inicio",
                rotulo: "Início",
                tipo: "data",
                valor: projeto?.inicio,
                obrigatorio: true,
            },
            {
                nome: "prazo",
                rotulo: "Prazo de entrega",
                tipo: "data",
                valor: projeto?.prazo,
                obrigatorio: true,
            },
            {
                nome: "progresso",
                rotulo: "Progresso (%)",
                tipo: "numero",
                valor: String(projeto?.progresso ?? 0),
                min: "0",
                max: "100",
                obrigatorio: true,
            },
            {
                nome: "empresaId",
                rotulo: "Cliente",
                tipo: "selecao",
                valor: projeto?.empresaId ?? "",
                opcoes: [
                    { valor: "", rotulo: "Projeto interno" },
                    ...empresas.map((empresa) => ({
                        valor: empresa.id,
                        rotulo: empresa.nome,
                    })),
                ],
            },
        ],
        excluir: projeto
            ? {
                  confirmacao: `Excluir "${projeto.nome}" da carteira? Essa ação não pode ser desfeita.`,
                  aoExcluir: () => excluirProjeto(projeto.id),
              }
            : undefined,
        async aoSalvar(valores) {
            const dados = dadosDoFormulario(valores);
            await (projeto ? salvarProjeto(projeto.id, dados) : cadastrarProjeto(dados));
        },
    });

    if (salvou) await recarregar();
}

async function recarregar(): Promise<void> {
    projetos = await carregarProjetos();
    preencherAreas();
    renderKpis();
    renderProjetos();
}

function projetosFiltrados(): Projeto[] {
    const palavras = termoDeBusca(busca.value);

    return projetos.filter((projeto) => {
        const texto = `${projeto.nome} ${projeto.descricao} ${projeto.responsavel} ${projeto.empresa ?? ""}`;
        return (
            combina(texto, palavras) &&
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

    // O cartão já mostra tudo que havia no detalhe, então clicar nele abre
    // direto a edição — é o que se quer fazer depois de olhar um projeto.
    todos("[data-projeto-id]", grid).forEach((card) => {
        card.addEventListener("click", () => {
            const projeto = projetos.find(
                (registro) => registro.id === dado(card, "projetoId"),
            );
            if (projeto) void abrirFormularioDe(projeto);
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

porId("novoProjeto").addEventListener("click", () => void abrirFormularioDe());

preencherAreas();
renderKpis();
renderProjetos();
