

<?php $__env->startSection('conteudo'); ?>
  
  <section class="page active" id="pastas">
    <div class="page-header">
      <div class="page-header-copy">
        <span class="page-overline">Arquivos e conhecimento</span>
        <h1>Documentos</h1>
        <p class="muted">Organize, pesquise e acesse os arquivos da HC.</p>
      </div>

      <div class="page-header-actions">
        <button class="secondary" id="newFolder" type="button">Nova pasta</button>
        <button class="primary" id="uploadFile" type="button">Enviar arquivo</button>
      </div>
    </div>

    <div class="documents-tabs" role="tablist">
      <button class="document-tab active" type="button" data-special="explore">Explorar</button>
      <button class="document-tab" type="button" data-special="recent">Recentes</button>
      <button class="document-tab" type="button" data-special="favorites">Favoritos</button>
      <button class="document-tab" type="button" data-special="shared">Compartilhados comigo</button>
    </div>

    <div class="documents-layout">
      <aside class="folder-menu" aria-label="Pastas">
        <p class="folder-menu-title">Minhas pastas</p>
        <div id="folderMenu"></div>
      </aside>

      <div class="documents-content">
        <div class="documents-toolbar">
          <nav class="breadcrumb" aria-label="Caminho">
            <span>Documentos</span>
            <span aria-hidden="true">/</span>
            <strong id="currentFolder">Todas as pastas</strong>
          </nav>

          <div class="view-toggle" id="documentViewToggle">
            <button type="button" class="active" data-document-view="grid" id="gridView">
              Grade
            </button>
            <button type="button" data-document-view="list" id="listView">Lista</button>
          </div>
        </div>

        <div class="documents-filtros">
          <div class="document-search">
            <span class="search-icon"><i data-lucide="search"></i></span>
            <label class="sr-only" for="documentSearch">Pesquisar documentos</label>
            <input id="documentSearch" autocomplete="off" placeholder="Pesquisar documentos e pastas..." />
          </div>

          <label class="sr-only" for="documentType">Tipo de arquivo</label>
          <select id="documentType" class="controle documents-tipo">
            <option value="all">Todos os tipos</option>
            <option value="folder">Pastas</option>
            <option value="pdf">PDF</option>
            <option value="doc">Documentos</option>
            <option value="sheet">Planilhas</option>
          </select>
        </div>

        <div class="documents-summary">
          <span id="counter">0 itens encontrados</span>
          <button id="selectAll" class="clear-filters" type="button">Selecionar todos</button>
        </div>

        <div class="documents-grid" id="documentsGrid">
          <div class="estado-carregando">Carregando documentos…</div>
        </div>
      </div>
    </div>
  </section>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.app', [
    'tela' => 'documentos',
    'titulo' => 'Documentos',
    'descricao' => 'Organize, pesquise e acesse os arquivos da HC.',
], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\beatr\Downloads\HC\hc-brain-laravel-v2\hc-brain-laravel\resources\views/telas/documentos.blade.php ENDPATH**/ ?>