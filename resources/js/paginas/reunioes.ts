/* =========================================================
   TELA REUNIÕES
   Agenda com resumo do recorte, movimento por dia e o histórico
   em lista, cartões ou calendário. Os filtros vivem no estado
   compartilhado, então "ver reuniões desta empresa" vindo do
   detalhe do cliente já chega com o recorte aplicado.
   ========================================================= */

import {
    cadastrarReuniao,
    carregarReunioes,
    excluirReuniao,
    salvarReuniao,
    STATUS_DE_REUNIAO,
    tagDoStatus,
    tagDoTipoDeReuniao,
    TIPOS_DE_REUNIAO,
    type Reuniao,
    type StatusReuniao,
} from "../dados/reunioes.ts";
import { alvoMaisProximo, campo, dado, porId, selecao, todos } from "../comum/dom.ts";
import {
    atualizarSecao,
    observarEstado,
    obterSecao,
    type VisualizacaoAgenda,
} from "../comum/estado.ts";
import { dataCurta, escapar, mesPorExtenso, plural } from "../comum/formato.ts";
import { abrirFormulario } from "../comum/formulario.ts";
import { desenharIcones, icone, type NomeDeIcone } from "../comum/icones.ts";
import { openMeetingModal, showModal } from "../comum/modal.ts";
import { iniciarPagina } from "../comum/shell.ts";

iniciarPagina("reunioes");

const lista = porId("meetingsList");
const grid = porId("meetingsGrid");
const calendario = porId("meetingsCalendar");
const stats = porId("agendaStats");
const grafico = porId("agendaGrafico");
const intervalo = porId("agendaIntervalo");
const busca = campo("meetingSearch");
const tipoFilter = selecao("meetingTypeFilter");
const empresaFilter = selecao("meetingEmpresaFilter");
const statusFilter = selecao("meetingStatusFilter");
const responsavelFilter = selecao("meetingResponsavelFilter");
const deCampo = campo("meetingFrom");
const ateCampo = campo("meetingTo");

let { reunioes: meetingsData, empresas } = await carregarReunioes();

/** Cor da etiqueta de cada status, reaproveitada na barra e na legenda. */
const CLASSE_DO_STATUS: Record<StatusReuniao, string> = {
    Concluída: "verde",
    Agendada: "azul",
    Cancelada: "vermelho",
};

preencherOpcoes();

/**
 * Monta as opções dos dois filtros que dependem da base. Roda de novo a cada
 * recarga, porque cadastrar uma reunião pode estrear um responsável.
 */
function preencherOpcoes(): void {
    const repovoar = (seletor: HTMLSelectElement, nomes: string[]): void => {
        // A primeira opção é o "todos" que veio no Blade; as demais são da base.
        seletor.length = 1;
        nomes.forEach((nome) => {
            const opcao = document.createElement("option");
            opcao.value = nome;
            opcao.textContent = nome;
            seletor.appendChild(opcao);
        });
    };

    repovoar(
        empresaFilter,
        empresas.map(({ nome }) => nome),
    );

    // Os responsáveis não têm cadastro próprio; a lista sai das reuniões
    // existentes, que é exatamente o conjunto que o filtro consegue achar.
    repovoar(
        responsavelFilter,
        [...new Set(meetingsData.map(({ responsavel }) => responsavel))]
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, "pt-BR")),
    );
}

function hojeEmIso(): string {
    const agora = new Date();
    return paraIso(agora);
}

