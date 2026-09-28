<?php

namespace Database\Seeders;

use App\Models\Empresa;
use App\Models\Treinamento;
use App\Models\TreinamentoHistorico;
use Illuminate\Database\Seeder;

/** Base do sistema de capacitação, integrada ao banco de conhecimento. */
class TreinamentoSeeder extends Seeder
{
    /** id, tipo, título, categoria, nível, descrição, trilha, cursos, processo */
    private const CONTEUDOS = [
        ['curso-abertura', 'Curso', 'Abertura, Regularização e Encerramento', 'Comercial', 'Iniciante', 'Conceitos e etapas do atendimento desde a abertura até o encerramento da empresa.', 'Atendimento', null, 'Abertura de empresa'],
        ['curso-atendimento', 'Curso', 'A Importância do Atendimento', 'Atendimento', 'Iniciante', 'Boas práticas para relacionamento, comunicação e atendimento ao cliente.', 'Atendimento', null, 'Atendimento'],
        ['curso-processos', 'Curso', 'Atendimento e Processos Internos', 'Atendimento', 'Intermediário', 'Visão dos processos internos que apoiam o atendimento e a execução das demandas.', 'Atendimento', null, 'Atendimento'],
        ['curso-registros', 'Curso', 'Consulta e Regularização de Registros Médicos e Odontológicos', 'Legalização', 'Avançado', 'Consulta e regularização de registros dentro do fluxo de atendimento especializado.', 'Legalização', null, 'Regularização'],
        ['curso-simples', 'Curso', 'Demonstrativo Simples Nacional', 'Regime tributário', 'Intermediário', 'Leitura do demonstrativo do Simples Nacional com mais de um sócio.', 'Regime tributário', null, 'Simples Nacional'],
        ['curso-contabilidade', 'Curso', 'O que é contabilidade', 'Contábil', 'Iniciante', 'Fundamentos de contabilidade para novos colaboradores.', 'Mentalidade', null, 'Rotina contábil'],
        ['curso-gessta', 'Curso', 'Procedimentos e Utilização da Ferramenta Gessta', 'Atendimento', 'Intermediário', 'Procedimentos para utilização da ferramenta no fluxo operacional.', 'Atendimento', null, 'Processo com o cliente'],
        ['trilha-mentalidade', 'Trilha', 'Trilha Mentalidade', 'Desenvolvimento', 'Iniciante', 'Trilha com 3 cursos voltados para mentalidade e desenvolvimento.', null, '3 cursos', 'Desenvolvimento interno'],
        ['trilha-regime', 'Trilha', 'Trilha Regime tributário', 'Regime tributário', 'Intermediário', 'Trilha com 6 cursos sobre regimes e rotinas tributárias.', null, '6 cursos', 'Regime tributário'],
        ['trilha-comercial', 'Trilha', 'Trilha do Comercial', 'Comercial', 'Intermediário', 'Trilha com 4 cursos para atividades comerciais e relacionamento.', null, '4 cursos', 'Comercial'],
        ['trilha-atendimento', 'Trilha', 'Trilha do Atendimento', 'Atendimento', 'Iniciante', 'Trilha com 6 cursos focados em atendimento e execução dos processos.', null, '6 cursos', 'Atendimento'],
        ['manual-processo', 'Manual', 'Processo com o Cliente', 'Integração', 'Todos', 'Documento com orientações para condução do processo junto ao cliente.', null, null, 'Processo com o cliente'],
        ['manual-drive', 'Manual', 'Organização no Drive', 'Integração', 'Todos', 'Orientações para organização de arquivos e documentos da operação.', null, null, 'Documentos'],
        ['manual-propostas', 'Manual', 'Propostas de Abertura e Transferência', 'Integração', 'Todos', 'Material de apoio para propostas ligadas à abertura e transferência.', null, null, 'Abertura de empresa'],
        ['manual-planilhas', 'Manual', 'Planilhas', 'Integração', 'Todos', 'Material de apoio para utilização das planilhas operacionais.', null, null, 'Operação'],
        ['manual-modelos', 'Manual', 'Modelo de mensagens — Etapa abertura da empresa', 'Integração', 'Todos', 'Modelos de comunicação utilizados na etapa de abertura.', null, null, 'Abertura de empresa'],
        ['fluxo-comercial', 'Fluxograma', 'teste fluxo', 'Comercial', 'Todos', 'Fluxo demonstrativo de uma rotina comercial.', null, null, 'Comercial'],
        ['fluxo-legalizacao', 'Fluxograma', 'TESTE MATHEUS', 'Legalização', 'Todos', 'Fluxo demonstrativo relacionado à legalização.', null, null, 'Regularização'],
        ['fluxo-contabil', 'Fluxograma', 'Teste 01 FLUXOGRAMA', 'Contábil', 'Todos', 'Fluxo demonstrativo de uma rotina contábil.', null, null, 'Rotina contábil'],
    ];

    private const HISTORICO = [
        ['Flávia Silva', 'Empresa X', 'Abertura, Regularização e Encerramento', 'Concluído', 100, '05/09/2026'],
        ['João Pereira', 'Empresa Y', 'Trilha do Atendimento', 'Em andamento', 65, '08/09/2026'],
        ['Mariana Costa', 'Empresa Z', 'Demonstrativo Simples Nacional', 'Concluído', 100, '02/09/2026'],
        ['Luciana Almeida', 'Empresa K', 'Trilha do Comercial', 'Em andamento', 40, '09/09/2026'],
        ['Carlos Mendes', 'Empresa W', 'O que é contabilidade', 'Concluído', 100, '01/09/2026'],
    ];

    private const POR_EMPRESA = [
        'empresaX' => ['curso-abertura', 'manual-processo', 'trilha-comercial'],
        'empresaY' => ['trilha-atendimento', 'curso-processos', 'manual-drive'],
        'empresaZ' => ['curso-simples', 'trilha-regime', 'fluxo-legalizacao'],
        'empresaW' => ['curso-atendimento', 'curso-gessta', 'trilha-atendimento'],
        'empresaK' => ['curso-contabilidade', 'trilha-comercial', 'manual-propostas'],
    ];

    public function run(): void
    {
        foreach (self::CONTEUDOS as $ordem => $conteudo) {
            [$id, $tipo, $titulo, $categoria, $nivel, $descricao, $trilha, $cursos, $processo] = $conteudo;

            Treinamento::updateOrCreate(['id' => $id], compact(
                'tipo', 'titulo', 'categoria', 'nivel', 'descricao',
                'trilha', 'cursos', 'processo', 'ordem',
            ));
        }

        TreinamentoHistorico::query()->delete();
        foreach (self::HISTORICO as $ordem => [$pessoa, $empresa, $conteudo, $status, $progresso, $data]) {
            TreinamentoHistorico::create(compact('pessoa', 'empresa', 'conteudo', 'status', 'progresso', 'data', 'ordem'));
        }

        foreach (self::POR_EMPRESA as $empresaId => $treinamentos) {
            $vinculos = [];
            foreach (array_values($treinamentos) as $ordem => $treinamentoId) {
                $vinculos[$treinamentoId] = ['ordem' => $ordem];
            }

            Empresa::findOrFail($empresaId)->treinamentos()->sync($vinculos);
        }
    }
}
