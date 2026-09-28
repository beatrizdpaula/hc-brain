@extends('layouts.app', [
    'tela' => 'financeiro',
    'titulo' => 'Financeiro geral',
    'descricao' => 'Visão consolidada da carteira: LTV, honorários e concentração de receita.',
])

@section('conteudo')
  {{-- Visão financeira consolidada de todas as empresas. --}}
  <section class="page finance-page active" id="financeiro-geral">
    <span class="page-overline">VISÃO FINANCEIRA • TODAS AS EMPRESAS</span>

    <div class="finance-head">
      <div class="finance-head-copy">
        <h1>Financeiro geral</h1>
        <p class="muted">
          Uma visão consolidada da carteira para comparar valor dos clientes,
          honorários e concentração de receita.
        </p>
      </div>
    </div>

    <div class="finance-toolbar">
      <div class="finance-field">
        <label for="financeEmpresaSearch">Empresa</label>
        <input
          id="financeEmpresaSearch"
          placeholder="Pesquisar empresa..."
          autocomplete="off"
        />
      </div>
      <div class="finance-field">
        <label for="financeRegimeFilter">Regime tributário</label>
        <select id="financeRegimeFilter">
          <option value="Todos">Todos os regimes</option>
          <option value="Simples Nacional">Simples Nacional</option>
          <option value="Lucro Presumido">Lucro Presumido</option>
          <option value="Lucro Real">Lucro Real</option>
        </select>
      </div>
      <button class="finance-clear" id="clearFinanceFilters">Limpar filtros</button>
    </div>

    <div class="finance-filter-state" id="financeFilterState">
      <span class="dot"></span><span>Todos os clientes</span>
    </div>

    <div class="finance-kpis" id="financeKpis"></div>

    <div class="finance-main-grid">
      <div class="finance-panel">
        <div class="finance-panel-head">
          <div>
            <h2>LTV médio por regime</h2>
            <p>Quanto cada grupo de empresas já deixou, em média.</p>
          </div>
        </div>
        <div class="finance-panel-body" id="financeLtvChart"></div>
      </div>

      <div class="finance-panel">
        <div class="finance-panel-head">
          <div>
            <h2>Distribuição do valor arrecadado</h2>
            <p>Participação de cada regime na carteira filtrada.</p>
          </div>
        </div>
        <div class="finance-panel-body">
          <div class="finance-donut-wrap">
            <div class="finance-donut" id="financeDonut">
              <div class="finance-donut-center">
                <strong id="financeDonutTotal">R$ 0</strong><span>carteira</span>
              </div>
            </div>
            <div class="finance-legend" id="financeLegend"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="finance-secondary-grid">
      <div class="finance-panel">
        <div class="finance-panel-head">
          <div>
            <h2>Honorário: entrada × atual</h2>
            <p>Comparação entre o primeiro valor e o honorário atual.</p>
          </div>
        </div>
        <div class="finance-panel-body" id="financeHonorariumChart"></div>
      </div>

      <div class="finance-panel">
        <div class="finance-panel-head">
          <div>
            <h2>Concentração da carteira</h2>
            <p>Empresas que representam maior valor arrecadado no grupo.</p>
          </div>
        </div>
        <div class="finance-panel-body" id="financeTopClients"></div>
      </div>
    </div>

    <div class="finance-insights" id="financeInsights"></div>

    <div class="finance-table-panel">
      <div class="finance-table-head">
        <div>
          <h2>Clientes analisados</h2>
          <span class="muted">Indicadores consolidados por empresa.</span>
        </div>
        <span class="finance-count" id="financeCount">0 empresas</span>
      </div>
      <div class="finance-table-wrap">
        <table class="finance-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Regime</th>
              <th>Tempo de vida</th>
              <th>1º honorário</th>
              <th>Honorário atual</th>
              <th>LTV / total arrecadado</th>
            </tr>
          </thead>
          <tbody id="financeTableBody">
            <tr>
              <td colspan="6">
                <div class="estado-carregando">Carregando carteira…</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
@endsection
