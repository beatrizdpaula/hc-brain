/* =========================================================
   REUNIÕES — histórico central, vinculado à empresa e ao sócio
   ========================================================= */

import { obter } from "../comum/api.ts";
import type { CorTag } from "./empresas.ts";

export type TipoReuniao =
    "Abertura" | "Transferência" | "Dúvidas" | "Comercial" | "Alinhamento" | "Financeira";

export type StatusReuniao = "Concluída" | "Agendada" | "Cancelada";

export interface Reuniao {
    id: number;
    empresa: string;
    empresaId: string;
    /** Sócio responsável da empresa, mostrado no modal da reunião. */
    socio: string | null;
    tipo: TipoReuniao;
    data: string;
    dataOrd: string;
    /** O horário ainda não é registrado na base; a agenda mostra "—" sem ele. */
    horario: string | null;
    responsavel: string;
    participantes: string[];
    resumo: string;
    decisoes: string[];
    proximosPassos: string[];
    status: StatusReuniao;
}

export interface BaseReunioes {
    reunioes: Reuniao[];
    /** Nomes das empresas, para montar o filtro da tela. */
    empresas: string[];
}

export const tagDoTipoDeReuniao: Record<TipoReuniao, CorTag> = {
    Abertura: "green",
    Transferência: "blue",
    Dúvidas: "yellow",
    Comercial: "purple",
    Alinhamento: "gray",
    Financeira: "red",
};

export const tagDoStatus: Record<StatusReuniao, CorTag> = {
    Concluída: "green",
    Agendada: "blue",
    Cancelada: "red",
};

export function carregarReunioes(): Promise<BaseReunioes> {
    return obter<BaseReunioes>("/reunioes");
}
