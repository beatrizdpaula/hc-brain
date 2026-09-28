/* =========================================================
   CONVERSA COM O BACK-END
   Toda tela lê do mesmo lugar: a API do Laravel, na mesma sessão
   do navegador. Estas funções cuidam do token CSRF, do formato
   das respostas e do que fazer quando a sessão cai.
   ========================================================= */

const BASE = "/api";

/** Erro devolvido pela API, com os erros de validação separados por campo. */
export class ErroDeApi extends Error {
    constructor(
        readonly status: number,
        mensagem: string,
        readonly campos: Record<string, string[]> = {},
    ) {
        super(mensagem);
        this.name = "ErroDeApi";
    }

    /** Primeira mensagem de um campo, para mostrar direto na tela. */
    primeiroErro(campo: string): string | null {
        return this.campos[campo]?.[0] ?? null;
    }
}

function tokenCsrf(): string {
    return (
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? ""
    );
}

interface CorpoDeErro {
    message?: string;
    errors?: Record<string, string[]>;
}

async function pedir<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
    const resposta = await fetch(`${BASE}${caminho}`, {
        ...opcoes,
        headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            ...opcoes.headers,
        },
    });

    // Sessão expirada ou token vencido: a pessoa precisa entrar de novo.
    if (resposta.status === 401 || resposta.status === 419) {
        window.location.href = "/login";
        throw new ErroDeApi(resposta.status, "Sua sessão expirou.");
    }

    const corpo: unknown = await resposta.json().catch(() => null);

    if (!resposta.ok) {
        const erro = (corpo ?? {}) as CorpoDeErro;
        throw new ErroDeApi(
            resposta.status,
            erro.message ?? "Não foi possível falar com o servidor.",
            erro.errors ?? {},
        );
    }

    return corpo as T;
}

export function obter<T>(caminho: string): Promise<T> {
    return pedir<T>(caminho);
}

export function enviar<T>(caminho: string, corpo: unknown): Promise<T> {
    return pedir<T>(caminho, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": tokenCsrf(),
        },
        body: JSON.stringify(corpo),
    });
}

/** Coleções vêm embrulhadas em `data` quando saem de um API Resource. */
export async function obterColecao<T>(caminho: string): Promise<T[]> {
    const resposta = await obter<{ data: T[] }>(caminho);
    return resposta.data;
}
