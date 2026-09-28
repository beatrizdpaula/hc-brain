@extends('layouts.app', [
    'tela' => 'pesquisa',
    'titulo' => 'Pesquisa',
    'descricao' => 'Pesquise documentos, clientes, sócios, reuniões e decisões na memória da HC.',
])

@section('conteudo')
  {{-- Área de pesquisa inteligente e resultados. --}}
  <section class="page active" id="pesquisa">
    <div class="page-header">
      <div class="page-header-copy">
        <span class="page-overline">Consulta inteligente</span>
        <h1>Pesquisar na memória da HC</h1>
        <p class="muted">
          Encontre documentos, clientes, sócios, reuniões e decisões.
        </p>
      </div>

      <div class="page-header-actions">
        <button class="secondary" id="researchHelp" type="button">Como pesquisar</button>
      </div>
    </div>

    <div class="research-box">
      <form class="advanced-search" id="advancedSearchForm" role="search">
        <span class="search-icon"><i data-lucide="search"></i></span>
        <label class="sr-only" for="advancedSearchInput">Termo da pesquisa</label>
        <input
          id="advancedSearchInput"
          autocomplete="off"
          placeholder="Pesquise por nome, palavra-chave, documento ou pergunta..."
        />
        {{-- Só aparece quando há o que limpar; o script cuida disso. --}}
        <button type="button" class="icon-button" id="clearSearch" aria-label="Limpar pesquisa" hidden><i data-lucide="x"></i></button>
        <button type="submit" class="primary search-submit">Pesquisar</button>
      </form>

      <div class="quick">
        <span class="filtro-inline-label">Buscar em</span>
        <button class="search-chip active" type="button" data-scope="Tudo">Tudo</button>
        <button class="search-chip" type="button" data-scope="Documentos">Documentos</button>
        <button class="search-chip" type="button" data-scope="Pessoas">Pessoas</button>
        <button class="search-chip" type="button" data-scope="Projetos">Projetos</button>
        <button class="search-chip" type="button" data-scope="Reuniões">Reuniões</button>
        <button class="search-chip" type="button" data-scope="Comercial">Comercial</button>
      </div>
    </div>

    <div class="research-layout">
      <aside class="research-sidebar" aria-label="Filtros da pesquisa">
        <h2>Filtros</h2>

        <div class="campo">
          <label for="resultType">Tipo de informação</label>
          <select id="resultType">
            <option value="Tudo">Todos</option>
            <option value="Documento">Documentos</option>
            <option value="Pessoa">Pessoas</option>
            <option value="Projeto">Projetos</option>
            <option value="Reunião">Reuniões</option>
            <option value="Treinamento">Treinamentos</option>
          </select>
        </div>

        <div class="campo">
          <label for="resultArea">Área responsável</label>
          <select id="resultArea">
            <option value="Todas">Todas as áreas</option>
            <option value="Comercial">Comercial</option>
            <option value="Operações">Operações</option>
            <option value="Projetos">Projetos</option>
            <option value="Financeiro">Financeiro</option>
          </select>
        </div>

        <div class="campo">
          <label for="resultPeriod">Período</label>
          <select id="resultPeriod">
            <option>Qualquer período</option>
            <option>Hoje</option>
            <option>Esta semana</option>
            <option>Este mês</option>
          </select>
        </div>

        <button id="clearFilters" class="clear-filters" type="button">Limpar filtros</button>
      </aside>

      <div class="research-results">
        <div class="results-top">
          <h2 id="resultsTitle">Buscas recentes</h2>
          <span id="resultCount">0 consultas</span>
        </div>

        <div class="recent-searches" id="recentSearches">
          <div class="estado-carregando">Carregando buscas recentes…</div>
        </div>

        <div id="advancedResults"></div>
      </div>
    </div>
  </section>
@endsection
