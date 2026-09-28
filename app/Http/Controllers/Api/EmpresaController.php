<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmpresaResource;
use App\Http\Resources\ReuniaoResource;
use App\Http\Resources\TreinamentoResource;
use App\Models\Empresa;
use App\Models\ReceitaMensal;
use App\Models\Transacao;
use App\Support\Contadores;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EmpresaController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $empresas = Empresa::with(['socio', 'fontes', 'reunioes'])
            ->withCount('reunioes')
            ->orderBy('created_at')
            ->get();

        return EmpresaResource::collection($empresas);
    }

    /** Tudo o que o detalhe do cliente mostra, em uma resposta só. */
    public function show(Empresa $empresa): JsonResponse
    {
        $empresa->load([
            'socio', 'fontes', 'reunioes.empresa.socio', 'treinamentos',
            'financeiro', 'receitasMensais', 'transacoes',
        ]);

        $financeiro = $empresa->financeiro;

        return response()->json([
            'empresa' => new EmpresaResource($empresa),
            'reunioes' => ReuniaoResource::collection($empresa->reunioes),
            'treinamentos' => TreinamentoResource::collection($empresa->treinamentos),
            'financeiro' => $financeiro === null ? null : [
                'regime' => $financeiro->regime,
                'desde' => $financeiro->desde->format('Y-m-d'),
                'meses' => $financeiro->mesesDeVida(Contadores::HOJE),
                'primeiro' => $financeiro->primeiro,
                'atual' => $financeiro->atual,
                'total' => $financeiro->total,
                'saldo' => $financeiro->saldo,
                'receber' => $financeiro->receber,
                'despesas' => $financeiro->despesas,
                'margem' => $financeiro->margem,
                'receitaMensal' => $empresa->receitasMensais
                    ->map(fn (ReceitaMensal $item) => ['mes' => $item->mes, 'valor' => $item->valor])
                    ->all(),
                'transacoes' => $empresa->transacoes->map(fn (Transacao $item) => [
                    'data' => $item->data,
                    'desc' => $item->descricao,
                    'cat' => $item->categoria,
                    'tipo' => $item->tipo,
                    'valor' => $item->valor,
                    'status' => $item->status,
                ])->all(),
            ],
        ]);
    }
}
