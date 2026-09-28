@extends('layouts.app', [
    'tela' => 'inicio',
    'titulo' => 'Início',
    'descricao' => 'Memória central da Health Care: reuniões, documentos, empresas, treinamentos e indicadores.',
])

@section('conteudo')
  {{-- Painel de entrada: busca, números da base, atalhos e atividade recente. --}}
  <section class="page active" id="inicio">
    <div class="hero">
      <span class="hero-label">Inteligência • Memória • Aprendizado</span>

      <h1>O que a empresa precisa saber agora?</h1>

      <p>
        Pesquise em reuniões, treinamentos, fluxos, planilhas, documentos,
        históricos e demais fontes que alimentam a memória da empresa HC.
      </p>

      <form class="hero-search" id="heroSearchForm" role="search">
        <label class="sr-only" for="heroSearchInput">Pesquisar na memória da HC</label>
        <span class="hero-search-icon"><i data-lucide="search"></i></span>
        <input
          id="heroSearchInput"
          autocomplete="off"
          placeholder="Pergunte à Sofia ou encontre qualquer informação..."
        />
        <button class="primary" type="submit">Pesquisar</button>
      </form>

      <div class="quick">
        <button type="button" data-search="Abertura de empresa">Abertura de empresa</button>
        <button type="button" data-search="Proposta comercial">Proposta comercial</button>
        <button type="button" data-search="Reunião de abertura">Reunião de abertura</button>
        <button type="button" data-search="Simples Nacional">Simples Nacional</button>
      </div>
    </div>

    {{-- Os números saem de contagens reais da base, não de valores fixos. --}}
    <div class="metrics" id="inicioMetrics">
      <div class="estado-carregando">Carregando os números da base…</div>
    </div>

    <h2>Acessos rápidos</h2>
    <div class="card-grid" id="atalhosGrid"></div>

    <div class="dashboard">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Atividade recente</h2>
            <p>Últimas reuniões, projetos e documentos registrados.</p>
          </div>
        </div>
        <div class="panel-body" id="atividadeRecente">
          <div class="estado-carregando">Carregando atividade…</div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Onde a base está</h2>
            <p>Volume por área do sistema.</p>
          </div>
        </div>
        <div class="panel-body" id="areasAcessadas"></div>
      </div>
    </div>
  </section>
@endsection
