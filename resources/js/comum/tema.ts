/* =========================================================
   TEMA CLARO E ESCURO
   Quem pinta o tema não é este arquivo: é o script embutido no
   <head> do layout, que roda antes das folhas de estilo. Um
   módulo só executa depois do documento montado, e o primeiro
   quadro já teria saído no tema errado. Aqui ficam a troca pelo
   botão da barra superior e a sincronia entre abas.

   A escolha mora em uma chave própria do localStorage, fora do
   `hcBrainEstado`: o script do <head> atrasa a renderização
   enquanto roda, e ler uma string solta custa menos (e falha
   menos) do que desserializar o estado inteiro do app ali. A
   chave abaixo é a mesma usada no Blade — mudar uma exige mudar
   a outra.
   ========================================================= */

import { todos } from "./dom.ts";
import { desenharIcones, icone } from "./icones.ts";

/** Precisa casar com a chave lida em resources/views/layouts/*.blade.php. */
const CHAVE = "hcBrainTema";

const PREFERENCIA_CLARA = "(prefers-color-scheme: light)";

export type Tema = "claro" | "escuro";

function escolhaSalva(): Tema | null {
    try {
        const valor = localStorage.getItem(CHAVE);
        return valor === "claro" || valor === "escuro" ? valor : null;
    } catch {
        // Modo privado: a sessão segue com o tema do sistema.
        return null;
    }
}

function temaDoSistema(): Tema {
    return window.matchMedia(PREFERENCIA_CLARA).matches ? "claro" : "escuro";
}

/** O tema que está na tela agora, lido de onde ele de fato vale. */
export function temaAtual(): Tema {
    return document.documentElement.dataset.tema === "claro" ? "claro" : "escuro";
}

function aplicar(tema: Tema): void {
    document.documentElement.dataset.tema = tema;

    todos("[data-tema-toggle]").forEach((botao) => {
        botao.setAttribute("aria-pressed", String(tema === "claro"));
        botao.innerHTML = icone(tema === "claro" ? "sun" : "moon");
        desenharIcones(botao);
    });
}

/**
 * Marcador do botão de tema para o HTML que o shell monta. O ícone e o
 * estado entram em `ligarTema()`, que é quem conhece o tema atual.
 */
export function botaoDeTema(): string {
    return `
    <button type="button" class="tema-toggle" data-tema-toggle
            aria-pressed="false" aria-label="Tema claro"
            title="Alternar entre tema claro e escuro"></button>
  `;
}

/**
 * Liga o botão, a sincronia entre abas e a preferência do sistema. Enquanto
 * ninguém escolheu nada, trocar o tema do sistema operacional troca o da
 * página; depois da primeira escolha, ela passa a valer.
 */
export function ligarTema(): void {
    aplicar(temaAtual());

    todos("[data-tema-toggle]").forEach((botao) => {
        botao.addEventListener("click", () => {
            const proximo: Tema = temaAtual() === "claro" ? "escuro" : "claro";
            try {
                localStorage.setItem(CHAVE, proximo);
            } catch {
                // Sem armazenamento a troca vale só nesta página.
            }
            aplicar(proximo);
        });
    });

    // Outra aba gravou a chave: o evento `storage` só chega em quem não
    // gravou, então aqui nunca se repinta a aba que acabou de trocar.
    window.addEventListener("storage", (evento) => {
        if (evento.key === CHAVE) {
            aplicar(escolhaSalva() ?? temaDoSistema());
        }
    });

    window.matchMedia(PREFERENCIA_CLARA).addEventListener("change", () => {
        if (escolhaSalva() === null) {
            aplicar(temaDoSistema());
        }
    });
}
