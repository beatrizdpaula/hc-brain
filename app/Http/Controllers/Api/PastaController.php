<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SalvarPastaRequest;
use App\Models\Pasta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class PastaController extends Controller
{
    public function store(SalvarPastaRequest $request): JsonResponse
    {
        $pasta = Pasta::create([
            'nome' => $request->string('nome')->toString(),
            'ordem' => (int) Pasta::max('ordem') + 1,
        ]);

        return response()->json([
            'id' => $pasta->id,
            'nome' => $pasta->nome,
            'total' => 0,
        ], 201);
    }

    public function update(SalvarPastaRequest $request, Pasta $pasta): JsonResponse
    {
        $pasta->update(['nome' => $request->string('nome')->toString()]);

        return response()->json([
            'id' => $pasta->id,
            'nome' => $pasta->nome,
            'total' => $pasta->documentos()->count(),
        ]);
    }

    /**
     * Excluir a pasta leva os arquivos dela junto. O banco apaga as linhas em
     * cascata, mas os arquivos no disco só somem se alguém os apagar — então
     * é aqui, antes do delete, que isso acontece.
     */
    public function destroy(Pasta $pasta): Response
    {
        $pasta->documentos->each->apagarArquivo();
        $pasta->delete();

        return response()->noContent();
    }
}