function paraIso(data: Date): string {
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${data.getFullYear()}-${mes}-${dia}`;
}

/* ---------------------------------------------------------
   RECORTE
   `recorte` é tudo menos o status, porque são os cartões do
   resumo que mexem no status — eles precisam de uma base que
   não muda quando um deles é acionado.
   --------------------------------------------------------- */
function recorte(): Reuniao[] {
    const estado = obterSecao("reunioes");
    const termo = estado.busca.toLowerCase().trim();

    return meetingsData
        .filter((reuniao) => estado.tipo === "Todas" || reuniao.tipo === estado.tipo)
        .filter(
            (reuniao) => estado.empresa === "Todas" || reuniao.empresa === estado.empresa,
        )
        .filter(
            (reuniao) =>
                estado.responsavel === "Todos" ||
                reuniao.responsavel === estado.responsavel,
        )
        .filter((reuniao) => !estado.de || reuniao.dataOrd >= estado.de)
        .filter((reuniao) => !estado.ate || reuniao.dataOrd <= estado.ate)
        .filter((reuniao) => {
            if (!termo) return true;
            const texto = [
                reuniao.empresa,
                reuniao.tipo,
                reuniao.resumo,
                reuniao.responsavel,
                reuniao.participantes.join(" "),
            ]
                .join(" ")
                .toLowerCase();
            return texto.includes(termo);
        })
        .sort((a, b) => (a.dataOrd < b.dataOrd ? 1 : -1));
}

function reunioesFiltradas(): Reuniao[] {
    const { status } = obterSecao("reunioes");
    return recorte().filter((reuniao) => status === "Todos" || reuniao.status === status);
}

function agruparPorDia(reunioes: Reuniao[]): [string, Reuniao[]][] {
    const grupos = reunioes.reduce<Record<string, Reuniao[]>>((mapa, reuniao) => {
        (mapa[reuniao.dataOrd] ||= []).push(reuniao);
        return mapa;
    }, {});

    return Object.entries(grupos);
}

/* ---------------------------------------------------------
   RESUMO DO PERÍODO
   --------------------------------------------------------- */
interface CartaoResumo {
    chave: string;
    rotulo: string;
    valor: number;
    detalhe: string;
    cor: string;
    icone: NomeDeIcone;
    /** Status que o cartão aplica ao ser acionado. */
    status: string;
    /** Fatias da barra, em porcentagem, na ordem em que aparecem. */
    fatias: { cor: string; parte: number }[];
}

function montarResumo(base: Reuniao[]): CartaoResumo[] {
    const hoje = hojeEmIso();
    const total = base.length;
    const porStatus = (status: StatusReuniao): Reuniao[] =>
        base.filter((reuniao) => reuniao.status === status);

    const concluidas = porStatus("Concluída");
    const agendadas = porStatus("Agendada");
    const canceladas = porStatus("Cancelada");
    const futuras = agendadas.filter((reuniao) => reuniao.dataOrd >= hoje);
    const proxima = futuras.at(-1);
    const fatia = (quantidade: number): number =>
        total ? (quantidade / total) * 100 : 0;
    const proporcao = (quantidade: number): string =>
        total
            ? `${Math.round(fatia(quantidade))}% do recorte`
            : "Sem reuniões no recorte";

    return [
        {
            chave: "total",
            rotulo: "Reuniões no período",
            valor: total,
            detalhe: total
                ? `${concluidas.length} concluídas · ${agendadas.length} agendadas`
                : "Nenhuma reunião neste recorte",
            cor: "roxo",
            icone: "calendar",
            status: "Todos",
            fatias: [
                { cor: "verde", parte: fatia(concluidas.length) },
                { cor: "azul", parte: fatia(agendadas.length) },
                { cor: "vermelho", parte: fatia(canceladas.length) },
            ],
        },
        {
            chave: "proximas",
            rotulo: "Próximas agendadas",
            valor: futuras.length,
            detalhe: proxima
                ? `Mais próxima: ${dataCurta(proxima.dataOrd)}`
                : "Nenhuma reunião futura neste recorte",
            cor: "azul",
            icone: "calendar-days",
            status: "Agendada",
            fatias: [{ cor: "azul", parte: fatia(futuras.length) }],
        },
        {
            chave: "concluidas",
            rotulo: "Concluídas",
            valor: concluidas.length,
            detalhe: proporcao(concluidas.length),
            cor: "verde",
            icone: "check",
            status: "Concluída",
            fatias: [{ cor: "verde", parte: fatia(concluidas.length) }],
        },
        {
            chave: "canceladas",
            rotulo: "Canceladas",
            valor: canceladas.length,
            detalhe: proporcao(canceladas.length),
            cor: "vermelho",
            icone: "x",
            status: "Cancelada",
            fatias: [{ cor: "vermelho", parte: fatia(canceladas.length) }],
        },
    ];
}

function renderResumo(base: Reuniao[]): void {
    const estado = obterSecao("reunioes");

    intervalo.textContent =
        estado.de || estado.ate
            ? `${estado.de ? dataCurta(estado.de) : "início"} — ${estado.ate ? dataCurta(estado.ate) : "hoje"}`
            : "Todo o histórico";

    stats.innerHTML = montarResumo(base)
        .map((cartao) => {
            const ativo = cartao.status !== "Todos" && estado.status === cartao.status;

            return `
    <button class="agenda-stat ${cartao.cor}" type="button" data-stat-status="${escapar(cartao.status)}"
            aria-pressed="${ativo}" aria-label="Filtrar: ${escapar(cartao.rotulo)}, ${cartao.valor}">
      <span class="agenda-stat-topo">
        <span class="agenda-stat-icone">${icone(cartao.icone)}</span>
        <span class="agenda-stat-seta">${icone("chevron-right")}</span>
      </span>
      <span class="agenda-stat-meio">
        <strong class="agenda-stat-valor">${cartao.valor}</strong>
        <span class="agenda-stat-rotulo">${escapar(cartao.rotulo)}</span>
      </span>
      <span class="agenda-stat-base">
        <span class="agenda-stat-detalhe">${escapar(cartao.detalhe)}</span>
        <span class="agenda-stat-barra" aria-hidden="true">
          ${cartao.fatias.map((parte) => `<span class="${parte.cor}" style="width: ${parte.parte}%"></span>`).join("")}
        </span>
      </span>
    </button>`;
        })
        .join("");
}

/* ---------------------------------------------------------
   MOVIMENTO POR DIA
   --------------------------------------------------------- */
function renderGrafico(base: Reuniao[]): void {
    const dias = agruparPorDia(base).sort(([a], [b]) => (a < b ? -1 : 1));

    if (!dias.length) {
        grafico.innerHTML = `<p class="agenda-grafico-vazio">Nenhuma reunião no recorte para desenhar.</p>`;
        return;
    }

    const maior = Math.max(...dias.map(([, reunioes]) => reunioes.length));

    // Num mês só, o dia da semana ajuda a ler o ritmo. Quando o recorte
    // atravessa meses, "ter, 01" vira adivinhação: aí o mês é que importa.
    const umMesSo = new Set(dias.map(([dataOrd]) => dataOrd.slice(0, 7))).size === 1;

    grafico.innerHTML = dias
        .map(([dataOrd, reunioes]) => {
            const data = new Date(`${dataOrd}T00:00:00`);
            const rotulo = data
                .toLocaleDateString(
                    "pt-BR",
                    umMesSo
                        ? { weekday: "short", day: "2-digit" }
                        : { day: "2-digit", month: "short" },
                )
                .replace(".", "");
            const altura = Math.max(8, Math.round((reunioes.length / maior) * 96));
            const fatias = STATUS_DE_REUNIAO.map((status) => {
                const parte = reunioes.filter((reuniao) => reuniao.status === status);
                if (!parte.length) return "";
                const porcento = (parte.length / reunioes.length) * 100;
                return `<span class="${CLASSE_DO_STATUS[status]}" style="height: ${porcento}%"></span>`;
            }).join("");

            return `
    <button class="agenda-barra" type="button" data-grafico-dia="${dataOrd}"
            aria-label="${plural(reunioes.length, "reunião", "reuniões")} em ${escapar(rotulo)}">
      <span class="agenda-barra-numero">${reunioes.length}</span>
      <span class="agenda-barra-coluna" style="height: ${altura}px">${fatias}</span>
      <span class="agenda-barra-dia">${escapar(rotulo)}</span>
    </button>`;
        })
        .join("");
}

/* ---------------------------------------------------------
   LISTA, CARTÕES E CALENDÁRIO
   --------------------------------------------------------- */
function classeDoStatus(reuniao: Reuniao): string {
    return `status-${CLASSE_DO_STATUS[reuniao.status]}`;
}

function etiquetaDeStatus(reuniao: Reuniao): string {
    return `<span class="tag ${tagDoStatus[reuniao.status]}"><i class="agenda-ponto"></i>${escapar(reuniao.status)}</span>`;
}

function etiquetaDeTipo(reuniao: Reuniao): string {
    return `<span class="agenda-tipo ${tagDoTipoDeReuniao[reuniao.tipo]}"><i class="agenda-ponto"></i>${escapar(reuniao.tipo)}</span>`;
}

function renderLinha(reuniao: Reuniao): string {
    return `
    <div class="agenda-linha ${classeDoStatus(reuniao)}" role="button" tabindex="0"
         data-meeting-id="${reuniao.id}" data-date-ord="${reuniao.dataOrd}"
         aria-label="Abrir reunião de ${escapar(reuniao.tipo)} com ${escapar(reuniao.empresa)}">
      <div>
        ${
            reuniao.horario
                ? `<span class="agenda-hora">${reuniao.horario}</span>`
                : `<span class="agenda-hora-sub">Sem horário</span>`
        }
      </div>
      <div class="agenda-linha-main">
        <div class="agenda-linha-titulo">${escapar(reuniao.empresa)}</div>
        <div class="agenda-linha-motivo">${escapar(reuniao.resumo)}</div>
      </div>
      <div>${etiquetaDeTipo(reuniao)}</div>
      <div>${etiquetaDeStatus(reuniao)}</div>
      <div class="agenda-pessoa">${escapar(reuniao.responsavel)}</div>
      <div class="agenda-pessoa">${plural(reuniao.participantes.length, "pessoa", "pessoas")}</div>
      <span class="agenda-seta">${icone("chevron-right")}</span>
    </div>`;
}

function renderCartao(reuniao: Reuniao): string {
    return `
    <article class="agenda-card ${classeDoStatus(reuniao)}" role="button" tabindex="0"
             data-meeting-id="${reuniao.id}"
             aria-label="Abrir reunião de ${escapar(reuniao.tipo)} com ${escapar(reuniao.empresa)}">
      <div class="agenda-card-topo">
        <span class="agenda-card-hora${reuniao.horario ? "" : " vazia"}">${reuniao.horario || "Sem horário"}</span>
        <div class="agenda-card-main">
          <div class="agenda-card-titulo">${escapar(reuniao.empresa)}</div>
          <div class="agenda-card-motivo">${escapar(reuniao.resumo)}</div>
        </div>
        <span class="agenda-seta">${icone("chevron-right")}</span>
      </div>
      <div class="agenda-card-meta">
        ${etiquetaDeTipo(reuniao)}
        ${etiquetaDeStatus(reuniao)}
        <span class="agenda-pessoa">Realiza: ${escapar(reuniao.responsavel)}</span>
      </div>
    </article>`;
}

// Agrupamento inspirado em agendas como o Google Calendar: hoje, amanhã
// e ontem ficam destacados; o resto aparece pelo dia da semana.
function rotuloRelativo(dataOrd: string): string | null {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const data = new Date(`${dataOrd}T00:00:00`);
    data.setHours(0, 0, 0, 0);
    const diferenca = Math.round((data.getTime() - hoje.getTime()) / 86400000);

    if (diferenca === 0) return "Hoje";
    if (diferenca === 1) return "Amanhã";
    if (diferenca === -1) return "Ontem";
    return null;
}

function renderCabecalhoDoDia(dataOrd: string, total: number): string {
    const data = new Date(`${dataOrd}T00:00:00`);
    const relativo = rotuloRelativo(dataOrd);
    const mesCurto = data
        .toLocaleDateString("pt-BR", { month: "short" })
        .replace(".", "");
    // "sexta-feira" são duas palavras para o CSS: com `text-transform:
    // capitalize` sairia "Sexta-Feira", então só a inicial sobe, aqui.
    const diaSemana = data.toLocaleDateString("pt-BR", { weekday: "long" });
    const titulo = relativo || `${diaSemana[0].toUpperCase()}${diaSemana.slice(1)}`;
    const completa = data.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return `
    <div class="agenda-dia ${relativo === "Hoje" ? "hoje" : ""}">
      <div class="agenda-dia-pastilha">
        <strong>${data.getDate()}</strong>
        <small>${escapar(mesCurto)}</small>
      </div>
      <div class="agenda-dia-texto">
        <strong>${escapar(titulo)}</strong>
        <small>${escapar(completa)}</small>
      </div>
      <span class="agenda-dia-contagem">${plural(total, "reunião", "reuniões")}</span>
    </div>`;
}

