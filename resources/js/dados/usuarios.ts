/* =========================================================
   USUÁRIOS — equipe com acesso ao HC Brain
   A lista vive na tabela `users`, a mesma que autentica o login:
   quem é cadastrado aqui consegue entrar no sistema.
   ========================================================= */

import { atualizar, enviar, obterColecao, remover } from "../comum/api.ts";

export type PerfilUsuario = "Administrador" | "Gestor" | "Colaborador";

export type StatusUsuario = "Ativo" | "Inativo";

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    perfil: PerfilUsuario;
    area: string;
    status: StatusUsuario;
    ultimoAcesso: string;
    iniciais: string;
}

export interface DadosDeUsuario {
    nome: string;
    email: string;
    perfil: string;
    area: string;
    status: string;
    /** Em branco na edição mantém a senha atual. */
    senha: string;
}

export function carregarUsuarios(): Promise<Usuario[]> {
    return obterColecao<Usuario>("/usuarios");
}

export async function cadastrarUsuario(novo: DadosDeUsuario): Promise<Usuario> {
    const resposta = await enviar<{ data: Usuario }>("/usuarios", novo);
    return resposta.data;
}

export async function salvarUsuario(id: number, dados: DadosDeUsuario): Promise<Usuario> {
    const resposta = await atualizar<{ data: Usuario }>(`/usuarios/${id}`, dados);
    return resposta.data;
}

export function excluirUsuario(id: number): Promise<void> {
    return remover(`/usuarios/${id}`);
}
