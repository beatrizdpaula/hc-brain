@extends('layouts.app', [
    'tela' => 'processos',
    'titulo' => 'Processos',
    'descricao' => 'Fluxos e procedimentos usados pelas equipes da HC, etapa por etapa.',
])

@section('conteudo')
  {{-- Cada processo abre para mostrar as etapas na ordem de execução. --}}
  <section class="page active" id="processos">
    <div class="page-header">
      <div class="page-header-copy">
        <span class="page-overline">Processos internos</span>
        <h1>Fluxos e procedimentos</h1>
        <p class="muted">
          O jeito combinado de fazer cada coisa na HC. Abra um processo para ver as
          etapas na ordem em que são executadas, quem responde por ele e com que
          frequência acontece.
        </p>
      </div>

      <div class="page-header-actions">
        <button class="primary" id="novoProcesso" type="button">Novo processo</button>
      </div>
    </div>

    <div class="filtros">
      <div class="campo">
        <label for="processoSearch">Buscar processo</label>
        <input id="processoSearch" placeholder="Nome, etapa ou responsável..." autocomplete="off" />
      </div>
      <div class="campo">
        <label for="processoAreaFilter">Área</label>
        <select id="processoAreaFilter">
          <option value="Todas">Todas as áreas</option>
        </select>
      </div>
      <button class="clear-filters" id="clearProcessoFilters" type="button">
        Limpar filtros
      </button>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h2>Procedimentos documentados</h2>
          <p>Cada fluxo abre com as etapas na ordem de execução.</p>
        </div>
        <span class="panel-count" id="processosCount">0 processos</span>
      </div>
      <div class="processos-lista" id="processosLista">
        <div class="estado-carregando">Carregando processos…</div>
      </div>
    </div>
  </section>
@endsection
