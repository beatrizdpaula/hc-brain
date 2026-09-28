/* =========================================================
   COMERCIAL — indicadores gerenciais por período
   ========================================================= */

import { obter } from "../comum/api.ts";

export const PERIODOS_COMERCIAIS = ["2026-09", "2026-08", "2026-07"] as const;

export type PeriodoComercialId = (typeof PERIODOS_COMERCIAIS)[number];

export const PERIODO_COMERCIAL_PADRAO: PeriodoComercialId = "2026-09";

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

/** O período vem de um `<select>`, então precisa ser conferido antes do acesso. */
export function ehPeriodoComercial(valor: string): valor is PeriodoComercialId {
    return (PERIODOS_COMERCIAIS as readonly string[]).includes(valor);
}

export function carregarComercial(periodo: string): Promise<IndicadoresComerciais> {
    const escolhido = ehPeriodoComercial(periodo) ? periodo : PERIODO_COMERCIAL_PADRAO;
    return obter<IndicadoresComerciais>(`/comercial/${escolhido}`);
}
