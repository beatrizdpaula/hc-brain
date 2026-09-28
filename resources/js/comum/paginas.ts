/* =========================================================
   MAPA DAS TELAS
   O mapa em si vive no servidor (app/Support/Telas.php), que também
   registra as rotas; aqui só o consultamos. Assim um link entre
   páginas é `caminhoDaPagina("reunioes")`, e renomear uma URL é
   mexer em um lugar só.
   ========================================================= */

import { APP, type Pagina } from "./bootstrap.ts";

export type { Pagina, PaginaMenu } from "./bootstrap.ts";

export const PAGINAS = APP.paginas;

export function paginaPorId(id: string): Pagina | undefined {
    return (
        PAGINAS.find((pagina) => pagina.id === id) ||
        APP.auxiliares.find((pagina) => pagina.id === id)
    );
}

/** Caminho navegável de uma tela, com os parâmetros da rota já aplicados. */
export function caminhoDaPagina(
    id: string,
    parametros: Record<string, string> = {},
): string {
    const pagina = paginaPorId(id);
    if (!pagina) return "/";

    return Object.entries(parametros).reduce(
        (caminho, [chave, valor]) =>
            caminho.replace(`{${chave}}`, encodeURIComponent(valor)),
        pagina.rota,
    );
}

export function irPara(id: string, parametros?: Record<string, string>): void {
    window.location.href = caminhoDaPagina(id, parametros);
}
