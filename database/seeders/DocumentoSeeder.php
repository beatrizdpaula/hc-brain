<?php

namespace Database\Seeders;

use App\Models\Documento;
use App\Models\Pasta;
use Illuminate\Database\Seeder;

class DocumentoSeeder extends Seeder
{
    private const PASTAS = [
        ['Todas', 'Todas as pastas', 248],
        ['Comercial', 'Comercial', 42],
        ['Projetos', 'Projetos', 31],
        ['Financeiro', 'Financeiro', 26],
        ['Operações', 'Operações', 57],
        ['Marketing', 'Marketing', 19],
    ];

    private const DOCUMENTOS = [
        ['Comercial', 'Comercial', 'folder', 'Comercial', '42 documentos'],
        ['Projetos', 'Projetos', 'folder', 'Projetos', '31 documentos'],
        ['Financeiro', 'Financeiro', 'folder', 'Financeiro', '26 documentos'],
        ['Cadastro de clientes', 'Cadastro de clientes.pdf', 'pdf', 'Comercial', 'Atualizado hoje • 2,4 MB'],
        ['Proposta comercial', 'Proposta comercial.pdf', 'pdf', 'Comercial', 'Atualizado ontem • 1,8 MB'],
        ['Relatório mensal', 'Relatório mensal.xlsx', 'sheet', 'Financeiro', 'Atualizado em 02/09/2026 • 856 KB'],
        ['Fluxos e procedimentos', 'Fluxos e procedimentos.docx', 'doc', 'Operações', 'Atualizado em 01/09/2026 • 640 KB'],
        ['Ata reunião Empresa X', 'Ata reunião Empresa X.pdf', 'pdf', 'Comercial', 'Atualizado em 28/08/2026 • 990 KB'],
    ];

    public function run(): void
    {
        foreach (self::PASTAS as $ordem => [$nome, $rotulo, $total]) {
            Pasta::updateOrCreate(['nome' => $nome], compact('rotulo', 'total', 'ordem'));
        }

        Documento::query()->delete();
        foreach (self::DOCUMENTOS as $ordem => [$nome, $exibicao, $tipo, $pasta, $detalhe]) {
            Documento::create(compact('nome', 'exibicao', 'tipo', 'pasta', 'detalhe', 'ordem'));
        }
    }
}
