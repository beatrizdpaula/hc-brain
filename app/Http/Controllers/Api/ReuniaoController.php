<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReuniaoResource;
use App\Models\Empresa;
use App\Models\Reuniao;
use Illuminate\Http\JsonResponse;

class ReuniaoController extends Controller
{
    /** Histórico completo, já ordenado como a linha do tempo mostra. */
    public function index(): JsonResponse
    {
        $reunioes = Reuniao::with('empresa.socio')->orderByDesc('data')->orderByDesc('id')->get();

        return response()->json([
            'reunioes' => ReuniaoResource::collection($reunioes),
            'empresas' => Empresa::orderBy('created_at')->pluck('nome'),
        ]);
    }
}
