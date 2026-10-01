<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SalvarProcessoRequest;
use App\Http\Resources\ProcessoResource;
use App\Models\Processo;
use App\Support\Chave;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProcessoController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return ProcessoResource::collection(Processo::orderBy('ordem')->get());
    }

    public function store(SalvarProcessoRequest $request): JsonResponse
    {
        $processo = Processo::create([
            ...$request->paraOBanco(),
            'id' => Chave::apartirDe($request->string('nome')->toString(), 'processos'),
            'ordem' => (int) Processo::max('ordem') + 1,
        ]);

        return (new ProcessoResource($processo))->response()->setStatusCode(201);
    }

    public function update(SalvarProcessoRequest $request, Processo $processo): ProcessoResource
    {
        $processo->update($request->paraOBanco());

        return new ProcessoResource($processo);
    }

    public function destroy(Processo $processo): Response
    {
        $processo->delete();

        return response()->noContent();
    }
}
