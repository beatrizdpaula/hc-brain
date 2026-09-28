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
