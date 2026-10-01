<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SalvarTreinamentoRequest;
use App\Http\Resources\TreinamentoResource;
use App\Models\Treinamento;
use App\Models\TreinamentoHistorico;
use App\Support\Chave;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

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

    public function store(SalvarTreinamentoRequest $request): JsonResponse
    {
        $treinamento = Treinamento::create([
            ...$request->paraOBanco(),
            'id' => Chave::apartirDe($request->string('titulo')->toString(), 'treinamentos'),
            'ordem' => (int) Treinamento::max('ordem') + 1,
        ]);

        return (new TreinamentoResource($treinamento))->response()->setStatusCode(201);
    }

    public function update(SalvarTreinamentoRequest $request, Treinamento $treinamento): TreinamentoResource
    {
        $treinamento->update($request->paraOBanco());

        return new TreinamentoResource($treinamento);
    }

    public function destroy(Treinamento $treinamento): Response
    {
        $treinamento->delete();

        return response()->noContent();
    }
}
