<?php

namespace Database\Seeders;

use App\Models\Empresa;
use App\Models\Reuniao;
use Illuminate\Database\Seeder;

/** Histórico central de reuniões, vinculado à empresa e ao sócio responsável. */
class ReuniaoSeeder extends Seeder
{
    public function run(): void
    {
        Reuniao::query()->delete();

        $idPorNome = Empresa::pluck('id', 'nome');

        foreach ($this->reunioes() as $reuniao) {
            $nome = $reuniao['empresa'];
            unset($reuniao['empresa']);

            Reuniao::create([...$reuniao, 'empresa_id' => $idPorNome[$nome]]);
        }
    }

    /** @return array<int, array<string, mixed>> */
    private function reunioes(): array
    {
        return [
            [
                'empresa' => 'Empresa X',
                'tipo' => 'Abertura',
                'data' => '2026-07-10',
                'responsavel' => 'Beatriz Andrade',
                'participantes' => ['Beatriz Andrade', 'Flávia Silva'],
                'resumo' => 'Reunião inicial de boas-vindas, apresentação da equipe HC e alinhamento das expectativas do contrato.',
                'decisoes' => [
                    'Definido cronograma de implantação em 3 fases',
                    'Flávia Silva indicada como ponto focal da Empresa X',
                ],
                'proximos_passos' => [
                    'Enviar cronograma detalhado até 15/07',
                    'Agendar reunião de dúvidas em até 30 dias',
                ],
                'status' => 'Concluída',
            ],
            [
                'empresa' => 'Empresa X',
                'tipo' => 'Dúvidas',
                'data' => '2026-08-05',
                'responsavel' => 'Carlos Mendes',
                'participantes' => ['Carlos Mendes', 'Flávia Silva'],
                'resumo' => 'Esclarecimentos sobre o funcionamento da automação comercial e prazos de entrega.',
                'decisoes' => ['Confirmado prazo de entrega da primeira etapa para 30/08'],
                'proximos_passos' => ['Equipe técnica revisar integrações pendentes'],
                'status' => 'Concluída',
            ],
            [
                'empresa' => 'Empresa X',
                'tipo' => 'Comercial',
                'data' => '2026-08-28',
                'responsavel' => 'Beatriz Andrade',
                'participantes' => ['Beatriz Andrade', 'Flávia Silva', 'Carlos Mendes'],
                'resumo' => 'Revisão de demandas do projeto de automação, decisões comerciais e próximos passos.',
                'decisoes' => [
                    'Aprovado escopo adicional de relatórios automáticos',
                    'Reajuste de valor aceito para o próximo ciclo',
                ],
                'proximos_passos' => [
                    'Enviar aditivo contratual até 05/09',
                    'Agendar reunião de alinhamento em setembro',
                ],
                'status' => 'Concluída',
            ],
            [
                'empresa' => 'Empresa Y',
                'tipo' => 'Abertura',
                'data' => '2026-06-15',
                'responsavel' => 'Carlos Mendes',
                'participantes' => ['Carlos Mendes', 'João Pereira'],
                'resumo' => 'Apresentação institucional e definição do time responsável pela conta.',
                'decisoes' => ['João Pereira definido como sócio responsável pela conta'],
                'proximos_passos' => ['Enviar checklist de onboarding'],
                'status' => 'Concluída',
            ],
            [
                'empresa' => 'Empresa Y',
                'tipo' => 'Transferência',
                'data' => '2026-08-20',
                'responsavel' => 'Beatriz Andrade',
                'participantes' => ['Beatriz Andrade', 'João Pereira', 'Equipe de Operações'],
                'resumo' => 'Transferência da conta da equipe comercial para a equipe de operações, com repasse de histórico.',
                'decisoes' => [
                    'Aprovada transferência de responsabilidade para a equipe de Operações',
                    'Histórico completo repassado via planilha de transferência',
                ],
                'proximos_passos' => ['Nova equipe assumir atendimento a partir de 01/09'],
                'status' => 'Concluída',
            ],
            [
                'empresa' => 'Empresa Z',
                'tipo' => 'Dúvidas',
                'data' => '2026-08-30',
                'responsavel' => 'Carlos Mendes',
                'participantes' => ['Carlos Mendes', 'Mariana Costa'],
                'resumo' => 'Esclarecimentos sobre o escopo do projeto de base de conhecimento e prazos.',
                'decisoes' => ['Escopo revisado e confirmado com a coordenadora'],
                'proximos_passos' => ['Enviar cronograma revisado até 04/09'],
                'status' => 'Concluída',
            ],
            [
                'empresa' => 'Empresa Z',
                'tipo' => 'Alinhamento',
                'data' => '2026-09-10',
                'responsavel' => 'Beatriz Andrade',
                'participantes' => ['Beatriz Andrade', 'Mariana Costa'],
                'resumo' => 'Alinhamento de prioridades para a próxima fase do projeto.',
                'decisoes' => [],
                'proximos_passos' => ['Confirmar pauta com a coordenadora de projetos'],
                'status' => 'Agendada',
            ],
            [
                'empresa' => 'Empresa W',
                'tipo' => 'Abertura',
                'data' => '2026-09-01',
                'responsavel' => 'Carlos Mendes',
                'participantes' => ['Carlos Mendes', 'Rafael Nogueira'],
                'resumo' => 'Boas-vindas à Empresa W e apresentação do time HC responsável.',
                'decisoes' => ['Definido plano de implantação inicial de 60 dias'],
                'proximos_passos' => ['Enviar contrato assinado para o setor financeiro'],
                'status' => 'Concluída',
            ],
            [
                'empresa' => 'Empresa K',
                'tipo' => 'Financeira',
                'data' => '2026-08-12',
                'responsavel' => 'Luciana Almeida',
                'participantes' => ['Luciana Almeida', 'Beatriz Andrade'],
                'resumo' => 'Revisão do fechamento financeiro do trimestre e indicadores de resultado.',
                'decisoes' => ['Aprovado plano de pagamento em 3 parcelas'],
                'proximos_passos' => ['Enviar relatório de indicadores até 20/08'],
                'status' => 'Concluída',
            ],
            [
                'empresa' => 'Empresa K',
                'tipo' => 'Alinhamento',
                'data' => '2026-09-18',
                'responsavel' => 'Carlos Mendes',
                'participantes' => ['Carlos Mendes', 'Luciana Almeida'],
                'resumo' => 'Alinhamento sobre metas do próximo semestre letivo.',
                'decisoes' => [],
                'proximos_passos' => ['Confirmar disponibilidade de agenda'],
                'status' => 'Agendada',
            ],
        ];
    }
}
