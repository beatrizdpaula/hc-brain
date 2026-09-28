<?php

namespace Database\Seeders;

use App\Models\Processo;
use App\Models\Projeto;
use Illuminate\Database\Seeder;

/** Projetos em andamento e os fluxos internos que as equipes seguem. */
class ProjetoSeeder extends Seeder
{
    /** id, nome, descrição, status, prioridade, responsável, área, progresso, início, prazo, empresa */
    private const PROJETOS = [
        ['automacao-comercial', 'Automação do processo comercial', 'Automatizar a entrada de leads, a proposta e o acompanhamento até o fechamento, reduzindo o retrabalho do time comercial.', 'Em andamento', 'Alta', 'Matheus', 'Comercial', 72, '2026-05-12', '2026-11-28', 'empresaX'],
        ['portal-do-cliente', 'Portal do cliente', 'Área onde o cliente acompanha solicitações, documentos e o andamento das demandas sem depender do atendimento.', 'Em andamento', 'Alta', 'Ana Souza', 'Projetos', 45, '2026-06-01', '2026-12-15', 'empresaY'],
        ['base-conhecimento', 'Base de conhecimento HC', 'Centralizar documentos, processos e treinamentos em um só lugar, alimentando as respostas da Sofia.', 'Em andamento', 'Alta', 'Beatriz', 'Gestão', 88, '2026-03-02', '2026-10-30', null],
        ['integracao-contabil', 'Integração contábil', 'Conectar o sistema contábil às rotinas de fechamento mensal para eliminar lançamentos manuais.', 'Em revisão', 'Média', 'Rafael Nogueira', 'Financeiro', 60, '2026-04-20', '2026-11-10', 'empresaZ'],
        ['onboarding-equipe', 'Onboarding da equipe', 'Trilha de integração para novos colaboradores, ligada aos conteúdos do sistema de capacitação.', 'Em andamento', 'Média', 'Mariana Costa', 'Atendimento', 35, '2026-07-14', '2027-01-20', null],
        ['revisao-legalizacao', 'Revisão do fluxo de legalização', 'Mapear e simplificar as etapas de regularização de registros, hoje distribuídas entre três equipes.', 'Planejado', 'Baixa', 'Carlos Mendes', 'Operações', 10, '2026-09-01', '2027-02-27', 'empresaW'],
    ];

    /** id, nome, descrição, área, responsável, frequência, atualizado em, etapas */
    private const PROCESSOS = [
        [
            'cadastro-clientes', 'Cadastro e atualização de clientes',
            'Procedimento para inserir um cliente novo na base e manter os dados cadastrais revisados.',
            'Atendimento', 'Mariana Costa', 'A cada novo cliente', '04/09/2026',
            ['Receber os dados e documentos do cliente', 'Conferir CNPJ, sócios e regime tributário', 'Cadastrar a empresa e o sócio responsável', 'Vincular as fontes e a pasta de documentos', 'Registrar a reunião de abertura'],
        ],
        [
            'analise-documentos', 'Análise de documentos',
            'Fluxo de validação, aprovação e armazenamento de todo documento que entra na base.',
            'Operações', 'Carlos Mendes', 'Diária', '01/09/2026',
            ['Receber o documento pelo canal oficial', 'Validar tipo, assinatura e vigência', 'Classificar por empresa e por pasta', 'Aprovar ou devolver com o motivo', 'Arquivar na base de conhecimento'],
        ],
        [
            'registro-reunioes', 'Registro de reuniões',
            'Como registrar decisões, tipo de reunião e próximos passos para a memória não se perder.',
            'Gestão', 'Beatriz', 'A cada reunião', '08/09/2026',
            ['Escolher o tipo da reunião', 'Vincular a empresa e o sócio responsável', 'Escrever o resumo em até cinco linhas', 'Listar as decisões tomadas', 'Definir os próximos passos com responsável'],
        ],
        [
            'fechamento-mensal', 'Fechamento mensal',
            'Rotina contábil de fechamento: conferência de lançamentos, conciliação e envio do relatório.',
            'Financeiro', 'Rafael Nogueira', 'Mensal', '02/09/2026',
            ['Conferir os lançamentos do mês', 'Conciliar entradas e saídas', 'Apurar o resultado por empresa', 'Emitir o relatório mensal', 'Enviar ao cliente e arquivar'],
        ],
        [
            'proposta-comercial', 'Proposta comercial',
            'Da qualificação do lead até o envio da proposta e o registro do resultado no painel comercial.',
            'Comercial', 'Matheus', 'A cada lead qualificado', '06/09/2026',
            ['Qualificar o lead e registrar a origem', 'Levantar o escopo com o cliente', 'Montar a proposta a partir do modelo', 'Enviar e registrar a data', 'Marcar o resultado: fechado ou motivo da perda'],
        ],
        [
            'transferencia-contabil', 'Transferência de contabilidade',
            'Passos para receber uma empresa que vem de outro escritório sem perder histórico.',
            'Legalização', 'Luciana Almeida', 'A cada transferência', '29/08/2026',
            ['Solicitar a documentação ao escritório anterior', 'Conferir pendências fiscais e trabalhistas', 'Atualizar procurações e certificados', 'Migrar o histórico para a base da HC', 'Agendar a reunião de transferência'],
        ],
    ];

    public function run(): void
    {
        foreach (self::PROJETOS as $ordem => $projeto) {
            [$id, $nome, $descricao, $status, $prioridade, $responsavel, $area, $progresso, $inicio, $prazo, $empresaId] = $projeto;

            Projeto::updateOrCreate(['id' => $id], [
                'nome' => $nome,
                'descricao' => $descricao,
                'status' => $status,
                'prioridade' => $prioridade,
                'responsavel' => $responsavel,
                'area' => $area,
                'progresso' => $progresso,
                'inicio' => $inicio,
                'prazo' => $prazo,
                'empresa_id' => $empresaId,
                'ordem' => $ordem,
            ]);
        }

        foreach (self::PROCESSOS as $ordem => $processo) {
            [$id, $nome, $descricao, $area, $responsavel, $frequencia, $atualizadoEm, $etapas] = $processo;

            Processo::updateOrCreate(['id' => $id], [
                'nome' => $nome,
                'descricao' => $descricao,
                'area' => $area,
                'responsavel' => $responsavel,
                'frequencia' => $frequencia,
                'atualizado_em' => $atualizadoEm,
                'etapas' => $etapas,
                'ordem' => $ordem,
            ]);
        }
    }
}
