/* =========================================================
   TELA REUNIÕES
   Lista, calendário e filtros. Os filtros vivem no estado
   compartilhado, então "ver reuniões desta empresa" vindo do
   detalhe do cliente já chega com o recorte aplicado.
   ========================================================= */

import {
    carregarReunioes,
    tagDoStatus,
    tagDoTipoDeReuniao,
    type Reuniao,
} from "../dados/reunioes.ts";
import {
    alvoMaisProximo,
    campo,
    dado,
    porId,
    selecao,
    talvez,
    todos,
} from "../comum/dom.ts";
import {
    atualizarSecao,
    observarEstado,
    obterSecao,
    type VisualizacaoLista,
} from "../comum/estado.ts";
import { escapar, iniciais, mesPorExtenso, plural } from "../comum/formato.ts";
import { desenharIcones, icone } from "../comum/icones.ts";
import { openMeetingModal, showModal } from "../comum/modal.ts";
import { iniciarPagina } from "../comum/shell.ts";

iniciarPagina("reunioes");

const lista = porId("meetingsList");
const grid = porId("meetingsGrid");
const busca = campo("meetingSearch");
const empresaFilter = selecao("meetingEmpresaFilter");
const statusFilter = selecao("meetingStatusFilter");

const { reunioes: meetingsData, empresas } = await carregarReunioes();

empresas.forEach((nome) => {
    const opcao = document.createElement("option");
    opcao.value = nome;
    opcao.textContent = nome;
    empresaFilter.appendChild(opcao);
});

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

