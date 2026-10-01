/* =========================================================
   FORMULÁRIO EM MODAL
   Cadastrar, editar e excluir acontecem em quase toda tela, e
   sempre do mesmo jeito: uma caixa com campos, o erro de cada
   campo vindo do Laravel e a lista se atualizando ao salvar.
   Esse comportamento mora aqui, e não repetido em cada página.
   ========================================================= */

import { ErroDeApi } from "./api.ts";
import { escapar } from "./formato.ts";
import { desenharIcones, icone } from "./icones.ts";

export type TipoCampo =
    | "texto"
    | "email"
    | "senha"
    | "data"
    | "hora"
    | "numero"
    | "arquivo"
    | "longo"
    | "linhas"
    | "selecao";

export interface OpcaoDeCampo {
    valor: string;
    rotulo: string;
}

export interface CampoDeFormulario {
    /** O mesmo nome que o Laravel valida, para o erro cair no campo certo. */
    nome: string;
    rotulo: string;
    tipo?: TipoCampo;
    valor?: string;
    opcoes?: OpcaoDeCampo[];
    obrigatorio?: boolean;
    dica?: string;
    min?: string;
    max?: string;
    /** Campo que ocupa a linha inteira da grade. */
    largo?: boolean;
}

/** Leitura dos campos já no tipo que o chamador precisa enviar. */
export interface ValoresDoFormulario {
    texto(nome: string): string;
    numero(nome: string): number;
    arquivo(nome: string): File | null;
    /** Campo "linhas": cada linha preenchida vira um item da lista. */
    linhas(nome: string): string[];
}

/** Excluir dentro da caixa de edição, separado do botão de salvar. */
export interface ExclusaoDoFormulario {
    rotulo?: string;
    confirmacao: string;
    aoExcluir(): Promise<void>;
}

export interface Formulario {
    titulo: string;
    descricao?: string;
    campos: CampoDeFormulario[];
    confirmar?: string;
    excluir?: ExclusaoDoFormulario;
    /**
     * Erro de validação da API mantém a caixa aberta com a mensagem no campo;
     * qualquer outro erro sobe, porque não é algo que quem usa possa corrigir.
     */
    aoSalvar(valores: ValoresDoFormulario): Promise<void>;
}

const TIPO_HTML: Record<TipoCampo, string> = {
    texto: "text",
    email: "email",
    senha: "password",
    data: "date",
    hora: "time",
    numero: "number",
    arquivo: "file",
    longo: "text",
    linhas: "text",
    selecao: "text",
};

function controle(campo: CampoDeFormulario): string {
    const id = `campo-${campo.nome}`;
    const obrigatorio = campo.obrigatorio ? " required" : "";
    const nome = escapar(campo.nome);

    if (campo.tipo === "selecao") {
        const opcoes = (campo.opcoes ?? [])
            .map(
                (opcao) =>
                    `<option value="${escapar(opcao.valor)}"${opcao.valor === campo.valor ? " selected" : ""}>${escapar(opcao.rotulo)}</option>`,
            )
            .join("");

        return `<select id="${id}" data-campo="${nome}"${obrigatorio}>${opcoes}</select>`;
    }

    if (campo.tipo === "longo" || campo.tipo === "linhas") {
        const linhas = campo.tipo === "linhas" ? 4 : 3;
        return `<textarea id="${id}" data-campo="${nome}" rows="${linhas}"${obrigatorio}>${escapar(campo.valor ?? "")}</textarea>`;
    }

    const tipo = TIPO_HTML[campo.tipo ?? "texto"];
    const limites =
        (campo.min === undefined ? "" : ` min="${escapar(campo.min)}"`) +
        (campo.max === undefined ? "" : ` max="${escapar(campo.max)}"`);
    const valor =
        campo.tipo === "arquivo" ? "" : ` value="${escapar(campo.valor ?? "")}"`;

    return `<input id="${id}" data-campo="${nome}" type="${tipo}"${valor}${limites}${obrigatorio} />`;
}

function markup(formulario: Formulario): string {
    const campos = formulario.campos
        .map(
            (campo) => `
      <div class="campo${campo.largo ? " campo-largo" : ""}">
        <label for="campo-${campo.nome}">${escapar(campo.rotulo)}</label>
        ${controle(campo)}
        ${campo.dica ? `<small class="campo-dica">${escapar(campo.dica)}</small>` : ""}
        <small class="campo-erro" data-erro="${escapar(campo.nome)}" hidden></small>
      </div>
    `,
        )
        .join("");

    return `
    <div class="modal-box">
      <button class="icon-button close" type="button" data-fechar aria-label="Fechar">${icone("x")}</button>
      <h2>${escapar(formulario.titulo)}</h2>
      ${formulario.descricao ? `<p>${escapar(formulario.descricao)}</p>` : ""}

      <form novalidate>
        <div class="form-campos">${campos}</div>

        <div class="modal-erro" data-erro-geral hidden></div>

        <div class="modal-actions">
          ${
              formulario.excluir
                  ? `<button type="button" class="perigo modal-acao-perigosa" data-excluir>${escapar(formulario.excluir.rotulo ?? "Excluir")}</button>`
                  : ""
          }
          <button type="button" class="secondary" data-fechar>Cancelar</button>
          <button type="submit" class="primary" data-salvar>${escapar(formulario.confirmar ?? "Salvar")}</button>
        </div>
      </form>
    </div>
  `;
}