interface CelulaCalendario {
    dia: number;
    data: Date;
    fora: boolean;
}

function mesSelecionado(): Date {
    const { mesCalendario } = obterSecao("reunioes");
    if (mesCalendario) {
        const [ano, mes] = mesCalendario.split("-").map(Number);
        return new Date(ano, mes - 1, 1);
    }
    const hoje = new Date();
    hoje.setDate(1);
    return hoje;
}

function guardarMes(data: Date): void {
    atualizarSecao("reunioes", {
        mesCalendario: `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`,
    });
}

function renderCalendario(): void {
    const titulo = porId("calendarMonthTitle");
    const dias = porId("calendarDays");
    const referencia = mesSelecionado();

    // `toLocaleDateString` devolve "setembro de 2026"; com text-transform a
    // preposição também virava maiúscula ("Setembro De 2026"), então o rótulo
    // é montado com só a inicial do mês em caixa alta.
    titulo.textContent = mesPorExtenso(referencia);
    dias.innerHTML = "";

    const ano = referencia.getFullYear();
    const mes = referencia.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    let indiceSegunda = primeiroDia.getDay() - 1;
    if (indiceSegunda < 0) indiceSegunda = 6;

    const diasMesAnterior = new Date(ano, mes, 0).getDate();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const celulas: CelulaCalendario[] = [];
    for (let i = indiceSegunda - 1; i >= 0; i--) {
        celulas.push({
            dia: diasMesAnterior - i,
            data: new Date(ano, mes - 1, diasMesAnterior - i),
            fora: true,
        });
    }
    for (let dia = 1; dia <= diasNoMes; dia++) {
        celulas.push({ dia, data: new Date(ano, mes, dia), fora: false });
    }
    while (celulas.length % 7 !== 0) {
        const dia = celulas.length - (indiceSegunda + diasNoMes) + 1;
        celulas.push({ dia, data: new Date(ano, mes + 1, dia), fora: true });
    }

    const porDia = meetingsData.reduce<Record<string, Reuniao[]>>((mapa, reuniao) => {
        (mapa[reuniao.dataOrd] ||= []).push(reuniao);
        return mapa;
    }, {});

    celulas.forEach(({ dia, data, fora }) => {
        const iso = paraIso(data);
        const reunioes = porDia[iso] || [];
        const hojeMesmo = data.getTime() === hoje.getTime();

        const celula = document.createElement("div");
        celula.className = `calendar-day${fora ? " muted-day" : ""}${hojeMesmo ? " today" : ""}`;
        celula.dataset.dateOrd = iso;
        celula.innerHTML = `
      <span class="calendar-day-number">${dia}</span>
      ${reunioes
          .slice(0, 3)
          .map(
              (reuniao) =>
                  `<span class="calendar-meeting ${CLASSE_DO_STATUS[reuniao.status]}">${reuniao.horario || "—"} · ${escapar(reuniao.empresa)}</span>`,
          )
          .join("")}
      ${reunioes.length > 3 ? `<span class="calendar-more">+${plural(reunioes.length - 3, "reunião", "reuniões")}</span>` : ""}
    `;

        if (!fora) {
            // Clicar num dia é o mesmo que recortar o período para ele: é o
            // caminho que a lista e o gráfico já entendem.
            celula.addEventListener("click", () =>
                atualizarSecao("reunioes", { de: iso, ate: iso, visualizacao: "list" }),
            );
        }

        dias.appendChild(celula);
    });
}

