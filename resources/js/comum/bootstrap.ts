/* =========================================================
   PACOTE INICIAL
   O layout Blade entrega, antes de qualquer script rodar, tudo o
   que o shell precisa saber: quem está logado, o mapa de telas e
   os contadores do menu. Assim nenhuma tela começa com uma ida ao
   servidor só para desenhar a barra lateral.
   ========================================================= */

export interface SessaoUsuario {
    nome: string;
    email: string;
    perfil: string;
    iniciais: string;
}

export interface Contadores {
    empresas: number;
    reunioes: number;
    usuarios: number;
}

export type ChaveContador = keyof Contadores;

export interface Pagina {
    id: string;
    titulo: string;
    /** Caminho da tela, com `{parametro}` onde a URL pede um valor. */
    rota: string;
    /** Nome do ícone na Lucide — só as telas do menu têm. */
    icone?: string;
    grupo?: string;
    /** Número exibido ao lado do item no menu. */
    contador?: ChaveContador;
    /** Item do menu que fica ativo quando a tela não está no menu. */
    menu?: string;
}

/** Tela com entrada no menu lateral: ícone e grupo são obrigatórios. */
export type PaginaMenu = Pagina & Required<Pick<Pagina, "icone" | "grupo">>;

interface PacoteInicial {
    usuario: SessaoUsuario;
    paginas: PaginaMenu[];
    auxiliares: Pagina[];
    contadores: Contadores;
}

declare global {
    interface Window {
        HC_BRAIN?: PacoteInicial;
    }
}

function ler(): PacoteInicial {
    const pacote = window.HC_BRAIN;
    if (!pacote) {
        throw new Error("A página não recebeu o pacote inicial do HC Brain.");
    }
    return pacote;
}

export const APP = ler();
