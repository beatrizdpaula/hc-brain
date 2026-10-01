/* =========================================================
   RECUPERAÇÃO DE ACESSO
   Quem valida o token e troca a senha é o Laravel: as duas
   telas são formulários POST comuns. Aqui fica só o detalhe de
   interação — o cursor já no primeiro campo que falta preencher.
   ========================================================= */

import { todos } from "../comum/dom.ts";

// A mesma folha e o mesmo script servem às duas telas de senha, então eles
// trabalham sobre os campos que a página tiver, sem contar com ids fixos.
const campos = todos<HTMLInputElement>(".login-card input:not([type='hidden'])");

(campos.find((campo) => campo.value === "") ?? campos[0])?.focus();