function renderReunioes(): void {
    const estado = obterSecao("reunioes");
    const base = recorte();
    const filtradas = reunioesFiltradas();
    const vazio = `<div class="empty-state">Nenhuma reunião encontrada com os filtros atuais.</div>`;
    const grupos = agruparPorDia(filtradas);

    renderResumo(base);
    renderGrafico(base);

    lista.innerHTML = filtradas.length
        ? `<div class="agenda-tabela-cab">
        <span>Horário</span><span>Reunião / motivo</span><span>Tipo</span>
        <span>Status</span><span>Quem realiza</span><span>Participantes</span><span></span>
      </div>` +
          grupos
              .map(
                  ([dataOrd, reunioes]) =>
                      renderCabecalhoDoDia(dataOrd, reunioes.length) +
                      reunioes.map(renderLinha).join(""),
              )
              .join("")
        : vazio;

    grid.innerHTML = filtradas.length
        ? grupos
              .map(
                  ([dataOrd, reunioes]) =>
                      renderCabecalhoDoDia(dataOrd, reunioes.length) +
                      `<div class="agenda-cards-grade">${reunioes.map(renderCartao).join("")}</div>`,
              )
              .join("")
        : vazio;

    porId("meetingCount").textContent = String(filtradas.length);

    [grid, lista].forEach((container) => {
        todos("[data-meeting-id]", container).forEach((elemento) => {
            const abrir = (): void => {
                const reuniao = meetingsData.find(
                    (registro) => registro.id === Number(dado(elemento, "meetingId")),
                );
                if (reuniao) openMeetingModal(reuniao, () => abrirFormularioDe(reuniao));
            };

            elemento.addEventListener("click", abrir);
            elemento.addEventListener("keydown", (evento) => {
                if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    abrir();
                }
            });
        });
    });

    lista.classList.toggle("hidden-view", estado.visualizacao !== "list");
    grid.classList.toggle("hidden-view", estado.visualizacao !== "cards");
    calendario.classList.toggle("hidden-view", estado.visualizacao !== "calendar");

    renderCalendario();
    desenharIcones();
}

