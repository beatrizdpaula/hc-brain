/* =========================================================
   SOFIA — sugestões iniciais e respostas do assistente
   A resposta é montada no servidor, onde está o banco: a Sofia lê
   exatamente as mesmas empresas, reuniões e treinamentos das
   outras telas.
   ========================================================= */

import { enviar, enviarArquivo, obter } from "../comum/api.ts";

export type AutorMensagem = "user" | "bot";

export interface MensagemSofia {
    autor: AutorMensagem;
    texto: string;
    /** Pergunta ditada ou transcrita a partir de um áudio. */
    voz?: boolean;
}

/** Uma conversa guardada no navegador, como um chat da lista lateral. */
export interface ConversaSofia {
    id: string;
    titulo: string;
    atualizadoEm: number;
    mensagens: MensagemSofia[];
}

/** Título da lista: a primeira pergunta, cortada para caber na lateral. */
export function tituloDaConversa(mensagens: MensagemSofia[]): string {
    const texto = mensagens.find((mensagem) => mensagem.autor === "user")?.texto ?? "";
    const limpo = texto.replace(/\s+/g, " ").trim();
    if (!limpo) return "Novo chat";
    return limpo.length > 48 ? `${limpo.slice(0, 45).trimEnd()}…` : limpo;
}

export interface SugestaoSofia {
    icon: string;
    text: string;
}

export function carregarSugestoes(): Promise<SugestaoSofia[]> {
    return obter<SugestaoSofia[]>("/sofia/sugestoes");
}

/**
 * O que já foi dito na conversa vai junto com a pergunta: é isso que deixa a
 * Sofia entender um "e a última reunião dela?" logo depois de uma pergunta
 * sobre uma empresa. As respostas montadas pelo banco ignoram o histórico; a
 * IA é que o usa.
 */
export async function perguntarSofia(
    pergunta: string,
    historico: MensagemSofia[] = [],
): Promise<string> {
    const resposta = await enviar<{ resposta: string }>("/sofia/perguntar", {
        pergunta,
        historico: paraHistorico(historico),
    });
    return resposta.resposta;
}

/** Áudio anexado ou gravado sem reconhecimento no navegador. */
export function enviarAudioSofia(
    arquivo: Blob,
    nome: string,
    historico: MensagemSofia[] = [],
): Promise<{ transcricao: string; resposta: string }> {
    const dados = new FormData();
    const envio =
        arquivo instanceof File
            ? arquivo
            : new File([arquivo], nome, { type: arquivo.type || "audio/webm" });
    dados.append("audio", envio, nome);

    paraHistorico(historico).forEach((mensagem, indice) => {
        dados.append(`historico[${indice}][autor]`, mensagem.autor);
        dados.append(`historico[${indice}][texto]`, mensagem.texto);
    });

    return enviarArquivo("/sofia/audio", dados);
}

/** Só autor e texto: o resto da mensagem não diz nada a quem responde. */
function paraHistorico(
    mensagens: MensagemSofia[],
): { autor: AutorMensagem; texto: string }[] {
    return mensagens.map((mensagem) => ({
        autor: mensagem.autor,
        texto: mensagem.texto,
    }));
}
