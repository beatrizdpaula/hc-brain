/* =========================================================
   ACESSO AO DOM
   O script de cada tela é escrito junto com o Blade dela, então
   ele conta com os elementos daquela página. Estes helpers
   deixam essa premissa explícita: se um id sair da view, a
   página falha na hora, em vez de seguir com null.
   ========================================================= */

export function porId<T extends HTMLElement = HTMLElement>(id: string): T {
    const elemento = document.getElementById(id);
    if (!elemento) throw new Error(`A página não tem o elemento #${id}.`);
    return elemento as T;
}

export function campo(id: string): HTMLInputElement {
    return porId<HTMLInputElement>(id);
}

export function selecao(id: string): HTMLSelectElement {
    return porId<HTMLSelectElement>(id);
}

export function porSeletor<T extends HTMLElement = HTMLElement>(
    seletor: string,
    escopo: ParentNode = document,
): T {
    const elemento = escopo.querySelector<T>(seletor);
    if (!elemento) throw new Error(`A página não tem o elemento ${seletor}.`);
    return elemento;
}

export function talvez<T extends HTMLElement = HTMLElement>(
    seletor: string,
    escopo: ParentNode = document,
): T | null {
    return escopo.querySelector<T>(seletor);
}

export function todos<T extends HTMLElement = HTMLElement>(
    seletor: string,
    escopo: ParentNode = document,
): T[] {
    return Array.from(escopo.querySelectorAll<T>(seletor));
}

/** Valor de um atributo data-*, já pronto para entrar em texto ou estado. */
export function dado(elemento: HTMLElement, chave: string): string {
    return elemento.dataset[chave] ?? "";
}

/** Ancestral do alvo do evento que casa com o seletor. */
export function alvoMaisProximo<T extends HTMLElement = HTMLElement>(
    evento: Event,
    seletor: string,
): T | null {
    return evento.target instanceof Element ? evento.target.closest<T>(seletor) : null;
}