/* ---------------------------------------------------------
   CONTROLES
   --------------------------------------------------------- */
/** Os quatro atalhos de período traduzidos para o par de datas. */
function intervaloDoAtalho(atalho: string): { de: string; ate: string } {
    const hoje = new Date();

    if (atalho === "hoje") {
        return { de: paraIso(hoje), ate: paraIso(hoje) };
    }

    if (atalho === "7dias") {
        const fim = new Date(hoje);
        fim.setDate(fim.getDate() + 6);
        return { de: paraIso(hoje), ate: paraIso(fim) };
    }

    if (atalho === "mes") {
        const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        return { de: paraIso(inicio), ate: paraIso(fim) };
    }

    return { de: "", ate: "" };
}

function aplicarEstadoNosControles(): void {
    const estado = obterSecao("reunioes");
    if (busca.value !== estado.busca) busca.value = estado.busca;
    tipoFilter.value = estado.tipo;
    empresaFilter.value = estado.empresa;
    statusFilter.value = estado.status;
    responsavelFilter.value = estado.responsavel;
    if (deCampo.value !== estado.de) deCampo.value = estado.de;
    if (ateCampo.value !== estado.ate) ateCampo.value = estado.ate;

    todos("#agendaPeriodo button").forEach((botao) => {
        const alvo = intervaloDoAtalho(dado(botao, "periodo"));
        botao.classList.toggle(
            "active",
            alvo.de === estado.de && alvo.ate === estado.ate,
        );
    });

    todos("#meetingViewToggle button").forEach((botao) => {
        botao.classList.toggle(
            "active",
            botao.dataset.meetingView === estado.visualizacao,
        );
    });
}

