/* =========================================================
   TELA SOFIA (IA)
   Vários chats, como um assistente de verdade: a lista fica na
   lateral, um chat novo começa em branco e a conversa aberta
   continua no navegador — inclusive em outra aba.
   ========================================================= */

import {
    carregarSugestoes,
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
const anexo = porId("sofiaAttachment");
const anexoNome = porId("sofiaAttachmentName");
const arquivos = campo("sofiaFileInput");
const modoPesquisa = porId("sofiaSearchMode");
const modoBase = porId("sofiaComputerMode");
const fundoHistorico = porId("sofiaHistoricoFundo");
const buscaWrap = porId("sofiaBuscaWrap");
const buscaChats = porId<HTMLInputElement>("sofiaBuscaChats");

porId("sofiaUsuarioAvatar").textContent = usuario.iniciais;
porId("sofiaUsuarioNome").textContent = usuario.nome;
porId("sofiaUsuarioPerfil").textContent = usuario.perfil;

/** Chats que ainda estão esperando a resposta da Sofia. */
const aguardando = new Set<string>();

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

function atualizarEnvio(): void {
    const aberta = conversaAberta();
    const ocupada = aberta !== null && aguardando.has(aberta.id);
    envio.disabled = ocupada || entrada.value.trim() === "";
}

function htmlMensagem(mensagem: MensagemSofia, indice: number): string {
    if (mensagem.autor === "user") {
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

function renderConversa(): void {
    const aberta = conversaAberta();
    const mensagens = aberta?.mensagens ?? [];
    const pensando = aberta !== null && aguardando.has(aberta.id);
    const conversando = mensagens.length > 0 || pensando;

    chat.innerHTML =
        mensagens.map(htmlMensagem).join("") +
        (pensando
            ? `<div class="message bot"><span class="sofia-avatar" aria-hidden="true">S</span><div class="message-corpo"><div class="message-texto"><span class="sofia-digitando"><i></i><i></i><i></i></span></div></div></div>`
            : "");

    chat.classList.toggle("active", conversando);
    coluna.classList.toggle("em-conversa", conversando);
    boasVindas.hidden = conversando;
    sugestoes.hidden = conversando;
    titulo.hidden = !conversando;
    titulo.textContent = aberta?.titulo ?? "Novo chat";

    if (conversando) chat.scrollTop = chat.scrollHeight;
    atualizarEnvio();
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
                  ${escapar(conversa.titulo)}
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

function anexar(id: string, autor: AutorMensagem, texto: string): void {
    atualizarSecao("sofia", (atual) => ({
        conversas: atual.conversas
            .map((conversa) => {
                if (conversa.id !== id) return conversa;
                const mensagens = [...conversa.mensagens, { autor, texto }];
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

/** Garante um chat para a pergunta e devolve o id dele. */
function registrarPergunta(texto: string): string {
    const atual = obterSecao("sofia");
    const existente = atual.conversas.find(
        (conversa) => conversa.id === atual.conversaAtiva,
    );

    if (existente) {
        anexar(existente.id, "user", texto);
        return existente.id;
    }

    const id = novoId();
    const mensagem: MensagemSofia = { autor: "user", texto };
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

async function perguntar(pergunta: string): Promise<void> {
    const texto = pergunta.trim();
    const aberta = conversaAberta();
    if (!texto || (aberta !== null && aguardando.has(aberta.id))) return;

    const id = registrarPergunta(texto);
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
    anexar(id, "bot", resposta);
}

function novoChat(): void {
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
    atualizarSecao("sofia", { conversaAtiva: id });
    fecharHistorico();
    entrada.focus();
}

function apagarConversa(id: string): void {
    aguardando.delete(id);
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

porId<HTMLFormElement>("chatForm").addEventListener("submit", (evento) => {
    evento.preventDefault();
    void perguntar(entrada.value);
});

entrada.addEventListener("input", () => {
    ajustarCampo();
    atualizarEnvio();
});

entrada.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter" && !evento.shiftKey) {
        evento.preventDefault();
        void perguntar(entrada.value);
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
        ajustarCampo();
        atualizarEnvio();
        entrada.focus();
    };
    reconhecimento.onerror = () => entrada.focus();
    reconhecimento.start();
});

document.addEventListener("keydown", (evento) => {
    if (evento.key !== "Escape") return;
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