function reunioesFiltradas(): Reuniao[] {
    const estado = obterSecao("reunioes");
    const termo = estado.busca.toLowerCase().trim();

    return meetingsData
        .filter((reuniao) => estado.tipo === "Todas" || reuniao.tipo === estado.tipo)
        .filter(
            (reuniao) => estado.empresa === "Todas" || reuniao.empresa === estado.empresa,
        )
        .filter(
            (reuniao) => estado.status === "Todos" || reuniao.status === estado.status,
        )
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

function renderMeetingCard(reuniao: Reuniao): string {
    return `
    <article class="meeting-card" data-meeting-id="${reuniao.id}">
      <div class="meeting-card-top">
        <span class="tag ${tagDoTipoDeReuniao[reuniao.tipo] ?? ""}">${escapar(reuniao.tipo)}</span>
        <span class="tag ${tagDoStatus[reuniao.status] ?? ""}">${escapar(reuniao.status)}</span>
      </div>

      <div>
        <h3>Reunião de ${escapar(reuniao.tipo)}</h3>
        <span class="meeting-empresa">${escapar(reuniao.empresa)} • ${reuniao.data}</span>
      </div>

      <p class="meeting-resumo">${escapar(reuniao.resumo)}</p>

      <div class="meeting-card-footer">
        <span>${plural(reuniao.participantes.length, "participante", "participantes")}</span>
        <span class="meeting-link">Ver detalhes ${icone("arrow-right")}</span>
      </div>
    </article>
  `;
}

function renderMeetingListItem(reuniao: Reuniao): string {
    const classeStatus =
        reuniao.status === "Cancelada"
            ? "timeline-cancelled"
            : reuniao.status === "Agendada"
              ? "timeline-scheduled"
              : "timeline-completed";

    return `
    <article class="timeline-item ${classeStatus}" data-meeting-id="${reuniao.id}" data-date-ord="${reuniao.dataOrd}">
      <div class="timeline-time">
        <strong>${reuniao.horario || "—"}</strong>
        <span>${reuniao.data}</span>
      </div>
      <div class="avatar timeline-avatar">${iniciais(reuniao.empresa)}</div>
      <div class="timeline-main">
        <div class="timeline-title">
          <strong>Reunião de ${escapar(reuniao.tipo)}</strong>
          <span class="tag ${tagDoTipoDeReuniao[reuniao.tipo] ?? ""}">${escapar(reuniao.tipo)}</span>
        </div>
        <div class="timeline-company">${escapar(reuniao.empresa)} • Responsável: ${escapar(reuniao.responsavel)}</div>
        <div class="timeline-participants">${plural(reuniao.participantes.length, "participante", "participantes")} • ${escapar(reuniao.resumo)}</div>
      </div>
      <div class="timeline-actions">
        <span class="tag ${tagDoStatus[reuniao.status] ?? ""}">${escapar(reuniao.status)}</span>
        <span class="timeline-chevron">${icone("chevron-right")}</span>
      </div>
    </article>
  `;
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

function renderMeetingDayHeader(dataOrd: string, total: number): string {
    const data = new Date(`${dataOrd}T00:00:00`);
    const relativo = rotuloRelativo(dataOrd);
    const diaSemana = data.toLocaleDateString("pt-BR", { weekday: "long" });
    const dia = data.toLocaleDateString("pt-BR", { day: "numeric" });
    const mes = data.toLocaleDateString("pt-BR", { month: "long" });
    const ano =
        data.getFullYear() !== new Date().getFullYear()
            ? ` de ${data.getFullYear()}`
            : "";
    const rotulo = relativo || `${diaSemana}, ${dia} de ${mes}${ano}`;

    return `
    <div class="timeline-day-header ${relativo ? "relative-day" : ""} ${relativo === "Hoje" ? "today" : ""}">
      <span class="dot"></span>
      <span class="day-relative">${rotulo}</span>
      <small>${plural(total, "reunião", "reuniões")}</small>
    </div>
  `;
}

interface CelulaCalendario {
    dia: number;
    data: Date;
    fora: boolean;
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
        const iso = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
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
                  `<span class="calendar-meeting ${reuniao.status === "Concluída" ? "completed" : reuniao.status === "Cancelada" ? "cancelled" : ""}">${reuniao.horario || "—"} · ${escapar(reuniao.empresa)}</span>`,
          )
          .join("")}
      ${reunioes.length > 3 ? `<span class="calendar-more">+${plural(reunioes.length - 3, "reunião", "reuniões")}</span>` : ""}
    `;

        if (!fora) {
            celula.addEventListener("click", () => {
                todos(".calendar-day.selected", dias).forEach((item) =>
                    item.classList.remove("selected"),
                );
                celula.classList.add("selected");
                talvez(`.timeline-item[data-date-ord="${iso}"]`)?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            });
        }

        dias.appendChild(celula);
    });
}

function renderReunioes(): void {
    const estado = obterSecao("reunioes");
    const filtradas = reunioesFiltradas();
    const vazio = `<div class="empty-state">Nenhuma reunião encontrada com os filtros atuais.</div>`;

    grid.innerHTML = filtradas.length ? filtradas.map(renderMeetingCard).join("") : vazio;

    if (filtradas.length) {
        const porDia = filtradas.reduce<Record<string, Reuniao[]>>((grupos, reuniao) => {
            (grupos[reuniao.dataOrd] ||= []).push(reuniao);
            return grupos;
        }, {});

        lista.innerHTML = Object.entries(porDia)
            .map(
                ([dataOrd, reunioes]) =>
                    renderMeetingDayHeader(dataOrd, reunioes.length) +
                    reunioes.map(renderMeetingListItem).join(""),
            )
            .join("");
    } else {
        lista.innerHTML = vazio;
    }

    porId("meetingCount").textContent = plural(filtradas.length, "reunião", "reuniões");

    [grid, lista].forEach((container) => {
        todos("[data-meeting-id]", container).forEach((elemento) => {
            elemento.addEventListener("click", () => {
                const reuniao = meetingsData.find(
                    (registro) => registro.id === Number(dado(elemento, "meetingId")),
                );
                if (reuniao) openMeetingModal(reuniao);
            });
        });
    });

    grid.classList.toggle("hidden-view", estado.visualizacao !== "cards");
    lista.classList.toggle("hidden-view", estado.visualizacao !== "list");

    renderCalendario();
    desenharIcones();
}

function aplicarEstadoNosControles(): void {
    const estado = obterSecao("reunioes");
    if (busca.value !== estado.busca) busca.value = estado.busca;
    empresaFilter.value = estado.empresa;
    statusFilter.value = estado.status;

    todos("#meetingTypeRow .search-chip").forEach((chip) => {
        chip.classList.toggle("active", chip.dataset.meetingType === estado.tipo);
    });

    todos("#meetingViewToggle button").forEach((botao) => {
        botao.classList.toggle(
            "active",
            botao.dataset.meetingView === estado.visualizacao,
        );
    });
}

busca.addEventListener("input", () => atualizarSecao("reunioes", { busca: busca.value }));
empresaFilter.addEventListener("change", () =>
    atualizarSecao("reunioes", { empresa: empresaFilter.value }),
);
statusFilter.addEventListener("change", () =>
    atualizarSecao("reunioes", { status: statusFilter.value }),
);

porId("meetingTypeRow").addEventListener("click", (evento) => {
    const chip = alvoMaisProximo(evento, "[data-meeting-type]");
    if (chip) atualizarSecao("reunioes", { tipo: dado(chip, "meetingType") });
});

porId("meetingViewToggle").addEventListener("click", (evento) => {
    const botao = alvoMaisProximo(evento, "[data-meeting-view]");
    if (botao) {
        atualizarSecao("reunioes", {
            visualizacao: dado(botao, "meetingView") as VisualizacaoLista,
        });
    }
});

porId("clearMeetingFilters").addEventListener("click", () => {
    atualizarSecao("reunioes", {
        busca: "",
        tipo: "Todas",
        empresa: "Todas",
        status: "Todos",
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

porId("newMeeting").addEventListener("click", () => {
    showModal(
        "Nova reunião",
        "Na versão final, você poderá registrar uma nova reunião, escolher o tipo (abertura, transferência, dúvidas, comercial, alinhamento ou financeira) e vinculá-la diretamente à empresa e ao sócio responsável.",
    );
});

observarEstado(["reunioes"], () => {
    aplicarEstadoNosControles();
    renderReunioes();
});

aplicarEstadoNosControles();
renderReunioes();
