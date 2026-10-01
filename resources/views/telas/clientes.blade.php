@extends('layouts.app', [
    'tela' => 'clientes',
    'titulo' => 'Empresas & clientes',
    'descricao' => 'Banco central de empresas da HC, com sócio responsável, fontes e reuniões vinculadas.',
])

@section('conteudo')
  {{-- Lista das empresas. O detalhe de cada uma tem página própria. --}}
  <section class="page active" id="clientes">
    <div class="page-header">
      <div class="page-header-copy">
        <span class="page-overline">Banco central • empresa como entidade principal</span>
        <h1>Empresas &amp; clientes</h1>
        <p class="muted">
          Cada empresa é o registro principal: possui um sócio responsável, fontes
          vinculadas diretamente a ela e as reuniões realizadas ao longo do
          relacionamento.
        </p>
      </div>

      <div class="page-header-actions">
        <button class="primary" id="novaEmpresa" type="button">Nova empresa</button>
      </div>
    </div>

    <div class="empresas-toolbar">
      <div class="document-search">
        <span class="search-icon"><i data-lucide="search"></i></span>
        <label class="sr-only" for="empresaSearch">Pesquisar empresa</label>
        <input id="empresaSearch" autocomplete="off" placeholder="Pesquisar empresa ou sócio..." />
      </div>

      <div class="view-toggle" id="empresaViewToggle">
        <button type="button" class="active" data-empresa-view="list">Lista</button>
        <button type="button" data-empresa-view="cards">Cards</button>
      </div>
    </div>

    <div class="empresas-list" id="empresasList">
      <div class="estado-carregando">Carregando empresas…</div>
    </div>
    <div class="empresas-grid hidden-view" id="empresasGrid"></div>
  </section>
@endsection
