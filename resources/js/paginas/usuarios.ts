/* =========================================================
   TELA USUÁRIOS
   A lista é a tabela `users` do Laravel — a mesma que autentica o
   login. Cadastrar aqui cria de fato um acesso ao HC Brain.
   ========================================================= */

import { cadastrarUsuario, carregarUsuarios, type Usuario } from "../dados/usuarios.ts";
import { ErroDeApi } from "../comum/api.ts";
import { campo, porId, selecao } from "../comum/dom.ts";
import { atualizarSecao, observarEstado, obterSecao } from "../comum/estado.ts";
import { escapar, plural } from "../comum/formato.ts";
import { showModal } from "../comum/modal.ts";
import { iniciarPagina } from "../comum/shell.ts";

iniciarPagina("usuarios");

const busca = campo("usuarioSearch");
const perfil = selecao("usuarioRoleFilter");
const status = selecao("usuarioStatusFilter");
const corpo = porId("usuariosTableBody");
const modalCadastro = porId("novoUsuarioModal");
const formulario = porId<HTMLFormElement>("novoUsuarioForm");

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
            </tr>
          `,
              )
              .join("")
        : `<tr><td colspan="5"><div class="empty-state">Nenhum usuário encontrado.</div></td></tr>`;

    if (busca.value !== estado.busca) busca.value = estado.busca;
    perfil.value = estado.perfil;
    status.value = estado.status;
}

busca.addEventListener("input", () => atualizarSecao("usuarios", { busca: busca.value }));
perfil.addEventListener("change", () =>
    atualizarSecao("usuarios", { perfil: perfil.value }),
);
status.addEventListener("change", () =>
    atualizarSecao("usuarios", { status: status.value }),
);

const abrirCadastro = () => modalCadastro.classList.add("show");
const fecharCadastro = () => {
    modalCadastro.classList.remove("show");
    formulario.reset();
};

porId("novoUsuarioBtn").addEventListener("click", abrirCadastro);
porId("fecharNovoUsuario").addEventListener("click", fecharCadastro);
porId("cancelarNovoUsuario").addEventListener("click", fecharCadastro);
modalCadastro.addEventListener("click", (evento) => {
    if (evento.target === modalCadastro) fecharCadastro();
});

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nome = campo("novoUsuarioNome").value.trim();

    try {
        const criado = await cadastrarUsuario({
            nome,
            email: campo("novoUsuarioEmail").value.trim(),
            perfil: selecao("novoUsuarioPerfil").value,
            area: selecao("novoUsuarioArea").value,
            status: selecao("novoUsuarioStatus").value,
            senha: campo("novoUsuarioSenha").value,
        });

        usuarios = [...usuarios, criado];
        fecharCadastro();
        renderUsuarios();
        showModal("Usuário cadastrado", `${nome} foi adicionado à lista de usuários.`);
    } catch (erro) {
        if (!(erro instanceof ErroDeApi)) throw erro;

        showModal(
            "Não foi possível cadastrar",
            erro.primeiroErro("email") ?? erro.primeiroErro("senha") ?? erro.message,
        );
    }
});

observarEstado(["usuarios"], renderUsuarios);
renderUsuarios();
