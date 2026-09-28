<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TreinamentoResource;
use App\Models\Treinamento;
use App\Models\TreinamentoHistorico;
use Illuminate\Http\JsonResponse;

class TreinamentoController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'conteudos' => TreinamentoResource::collection(Treinamento::orderBy('ordem')->get()),
            'historico' => TreinamentoHistorico::orderBy('ordem')
                ->get(['pessoa', 'empresa', 'conteudo', 'status', 'progresso', 'data']),
        ]);
    }
}
