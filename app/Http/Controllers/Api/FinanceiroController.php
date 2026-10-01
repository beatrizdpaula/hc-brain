<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use Illuminate\Http\JsonResponse;

class FinanceiroController extends Controller
{
    /** A carteira consolidada: uma linha por empresa com relacionamento financeiro. */
    public function index(): JsonResponse
    {
        $carteira = Empresa::with(['socio', 'financeiro'])
            ->whereHas('financeiro')
            ->orderBy('created_at')
            ->get()
            ->map(fn (Empresa $empresa) => [
                'id' => $empresa->id,
                'nome' => $empresa->nome,
                'setor' => $empresa->setor,
                'socio' => $empresa->socio->nome,
                'regime' => $empresa->financeiro->regime,
                'desde' => $empresa->financeiro->desde->format('Y-m-d'),
                'meses' => $empresa->financeiro->mesesDeVida(),
                'primeiro' => $empresa->financeiro->primeiro,
                'atual' => $empresa->financeiro->atual,
                'total' => $empresa->financeiro->total,
            ]);

        return response()->json($carteira);
    }
}
