/* =========================================================
   TELA SOFIA (IA)
   Vários chats, como um assistente de verdade: a lista fica na
   lateral, um chat novo começa em branco e a conversa aberta
   continua no navegador — inclusive em outra aba.

   O microfone grava a pergunta. Se o navegador reconhece voz, o
   texto segue direto. Se não, o áudio vai para o servidor e volta
   transcrito — ou com um aviso claro, quando a chave não existe.
   ========================================================= */

import { ErroDeApi } from "../comum/api.ts";
import {
    carregarSugestoes,
    enviarAudioSofia,
    perguntarSofia,
    tituloDaConversa,
    type AutorMensagem,
    type ConversaSofia,
    type MensagemSofia,
} from "../dados/sofia.ts";
import { alvoMaisProximo, campo, dado, porId, todos } from "../comum/dom.ts";
import {
    atualizarSecao,
    observarEstado,
    obterSecao,
    type ModoSofia,
} from "../comum/estado.ts";
import { escapar } from "../comum/formato.ts";
import { desenharIcones, icone, iconeSeguro } from "../comum/icones.ts";
import { showModal } from "../comum/modal.ts";
import { iniciarPagina } from "../comum/shell.ts";

/** O reconhecimento de voz não é padrão em todos os navegadores. */
interface AlternativaDeVoz {
    transcript: string;
}

interface ResultadoDeVoz {
    isFinal: boolean;
    readonly length: number;
    [indice: number]: AlternativaDeVoz;
}

interface EventoDeVoz {
    resultIndex: number;
    results: ArrayLike<ResultadoDeVoz>;
}

interface ErroDeVoz {
    error: string;
}

