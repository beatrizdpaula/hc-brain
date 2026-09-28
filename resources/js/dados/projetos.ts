/* =========================================================
   PROJETOS E PROCESSOS
   Duas áreas que antes eram cartões escritos direto na view e
   hoje são registro: projeto tem responsável, prazo e progresso;
   processo tem as etapas na ordem em que são executadas.
   ========================================================= */

import { obter, obterColecao } from "../comum/api.ts";
import type { CorTag } from "./empresas.ts";

export type StatusProjeto = "Em andamento" | "Em revisão" | "Planejado" | "Concluído";

export type PrioridadeProjeto = "Alta" | "Média" | "Baixa";

export interface Projeto {
    id: string;
    nome: string;
    descricao: string;
    status: StatusProjeto;
    prioridade: PrioridadeProjeto;
    responsavel: string;
    area: string;
    progresso: number;
    inicio: string;
    prazo: string;
    /** Negativo quando o prazo já passou; quem calcula é o servidor. */
    diasRestantes: number;
    empresa: string | null;
}

export interface Processo {
    id: string;
    nome: string;
    descricao: string;
    area: string;
    responsavel: string;
    frequencia: string;
    atualizadoEm: string;
    etapas: string[];
}

export const tagDoStatusDeProjeto: Record<StatusProjeto, CorTag> = {
    "Em andamento": "blue",
    "Em revisão": "yellow",
    Planejado: "gray",
    Concluído: "green",
};

export const tagDaPrioridade: Record<PrioridadeProjeto, CorTag> = {
    Alta: "red",
    Média: "yellow",
    Baixa: "gray",
};

export function carregarProjetos(): Promise<Projeto[]> {
    return obterColecao<Projeto>("/projetos");
}

export function carregarProcessos(): Promise<Processo[]> {
    return obterColecao<Processo>("/processos");
}

export interface ContadoresDoInicio {
    empresas: number;
    reunioes: number;
    usuarios: number;
    documentos: number;
    fontes: number;
    treinamentos: number;
    projetos: number;
    processos: number;
}

export interface ItemDeAtividade {
    titulo: string;
    detalhe: string;
    etiqueta: string;
    quando: string;
    destino: string;
}

export interface PainelDoInicio {
    contadores: ContadoresDoInicio;
    atividade: ItemDeAtividade[];
}

export function carregarInicio(): Promise<PainelDoInicio> {
    return obter<PainelDoInicio>("/inicio");
}
