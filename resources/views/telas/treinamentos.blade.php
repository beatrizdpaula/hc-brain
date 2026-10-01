@extends('layouts.app', [
    'tela' => 'treinamentos',
    'titulo' => 'Treinamentos',
    'descricao' => 'Cursos, trilhas, manuais e fluxogramas do sistema de capacitação da HC.',
])

@section('conteudo')
  {{-- Área de capacitação e conhecimento da HC. --}}
  <section class="page active" id="treinamentos">
    <div class="page-header">
      <div class="page-header-copy">
        <span class="page-overline">Capacitação • conhecimento da HC</span>
        <h1>Treinamentos</h1>
        <p class="muted">
          Conteúdos do sistema de capacitação integrados ao banco de conhecimento da
          HC: cursos, trilhas, manuais e fluxogramas.
        </p>
      </div>

      <div class="page-header-actions">
        <button class="primary" id="novoTreinamento" type="button">Novo conteúdo</button>
      </div>
    </div>

    <div class="training-banner">
      <span class="icone-quadro yellow"><i data-lucide="graduation-cap"></i></span>
      <div>
        <strong>Integração ativa com o banco de conhecimento</strong>
        <p>
          Esses conteúdos podem ser relacionados a processos, empresas e perguntas
          feitas à Sofia.
        </p>
      </div>
    </div>

    <div class="filtros">
      <div class="campo">
        <label for="trainingSearch">Buscar conteúdo</label>
        <input id="trainingSearch" autocomplete="off" placeholder="Curso, manual, trilha ou fluxograma..." />
      </div>
      <div class="campo">
        <label for="trainingTypeFilter">Tipo</label>
        <select id="trainingTypeFilter">
          <option value="Todos">Todos</option>
          <option value="Curso">Cursos</option>
          <option value="Trilha">Trilhas</option>
          <option value="Manual">Manuais</option>
          <option value="Fluxograma">Fluxogramas</option>
        </select>
      </div>
      <div class="campo">
        <label for="trainingLevelFilter">Nível</label>
        <select id="trainingLevelFilter">
          <option value="Todos">Todos os níveis</option>
          <option value="Iniciante">Iniciante</option>
          <option value="Intermediário">Intermediário</option>
          <option value="Avançado">Avançado</option>
        </select>
      </div>
      <button class="clear-filters" id="clearTrainingFilters" type="button">
        Limpar filtros
      </button>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h2>Conteúdos da capacitação</h2>
          <p>Cursos, trilhas, manuais e fluxogramas conhecidos pela HC Brain.</p>
        </div>
        <span class="panel-count" id="trainingContentCount">0 itens</span>
      </div>
      <div class="training-cards" id="trainingContentGrid">
        <div class="estado-carregando">Carregando conteúdos…</div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h2>Histórico de aprendizagem</h2>
          <p>O que cada colaborador recebeu ou concluiu no sistema de treinamento.</p>
        </div>
        <span class="panel-count" id="trainingHistoryCount">0 registros</span>
      </div>
      <div class="tabela-wrap">
        <table class="tabela training-history">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Conteúdo</th>
              <th>Progresso</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody id="trainingHistory"></tbody>
        </table>
      </div>
    </div>
  </section>
@endsection
