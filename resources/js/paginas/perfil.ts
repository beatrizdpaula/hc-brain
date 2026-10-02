/* =========================================================
   TELA MEU PERFIL
   O conteúdo já chega pronto no Blade: são os campos da própria
   sessão, que o servidor conhece antes de responder. Não há
   busca, filtro nem edição, então aqui só sobe o shell — que é
   quem desenha o menu, a barra superior e os ícones da página.
   ========================================================= */

import { iniciarPagina } from "../comum/shell.ts";

iniciarPagina("perfil");
