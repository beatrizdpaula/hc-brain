/* =========================================================
   TELA USUÁRIOS
   A lista é a tabela `users` do Laravel — a mesma que autentica o
   login. Cadastrar aqui cria de fato um acesso ao HC Brain, e
   excluir tira o acesso de quem não trabalha mais com a base.
   ========================================================= */

import {
    cadastrarUsuario,
    carregarUsuarios,
    excluirUsuario,
    salvarUsuario,
    type Usuario,
} from "../dados/usuarios.ts";
import { campo, dado, porId, selecao, todos } from "../comum/dom.ts";
import { atualizarSecao, observarEstado, obterSecao } from "../comum/estado.ts";
import { escapar, plural } from "../comum/formato.ts";
import { abrirFormulario } from "../comum/formulario.ts";
import { desenharIcones, icone } from "../comum/icones.ts";
import { iniciarPagina } from "../comum/shell.ts";

iniciarPagina("usuarios");

const PERFIS = ["Administrador", "Gestor", "Colaborador"];
const AREAS = [
    "Gestão",
    "Comercial",
    "Operações",
    "Atendimento",
    "Financeiro",
    "Projetos",
];
const SITUACOES = ["Ativo", "Inativo"];

const busca = campo("usuarioSearch");
const perfil = selecao("usuarioRoleFilter");
const status = selecao("usuarioStatusFilter");
const corpo = porId("usuariosTableBody");

let usuarios: Usuario[] = await carregarUsuarios();

function renderUsuarios(): void {
    const estado = obterSecao("usuarios");
    const termo = estado.busca.toLowerCase().trim();

    const filtrados = usuarios.filter((usuario) => {
        const texto =
            `${usuario.nome} ${usuario.email} ${usuario.area} ${usuario.perfil}`.toLowerCase();
        return (
            (!termo || texto.includes(termo)) &&
            (estado.perfil === "Todos" || usuario.perfil === estado.perfil) &&
            (estado.status === "Todos" || usuario.status === estado.status)
        );
    });

    porId("usuariosTotal").textContent = String(filtrados.length);
    porId("usuariosAtivos").textContent = String(
        filtrados.filter((usuario) => usuario.status === "Ativo").length,
    );
    porId("usuariosAdmins").textContent = String(
        filtrados.filter((usuario) => usuario.perfil === "Administrador").length,
    );
    porId("usuariosUltimo").textContent = filtrados[0]?.ultimoAcesso || "—";
    porId("usuariosCount").textContent = plural(filtrados.length, "usuário", "usuários");

    corpo.innerHTML = filtrados.length
        ? filtrados
              .map(
                  (usuario) => `
            <tr>
              <td>
                <div class="usuario-person">
                  <span class="avatar">${escapar(usuario.iniciais)}</span>
                  <div>
                    <strong>${escapar(usuario.nome)}</strong>
                    <small>${escapar(usuario.email)}</small>
                  </div>
                </div>
              </td>
              <td><span class="tag gray">${escapar(usuario.perfil)}</span></td>
              <td>${escapar(usuario.area)}</td>
              <td><span class="tag ${usuario.status === "Ativo" ? "green" : "red"}">${escapar(usuario.status)}</span></td>
              <td class="usuario-access">${escapar(usuario.ultimoAcesso)}</td>
              <td class="usuario-acoes">
                <button type="button" class="icon-button" data-editar="${usuario.id}" aria-label="Editar ${escapar(usuario.nome)}">
                  ${icone("settings")}
                </button>
              </td>
            </tr>
          `,
              )
              .join("")
        : `<tr><td colspan="6"><div class="empty-state">Nenhum usuário encontrado.</div></td></tr>`;

    todos("[data-editar]", corpo).forEach((botao) => {
        botao.addEventListener("click", () => {
            const id = Number(dado(botao, "editar"));
            const usuario = usuarios.find((registro) => registro.id === id);
            if (usuario) abrirFormularioDe(usuario);
        });
    });

    desenharIcones(corpo);

    if (busca.value !== estado.busca) busca.value = estado.busca;
    perfil.value = estado.perfil;
    status.value = estado.status;
}

async function recarregar(): Promise<void> {
    usuarios = await carregarUsuarios();
    renderUsuarios();
}

/**
 * O mesmo formulário cadastra e edita. Na edição a senha é opcional: trocar
 * a área de alguém não deveria obrigar quem edita a inventar uma senha nova.
 */
function abrirFormularioDe(usuario?: Usuario): void {
    const opcoes = (valores: string[]) =>
        valores.map((valor) => ({ valor, rotulo: valor }));

    void abrirFormulario({
        titulo: usuario ? usuario.nome : "Cadastrar usuário",
        descricao: usuario
            ? "Alterar o acesso desta pessoa ao HC Brain."
            : "Adicione uma pessoa ao ambiente do HC Brain e defina o perfil e a área de acesso.",
        campos: [
            {
                nome: "nome",
                rotulo: "Nome completo",
                valor: usuario?.nome,
                obrigatorio: true,
            },
            {
                nome: "email",
                rotulo: "E-mail",
                tipo: "email",
                valor: usuario?.email,
                obrigatorio: true,
            },
            {
                nome: "perfil",
                rotulo: "Perfil",
                tipo: "selecao",
                valor: usuario?.perfil ?? "Colaborador",
                opcoes: opcoes(PERFIS),
            },
            {
                nome: "area",
                rotulo: "Área",
                tipo: "selecao",
                valor: usuario?.area ?? AREAS[0],
                opcoes: opcoes(AREAS),
            },
            {
                nome: "status",
                rotulo: "Status",
                tipo: "selecao",
                valor: usuario?.status ?? "Ativo",
                opcoes: opcoes(SITUACOES),
            },
            {
                nome: "senha",
                rotulo: usuario ? "Nova senha" : "Senha inicial",
                tipo: "senha",
                obrigatorio: usuario === undefined,
                dica: usuario
                    ? "Em branco, a senha atual continua valendo."
                    : "Mínimo de 8 caracteres.",
            },
        ],
        confirmar: usuario ? "Salvar usuário" : "Cadastrar usuário",
        excluir: usuario
            ? {
                  rotulo: "Excluir acesso",
                  confirmacao: `${usuario.nome} perde o acesso ao HC Brain. Não há como desfazer.`,
                  aoExcluir: async () => {
                      await excluirUsuario(usuario.id);
                      await recarregar();
                  },
              }
            : undefined,
        aoSalvar: async (valores) => {
            const dados = {
                nome: valores.texto("nome"),
                email: valores.texto("email"),
                perfil: valores.texto("perfil"),
                area: valores.texto("area"),
                status: valores.texto("status"),
                senha: valores.texto("senha"),
            };

            if (usuario) {
                await salvarUsuario(usuario.id, dados);
            } else {
                await cadastrarUsuario(dados);
            }

            await recarregar();
        },
    });
}

busca.addEventListener("input", () => atualizarSecao("usuarios", { busca: busca.value }));
perfil.addEventListener("change", () =>
    atualizarSecao("usuarios", { perfil: perfil.value }),
);
status.addEventListener("change", () =>
    atualizarSecao("usuarios", { status: status.value }),
);

porId("novoUsuarioBtn").addEventListener("click", () => abrirFormularioDe());

observarEstado(["usuarios"], renderUsuarios);
renderUsuarios();
