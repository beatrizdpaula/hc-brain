/* =========================================================
   TELA COMERCIAL
   O período escolhido fica no estado compartilhado, então ele
   continua selecionado quando você voltar para esta tela. Cada
   período é uma consulta ao servidor, que guarda os indicadores.
   ========================================================= */

import {
    carregarComercial,
    carregarPeriodosComerciais,
    type IndicadoresComerciais,
    type OrigemLead,
} from "../dados/comercial.ts";
import { porId, selecao } from "../comum/dom.ts";
import { atualizarSecao, observarEstado, obterSecao } from "../comum/estado.ts";
import { moeda, escapar, plural } from "../comum/formato.ts";
import { iniciarPagina } from "../comum/shell.ts";

iniciarPagina("comercial");

const filtroPeriodo = selecao("commercialMonthFilter");

// O filtro lista os meses fechados na base. Sem nenhum, não há indicador a
// mostrar — e a tela diz isso em vez de ficar carregando para sempre.
const periodos = await carregarPeriodosComerciais();

filtroPeriodo.innerHTML = periodos
    .map(({ id, rotulo }) => `<option value="${id}">${rotulo}</option>`)
    .join("");
filtroPeriodo.disabled = periodos.length === 0;

function gradienteOrigens(origens: OrigemLead[], total: number): string {
    let cursor = 0;
    const paradas = origens.map(([, valor, cor]) => {
        const inicio = cursor;
        cursor += (valor / Math.max(total, 1)) * 100;
        return `${cor} ${inicio.toFixed(2)}% ${cursor.toFixed(2)}%`;
    });
    return `conic-gradient(${paradas.join(",")})`;
}

function porcentagem(valor: number): string {
    return `${valor.toFixed(1).replace(".", ",")}%`;
}

/** A comparação com o mês anterior, quando existe um mês anterior na base. */
function variacaoDeLeads(dados: IndicadoresComerciais): string {
    if (!dados.leadsAnteriores) {
        return `<span>primeiro mês da base</span>`;
    }

    const variacao =
        ((dados.leads - dados.leadsAnteriores) / dados.leadsAnteriores) * 100;
    const direcao = variacao < 0 ? "down" : "up";
    const sinal = variacao < 0 ? "" : "+";

    return `<span class="commercial-delta ${direcao}">${sinal}${porcentagem(variacao)}</span><span>vs. mês anterior</span>`;
}

