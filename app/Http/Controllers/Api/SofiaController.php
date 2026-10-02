<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EnviarAudioSofiaRequest;
use App\Models\SugestaoSofia;
use App\Support\Sofia;
use App\Support\Transcricao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Throwable;

class SofiaController extends Controller
{
    public function sugestoes(): JsonResponse
    {
        $sugestoes = SugestaoSofia::orderBy('ordem')->get()
            ->map(fn (SugestaoSofia $item) => ['icon' => $item->icone, 'text' => $item->texto]);

        return response()->json($sugestoes);
    }

    public function perguntar(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'pergunta' => ['required', 'string', 'max:1000'],
        ]);

        return response()->json(['resposta' => Sofia::responder($dados['pergunta'])]);
    }

    public function audio(EnviarAudioSofiaRequest $request): JsonResponse
    {
        if (! Transcricao::configurada()) {
            return response()->json([
                'message' => 'A transcrição de arquivos de áudio não está configurada. Defina OPENAI_API_KEY no ambiente para enviar áudios gravados ou anexados.',
            ], 503);
        }

        $arquivo = $request->file('audio');

        if (! $arquivo instanceof UploadedFile) {
            return response()->json([
                'message' => 'Escolha ou grave um áudio para enviar.',
            ], 422);
        }

        try {
            $texto = Transcricao::deArquivo($arquivo);
        } catch (Throwable $excecao) {
            report($excecao);

            return response()->json([
                'message' => 'Não consegui transcrever o áudio agora. Tente novamente em instantes.',
            ], 502);
        }

        if ($texto === '') {
            return response()->json([
                'message' => 'Não consegui entender o áudio. Grave de novo ou escreva a pergunta.',
            ], 422);
        }

        return response()->json([
            'transcricao' => $texto,
            'resposta' => Sofia::responder($texto),
        ]);
    }
}
