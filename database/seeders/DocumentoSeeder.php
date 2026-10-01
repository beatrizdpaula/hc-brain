<?php

namespace Database\Seeders;

use App\Models\Documento;
use App\Models\Pasta;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

/**
 * As pastas da HC e alguns arquivos de exemplo. O seeder grava arquivo de
 * verdade no disco configurado: assim baixar, renomear e excluir funcionam em
 * desenvolvimento do mesmo jeito que vão funcionar com um envio real.
 */
class DocumentoSeeder extends Seeder
{
    private const PASTAS = ['Comercial', 'Projetos', 'Financeiro', 'Operações', 'Marketing'];

    /** pasta, nome do documento e extensão. */
    private const DOCUMENTOS = [
        ['Comercial', 'Cadastro de clientes', 'pdf'],
        ['Comercial', 'Proposta comercial', 'pdf'],
        ['Comercial', 'Ata reunião Empresa X', 'pdf'],
        ['Financeiro', 'Relatório mensal', 'xlsx'],
        ['Operações', 'Fluxos e procedimentos', 'docx'],
    ];

    public function run(): void
    {
        $disco = Storage::disk(config('hc.documentos.disco'));

        Documento::all()->each->apagarArquivo();
        Documento::query()->delete();

        $pastas = [];
        foreach (self::PASTAS as $ordem => $nome) {
            $pastas[$nome] = Pasta::updateOrCreate(['nome' => $nome], ['ordem' => $ordem]);
        }

        foreach (self::DOCUMENTOS as [$pasta, $nome, $extensao]) {
            $pastaId = $pastas[$pasta]->id;
            $caminho = "documentos/{$pastaId}/".str()->random(40).".{$extensao}";
            $conteudo = "{$nome} — arquivo de exemplo do HC Brain.\n";

            $disco->put($caminho, $conteudo);

            Documento::create([
                'pasta_id' => $pastaId,
                'nome' => $nome,
                'extensao' => $extensao,
                'arquivo' => $caminho,
                'tamanho' => strlen($conteudo),
                'mime' => 'text/plain',
            ]);
        }
    }
}
