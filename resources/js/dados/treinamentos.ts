/* =========================================================
   TREINAMENTOS — base integrada ao sistema de capacitação
   ========================================================= */

import { obter } from "../comum/api.ts";
import type { NomeDeIcone } from "../comum/icones.ts";
import type { CorTag } from "./empresas.ts";

export type TipoTreinamento = "Curso" | "Trilha" | "Manual" | "Fluxograma";

export type NivelTreinamento = "Iniciante" | "Intermediário" | "Avançado" | "Todos";

export interface ConteudoTreinamento {
    id: string;
    tipo: TipoTreinamento;
    titulo: string;
    categoria: string;
    nivel: NivelTreinamento;
    descricao: string;
    trilha: string | null;
    cursos: string | null;
    processo: string | null;
}

/** Ícone e cor de cada tipo de conteúdo — derivados do tipo, não gravados. */
export const aparenciaPorTipo: Record<
    TipoTreinamento,
    { icone: NomeDeIcone; cor: CorTag }
> = {
    Curso: { icone: "book-open", cor: "blue" },
    Trilha: { icone: "route", cor: "purple" },
    Manual: { icone: "clipboard-list", cor: "green" },
    Fluxograma: { icone: "workflow", cor: "yellow" },
};

export interface RegistroTreinamento {
    pessoa: string;
    empresa: string;
    conteudo: string;
    status: string;
    progresso: number;
    data: string;
}

export interface BaseTreinamentos {
    conteudos: ConteudoTreinamento[];
    historico: RegistroTreinamento[];
}

export function carregarTreinamentos(): Promise<BaseTreinamentos> {
    return obter<BaseTreinamentos>("/treinamentos");
}
