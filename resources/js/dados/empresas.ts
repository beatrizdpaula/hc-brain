/* =========================================================
   EMPRESAS — entidade principal do banco
     → sócio responsável (dados próprios)
     → fontes vinculadas diretamente à empresa
     → reuniões vinculadas (aparecem também na tela de Reuniões)

   Os registros moraram em um array aqui; agora moram no banco e
   chegam pela API. O formato continua o mesmo, então as telas
   leem empresa, sócio e fonte exatamente como antes.
   ========================================================= */

import { obter, obterColecao } from "../comum/api.ts";
import type { Reuniao } from "./reunioes.ts";
import type { ConteudoTreinamento } from "./treinamentos.ts";

/** Cores das etiquetas compartilhadas por empresas e reuniões. */
export type CorTag = "green" | "blue" | "yellow" | "purple" | "gray" | "red";

export interface SocioEmpresa {
    nome: string;
    cargo: string;
    email: string;
    telefone: string;
    participacao: string;
    desde: string;
}

export interface FonteEmpresa {
    tipo: "PDF" | "DOC" | "XLS";
    nome: string;
    info: string;
}

export interface ResumoReuniao {
    tipo: string;
    data: string;
}

export interface Empresa {
    id: string;
    nome: string;
    setor: string;
    status: string;
    statusTag: CorTag;
    socio: SocioEmpresa;
    fontes: FonteEmpresa[];
    totalReunioes: number;
    ultimaReuniao: ResumoReuniao | null;
}

export interface ReceitaMes {
    mes: string;
    valor: number;
}

export interface TransacaoEmpresa {
    data: string;
    desc: string;
    cat: string;
    tipo: "Entrada" | "Saída";
    valor: number;
    status: string;
}

export type RegimeTributario = "Simples Nacional" | "Lucro Presumido" | "Lucro Real";

export interface FinanceiroEmpresa {
    regime: RegimeTributario;
    desde: string;
    /** Meses completos de relacionamento, contados pelo servidor. */
    meses: number;
    primeiro: number;
    atual: number;
    total: number;
    saldo: number;
    receber: number;
    despesas: number;
    margem: number;
    receitaMensal: ReceitaMes[];
    transacoes: TransacaoEmpresa[];
}

/** Tudo o que o detalhe do cliente mostra, em uma resposta só. */
export interface DetalheEmpresa {
    empresa: Empresa;
    reunioes: Reuniao[];
    treinamentos: ConteudoTreinamento[];
    /** Nem toda empresa tem extrato financeiro no protótipo. */
    financeiro: FinanceiroEmpresa | null;
}

/** Uma empresa da carteira, como o Financeiro geral precisa dela. */
export interface LinhaCarteira {
    id: string;
    nome: string;
    setor: string;
    socio: string;
    regime: RegimeTributario;
    desde: string;
    meses: number;
    primeiro: number;
    atual: number;
    total: number;
}

/**
 * A cor de cada regime nos gráficos. São tokens, não hex soltos: mudar a
 * paleta em base.css muda o gráfico junto.
 */
export const corDoRegime: Record<string, string> = {
    "Simples Nacional": "var(--azul)",
    "Lucro Presumido": "var(--verde)",
    "Lucro Real": "var(--roxo-claro)",
};

/** Usada quando o regime não está no mapa acima. */
export const COR_PADRAO_DO_GRAFICO = "var(--texto-fraco)";

export function carregarEmpresas(): Promise<Empresa[]> {
    return obterColecao<Empresa>("/empresas");
}

export function carregarEmpresa(id: string): Promise<DetalheEmpresa> {
    return obter<DetalheEmpresa>(`/empresas/${encodeURIComponent(id)}`);
}

export function carregarCarteira(): Promise<LinhaCarteira[]> {
    return obter<LinhaCarteira[]>("/financeiro");
}