interface ReconhecimentoDeVoz {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((evento: EventoDeVoz) => void) | null;
    onerror: ((evento: ErroDeVoz) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

type ConstrutorDeReconhecimento = new () => ReconhecimentoDeVoz;

type ModoGravacao = "fala" | "arquivo";

const LIMITE_GRAVACAO_MS = 120_000;

const usuario = iniciarPagina("sofia-ia");

const tela = porId("sofiaTela");
const coluna = porId("sofiaColuna");
const lista = porId("sofiaConversas");
const titulo = porId("sofiaTituloConversa");
const chat = porId("chat");
const boasVindas = porId("sofiaWelcome");
const sugestoes = porId("sofiaSuggestions");
const entrada = porId<HTMLTextAreaElement>("question");
const envio = porId<HTMLButtonElement>("sofiaSend");
const micBtn = porId<HTMLButtonElement>("sofiaMicBtn");
const anexo = porId("sofiaAttachment");
const anexoNome = porId("sofiaAttachmentName");
const arquivos = campo("sofiaFileInput");
const modoPesquisa = porId("sofiaSearchMode");
const modoBase = porId("sofiaComputerMode");
const fundoHistorico = porId("sofiaHistoricoFundo");
const buscaWrap = porId("sofiaBuscaWrap");
const buscaChats = porId<HTMLInputElement>("sofiaBuscaChats");
const gravacao = porId("sofiaGravacao");
const gravacaoEstado = porId("sofiaGravacaoEstado");
const gravacaoTempo = porId("sofiaGravacaoTempo");
const gravacaoParcial = porId("sofiaGravacaoParcial");
const aviso = porId("sofiaAviso");

porId("sofiaUsuarioAvatar").textContent = usuario.iniciais;
porId("sofiaUsuarioNome").textContent = usuario.nome;
porId("sofiaUsuarioPerfil").textContent = usuario.perfil;

const primeiroNome = usuario.nome.trim().split(/\s+/)[0];
if (primeiroNome) {
    porId("sofiaSaudacao").textContent = `Olá, ${primeiroNome}. O que você quer saber?`;
}

/** Chats que ainda estão esperando a resposta da Sofia. */
const aguardando = new Set<string>();

/** Chat que está esperando a transcrição de um arquivo de áudio. */
let transcrevendoId: string | null = null;

/** Arquivo de áudio escolhido no anexo, pronto para enviar. */
let audioAnexado: File | null = null;

let modoGravacao: ModoGravacao | null = null;
let reconhecimentoAtivo: ReconhecimentoDeVoz | null = null;
let gravador: MediaRecorder | null = null;
let streamMic: MediaStream | null = null;
let pedacos: Blob[] = [];
let cancelouGravacao = false;
let paradaPedida = false;
let timerGravacao: number | null = null;
let inicioGravacao = 0;
let transcricaoFinal = "";
let transcricaoParcial = "";

function novoId(): string {
    return crypto.randomUUID();
}

function conversaAberta(): ConversaSofia | null {
    const { conversaAtiva, conversas } = obterSecao("sofia");
    return conversas.find((conversa) => conversa.id === conversaAtiva) ?? null;
}

function fecharHistorico(): void {
    tela.classList.remove("historico-aberto");
    fundoHistorico.hidden = true;
}

function abrirHistorico(): void {
    tela.classList.add("historico-aberto");
    fundoHistorico.hidden = false;
}

function ajustarCampo(): void {
    entrada.style.height = "auto";
    entrada.style.height = `${Math.min(entrada.scrollHeight, 160)}px`;
}

function esperandoResposta(): boolean {
    const aberta = conversaAberta();
    return aberta !== null && aguardando.has(aberta.id);
}

function atualizarEnvio(): void {
    envio.disabled =
        esperandoResposta() ||
        modoGravacao !== null ||
        (entrada.value.trim() === "" && audioAnexado === null);
    micBtn.disabled = esperandoResposta();
}

function mostrarAviso(texto: string): void {
    aviso.textContent = texto;
    aviso.hidden = false;
}

function limparAviso(): void {
    aviso.textContent = "";
    aviso.hidden = true;
}

function limparAnexo(): void {
    audioAnexado = null;
    arquivos.value = "";
    anexo.classList.remove("show");
    anexoNome.textContent = "";
    atualizarEnvio();
}

function mensagemDe(autor: AutorMensagem, texto: string, voz: boolean): MensagemSofia {
    return voz ? { autor, texto, voz: true } : { autor, texto };
}

function htmlMensagem(mensagem: MensagemSofia, indice: number): string {
    if (mensagem.autor === "user") {
        if (mensagem.voz) {
            return `
              <div class="message user message-voz">
                <div class="message-texto">
                  <span class="sofia-voz-etiqueta">${icone("mic")} Áudio</span>
                  <p>${escapar(mensagem.texto)}</p>
                </div>
              </div>
            `;
        }

        return `<div class="message user"><div class="message-texto">${escapar(mensagem.texto)}</div></div>`;
    }

    return `
      <div class="message bot">
        <span class="sofia-avatar" aria-hidden="true">S</span>
        <div class="message-corpo">
          <div class="message-texto">${escapar(mensagem.texto)}</div>
          <button type="button" class="sofia-copiar" data-copiar="${indice}">Copiar</button>
        </div>
      </div>
    `;
}

function htmlAudioPendente(): string {
    return `
      <div class="message user message-voz">
        <div class="message-texto">
          <span class="sofia-voz-etiqueta">${icone("mic")} Áudio</span>
          <p>Transcrevendo áudio…</p>
        </div>
      </div>
    `;
}

function renderConversa(): void {
    const aberta = conversaAberta();
    const mensagens = aberta?.mensagens ?? [];
    const pensando = aberta !== null && aguardando.has(aberta.id);
    const transcrevendo = aberta !== null && transcrevendoId === aberta.id;
    const conversando = mensagens.length > 0 || pensando || transcrevendo;

    chat.innerHTML =
        mensagens.map(htmlMensagem).join("") +
        (transcrevendo ? htmlAudioPendente() : "") +
        (pensando
            ? `<div class="message bot"><span class="sofia-avatar" aria-hidden="true">S</span><div class="message-corpo"><div class="message-texto"><span class="sofia-digitando"><i></i><i></i><i></i></span></div></div></div>`
            : "");

    desenharIcones(chat);
    chat.classList.toggle("active", conversando);
    coluna.classList.toggle("em-conversa", conversando);
    coluna.classList.toggle("enviando-audio", transcrevendo);
    boasVindas.hidden = conversando;
    sugestoes.hidden = conversando;
    titulo.hidden = !conversando;
    titulo.textContent = aberta?.titulo ?? "Novo chat";

    if (conversando) chat.scrollTop = chat.scrollHeight;
    atualizarEnvio();
}

function previaDa(conversa: ConversaSofia): string {
    const ultima = conversa.mensagens.at(-1);
    if (!ultima) return "Chat novo";

    const texto = ultima.texto.replace(/\s+/g, " ").trim();
    const prefixo = ultima.autor === "bot" ? "Sofia: " : ultima.voz ? "Áudio: " : "";
    const linha = `${prefixo}${texto}`;
    return linha.length > 42 ? `${linha.slice(0, 39).trimEnd()}…` : linha;
}

function renderHistorico(): void {
    const { conversaAtiva, conversas } = obterSecao("sofia");
    const termo = buscaChats.value.trim().toLowerCase();
    const ordem = [...conversas]
        .sort((a, b) => b.atualizadoEm - a.atualizadoEm)
        .filter((conversa) => conversa.titulo.toLowerCase().includes(termo));

    if (!ordem.length) {
        lista.innerHTML = `<p class="sofia-historico-vazio">${
            termo ? "Nenhum chat com esse nome." : "Nenhum chat ainda."
        }</p>`;
        return;
    }

    lista.innerHTML = ordem
        .map((conversa) => {
            const ativa = conversa.id === conversaAtiva ? " ativa" : "";
            return `
              <div class="sofia-conversa${ativa}">
                <button type="button" class="sofia-conversa-abrir" data-conversa="${escapar(conversa.id)}">
                  <span class="sofia-conversa-titulo">${escapar(conversa.titulo)}</span>
                  <span class="sofia-conversa-previa">${escapar(previaDa(conversa))}</span>
                </button>
                <button
                  type="button"
                  class="icon-button sofia-conversa-apagar"
                  data-apagar="${escapar(conversa.id)}"
                  aria-label="Apagar chat ${escapar(conversa.titulo)}"
                >
                  ${icone("trash-2")}
                </button>
              </div>
            `;
        })
        .join("");

    desenharIcones(lista);
}

function anexar(id: string, autor: AutorMensagem, texto: string, voz = false): void {
    atualizarSecao("sofia", (atual) => ({
        conversas: atual.conversas
            .map((conversa) => {
                if (conversa.id !== id) return conversa;
                const mensagens = [...conversa.mensagens, mensagemDe(autor, texto, voz)];
                const primeiraPergunta = !conversa.mensagens.some(
                    (mensagem) => mensagem.autor === "user",
                );
                return {
                    ...conversa,
                    mensagens,
                    titulo:
                        autor === "user" && primeiraPergunta
                            ? tituloDaConversa(mensagens)
                            : conversa.titulo,
                    atualizadoEm: Date.now(),
                };
            })
            .sort((a, b) => b.atualizadoEm - a.atualizadoEm),
    }));
}

function conversaAindaExiste(id: string): boolean {
    return obterSecao("sofia").conversas.some((conversa) => conversa.id === id);
}

/** Garante um chat para a pergunta e devolve o id dele. */
function registrarPergunta(texto: string, voz = false): string {
    const atual = obterSecao("sofia");
    const existente = atual.conversas.find(
        (conversa) => conversa.id === atual.conversaAtiva,
    );

    if (existente) {
        anexar(existente.id, "user", texto, voz);
        return existente.id;
    }

    const id = novoId();
    const mensagem = mensagemDe("user", texto, voz);
    atualizarSecao("sofia", (estado) => ({
        conversaAtiva: id,
        conversas: [
            {
                id,
                titulo: tituloDaConversa([mensagem]),
                atualizadoEm: Date.now(),
                mensagens: [mensagem],
            },
            ...estado.conversas,
        ],
    }));
    return id;
}

async function perguntar(pergunta: string, voz = false): Promise<void> {
    const texto = pergunta.trim();
    const aberta = conversaAberta();
    if (!texto || (aberta !== null && aguardando.has(aberta.id)) || modoGravacao) return;

    limparAviso();
    const id = registrarPergunta(texto, voz);
    aguardando.add(id);
    entrada.value = "";
    ajustarCampo();
    renderConversa();

    let resposta: string;
    try {
        resposta = await perguntarSofia(texto);
    } catch {
        resposta = "Não consegui consultar a base agora. Tente novamente em instantes.";
    }

    aguardando.delete(id);
    if (!conversaAindaExiste(id)) return;
    anexar(id, "bot", resposta);
}

async function enviarBlob(arquivo: Blob, nome: string): Promise<void> {
    if (esperandoResposta() || transcrevendoId !== null) return;

    limparAviso();
    const aberta = conversaAberta();
    const id = aberta?.id ?? novoId();
    transcrevendoId = id;
    aguardando.add(id);

    if (!aberta) {
        atualizarSecao("sofia", (estado) => ({
            conversaAtiva: id,
            conversas: [
                {
                    id,
                    titulo: "Novo chat",
                    atualizadoEm: Date.now(),
                    mensagens: [],
                },
                ...estado.conversas,
            ],
        }));
    } else {
        renderConversa();
    }

    try {
        const resultado = await enviarAudioSofia(arquivo, nome);
        transcrevendoId = null;
        aguardando.delete(id);
        if (!conversaAindaExiste(id)) return;

        const texto = resultado.transcricao.trim();
        if (!texto) {
            anexar(id, "user", "Mensagem de áudio", true);
            anexar(
                id,
                "bot",
                "Não consegui entender o áudio. Grave de novo ou escreva a pergunta.",
            );
            return;
        }

        anexar(id, "user", texto, true);
        anexar(id, "bot", resultado.resposta);
    } catch (erro) {
        transcrevendoId = null;
        aguardando.delete(id);
        if (!conversaAindaExiste(id)) return;

        const mensagem =
            erro instanceof ErroDeApi
                ? (erro.primeiroErro("audio") ?? erro.message)
                : "Não consegui enviar o áudio. Tente novamente em instantes.";
        anexar(id, "user", "Mensagem de áudio", true);
        anexar(id, "bot", mensagem);
    }
}

function novoChat(): void {
    cancelarGravacao();
    limparAnexo();
    limparAviso();
    if (obterSecao("sofia").conversaAtiva !== null) {
        atualizarSecao("sofia", { conversaAtiva: null });
    }
    entrada.value = "";
    ajustarCampo();
    fecharHistorico();
    renderConversa();
    entrada.focus();
}

function abrirConversa(id: string): void {
    cancelarGravacao();
    limparAviso();
    atualizarSecao("sofia", { conversaAtiva: id });
    fecharHistorico();
    entrada.focus();
}

function apagarConversa(id: string): void {
    aguardando.delete(id);
    if (transcrevendoId === id) transcrevendoId = null;
    atualizarSecao("sofia", (atual) => {
        const conversas = atual.conversas.filter((conversa) => conversa.id !== id);
        return {
            conversas,
            conversaAtiva: atual.conversaAtiva === id ? null : atual.conversaAtiva,
        };
    });
}

function renderSugestoes(itens: { icon: string; text: string }[]): void {
    sugestoes.innerHTML = itens
        .map(
            (sugestao) => `
        <button type="button" class="sofia-suggestion" data-suggestion="${escapar(sugestao.text)}">
          <span class="sofia-suggestion-icon">${iconeSeguro(sugestao.icon)}</span>
          <span>${escapar(sugestao.text)}</span>
        </button>
      `,
        )
        .join("");

    todos("[data-suggestion]", sugestoes).forEach((botao) => {
        botao.addEventListener("click", () => {
            void perguntar(dado(botao, "suggestion"));
        });
    });

    desenharIcones(sugestoes);
}

function aplicarModo(modo: ModoSofia): void {
    modoPesquisa.classList.toggle("active", modo === "search");
    modoBase.classList.toggle("active", modo === "base");
}

function enviarFormulario(): void {
    if (modoGravacao) {
        pararEEnviar();
        return;
    }

    if (audioAnexado) {
        const arquivo = audioAnexado;
        limparAnexo();
        void enviarBlob(arquivo, arquivo.name);
        return;
    }

    void perguntar(entrada.value);
}

function reconhecimentoDisponivel(): ConstrutorDeReconhecimento | null {
    const janela = window as unknown as {
        SpeechRecognition?: ConstrutorDeReconhecimento;
        webkitSpeechRecognition?: ConstrutorDeReconhecimento;
    };
    return janela.SpeechRecognition ?? janela.webkitSpeechRecognition ?? null;
}

function formatarTempo(totalSegundos: number): string {
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;
    return `${minutos}:${segundos.toString().padStart(2, "0")}`;
}

function pararStream(): void {
    streamMic?.getTracks().forEach((faixa) => faixa.stop());
    streamMic = null;
}

function abrirPainel(aoVivo: boolean): void {
    coluna.classList.add("gravando");
    gravacao.hidden = false;
    gravacaoEstado.textContent = "Ouvindo…";
    gravacaoTempo.textContent = "0:00";
    gravacaoParcial.textContent = aoVivo
        ? "Fale sua pergunta."
        : "Gravando. O áudio será transcrito quando você enviar.";
    micBtn.setAttribute("aria-pressed", "true");
    micBtn.setAttribute("aria-label", "Parar gravação e enviar");
    inicioGravacao = Date.now();
    if (timerGravacao !== null) window.clearInterval(timerGravacao);
    timerGravacao = window.setInterval(() => {
        const segundos = Math.floor((Date.now() - inicioGravacao) / 1000);
        gravacaoTempo.textContent = formatarTempo(segundos);
        if (Date.now() - inicioGravacao >= LIMITE_GRAVACAO_MS) pararEEnviar();
    }, 250);
    atualizarEnvio();
    porId("sofiaGravacaoEnviar").focus();
}

function encerrarPainel(): void {
    if (timerGravacao !== null) {
        window.clearInterval(timerGravacao);
        timerGravacao = null;
    }
    reconhecimentoAtivo = null;
    gravador = null;
    modoGravacao = null;
    paradaPedida = false;
    pararStream();
    gravacao.hidden = true;
    coluna.classList.remove("gravando");
    micBtn.setAttribute("aria-pressed", "false");
    micBtn.setAttribute("aria-label", "Gravar pergunta em áudio");
    atualizarEnvio();
}

function textoOuvido(): string {
    return `${transcricaoFinal} ${transcricaoParcial}`.replace(/\s+/g, " ").trim();
}

function pararEEnviar(): void {
    if (!modoGravacao || paradaPedida) return;
    paradaPedida = true;
    cancelouGravacao = false;

    if (reconhecimentoAtivo) {
        reconhecimentoAtivo.stop();
        return;
    }

    if (gravador && gravador.state !== "inactive") {
        gravador.stop();
    }
}

function cancelarGravacao(): void {
    if (!modoGravacao) return;
    cancelouGravacao = true;
    paradaPedida = true;

    if (reconhecimentoAtivo) {
        reconhecimentoAtivo.abort();
        return;
    }

    if (gravador && gravador.state !== "inactive") {
        gravador.stop();
        return;
    }

    encerrarPainel();
    entrada.focus();
}

function avisoDoMicrofone(nome: string): string {
    if (nome === "NotAllowedError" || nome === "PermissionDeniedError") {
        return "O microfone está bloqueado. Permita o acesso nas configurações do navegador e tente de novo.";
    }
    if (nome === "NotFoundError" || nome === "DevicesNotFoundError") {
        return "Não encontrei um microfone neste dispositivo. Anexe um arquivo de áudio ou escreva a pergunta.";
    }
    return "Não foi possível usar o microfone. Tente de novo ou anexe um arquivo de áudio.";
}

function avisoDoReconhecimento(codigo: string): string | null {
    if (codigo === "aborted" || codigo === "no-speech") return null;
    if (codigo === "not-allowed") {
        return "O microfone está bloqueado. Permita o acesso nas configurações do navegador e tente de novo.";
    }
    if (codigo === "audio-capture") {
        return "Não encontrei um microfone neste dispositivo. Anexe um arquivo de áudio ou escreva a pergunta.";
    }
    if (codigo === "network" || codigo === "service-not-allowed") {
        return "O reconhecimento de voz não está disponível neste navegador. Anexe um arquivo de áudio ou escreva a pergunta.";
    }
    return "Não consegui ouvir o áudio. Tente de novo ou anexe um arquivo de áudio.";
}

function iniciarReconhecimento(Construtor: ConstrutorDeReconhecimento): void {
    transcricaoFinal = "";
    transcricaoParcial = "";
    cancelouGravacao = false;
    paradaPedida = false;
    modoGravacao = "fala";

    const reconhecimento = new Construtor();
    reconhecimento.lang = "pt-BR";
    reconhecimento.continuous = true;
    reconhecimento.interimResults = true;
    reconhecimento.onresult = (evento) => {
        let parcial = "";
        for (
            let indice = evento.resultIndex;
            indice < evento.results.length;
            indice += 1
        ) {
            const resultado = evento.results[indice];
            const trecho = resultado?.[0]?.transcript ?? "";
            if (resultado?.isFinal) transcricaoFinal = `${transcricaoFinal} ${trecho}`;
            else parcial = trecho;
        }
        transcricaoParcial = parcial;
        const ouvido = textoOuvido();
        gravacaoParcial.textContent = ouvido || "Fale sua pergunta.";
    };
    reconhecimento.onerror = (evento) => {
        const texto = avisoDoReconhecimento(evento.error);
        if (!texto) return;
        cancelouGravacao = true;
        mostrarAviso(texto);
    };
    reconhecimento.onend = () => {
        if (modoGravacao !== "fala") return;
        const ouvido = textoOuvido();
        const cancelou = cancelouGravacao;
        encerrarPainel();
        entrada.focus();
        if (cancelou) return;
        if (!ouvido) {
            mostrarAviso("Não ouvi nada. Fale de novo ou escreva a pergunta.");
            return;
        }
        void perguntar(ouvido, true);
    };

    reconhecimentoAtivo = reconhecimento;
    abrirPainel(true);

    try {
        reconhecimento.start();
    } catch {
        encerrarPainel();
        mostrarAviso(
            "Não consegui começar a gravação. Anexe um arquivo de áudio ou escreva a pergunta.",
        );
        entrada.focus();
    }
}

function tipoDeGravacao(): string {
    if (typeof MediaRecorder === "undefined") return "";
    const candidatos = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
    return candidatos.find((tipo) => MediaRecorder.isTypeSupported(tipo)) ?? "";
}

function extensaoDoTipo(tipo: string): string {
    if (tipo.includes("mp4")) return "m4a";
    if (tipo.includes("ogg")) return "ogg";
    return "webm";
}

async function iniciarGravador(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        mostrarAviso(
            "Este navegador não grava áudio. Anexe um arquivo de áudio ou escreva a pergunta.",
        );
        return;
    }

    cancelouGravacao = false;
    paradaPedida = false;
    pedacos = [];

    try {
        streamMic = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (erro) {
        const nome = erro instanceof DOMException ? erro.name : "";
        mostrarAviso(avisoDoMicrofone(nome));
        entrada.focus();
        return;
    }

    const tipo = tipoDeGravacao();
    try {
        gravador = tipo
            ? new MediaRecorder(streamMic, { mimeType: tipo })
            : new MediaRecorder(streamMic);
    } catch {
        pararStream();
        mostrarAviso(
            "Este navegador não grava áudio. Anexe um arquivo de áudio ou escreva a pergunta.",
        );
        return;
    }

    modoGravacao = "arquivo";
    const recorder = gravador;
    recorder.ondataavailable = (evento) => {
        if (evento.data.size > 0) pedacos.push(evento.data);
    };
    recorder.onstop = () => {
        const mime = recorder.mimeType || "audio/webm";
        const blob = new Blob(pedacos, { type: mime });
        pedacos = [];
        const cancelou = cancelouGravacao;
        encerrarPainel();
        entrada.focus();
        if (cancelou) return;
        if (!blob.size) {
            mostrarAviso("A gravação ficou vazia. Tente de novo.");
            return;
        }
        void enviarBlob(blob, `pergunta.${extensaoDoTipo(mime)}`);
    };

    recorder.start();
    abrirPainel(false);
}

function iniciarGravacao(): void {
    if (modoGravacao || esperandoResposta()) return;
    limparAviso();

    const Construtor = reconhecimentoDisponivel();
    if (Construtor) {
        iniciarReconhecimento(Construtor);
        return;
    }

    void iniciarGravador();
}

function arquivoEhAudio(arquivo: File): boolean {
    if (arquivo.type.startsWith("audio/") || arquivo.type === "video/webm") return true;
    return /\.(webm|mp3|mpeg|mpga|m4a|mp4|wav|ogg|oga)$/i.test(arquivo.name);
}

porId<HTMLFormElement>("chatForm").addEventListener("submit", (evento) => {
    evento.preventDefault();
    enviarFormulario();
});

entrada.addEventListener("input", () => {
    ajustarCampo();
    atualizarEnvio();
});

entrada.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter" && !evento.shiftKey) {
        evento.preventDefault();
        enviarFormulario();
    }
});

