@extends('layouts.app', [
    'tela' => 'projetos',
    'titulo' => 'Projetos',
    'descricao' => 'Projetos em andamento na HC, com responsável, prazo e progresso.',
])

@section('conteudo')
  {{-- Carteira de projetos: os cartões vêm da API. --}}
  <section class="page active" id="projetos">
    <div class="page-header">
      <div class="page-header-copy">
        <span class="page-overline">Acompanhamento</span>
        <h1>Projetos</h1>
        <p class="muted">
          Iniciativas em curso na HC, cada uma com responsável, área, prazo e o
          quanto já foi entregue.
        </p>
      </div>

      <div class="page-header-actions">
        <button class="primary" id="novoProjeto" type="button">Novo projeto</button>
      </div>
    </div>

    <div class="projetos-kpis" id="projetosKpis"></div>

    <div class="filtros">
      <div class="campo">
        <label for="projetoSearch">Buscar projeto</label>
        <input id="projetoSearch" placeholder="Nome, responsável ou empresa..." autocomplete="off" />
      </div>
      <div class="campo">
        <label for="projetoStatusFilter">Status</label>
        <select id="projetoStatusFilter">
          <option value="Todos">Todos</option>
          <option value="Em andamento">Em andamento</option>
          <option value="Em revisão">Em revisão</option>
          <option value="Planejado">Planejado</option>
          <option value="Concluído">Concluído</option>
        </select>
      </div>
      <div class="campo">
        <label for="projetoAreaFilter">Área</label>
        <select id="projetoAreaFilter">
          <option value="Todas">Todas as áreas</option>
        </select>
      </div>
      <button class="clear-filters" id="clearProjetoFilters" type="button">
        Limpar filtros
      </button>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h2>Carteira de projetos</h2>
          <p>Ordenados pela prioridade definida com o time.</p>
        </div>
        <span class="panel-count" id="projetosCount">0 projetos</span>
      </div>
      <div class="projetos-grid" id="projetosGrid">
        <div class="estado-carregando">Carregando projetos…</div>
      </div>
    </div>
  </section>
@endsection
