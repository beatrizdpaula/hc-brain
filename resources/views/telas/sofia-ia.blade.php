@extends('layouts.app', [
    'tela' => 'sofia-ia',
    'titulo' => 'Sofia IA',
    'descricao' => 'Converse com a Sofia e pesquise na base de conhecimento da HC.',
])

@section('conteudo')
  {{-- Interface da assistente de IA da empresa. --}}
  <section class="page page-cheia active" id="sofia">
    <div class="sofia-ai-screen">
      <div class="sofia-ai-main">
        <div class="sofia-welcome" id="sofiaWelcome">
          <span class="sofia-eyebrow">Sofia • Assistente da HC</span>
          <h1>O que você quer saber?</h1>
          <p>Pesquise na base de conhecimento da HC ou converse com a Sofia.</p>
        </div>

        <div class="sofia-suggestions" id="sofiaSuggestions"></div>

        <div class="chat" id="chat" aria-live="polite"></div>

        <div class="sofia-compose-wrap">
          <form class="chat-form" id="chatForm">
            <div class="sofia-attachment" id="sofiaAttachment">
              <i data-lucide="paperclip"></i>
              <span class="sofia-attachment-name" id="sofiaAttachmentName"></span>
              <button
                type="button"
                class="icon-button"
                id="removeSofiaAttachment"
                aria-label="Remover arquivo"
              >
                <i data-lucide="x"></i>
              </button>
            </div>

            <div class="sofia-input-row">
              <label class="sr-only" for="question">Sua pergunta</label>
              <input id="question" autocomplete="off" placeholder="Pergunte qualquer coisa..." />
            </div>

            <div class="sofia-toolbar">
              <input type="file" id="sofiaFileInput" hidden multiple />

              <button type="button" class="sofia-tool" id="sofiaAttachBtn" title="Anexar arquivo">
                <i data-lucide="plus"></i>
                <span class="sr-only">Anexar arquivo</span>
              </button>

              <button type="button" class="sofia-tool active" id="sofiaSearchMode" title="Pesquisar na base">
                <i data-lucide="search"></i>
                <span class="sofia-tool-text">Pesquisar</span>
              </button>

              <button type="button" class="sofia-tool" id="sofiaComputerMode" title="Consultar documentos e arquivos">
                <i data-lucide="database"></i>
                <span class="sofia-tool-text">Base HC</span>
              </button>

              <span class="sofia-spacer"></span>

              <button type="button" class="sofia-tool" id="sofiaLimparConversa" title="Limpar conversa">
                <i data-lucide="trash-2"></i>
                <span class="sofia-tool-text">Limpar conversa</span>
              </button>

              <button type="button" class="sofia-tool" id="sofiaModelBtn" title="Modelo da Sofia">
                <span class="sofia-tool-text">Sofia</span>
                <i data-lucide="chevron-down"></i>
              </button>

              <button type="button" class="icon-button sofia-mic" id="sofiaMicBtn" title="Usar microfone">
                <i data-lucide="mic"></i>
                <span class="sr-only">Usar microfone</span>
              </button>

              <button class="sofia-send" type="submit" aria-label="Enviar pergunta">
                <i data-lucide="arrow-up"></i>
              </button>
            </div>
          </form>

          <p class="sofia-mode-note" id="sofiaModeNote"></p>

          <small class="sofia-disclaimer">
            A Sofia pode cometer erros. Confira informações importantes antes de tomar
            decisões.
          </small>
        </div>
      </div>
    </div>
  </section>
@endsection
