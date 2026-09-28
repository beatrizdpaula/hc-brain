<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\Contadores;
use Illuminate\Http\JsonResponse;

class ContadorController extends Controller
{
    /** Números do menu lateral e do Início, relidos depois de cada cadastro. */
    public function index(): JsonResponse
    {
        return response()->json(Contadores::todos());
    }
}
