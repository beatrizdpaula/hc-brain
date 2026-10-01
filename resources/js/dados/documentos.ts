/* =========================================================
   DOCUMENTOS — pastas e arquivos do banco de conhecimento
   O arquivo é real: sobe por multipart, fica no disco do
   servidor e só é baixado por quem está na sessão.
   ========================================================= */

import { atualizar, enviar, enviarArquivo, obter, remover } from "../comum/api.ts";
import type { NomeDeIcone } from "../comum/icones.ts";
import type { CorTag } from "./empresas.ts";

/** Como os arquivos são agrupados na tela; quem decide é o servidor. */
export type TipoDocumento = "pdf" | "doc" | "sheet" | "slide" | "imagem" | "outro";

/** Valor do filtro quando nenhuma pasta específica está escolhida. */
export const TODAS_AS_PASTAS = "Todas";

export interface Pasta {
    id: number;
    nome: string;
    total: number;
}

export interface Documento {
    id: number;
    nome: string;
    exibicao: string;
    tipo: TipoDocumento;
    extensao: string;
    pastaId: number;
    pasta: string;
    tamanho: number;
    detalhe: string;
    temArquivo: boolean;
}

export interface BaseDocumentos {
    pastas: Pasta[];
    documentos: Documento[];
}

/**
 * Como cada tipo aparece: o ícone e a cor são decisão de tela, não dado —
 * por isso são derivados do tipo aqui, e não gravados no banco.
 */
export const aparenciaPorTipo: Record<
    TipoDocumento,
    { icone: NomeDeIcone; cor: CorTag; rotulo: string }
> = {
    pdf: { icone: "file-text", cor: "red", rotulo: "PDF" },
    doc: { icone: "file-text", cor: "blue", rotulo: "Documento" },
    sheet: { icone: "file-spreadsheet", cor: "green", rotulo: "Planilha" },
    slide: { icone: "file-text", cor: "yellow", rotulo: "Apresentação" },
    imagem: { icone: "image", cor: "purple", rotulo: "Imagem" },
    outro: { icone: "file", cor: "gray", rotulo: "Arquivo" },
};

export function carregarDocumentos(): Promise<BaseDocumentos> {
    return obter<BaseDocumentos>("/documentos");
}

export async function enviarDocumento(
    pastaId: number,
    arquivo: File,
    nome: string,
): Promise<Documento> {
    const dados = new FormData();
    dados.append("arquivo", arquivo);
    dados.append("pastaId", String(pastaId));
    if (nome) dados.append("nome", nome);

    const resposta = await enviarArquivo<{ data: Documento }>("/documentos", dados);
    return resposta.data;
}

export async function salvarDocumento(
    id: number,
    nome: string,
    pastaId: number,
): Promise<Documento> {
    const resposta = await atualizar<{ data: Documento }>(`/documentos/${id}`, {
        nome,
        pastaId,
    });
    return resposta.data;
}

export function excluirDocumento(id: number): Promise<void> {
    return remover(`/documentos/${id}`);
}

/** O download é uma navegação comum: o Laravel responde com o arquivo. */
export function enderecoDoArquivo(id: number): string {
    return `/api/documentos/${id}/arquivo`;
}

export function criarPasta(nome: string): Promise<Pasta> {
    return enviar<Pasta>("/pastas", { nome });
}

export function salvarPasta(id: number, nome: string): Promise<Pasta> {
    return atualizar<Pasta>(`/pastas/${id}`, { nome });
}

export function excluirPasta(id: number): Promise<void> {
    return remover(`/pastas/${id}`);
}
