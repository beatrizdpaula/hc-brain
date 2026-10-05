/* =========================================================
   BUSCA POR TEXTO
   Como um termo digitado encontra um registro. Toda caixa de
   busca do app passa por aqui, então "reuniao abertura" acha
   "Reunião de abertura — Empresa X" em qualquer tela.

   Duas regras: acento e caixa não contam, e as palavras valem
   soltas. Comparar a frase inteira como um pedaço só fazia o
   atalho "Abertura de empresa", do Início, cair numa tela sem
   nenhum resultado, mesmo com a base cheia de registros sobre
   abertura de empresas.
   ========================================================= */

/** Tira acento e caixa: "José" e "jose" viram a mesma coisa. */
function dobrar(texto: string): string {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

/**
 * Quebra o termo digitado nas palavras que ele precisa casar. O preparo fica
 * fora do laço do filtro de propósito: a busca roda sobre a lista inteira a
 * cada tecla, e normalizar o mesmo termo em cada registro é desperdício.
 */
export function termoDeBusca(termo: string): string[] {
    return dobrar(termo).split(/\s+/).filter(Boolean);
}

/**
 * Verdadeiro quando todas as palavras aparecem no texto, em qualquer ordem.
 * Termo vazio casa com tudo, que é o estado de "sem filtro".
 */
export function combina(texto: string, palavras: string[]): boolean {
    if (!palavras.length) {
        return true;
    }

    const alvo = dobrar(texto);

    return palavras.every((palavra) => alvo.includes(palavra));
}
