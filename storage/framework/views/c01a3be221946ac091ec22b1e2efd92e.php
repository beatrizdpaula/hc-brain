

<?php $__env->startSection('conteudo'); ?>
  
  <section class="page active" id="reunioes">
    <div class="page-header">
      <div class="page-header-copy">
        <span class="page-overline">Histórico central de reuniões</span>
        <h1>Reuniões</h1>
        <p class="muted">
          Todas as reuniões da empresa — aberturas, transferências, dúvidas,
          comerciais, alinhamentos e financeiras — vinculadas à empresa e ao sócio
          responsável.
        </p>
      </div>

      <div class="page-header-actions">
        <button class="primary" id="newMeeting" type="button">Nova reunião</button>
      </div>
    </div>

    <div class="meetings-filters">
      <div class="advanced-search">
        <span class="search-icon"><i data-lucide="search"></i></span>
        <label class="sr-only" for="meetingSearch">Pesquisar reuniões</label>
        <input
          id="meetingSearch"
          autocomplete="off"
          placeholder="Pesquisar por empresa, sócio, assunto ou palavra-chave..."
        />
      </div>

      <div class="meetings-type-row" id="meetingTypeRow">
        <span class="filtro-inline-label">Tipo</span>
        <button class="search-chip active" type="button" data-meeting-type="Todas">Todas</button>
        <button class="search-chip" type="button" data-meeting-type="Abertura">Abertura</button>
        <button class="search-chip" type="button" data-meeting-type="Transferência">Transferência</button>
        <button class="search-chip" type="button" data-meeting-type="Dúvidas">Dúvidas</button>
        <button class="search-chip" type="button" data-meeting-type="Comercial">Comercial</button>
        <button class="search-chip" type="button" data-meeting-type="Alinhamento">Alinhamento</button>
        <button class="search-chip" type="button" data-meeting-type="Financeira">Financeira</button>
      </div>

      <div class="meetings-select-row">
        <div class="campo">
          <label for="meetingEmpresaFilter">Empresa</label>
          <select id="meetingEmpresaFilter">
            <option value="Todas">Todas as empresas</option>
          </select>
        </div>

        <div class="campo">
          <label for="meetingStatusFilter">Status</label>
          <select id="meetingStatusFilter">
            <option value="Todos">Todos</option>
            <option value="Concluída">Concluída</option>
            <option value="Agendada">Agendada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>

        <button id="clearMeetingFilters" class="clear-filters" type="button">
          Limpar filtros
        </button>
      </div>
    </div>

    <section class="meetings-calendar-panel" id="meetingsCalendarPanel" aria-label="Calendário de reuniões">
      <div class="meetings-calendar-head">
        <button type="button" class="icon-button" id="calendarPrev" aria-label="Mês anterior"><i data-lucide="chevron-left"></i></button>
        <div class="calendar-month-title">
          <strong id="calendarMonthTitle">—</strong>
          <button type="button" class="secondary calendar-today" id="calendarToday">Hoje</button>
        </div>
        <button type="button" class="icon-button" id="calendarNext" aria-label="Próximo mês"><i data-lucide="chevron-right"></i></button>
      </div>
      <div class="calendar-weekdays" aria-hidden="true">
        <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span>
        <span>Sex</span><span>Sáb</span><span>Dom</span>
      </div>
      <div class="calendar-days" id="calendarDays"></div>
    </section>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h2>Histórico de reuniões</h2>
          <p id="meetingCount">0 reuniões</p>
        </div>
        <div class="view-toggle" id="meetingViewToggle">
          <button type="button" class="active" data-meeting-view="list">Lista</button>
          <button type="button" data-meeting-view="cards">Cards</button>
        </div>
      </div>

      <div class="meetings-list" id="meetingsList">
        <div class="estado-carregando">Carregando reuniões…</div>
      </div>
      <div class="meetings-grid hidden-view" id="meetingsGrid"></div>
    </div>
  </section>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.app', [
    'tela' => 'reunioes',
    'titulo' => 'Reuniões',
    'descricao' => 'Histórico central de reuniões da HC por empresa, tipo e sócio responsável.',
], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\beatr\Downloads\HC\hc-brain-laravel-v2\hc-brain-laravel\resources\views/telas/reunioes.blade.php ENDPATH**/ ?>