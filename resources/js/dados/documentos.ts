/* =========================================================
   DOCUMENTOS — pastas e arquivos do banco de conhecimento
   ========================================================= */

import { obter } from "../comum/api.ts";
import type { NomeDeIcone } from "../comum/icones.ts";
import type { CorTag } from "./empresas.ts";

export type TipoDocumento = "folder" | "pdf" | "doc" | "sheet";

export interface Pasta {
    nome: string;
    rotulo: string;
    total: number;
}

export interface Documento {
    nome: string;
    exibicao: string;
    tipo: TipoDocumento;
    pasta: string;
    detalhe: string;
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
    folder: { icone: "folder", cor: "purple", rotulo: "Pasta" },
    pdf: { icone: "file-text", cor: "red", rotulo: "PDF" },
    doc: { icone: "file-text", cor: "blue", rotulo: "Documento" },
    sheet: { icone: "file-spreadsheet", cor: "green", rotulo: "Planilha" },
};

export function carregarDocumentos(): Promise<BaseDocumentos> {
    return obter<BaseDocumentos>("/documentos");
}
