/* =========================================================
   TREINAMENTOS — base integrada ao sistema de capacitação
   ========================================================= */

import { atualizar, enviar, obter, remover } from "../comum/api.ts";
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

export const TIPOS_DE_TREINAMENTO: TipoTreinamento[] = [
    "Curso",
    "Trilha",
    "Manual",
    "Fluxograma",
];

export const NIVEIS_DE_TREINAMENTO: NivelTreinamento[] = [
    "Todos",
    "Iniciante",
    "Intermediário",
    "Avançado",
];

/** Trilha, cursos e processo descrevem conteúdos específicos: vão vazios quando não se aplicam. */
export interface DadosDeTreinamento {
    titulo: string;
    tipo: string;
    categoria: string;
    nivel: string;
    descricao: string;
    trilha: string | null;
    cursos: string | null;
    processo: string | null;
}

export function carregarTreinamentos(): Promise<BaseTreinamentos> {
    return obter<BaseTreinamentos>("/treinamentos");
}

export async function cadastrarTreinamento(
    dados: DadosDeTreinamento,
): Promise<ConteudoTreinamento> {
    const resposta = await enviar<{ data: ConteudoTreinamento }>("/treinamentos", dados);
    return resposta.data;
}

export async function salvarTreinamento(
    id: string,
    dados: DadosDeTreinamento,
): Promise<ConteudoTreinamento> {
    const resposta = await atualizar<{ data: ConteudoTreinamento }>(
        `/treinamentos/${encodeURIComponent(id)}`,
        dados,
    );
    return resposta.data;
}

export function excluirTreinamento(id: string): Promise<void> {
    return remover(`/treinamentos/${encodeURIComponent(id)}`);
}
