/* =========================================================
   TELA SOFIA (IA)
   A conversa fica no estado compartilhado: sai desta página,
   volta depois e o histórico continua aqui — inclusive em outra
   aba aberta ao mesmo tempo. A resposta vem do servidor, que lê
   a mesma base das outras telas.
   ========================================================= */

import {
    carregarSugestoes,
    perguntarSofia,
    type AutorMensagem,
    type MensagemSofia,
} from "../dados/sofia.ts";
import { campo, dado, porId, todos } from "../comum/dom.ts";
import {
    atualizarSecao,
    observarEstado,
    obterSecao,
    type ModoSofia,
} from "../comum/estado.ts";
import { escapar } from "../comum/formato.ts";
import { desenharIcones, iconeSeguro } from "../comum/icones.ts";
import { showModal } from "../comum/modal.ts";
import { iniciarPagina } from "../comum/shell.ts";

/** O reconhecimento de voz não é padrão em todos os navegadores. */
interface EventoDeVoz {
    results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface ReconhecimentoDeVoz {
    lang: string;
    onresult: ((evento: EventoDeVoz) => void) | null;
    onerror: (() => void) | null;
    start(): void;
}

type ConstrutorDeReconhecimento = new () => ReconhecimentoDeVoz;

iniciarPagina("sofia-ia");

const chat = porId("chat");
const boasVindas = porId("sofiaWelcome");
const sugestoes = porId("sofiaSuggestions");
const entrada = campo("question");
const anexo = porId("sofiaAttachment");
const anexoNome = porId("sofiaAttachmentName");
const arquivos = campo("sofiaFileInput");
const modoPesquisa = porId("sofiaSearchMode");
const modoBase = porId("sofiaComputerMode");
const notaModo = porId("sofiaModeNote");

const ABERTURA: MensagemSofia = {
    autor: "bot",
    texto: "Olá! Sou a Sofia. Como posso ajudar?",
};

let pensando = false;

function renderConversa(): void {
    const { mensagens } = obterSecao("sofia");
    const conversa = [ABERTURA, ...mensagens];

    chat.innerHTML =
        conversa
            .map(
                (mensagem) =>
                    `<div class="message ${mensagem.autor}">${escapar(mensagem.texto)}</div>`,
            )
            .join("") +
        (pensando
            ? `<div class="message bot"><span class="sofia-digitando"><i></i><i></i><i></i></span></div>`
            : "");

    const conversando = mensagens.length > 0;
    chat.classList.toggle("active", conversando || pensando);
    boasVindas.hidden = conversando || pensando;
    sugestoes.hidden = conversando || pensando;
    chat.scrollTop = chat.scrollHeight;
}

function registrar(autor: AutorMensagem, texto: string): void {
    atualizarSecao("sofia", (atual) => ({
        ...atual,
        mensagens: [...atual.mensagens, { autor, texto }],
    }));
}

async function perguntar(pergunta: string): Promise<void> {
    const texto = pergunta.trim();
    if (!texto || pensando) return;

    registrar("user", texto);

    pensando = true;
    renderConversa();

    let resposta: string;
    try {
        resposta = await perguntarSofia(texto);
    } catch {
        resposta = "Não consegui consultar a base agora. Tente novamente em instantes.";
    }

    pensando = false;
    registrar("bot", resposta);
}

function renderSugestoes(lista: { icon: string; text: string }[]): void {
    sugestoes.innerHTML = lista
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
    notaModo.textContent =
        modo === "search"
            ? "Pesquisa ativada: a Sofia priorizará informações da base de conhecimento da HC."
            : "Base HC ativada: a Sofia priorizará documentos, empresas, reuniões e registros internos.";
}

porId<HTMLFormElement>("chatForm").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const pergunta = entrada.value;
    entrada.value = "";
    void perguntar(pergunta);
});

porId("sofiaAttachBtn").addEventListener("click", () => arquivos.click());

arquivos.addEventListener("change", () => {
    const selecionados = Array.from(arquivos.files ?? []);
    if (!selecionados.length) return;
    anexo.classList.add("show");
    anexoNome.textContent =
        selecionados.length === 1
            ? selecionados[0].name
            : `${selecionados.length} arquivos anexados`;
});

porId("removeSofiaAttachment").addEventListener("click", () => {
    arquivos.value = "";
    anexo.classList.remove("show");
    anexoNome.textContent = "";
});

modoPesquisa.addEventListener("click", () => atualizarSecao("sofia", { modo: "search" }));
modoBase.addEventListener("click", () => atualizarSecao("sofia", { modo: "base" }));

porId("sofiaLimparConversa").addEventListener("click", () => {
    atualizarSecao("sofia", { mensagens: [] });
    entrada.focus();
});

porId("sofiaModelBtn").addEventListener("click", () => {
    showModal(
        "Modelo da Sofia",
        "Sofia é o assistente de IA da HC. Nesta versão do protótipo, o modelo é demonstrativo.",
    );
});

porId("sofiaMicBtn").addEventListener("click", () => {
    const janela = window as unknown as {
        SpeechRecognition?: ConstrutorDeReconhecimento;
        webkitSpeechRecognition?: ConstrutorDeReconhecimento;
    };
    const Reconhecimento = janela.SpeechRecognition ?? janela.webkitSpeechRecognition;

    if (!Reconhecimento) {
        entrada.focus();
        return;
    }

    const reconhecimento = new Reconhecimento();
    reconhecimento.lang = "pt-BR";
    reconhecimento.onresult = (evento) => {
        entrada.value = evento.results[0][0].transcript;
        entrada.focus();
    };
    reconhecimento.onerror = () => entrada.focus();
    reconhecimento.start();
});

observarEstado(["sofia"], () => {
    aplicarModo(obterSecao("sofia").modo);
    renderConversa();
});

aplicarModo(obterSecao("sofia").modo);
renderConversa();
renderSugestoes(await carregarSugestoes());