porId("sofiaNovaConversa").addEventListener("click", novoChat);
porId("sofiaAbrirHistorico").addEventListener("click", abrirHistorico);
fundoHistorico.addEventListener("click", fecharHistorico);

porId("sofiaBuscaBtn").addEventListener("click", () => {
    buscaWrap.hidden = !buscaWrap.hidden;
    if (buscaWrap.hidden) {
        buscaChats.value = "";
        renderHistorico();
        return;
    }
    buscaChats.focus();
});

buscaChats.addEventListener("input", () => renderHistorico());

chat.addEventListener("click", (evento) => {
    const botao = alvoMaisProximo<HTMLButtonElement>(evento, "[data-copiar]");
    if (!botao) return;
    const indice = Number(dado(botao, "copiar"));
    const texto = conversaAberta()?.mensagens[indice]?.texto ?? "";
    if (!texto) return;

    void navigator.clipboard.writeText(texto).then(() => {
        botao.textContent = "Copiado";
        botao.classList.add("copiado");
        window.setTimeout(() => {
            botao.textContent = "Copiar";
            botao.classList.remove("copiado");
        }, 1500);
    });
});

lista.addEventListener("click", (evento) => {
    const apagar = alvoMaisProximo(evento, "[data-apagar]");
    if (apagar) {
        apagarConversa(dado(apagar, "apagar"));
        return;
    }

    const abrir = alvoMaisProximo(evento, "[data-conversa]");
    if (abrir) abrirConversa(dado(abrir, "conversa"));
});

