<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Documento;
use App\Models\Projeto;
use App\Models\Reuniao;
use App\Support\Contadores;
use Illuminate\Http\JsonResponse;

/**
 * O painel do Início. Os números e a atividade recente eram texto escrito na
 * view; agora saem das mesmas tabelas que as outras telas, então a primeira
 * tela conta a situação real da base.
 */
class InicioController extends Controller
{
    /** Quantos itens a lista de atividade recente mostra. */
    private const LIMITE_ATIVIDADE = 5;

    public function index(): JsonResponse
    {
        return response()->json([
            'contadores' => Contadores::doInicio(),
            'atividade' => $this->atividadeRecente(),
        ]);
    }

    /**
     * As últimas reuniões e os últimos projetos atualizados, misturados em uma
     * linha do tempo só — é o que alguém quer ver ao abrir o sistema.
     *
     * @return array<int, array<string, string>>
     */
    private function atividadeRecente(): array
    {
        $reunioes = Reuniao::with('empresa')
            ->orderByDesc('data')
            ->limit(self::LIMITE_ATIVIDADE)
            ->get()
            ->map(fn (Reuniao $reuniao) => [
                'titulo' => "Reunião de {$reuniao->tipo} — {$reuniao->empresa?->nome}",
                'detalhe' => $reuniao->resumo,
                'etiqueta' => $reuniao->tipo,
                'quando' => $reuniao->data->format('d/m/Y'),
                'ordem' => $reuniao->data->format('Y-m-d'),
                'destino' => 'reunioes',
            ]);

        $projetos = Projeto::orderByDesc('updated_at')
            ->limit(self::LIMITE_ATIVIDADE)
            ->get()
            ->map(fn (Projeto $projeto) => [
                'titulo' => $projeto->nome,
                'detalhe' => "{$projeto->progresso}% concluído · responsável: {$projeto->responsavel}",
                'etiqueta' => $projeto->status,
                'quando' => $projeto->prazo->format('d/m/Y'),
                'ordem' => $projeto->prazo->format('Y-m-d'),
                'destino' => 'projetos',
            ]);

        $documentos = Documento::where('tipo', '!=', 'folder')
            ->orderBy('ordem')
            ->limit(self::LIMITE_ATIVIDADE)
            ->get()
            ->map(fn (Documento $documento) => [
                'titulo' => $documento->exibicao,
                'detalhe' => $documento->detalhe,
                'etiqueta' => 'Documento',
                'quando' => $documento->pasta,
                'ordem' => Contadores::HOJE,
                'destino' => 'documentos',
            ]);

        return $reunioes
            ->concat($projetos)
            ->concat($documentos)
            ->sortByDesc('ordem')
            ->take(self::LIMITE_ATIVIDADE * 2)
            ->values()
            ->all();
    }
}
