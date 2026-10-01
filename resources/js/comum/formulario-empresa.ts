/* =========================================================
   FORMULÁRIO DE EMPRESA
   Duas telas cadastram e editam a mesma empresa: a lista, em
   "Nova empresa", e o detalhe do cliente, em "Editar". Como o
   formulário é o mesmo — empresa e sócio na mesma caixa —, ele
   mora aqui em vez de aparecer escrito duas vezes.
   ========================================================= */

import {
    cadastrarEmpresa,
    excluirEmpresa,
    salvarEmpresa,
    TAGS_DE_STATUS,
    type DadosDeEmpresa,
} from "../dados/empresas.ts";
import { abrirFormulario } from "./formulario.ts";

/** O que o formulário precisa saber de uma empresa já cadastrada. */
export interface EmpresaEmEdicao {
    id: string;
    nome: string;
    setor: string;
    status: string;
    statusTag: string;
    socio: {
        nome: string;
        cargo: string;
        email: string;
        telefone: string;
        participacao: string;
        desde: string;
    };
}

export interface AcoesDoFormularioDeEmpresa {
    /** Chamado depois de cadastrar ou salvar; recebe o id de quem foi gravado. */
    aoSalvar(id: string): void | Promise<void>;
    /**
     * Para onde ir depois da exclusão. Sem isto, a caixa não oferece excluir:
     * cada tela resolve o depois de um jeito, e nenhuma pode ficar na frente
     * de um registro que não existe mais.
     */
    aoExcluir?(): void | Promise<void>;
}

export async function abrirFormularioDeEmpresa(
    empresa: EmpresaEmEdicao | undefined,
    acoes: AcoesDoFormularioDeEmpresa,
): Promise<void> {
    await abrirFormulario({
        titulo: empresa ? "Editar empresa" : "Nova empresa",
        descricao: "A empresa e o sócio responsável são cadastrados juntos.",
        campos: [
            {
                nome: "nome",
                rotulo: "Empresa",
                valor: empresa?.nome,
                obrigatorio: true,
                largo: true,
            },
            {
                nome: "setor",
                rotulo: "Setor",
                valor: empresa?.setor,
                obrigatorio: true,
            },
            {
                nome: "status",
                rotulo: "Status",
                valor: empresa?.status ?? "Cliente ativo",
                obrigatorio: true,
                dica: "O texto que aparece na etiqueta.",
            },
            {
                nome: "statusTag",
                rotulo: "Cor do status",
                tipo: "selecao",
                valor: empresa?.statusTag ?? "green",
                opcoes: TAGS_DE_STATUS.map(({ valor, rotulo }) => ({ valor, rotulo })),
            },
            {
                nome: "socio.nome",
                rotulo: "Sócio responsável",
                valor: empresa?.socio.nome,
                obrigatorio: true,
            },
            {
                nome: "socio.cargo",
                rotulo: "Cargo do sócio",
                valor: empresa?.socio.cargo,
                obrigatorio: true,
            },
            {
                nome: "socio.email",
                rotulo: "E-mail do sócio",
                tipo: "email",
                valor: empresa?.socio.email,
                obrigatorio: true,
            },
            {
                nome: "socio.telefone",
                rotulo: "Telefone do sócio",
                valor: empresa?.socio.telefone,
                obrigatorio: true,
            },
            {
                nome: "socio.participacao",
                rotulo: "Participação",
                valor: empresa?.socio.participacao,
                obrigatorio: true,
                dica: "Como aparece na ficha: 60%, por exemplo.",
            },
            {
                nome: "socio.desde",
                rotulo: "Cliente desde",
                valor: empresa?.socio.desde,
                obrigatorio: true,
                dica: "Março de 2024, por exemplo.",
            },
        ],
        excluir:
            empresa && acoes.aoExcluir
                ? {
                      rotulo: "Excluir empresa",
                      confirmacao:
                          `Excluir ${empresa.nome} leva junto o sócio, as fontes, o financeiro ` +
                          "e as reuniões da empresa. Essa ação não pode ser desfeita.",
                      async aoExcluir() {
                          await excluirEmpresa(empresa.id);
                          await acoes.aoExcluir?.();
                      },
                  }
                : undefined,
        async aoSalvar(valores) {
            const dados: DadosDeEmpresa = {
                nome: valores.texto("nome"),
                setor: valores.texto("setor"),
                status: valores.texto("status"),
                statusTag: valores.texto("statusTag"),
                socio: {
                    nome: valores.texto("socio.nome"),
                    cargo: valores.texto("socio.cargo"),
                    email: valores.texto("socio.email"),
                    telefone: valores.texto("socio.telefone"),
                    participacao: valores.texto("socio.participacao"),
                    desde: valores.texto("socio.desde"),
                },
            };

            const gravada = empresa
                ? await salvarEmpresa(empresa.id, dados)
                : await cadastrarEmpresa(dados);

            await acoes.aoSalvar(gravada.id);
        },
    });
}
