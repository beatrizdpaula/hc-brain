<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SugestaoSofia;
use App\Support\Sofia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
}