function renderComercial(dados: IndicadoresComerciais): void {
    const conversao = dados.leads ? (dados.closed / dados.leads) * 100 : 0;
    const qualificacao = dados.leads ? (dados.qualified / dados.leads) * 100 : 0;
    const propostas = dados.qualified ? (dados.proposals / dados.qualified) * 100 : 0;
    const perdas = dados.losses.reduce((soma, [, valor]) => soma + valor, 0);

    porId("commercialKpis").innerHTML = `
    <div class="commercial-kpi"><span class="commercial-kpi-label">Leads recebidos</span><strong class="commercial-kpi-value">${dados.leads}</strong><div class="commercial-kpi-foot">${variacaoDeLeads(dados)}</div></div>
    <div class="commercial-kpi"><span class="commercial-kpi-label">Leads qualificados</span><strong class="commercial-kpi-value">${dados.qualified}</strong><div class="commercial-kpi-foot"><span class="commercial-delta up">${porcentagem(qualificacao)}</span><span>qualificação</span></div></div>
    <div class="commercial-kpi"><span class="commercial-kpi-label">Vendas fechadas</span><strong class="commercial-kpi-value">${dados.closed}</strong><div class="commercial-kpi-foot"><span class="commercial-delta up">${porcentagem(conversao)}</span><span>de conversão</span></div></div>
    <div class="commercial-kpi"><span class="commercial-kpi-label">Receita fechada</span><strong class="commercial-kpi-value">${moeda(dados.revenue)}</strong><div class="commercial-kpi-foot"><span>ticket médio</span><span>${moeda(dados.averageTicket)}</span></div></div>
    <div class="commercial-kpi"><span class="commercial-kpi-label">Em processo</span><strong class="commercial-kpi-value">${dados.inProcess}</strong><div class="commercial-kpi-foot"><span class="commercial-delta neutral">${dados.proposals}</span><span>propostas ativas</span></div></div>
  `;

    const funil: [string, number][] = [
        ["Leads recebidos", dados.leads],
        ["Qualificados", dados.qualified],
        ["Reuniões", dados.meetings],
        ["Propostas", dados.proposals],
        ["Vendas fechadas", dados.closed],
    ];
    const maximo = dados.leads || 1;

    porId("commercialFunnel").innerHTML = funil
        .map(
            ([nome, valor]) => `
        <div class="commercial-funnel-row">
          <span class="commercial-funnel-name">${nome}</span>
          <div class="commercial-funnel-track"><div class="commercial-funnel-fill" style="width:${Math.max(7, (valor / maximo) * 100)}%"></div></div>
          <strong class="commercial-funnel-value">${valor}</strong>
        </div>
      `,
        )
        .join("");

    porId("commercialRates").innerHTML = `
    <div class="commercial-rate"><span>Taxa de qualificação</span><strong>${porcentagem(qualificacao)}</strong><small>leads que avançaram</small></div>
    <div class="commercial-rate"><span>Qualificados → proposta</span><strong>${porcentagem(propostas)}</strong><small>avanço do funil</small></div>
    <div class="commercial-rate"><span>Proposta → venda</span><strong>${dados.proposals ? porcentagem((dados.closed / dados.proposals) * 100) : "0%"}</strong><small>eficiência do fechamento</small></div>
    <div class="commercial-rate"><span>Perdas registradas</span><strong>${perdas}</strong><small>leads sem fechamento</small></div>
  `;

    const maximoMensal = Math.max(...dados.monthly.map(([, valor]) => valor), 1);
    porId("commercialMonthlyLeads").innerHTML = `
    <div class="commercial-bars">${dados.monthly
        .map(
            ([rotulo, valor]) => `
          <div class="commercial-month-col">
            <span class="commercial-month-value">${valor}</span>
            <div class="commercial-month-bar-wrap"><div class="commercial-month-bar" style="height:${Math.max(6, (valor / maximoMensal) * 100)}%"></div></div>
            <span class="commercial-month-label">${rotulo}</span>
          </div>
        `,
        )
        .join("")}</div>
  `;

    porId("commercialOriginLegend").innerHTML = dados.origins
        .map(
            ([nome, valor, cor]) => `
        <div class="commercial-legend-row"><i class="commercial-legend-dot" style="background:${cor}"></i><span>${nome}</span><strong>${valor}</strong></div>
      `,
        )
        .join("");

    porId("commercialOriginDonut").style.background = gradienteOrigens(
        dados.origins,
        dados.leads,
    );

    const maximoPerda = Math.max(...dados.losses.map(([, valor]) => valor), 1);
    porId("commercialLostTotal").textContent = plural(perdas, "perda", "perdas");
    porId("commercialLossReasons").innerHTML = dados.losses
        .map(
            ([nome, valor]) => `
        <div class="commercial-loss-row">
          <span class="commercial-loss-name">${nome}</span>
          <div class="commercial-loss-track"><div class="commercial-loss-fill" style="width:${(valor / maximoPerda) * 100}%"></div></div>
          <strong class="commercial-loss-count">${valor}</strong>
        </div>
      `,
        )
        .join("");

    porId("commercialSalesList").innerHTML = dados.sales
        .map(
            ([empresa, responsavel, valor]) => `
        <div class="commercial-sale-row">
          <div class="commercial-sale-avatar">${escapar(empresa.replace("Empresa ", "").slice(0, 2))}</div>
          <div class="commercial-sale-main"><strong>${escapar(empresa)}</strong><span>${escapar(responsavel)}</span></div>
          <span class="commercial-sale-value">${valor}</span>
        </div>
      `,
        )
        .join("");

    porId("commercialTeamBody").innerHTML = [...dados.team]
        .sort((a, b) => b[2] - a[2])
        .map(
            (linha, indice) => `
        <tr>
          <td>${String(indice + 1).padStart(2, "0")}</td>
          <td><strong>${escapar(linha[0])}</strong></td>
          <td>${linha[1]}</td>
          <td>${linha[2]}</td>
          <td>${porcentagem(linha[3])}</td>
          <td>${moeda(linha[4])}</td>
        </tr>
      `,
        )
        .join("");

    filtroPeriodo.value = dados.periodo;
}

async function carregarEExibir(): Promise<void> {
    if (!periodos.length) {
        porId("commercialKpis").innerHTML =
            `<div class="empty-state">Nenhum período comercial fechado na base ainda.</div>`;
        return;
    }

    renderComercial(await carregarComercial(obterSecao("comercial").periodo));
}

filtroPeriodo.addEventListener("change", () =>
    atualizarSecao("comercial", { periodo: filtroPeriodo.value }),
);

observarEstado(["comercial"], () => {
    void carregarEExibir();
});

await carregarEExibir();
