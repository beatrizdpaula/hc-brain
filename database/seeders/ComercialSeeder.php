<?php

namespace Database\Seeders;

use App\Models\IndicadorComercial;
use Illuminate\Database\Seeder;

/** Indicadores gerenciais do comercial, um registro por período (AAAA-MM). */
class ComercialSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->periodos() as $periodo => $dados) {
            IndicadorComercial::updateOrCreate(['periodo' => $periodo], $dados);
        }
    }

    /** @return array<string, array<string, mixed>> */
    private function periodos(): array
    {
        return [
            '2026-09' => [
                'leads' => 488, 'qualified' => 335, 'meetings' => 24, 'proposals' => 85,
                'closed' => 24, 'revenue' => 202800, 'average_ticket' => 8450, 'in_process' => 150,
                'monthly' => [['Abr', 214], ['Mai', 271], ['Jun', 298], ['Jul', 352], ['Ago', 421], ['Set', 488]],
                'origins' => [
                    ['Orgânico', 190, '#6178ef'], ['Indicação', 130, '#4e92dc'], ['WhatsApp', 64, '#38aa86'],
                    ['Instagram', 38, '#9b82dc'], ['Site', 28, '#d2a34f'], ['Evento', 22, '#d05e75'],
                    ['Prospecção', 16, '#6f8199'],
                ],
                'losses' => [
                    ['Preço', 69], ['Sem interesse', 57], ['Momento / timing', 44], ['Prazo', 31],
                    ['Concorrente', 28], ['Sem retorno', 19], ['Orçamento', 17], ['Outros', 15],
                ],
                'sales' => [
                    ['Empresa X', 'Beatriz Andrade', 'R$ 9.800,00'],
                    ['Empresa K', 'Luciana Almeida', 'R$ 12.600,00'],
                    ['Empresa Y', 'Carlos Mendes', 'R$ 8.900,00'],
                    ['Empresa Z', 'Mariana Costa', 'R$ 7.400,00'],
                ],
                'team' => [
                    ['Beatriz Andrade', 122, 9, 7.4, 74100],
                    ['Carlos Mendes', 105, 7, 6.7, 59100],
                    ['Mariana Costa', 96, 5, 5.2, 42200],
                    ['Rafael Nogueira', 81, 3, 3.7, 27400],
                    ['Ana Souza', 84, 0, 0, 0],
                ],
            ],
            '2026-08' => [
                'leads' => 421, 'qualified' => 281, 'meetings' => 29, 'proposals' => 79,
                'closed' => 21, 'revenue' => 176400, 'average_ticket' => 8400, 'in_process' => 139,
                'monthly' => [['Mar', 186], ['Abr', 214], ['Mai', 271], ['Jun', 298], ['Jul', 352], ['Ago', 421]],
                'origins' => [
                    ['Orgânico', 164, '#6178ef'], ['Indicação', 119, '#4e92dc'], ['WhatsApp', 56, '#38aa86'],
                    ['Instagram', 33, '#9b82dc'], ['Site', 23, '#d2a34f'], ['Evento', 15, '#d05e75'],
                    ['Prospecção', 11, '#6f8199'],
                ],
                'losses' => [
                    ['Preço', 61], ['Sem interesse', 49], ['Momento / timing', 39], ['Prazo', 29],
                    ['Concorrente', 24], ['Sem retorno', 17], ['Orçamento', 14], ['Outros', 11],
                ],
                'sales' => [
                    ['Empresa K', 'Luciana Almeida', 'R$ 11.900,00'],
                    ['Empresa X', 'Beatriz Andrade', 'R$ 9.400,00'],
                    ['Empresa W', 'Rafael Nogueira', 'R$ 6.700,00'],
                ],
                'team' => [
                    ['Beatriz Andrade', 110, 8, 7.3, 65800],
                    ['Carlos Mendes', 98, 6, 6.1, 51400],
                    ['Mariana Costa', 82, 4, 4.9, 33200],
                    ['Rafael Nogueira', 73, 3, 4.1, 26000],
                ],
            ],
            '2026-07' => [
                'leads' => 352, 'qualified' => 226, 'meetings' => 24, 'proposals' => 65,
                'closed' => 18, 'revenue' => 151200, 'average_ticket' => 8400, 'in_process' => 126,
                'monthly' => [['Fev', 157], ['Mar', 186], ['Abr', 214], ['Mai', 271], ['Jun', 298], ['Jul', 352]],
                'origins' => [
                    ['Orgânico', 135, '#6178ef'], ['Indicação', 102, '#4e92dc'], ['WhatsApp', 44, '#38aa86'],
                    ['Instagram', 28, '#9b82dc'], ['Site', 19, '#d2a34f'], ['Evento', 13, '#d05e75'],
                    ['Prospecção', 11, '#6f8199'],
                ],
                'losses' => [
                    ['Preço', 52], ['Sem interesse', 43], ['Momento / timing', 31], ['Prazo', 25],
                    ['Concorrente', 21], ['Sem retorno', 15], ['Orçamento', 10], ['Outros', 9],
                ],
                'sales' => [
                    ['Empresa Y', 'Carlos Mendes', 'R$ 8.600,00'],
                    ['Empresa Z', 'Mariana Costa', 'R$ 7.200,00'],
                    ['Empresa K', 'Luciana Almeida', 'R$ 10.300,00'],
                ],
                'team' => [
                    ['Beatriz Andrade', 91, 7, 7.7, 58400],
                    ['Carlos Mendes', 85, 5, 5.9, 42200],
                    ['Mariana Costa', 73, 4, 5.5, 33300],
                    ['Rafael Nogueira', 60, 2, 3.3, 17300],
                ],
            ],
        ];
    }
}