busca.addEventListener("input", () => atualizarSecao("reunioes", { busca: busca.value }));
tipoFilter.addEventListener("change", () =>
    atualizarSecao("reunioes", { tipo: tipoFilter.value }),
);
empresaFilter.addEventListener("change", () =>
    atualizarSecao("reunioes", { empresa: empresaFilter.value }),
);
statusFilter.addEventListener("change", () =>
    atualizarSecao("reunioes", { status: statusFilter.value }),
);
responsavelFilter.addEventListener("change", () =>
    atualizarSecao("reunioes", { responsavel: responsavelFilter.value }),
);
deCampo.addEventListener("change", () =>
    atualizarSecao("reunioes", { de: deCampo.value }),
);
ateCampo.addEventListener("change", () =>
    atualizarSecao("reunioes", { ate: ateCampo.value }),
);

porId("agendaPeriodo").addEventListener("click", (evento) => {
    const botao = alvoMaisProximo(evento, "[data-periodo]");
    if (botao) atualizarSecao("reunioes", intervaloDoAtalho(dado(botao, "periodo")));
});

// Um cartão já acionado volta a "Todos": é o mesmo gesto para aplicar e tirar.
stats.addEventListener("click", (evento) => {
    const cartao = alvoMaisProximo(evento, "[data-stat-status]");
    if (!cartao) return;

    const escolhido = dado(cartao, "statStatus");
    const atual = obterSecao("reunioes").status;
    atualizarSecao("reunioes", { status: atual === escolhido ? "Todos" : escolhido });
});

