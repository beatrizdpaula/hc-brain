/* =========================================================
   SOFIA — sugestões iniciais e respostas do assistente
   A resposta é montada no servidor, onde está o banco: a Sofia lê
   exatamente as mesmas empresas, reuniões e treinamentos das
   outras telas.
   ========================================================= */

import { enviar, obter } from "../comum/api.ts";

export type AutorMensagem = "user" | "bot";

export interface MensagemSofia {
    autor: AutorMensagem;
    texto: string;
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

export async function perguntarSofia(pergunta: string): Promise<string> {
    const resposta = await enviar<{ resposta: string }>("/sofia/perguntar", { pergunta });
    return resposta.resposta;
}