porId("sofiaAttachBtn").addEventListener("click", () => arquivos.click());

arquivos.addEventListener("change", () => {
    const selecionados = Array.from(arquivos.files ?? []);
    if (!selecionados.length) return;

    const audio = selecionados.find(arquivoEhAudio) ?? null;
    if (!audio) {
        arquivos.value = "";
        mostrarAviso(
            "Anexe um áudio em webm, mp3, m4a, wav ou ogg — ou escreva a pergunta.",
        );
        return;
    }

    audioAnexado = audio;
    anexo.classList.add("show");
    anexoNome.textContent = `Áudio · ${audio.name}`;
    limparAviso();
    atualizarEnvio();
});

porId("removeSofiaAttachment").addEventListener("click", () => {
    limparAnexo();
});

modoPesquisa.addEventListener("click", () => atualizarSecao("sofia", { modo: "search" }));
modoBase.addEventListener("click", () => atualizarSecao("sofia", { modo: "base" }));

porId("sofiaModelBtn").addEventListener("click", () => {
    showModal(
        "Modelo da Sofia",
        "A Sofia responde a partir da base da HC: empresas, sócios, reuniões, documentos, treinamentos, projetos e processos. O microfone envia a pergunta falada. Um arquivo de áudio é transcrito quando o ambiente tem a chave configurada. Ela não consulta nada fora daqui.",
    );
});

micBtn.addEventListener("click", () => {
    if (modoGravacao) {
        pararEEnviar();
        return;
    }
    iniciarGravacao();
});

porId("sofiaGravacaoCancelar").addEventListener("click", () => {
    cancelarGravacao();
});

porId("sofiaGravacaoEnviar").addEventListener("click", () => {
    pararEEnviar();
});

document.addEventListener("keydown", (evento) => {
    if (evento.key !== "Escape") return;
    if (modoGravacao) {
        evento.preventDefault();
        cancelarGravacao();
        return;
    }
    if (!buscaWrap.hidden) {
        buscaWrap.hidden = true;
        buscaChats.value = "";
        renderHistorico();
        return;
    }
    fecharHistorico();
});

observarEstado(["sofia"], () => {
    aplicarModo(obterSecao("sofia").modo);
    renderHistorico();
    renderConversa();
});

aplicarModo(obterSecao("sofia").modo);
renderHistorico();
renderConversa();
renderSugestoes(await carregarSugestoes());
entrada.focus();