grafico.addEventListener("click", (evento) => {
    const barra = alvoMaisProximo(evento, "[data-grafico-dia]");
    if (!barra) return;

    const dia = dado(barra, "graficoDia");
    const estado = obterSecao("reunioes");
    const mesmoDia = estado.de === dia && estado.ate === dia;
    atualizarSecao("reunioes", mesmoDia ? { de: "", ate: "" } : { de: dia, ate: dia });
});

porId("meetingViewToggle").addEventListener("click", (evento) => {
    const botao = alvoMaisProximo(evento, "[data-meeting-view]");
    if (botao) {
        atualizarSecao("reunioes", {
            visualizacao: dado(botao, "meetingView") as VisualizacaoAgenda,
        });
    }
});

porId("clearMeetingFilters").addEventListener("click", () => {
    atualizarSecao("reunioes", {
        busca: "",
        tipo: "Todas",
        empresa: "Todas",
        status: "Todos",
        responsavel: "Todos",
        de: "",
        ate: "",
    });
});

porId("calendarPrev").addEventListener("click", () => {
    const referencia = mesSelecionado();
    referencia.setMonth(referencia.getMonth() - 1);
    guardarMes(referencia);
});

porId("calendarNext").addEventListener("click", () => {
    const referencia = mesSelecionado();
    referencia.setMonth(referencia.getMonth() + 1);
    guardarMes(referencia);
});

porId("calendarToday").addEventListener("click", () => {
    atualizarSecao("reunioes", { mesCalendario: null });
    renderCalendario();
});

/**
 * O mesmo formulário registra e edita: os campos são os mesmos, muda só se já
 * existe uma reunião por trás. `reuniao` ausente é um registro novo.
 */
