<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AtualizarDocumentoRequest;
use App\Http\Requests\EnviarDocumentoRequest;
use App\Http\Resources\DocumentoResource;
use App\Models\Documento;
use App\Models\Pasta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentoController extends Controller
{
    public function index(): JsonResponse
    {
        $documentos = Documento::with('pasta')->orderByDesc('updated_at')->get();

        return response()->json([
            // A contagem de cada pasta é contada de verdade, então enviar ou
            // excluir um arquivo muda o número no menu na mesma hora.
            'pastas' => Pasta::withCount('documentos')
                ->orderBy('ordem')
                ->orderBy('nome')
                ->get()
                ->map(fn (Pasta $pasta) => [
                    'id' => $pasta->id,
                    'nome' => $pasta->nome,
                    'total' => $pasta->documentos_count,
                ]),
            'documentos' => DocumentoResource::collection($documentos),
        ]);
    }

    public function store(EnviarDocumentoRequest $request): JsonResponse
    {
        $arquivo = $request->file('arquivo');
        $extensao = strtolower($arquivo->getClientOriginalExtension());

        $caminho = $arquivo->store(
            'documentos/'.$request->integer('pastaId'),
            config('hc.documentos.disco')
        );

        $documento = Documento::create([
            'pasta_id' => $request->integer('pastaId'),
            'nome' => $request->filled('nome')
                ? $request->string('nome')->toString()
                : pathinfo($arquivo->getClientOriginalName(), PATHINFO_FILENAME),
            'extensao' => $extensao,
            'arquivo' => $caminho,
            'tamanho' => $arquivo->getSize(),
            'mime' => $arquivo->getClientMimeType(),
            'enviado_por' => $request->user()->id,
        ]);

        return (new DocumentoResource($documento->load('pasta')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(AtualizarDocumentoRequest $request, Documento $documento): DocumentoResource
    {
        $documento->update([
            'nome' => $request->string('nome')->toString(),
            'pasta_id' => $request->integer('pastaId'),
        ]);

        return new DocumentoResource($documento->load('pasta'));
    }

    public function destroy(Documento $documento): Response
    {
        $documento->apagarArquivo();
        $documento->delete();

        return response()->noContent();
    }

    /**
     * O arquivo sai pelo Laravel, e não por uma URL pública do disco, porque
     * documento da HC não deve ser acessível a quem não está na sessão.
     */
    public function download(Documento $documento): StreamedResponse
    {
        abort_if($documento->arquivo === null, 404, 'Este registro não tem arquivo anexado.');

        $disco = Storage::disk(config('hc.documentos.disco'));
        abort_unless($disco->exists($documento->arquivo), 404, 'O arquivo não está mais no armazenamento.');

        return $disco->download($documento->arquivo, $documento->nomeDoArquivo());
    }
}
