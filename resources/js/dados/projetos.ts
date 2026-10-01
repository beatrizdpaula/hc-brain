/* =========================================================
   PROJETOS E PROCESSOS
   Duas áreas que antes eram cartões escritos direto na view e
   hoje são registro: projeto tem responsável, prazo e progresso;
   processo tem as etapas na ordem em que são executadas.
   ========================================================= */

import { atualizar, enviar, obter, obterColecao, remover } from "../comum/api.ts";
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
    /** Em ISO (AAAA-MM-DD), que é o que o campo de data entende. */
    inicio: string;
    prazo: string;
    /** Negativo quando o prazo já passou; quem calcula é o servidor. */
    diasRestantes: number;
    empresaId: string | null;
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

export const STATUS_DE_PROJETO: StatusProjeto[] = [
    "Planejado",
    "Em andamento",
    "Em revisão",
    "Concluído",
];

export const PRIORIDADES_DE_PROJETO: PrioridadeProjeto[] = ["Alta", "Média", "Baixa"];

/** O que o formulário de projeto envia; as datas vão em AAAA-MM-DD. */
export interface DadosDeProjeto {
    nome: string;
    descricao: string;
    status: string;
    prioridade: string;
    responsavel: string;
    area: string;
    progresso: number;
    inicio: string;
    prazo: string;
    empresaId: string | null;
}

export interface DadosDeProcesso {
    nome: string;
    descricao: string;
    area: string;
    responsavel: string;
    frequencia: string;
    etapas: string[];
}

export function carregarProjetos(): Promise<Projeto[]> {
    return obterColecao<Projeto>("/projetos");
}

export async function cadastrarProjeto(dados: DadosDeProjeto): Promise<Projeto> {
    const resposta = await enviar<{ data: Projeto }>("/projetos", dados);
    return resposta.data;
}

export async function salvarProjeto(id: string, dados: DadosDeProjeto): Promise<Projeto> {
    const resposta = await atualizar<{ data: Projeto }>(
        `/projetos/${encodeURIComponent(id)}`,
        dados,
    );
    return resposta.data;
}

export function excluirProjeto(id: string): Promise<void> {
    return remover(`/projetos/${encodeURIComponent(id)}`);
}

export function carregarProcessos(): Promise<Processo[]> {
    return obterColecao<Processo>("/processos");
}

export async function cadastrarProcesso(dados: DadosDeProcesso): Promise<Processo> {
    const resposta = await enviar<{ data: Processo }>("/processos", dados);
    return resposta.data;
}

export async function salvarProcesso(
    id: string,
    dados: DadosDeProcesso,
): Promise<Processo> {
    const resposta = await atualizar<{ data: Processo }>(
        `/processos/${encodeURIComponent(id)}`,
        dados,
    );
    return resposta.data;
}

export function excluirProcesso(id: string): Promise<void> {
    return remover(`/processos/${encodeURIComponent(id)}`);
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