/** Abre a caixa e resolve quando ela fecha, tendo salvo ou não. */
export function abrirFormulario(formulario: Formulario): Promise<boolean> {
    return new Promise((resolver) => {
        const modal = document.createElement("div");
        modal.className = "modal show";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.innerHTML = markup(formulario);
        document.body.append(modal);
        desenharIcones(modal);

        const foco = document.activeElement as HTMLElement | null;
        const form = modal.querySelector("form") as HTMLFormElement;
        const salvar = modal.querySelector("[data-salvar]") as HTMLButtonElement;
        const erroGeral = modal.querySelector("[data-erro-geral]") as HTMLElement;

        const elemento = (nome: string) =>
            form.querySelector<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >(`[data-campo="${nome}"]`);

        const valores: ValoresDoFormulario = {
            texto: (nome) => elemento(nome)?.value.trim() ?? "",
            numero: (nome) => Number(elemento(nome)?.value ?? 0),
            arquivo: (nome) => (elemento(nome) as HTMLInputElement)?.files?.[0] ?? null,
            linhas: (nome) =>
                (elemento(nome)?.value ?? "")
                    .split("\n")
                    .map((linha) => linha.trim())
                    .filter((linha) => linha !== ""),
        };

        function limparErros(): void {
            erroGeral.hidden = true;
            erroGeral.textContent = "";
            modal.querySelectorAll<HTMLElement>("[data-erro]").forEach((aviso) => {
                aviso.hidden = true;
                aviso.textContent = "";
            });
        }

        function mostrarErro(erro: ErroDeApi): void {
            let sobrou = erro.message;

            for (const campo of formulario.campos) {
                const mensagem = erro.primeiroErro(campo.nome);
                if (mensagem === null) continue;

                const aviso = modal.querySelector<HTMLElement>(
                    `[data-erro="${campo.nome}"]`,
                );
                if (aviso) {
                    aviso.textContent = mensagem;
                    aviso.hidden = false;
                    // Já há mensagem no campo: repeti-la no topo é ruído.
                    sobrou = "";
                }
            }

            if (sobrou) {
                erroGeral.textContent = sobrou;
                erroGeral.hidden = false;
            }
        }

        function fechar(salvou: boolean): void {
            modal.remove();
            document.removeEventListener("keydown", aoTeclar);
            foco?.focus();
            resolver(salvou);
        }

        function aoTeclar(evento: KeyboardEvent): void {
            if (evento.key === "Escape") fechar(false);
        }

        form.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            limparErros();
            salvar.disabled = true;

            try {
                await formulario.aoSalvar(valores);
                fechar(true);
            } catch (erro) {
                if (!(erro instanceof ErroDeApi)) {
                    fechar(false);
                    throw erro;
                }
                mostrarErro(erro);
            } finally {
                salvar.disabled = false;
            }
        });

        modal.querySelectorAll("[data-fechar]").forEach((botao) => {
            botao.addEventListener("click", () => fechar(false));
        });

        modal.querySelector("[data-excluir]")?.addEventListener("click", async () => {
            const exclusao = formulario.excluir;
            if (!exclusao) return;

            // A caixa de edição sai da frente antes da confirmação: duas
            // janelas empilhadas escondem o que está sendo decidido.
            modal.classList.remove("show");

            if (
                await confirmarAcao(
                    formulario.titulo,
                    exclusao.confirmacao,
                    exclusao.rotulo,
                )
            ) {
                await exclusao.aoExcluir();
                fechar(true);
                return;
            }

            modal.classList.add("show");
        });

        modal.addEventListener("click", (evento) => {
            if (evento.target === modal) fechar(false);
        });

        document.addEventListener("keydown", aoTeclar);

        form.querySelector<HTMLElement>("[data-campo]")?.focus();
    });
}

/**
 * Confirmação de uma ação que não dá para desfazer. Separada do formulário
 * porque excluir não tem campo para preencher — só a decisão.
 */
export function confirmarAcao(
    titulo: string,
    texto: string,
    rotulo = "Excluir",
): Promise<boolean> {
    return new Promise((resolver) => {
        const modal = document.createElement("div");
        modal.className = "modal show";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.innerHTML = `
      <div class="modal-box">
        <button class="icon-button close" type="button" data-fechar aria-label="Fechar">${icone("x")}</button>
        <h2>${escapar(titulo)}</h2>
        <p>${escapar(texto)}</p>
        <div class="modal-actions">
          <button type="button" class="secondary" data-fechar>Cancelar</button>
          <button type="button" class="perigo" data-confirmar>${escapar(rotulo)}</button>
        </div>
      </div>
    `;
        document.body.append(modal);
        desenharIcones(modal);

        const foco = document.activeElement as HTMLElement | null;

        const fechar = (confirmou: boolean) => {
            modal.remove();
            document.removeEventListener("keydown", aoTeclar);
            foco?.focus();
            resolver(confirmou);
        };

        function aoTeclar(evento: KeyboardEvent): void {
            if (evento.key === "Escape") fechar(false);
        }

        modal.querySelectorAll("[data-fechar]").forEach((botao) => {
            botao.addEventListener("click", () => fechar(false));
        });
        modal
            .querySelector("[data-confirmar]")
            ?.addEventListener("click", () => fechar(true));
        modal.addEventListener("click", (evento) => {
            if (evento.target === modal) fechar(false);
        });
        document.addEventListener("keydown", aoTeclar);

        modal.querySelector<HTMLElement>("[data-confirmar]")?.focus();
    });
}
