<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IndicadorComercial;
use Illuminate\Http\JsonResponse;

class ComercialController extends Controller
{
    /**
     * O período vem de um `<select>`, então um valor desconhecido cai no mais
     * recente em vez de derrubar a tela.
     */
    public function show(string $periodo): JsonResponse
    {
        $indicadores = IndicadorComercial::find($periodo)
            ?? IndicadorComercial::orderByDesc('periodo')->firstOrFail();

        return response()->json([
            'periodo' => $indicadores->periodo,
            'leads' => $indicadores->leads,
            'qualified' => $indicadores->qualified,
            'meetings' => $indicadores->meetings,
            'proposals' => $indicadores->proposals,
            'closed' => $indicadores->closed,
            'revenue' => $indicadores->revenue,
            'averageTicket' => $indicadores->average_ticket,
            'inProcess' => $indicadores->in_process,
            'monthly' => $indicadores->monthly,
            'origins' => $indicadores->origins,
            'losses' => $indicadores->losses,
            'sales' => $indicadores->sales,
            'team' => $indicadores->team,
        ]);
    }
}
