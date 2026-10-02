@extends('layouts.app', [
    'tela' => 'sofia-ia',
    'titulo' => 'Sofia IA',
    'descricao' => 'Converse com a Sofia e pesquise na base de conhecimento da HC.',
])

@section('conteudo')
  {{-- Interface da assistente, no formato de um chat de IA. --}}
  <section class="page page-cheia active" id="sofia">
    <div class="sofia-ai-screen" id="sofiaTela">
      <button
        type="button"
        class="sofia-historico-fundo"
        id="sofiaHistoricoFundo"
        aria-label="Fechar lista de chats"
        hidden
      ></button>

      <aside class="sofia-historico" id="sofiaHistorico" aria-label="Chats com a Sofia">
        <div class="sofia-historico-topo">
          <button type="button" class="icon-button" id="sofiaBuscaBtn" aria-label="Buscar chats" title="Buscar chats">
            <i data-lucide="search"></i>
          </button>
        </div>

        <button type="button" class="sofia-nova-conversa" id="sofiaNovaConversa">
          <i data-lucide="plus"></i>
          <span>Novo chat</span>
        </button>

        <label class="sofia-busca" id="sofiaBuscaWrap" hidden>
          <span class="sr-only">Buscar chats</span>
          <input id="sofiaBuscaChats" type="search" placeholder="Buscar em chats" autocomplete="off" />
        </label>

        <p class="sofia-historico-rotulo">Recentes</p>
        <div class="sofia-conversas" id="sofiaConversas"></div>

        <div class="sofia-usuario">
          <span class="avatar sofia-usuario-avatar" id="sofiaUsuarioAvatar" aria-hidden="true"></span>
          <span class="sofia-usuario-texto">
            <strong id="sofiaUsuarioNome"></strong>
            <small id="sofiaUsuarioPerfil"></small>
          </span>
        </div>
      </aside>

      <div class="sofia-ai-main">
        <header class="sofia-topo">
          <div class="sofia-topo-esq">
            <button
              type="button"
              class="icon-button sofia-abrir-historico"
              id="sofiaAbrirHistorico"
              aria-label="Abrir chats"
            >
              <i data-lucide="list"></i>
            </button>
            <h2 class="sofia-titulo-conversa" id="sofiaTituloConversa" hidden>Novo chat</h2>
          </div>

          <div class="sofia-modos" role="group" aria-label="Modo da Sofia">
            <button type="button" class="active" id="sofiaSearchMode">Pesquisar</button>
            <button type="button" id="sofiaComputerMode">Base HC</button>
          </div>

          <div class="sofia-topo-dir">
            <button type="button" class="sofia-modelo" id="sofiaModelBtn" title="Modelo da Sofia">
              Sofia
            </button>
          </div>
        </header>

        <div class="sofia-coluna" id="sofiaColuna">
          <div class="sofia-palco" id="sofiaPalco">
            <div class="chat" id="chat" aria-live="polite"></div>
          </div>

          <div class="sofia-centro">
            <div class="sofia-welcome" id="sofiaWelcome">
              <div class="sofia-marca" aria-hidden="true"><span>S</span></div>
              <p class="sofia-kicker">Assistente da base HC</p>
              <h1 id="sofiaSaudacao">O que você quer saber?</h1>
              <p class="sofia-welcome-texto">
                Pergunte por texto, grave um áudio ou anexe um arquivo de som. A Sofia responde com
                empresas, reuniões, documentos, projetos e processos da HC.
              </p>
            </div>

            <div class="sofia-compose-wrap" id="sofiaCompose">
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

                <div class="sofia-gravacao" id="sofiaGravacao" hidden role="region" aria-label="Gravação de áudio">
                  <div class="sofia-gravacao-topo">
                    <span class="sofia-gravacao-pulso" aria-hidden="true"></span>
                    <strong id="sofiaGravacaoEstado">Ouvindo…</strong>
                    <span id="sofiaGravacaoTempo">0:00</span>
                  </div>
                  <p class="sofia-gravacao-parcial" id="sofiaGravacaoParcial" aria-live="polite">
                    Fale sua pergunta.
                  </p>
                  <div class="sofia-gravacao-acoes">
                    <button type="button" class="sofia-gravacao-cancelar" id="sofiaGravacaoCancelar">
                      Cancelar
                    </button>
                    <button type="button" class="sofia-gravacao-enviar" id="sofiaGravacaoEnviar">
                      Enviar áudio
                    </button>
                  </div>
                </div>

                <div class="sofia-pill">
                  <input type="file" id="sofiaFileInput" hidden multiple accept="audio/*,.webm,.mp3,.m4a,.wav,.ogg,.mpeg,.mp4" />

                  <button type="button" class="sofia-pill-btn" id="sofiaAttachBtn" title="Anexar áudio">
                    <i data-lucide="plus"></i>
                    <span class="sr-only">Anexar áudio</span>
                  </button>

                  <label class="sr-only" for="question">Sua pergunta</label>
                  <textarea
                    id="question"
                    rows="1"
                    autocomplete="off"
                    placeholder="Pergunte à Sofia ou grave um áudio"
                  ></textarea>

                  <button
                    type="button"
                    class="sofia-pill-btn sofia-mic"
                    id="sofiaMicBtn"
                    title="Gravar áudio"
                    aria-pressed="false"
                    aria-label="Gravar pergunta em áudio"
                  >
                    <i data-lucide="mic"></i>
                  </button>

                  <button class="sofia-send" id="sofiaSend" type="submit" aria-label="Enviar pergunta" disabled>
                    <i data-lucide="arrow-up"></i>
                  </button>
                </div>
              </form>

              <p class="sofia-aviso" id="sofiaAviso" role="alert" hidden></p>

              <small class="sofia-disclaimer">
                A Sofia pode cometer erros. Confira informações importantes antes de tomar decisões.
              </small>
            </div>

            <div class="sofia-suggestions" id="sofiaSuggestions"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
@endsection
