/* =========================================================
   COMERCIAL — indicadores gerenciais por período
   ========================================================= */

import { obter } from "../comum/api.ts";

/** Um mês fechado na base, como o filtro da tela precisa dele. */
export interface PeriodoComercial {
    id: string;
    rotulo: string;
}

export type MesLeads = [rotulo: string, leads: number];
export type OrigemLead = [nome: string, leads: number, cor: string];
export type MotivoPerda = [motivo: string, ocorrencias: number];
export type VendaFechada = [empresa: string, responsavel: string, valor: string];
export type LinhaEquipe = [
    pessoa: string,
    leads: number,
    vendas: number,
    conversao: number,
    receita: number,
];

export interface IndicadoresComerciais {
    periodo: string;
    leads: number;
    /** Nulo no mês mais antigo da base: não há com o que comparar. */
    leadsAnteriores: number | null;
    qualified: number;
    meetings: number;
    proposals: number;
    closed: number;
    revenue: number;
    averageTicket: number;
    inProcess: number;
    monthly: MesLeads[];
    origins: OrigemLead[];
    losses: MotivoPerda[];
    sales: VendaFechada[];
    team: LinhaEquipe[];
}

export function carregarPeriodosComerciais(): Promise<PeriodoComercial[]> {
    return obter<PeriodoComercial[]>("/comercial");
}

export function carregarComercial(periodo: string): Promise<IndicadoresComerciais> {
    return obter<IndicadoresComerciais>(
        `/comercial/${encodeURIComponent(periodo || "atual")}`,
    );
}
