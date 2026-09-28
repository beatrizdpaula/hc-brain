<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Documento;
use App\Models\Pasta;
use Illuminate\Http\JsonResponse;

class DocumentoController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'pastas' => Pasta::orderBy('ordem')->get(['nome', 'rotulo', 'total']),
            'documentos' => Documento::orderBy('ordem')->get(['nome', 'exibicao', 'tipo', 'pasta', 'detalhe']),
        ]);
    }
}
