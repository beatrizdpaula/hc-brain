<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SalvarProjetoRequest;
use App\Http\Resources\ProjetoResource;
use App\Models\Projeto;
use App\Support\Chave;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProjetoController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $projetos = Projeto::with('empresa')->orderBy('ordem')->get();

        return ProjetoResource::collection($projetos);
    }

    public function store(SalvarProjetoRequest $request): JsonResponse
    {
        $projeto = Projeto::create([
            ...$request->paraOBanco(),
            'id' => Chave::apartirDe($request->string('nome')->toString(), 'projetos'),
            'ordem' => (int) Projeto::max('ordem') + 1,
        ]);

        return (new ProjetoResource($projeto->load('empresa')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(SalvarProjetoRequest $request, Projeto $projeto): ProjetoResource
    {
        $projeto->update($request->paraOBanco());

        return new ProjetoResource($projeto->load('empresa'));
    }

    public function destroy(Projeto $projeto): Response
    {
        $projeto->delete();

        return response()->noContent();
    }
}
