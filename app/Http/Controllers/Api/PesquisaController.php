<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResultadoPesquisa;
use Illuminate\Http\JsonResponse;

class PesquisaController extends Controller
{
    /**
     * O índice inteiro vai de uma vez: os filtros da tela são instantâneos e
     * ficam no estado compartilhado, sem uma ida ao servidor por tecla.
     */
    public function index(): JsonResponse
    {
        $resultados = ResultadoPesquisa::orderBy('ordem')->get()
            ->map(fn (ResultadoPesquisa $item) => [
                'type' => $item->tipo,
                'area' => $item->area,
                'title' => $item->titulo,
                'text' => $item->texto,
                'meta' => $item->meta,
            ]);

        return response()->json($resultados);
    }
}