function abrirFormularioDe(reuniao?: Reuniao): void {
    if (!empresas.length) {
        showModal(
            "Nenhuma empresa cadastrada",
            "Toda reunião pertence a uma empresa da carteira. Cadastre a empresa primeiro, em Empresas & clientes.",
        );
        return;
    }

    void abrirFormulario({
        titulo: reuniao ? `Reunião de ${reuniao.tipo}` : "Nova reunião",
        descricao: reuniao
            ? `${reuniao.empresa} • registrada em ${reuniao.data}.`
            : "A reunião entra no histórico da empresa e aparece na agenda.",
        campos: [
            {
                nome: "empresaId",
                rotulo: "Empresa",
                tipo: "selecao",
                valor: reuniao?.empresaId,
                opcoes: empresas.map(({ id, nome }) => ({ valor: id, rotulo: nome })),
            },
            {
                nome: "tipo",
                rotulo: "Tipo",
                tipo: "selecao",
                valor: reuniao?.tipo,
                opcoes: TIPOS_DE_REUNIAO.map((tipo) => ({ valor: tipo, rotulo: tipo })),
            },
            {
                nome: "data",
                rotulo: "Data",
                tipo: "data",
                valor: reuniao?.dataOrd,
                obrigatorio: true,
            },
            {
                nome: "horario",
                rotulo: "Horário",
                tipo: "hora",
                valor: reuniao?.horario ?? "",
                dica: "Opcional.",
            },
            {
                nome: "responsavel",
                rotulo: "Responsável interno",
                valor: reuniao?.responsavel,
                obrigatorio: true,
            },
            {
                nome: "status",
                rotulo: "Status",
                tipo: "selecao",
                valor: reuniao?.status ?? "Agendada",
                opcoes: STATUS_DE_REUNIAO.map((status) => ({
                    valor: status,
                    rotulo: status,
                })),
            },
            {
                nome: "participantes",
                rotulo: "Participantes",
                tipo: "linhas",
                valor: reuniao?.participantes.join("\n"),
                dica: "Um nome por linha.",
                largo: true,
            },
            {
                nome: "resumo",
                rotulo: "Resumo",
                tipo: "longo",
                valor: reuniao?.resumo,
                obrigatorio: true,
                largo: true,
            },
            {
                nome: "decisoes",
                rotulo: "Decisões tomadas",
                tipo: "linhas",
                valor: reuniao?.decisoes.join("\n"),
                dica: "Uma por linha.",
                largo: true,
            },
            {
                nome: "proximosPassos",
                rotulo: "Próximos passos",
                tipo: "linhas",
                valor: reuniao?.proximosPassos.join("\n"),
                dica: "Um por linha.",
                largo: true,
            },
        ],
        confirmar: reuniao ? "Salvar reunião" : "Registrar reunião",
        excluir: reuniao
            ? {
                  rotulo: "Excluir reunião",
                  confirmacao:
                      "A reunião sai do histórico da empresa e da agenda. Não há como desfazer.",
                  aoExcluir: async () => {
                      await excluirReuniao(reuniao.id);
                      await recarregar();
                  },
              }
            : undefined,
        aoSalvar: async (valores) => {
            const dados = {
                empresaId: valores.texto("empresaId"),
                tipo: valores.texto("tipo"),
                data: valores.texto("data"),
                horario: valores.texto("horario") || null,
                responsavel: valores.texto("responsavel"),
                status: valores.texto("status"),
                resumo: valores.texto("resumo"),
                participantes: valores.linhas("participantes"),
                decisoes: valores.linhas("decisoes"),
                proximosPassos: valores.linhas("proximosPassos"),
            };

            if (reuniao) {
                await salvarReuniao(reuniao.id, dados);
            } else {
                await cadastrarReuniao(dados);
            }

            await recarregar();
        },
    });
}

async function recarregar(): Promise<void> {
    ({ reunioes: meetingsData, empresas } = await carregarReunioes());
    preencherOpcoes();
    aplicarEstadoNosControles();
    renderReunioes();
}

porId("newMeeting").addEventListener("click", () => abrirFormularioDe());

observarEstado(["reunioes"], () => {
    aplicarEstadoNosControles();
    renderReunioes();
});

aplicarEstadoNosControles();
renderReunioes();
