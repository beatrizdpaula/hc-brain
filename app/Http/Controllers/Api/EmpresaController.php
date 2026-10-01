<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SalvarEmpresaRequest;
use App\Http\Resources\EmpresaResource;
use App\Http\Resources\ReuniaoResource;
use App\Http\Resources\TreinamentoResource;
use App\Models\Empresa;
use App\Models\ReceitaMensal;
use App\Models\Transacao;
use App\Support\Chave;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

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
                'meses' => $financeiro->mesesDeVida(),
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

    /**
     * A empresa e o sócio nascem juntos, dentro da mesma transação: uma
     * empresa gravada sem o sócio quebraria toda tela que lê `socio->nome`.
     */
    public function store(SalvarEmpresaRequest $request): JsonResponse
    {
        $empresa = DB::transaction(function () use ($request) {
            $empresa = Empresa::create([
                'id' => Chave::apartirDe($request->string('nome')->toString(), 'empresas'),
                'nome' => $request->string('nome')->toString(),
                'setor' => $request->string('setor')->toString(),
                'status' => $request->string('status')->toString(),
                'status_tag' => $request->string('statusTag')->toString(),
            ]);

            $empresa->socio()->create($request->dadosDoSocio());

            return $empresa;
        });

        return (new EmpresaResource($empresa->load(['socio', 'fontes', 'reunioes'])))
            ->response()
            ->setStatusCode(201);
    }

    public function update(SalvarEmpresaRequest $request, Empresa $empresa): EmpresaResource
    {
        DB::transaction(function () use ($request, $empresa) {
            $empresa->update([
                'nome' => $request->string('nome')->toString(),
                'setor' => $request->string('setor')->toString(),
                'status' => $request->string('status')->toString(),
                'status_tag' => $request->string('statusTag')->toString(),
            ]);

            $empresa->socio()->updateOrCreate([], $request->dadosDoSocio());
        });

        return new EmpresaResource($empresa->load(['socio', 'fontes', 'reunioes']));
    }

    /**
     * Excluir a empresa leva junto sócio, fontes, financeiro e reuniões — é o
     * que as chaves estrangeiras em cascata fazem. Projetos ficam, só perdem
     * o vínculo, porque o trabalho existiu independente do cliente.
     */
    public function destroy(Empresa $empresa): Response
    {
        $empresa->delete();

        return response()->noContent();
    }
}
