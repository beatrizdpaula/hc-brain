/* =========================================================
   TELA DE LOGIN
   Quem confere o acesso é o Laravel: o formulário vai por POST e
   volta com a mensagem de erro já renderizada. Aqui ficam só os
   detalhes de interação da tela.
   ========================================================= */

import { campo, porId } from "../comum/dom.ts";

const loginEmail = campo("loginEmail");
const loginPassword = campo("loginPassword");
const loginError = porId("loginError");

// Com o e-mail já preenchido, o cursor vai direto para a senha.
if (loginEmail.value) {
    loginPassword.focus();
} else {
    loginEmail.focus();
}

const esconderErro = () => loginError.classList.remove("show");
loginEmail.addEventListener("input", esconderErro);
loginPassword.addEventListener("input", esconderErro);
