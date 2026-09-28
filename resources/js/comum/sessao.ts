/* =========================================================
   SESSÃO
   Quem guarda a sessão é o Laravel: as telas já chegam autenticadas
   (o middleware barra quem não está) e só precisam saber quem está
   logado e como sair.
   ========================================================= */

import { APP, type SessaoUsuario } from "./bootstrap.ts";
import { talvez } from "./dom.ts";

export type { SessaoUsuario } from "./bootstrap.ts";

export function usuarioLogado(): SessaoUsuario {
    return APP.usuario;
}

/** Sair muda estado do servidor, então vai por POST com o token da sessão. */
export function sair(): void {
    talvez<HTMLFormElement>("[data-form-sair]")?.submit();
}
