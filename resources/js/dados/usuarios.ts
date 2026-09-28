/* =========================================================
   USUÁRIOS — equipe com acesso ao HC Brain
   A lista vive na tabela `users`, a mesma que autentica o login:
   quem é cadastrado aqui consegue entrar no sistema.
   ========================================================= */

import { enviar, obterColecao } from "../comum/api.ts";

export interface Usuario {
    nome: string;
    email: string;
    perfil: string;
    area: string;
    status: string;
    ultimoAcesso: string;
    iniciais: string;
}

export interface NovoUsuario {
    nome: string;
    email: string;
    perfil: string;
    area: string;
    status: string;
    senha: string;
}

export function carregarUsuarios(): Promise<Usuario[]> {
    return obterColecao<Usuario>("/usuarios");
}

export async function cadastrarUsuario(novo: NovoUsuario): Promise<Usuario> {
    const resposta = await enviar<{ data: Usuario }>("/usuarios", novo);
    return resposta.data;
}
