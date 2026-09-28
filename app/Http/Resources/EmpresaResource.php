<?php

namespace App\Http\Resources;

use App\Models\Empresa;
use App\Models\Fonte;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A empresa como a lista de clientes precisa dela: cadastro, sócio, fontes e
 * o total de reuniões, que aparece no cartão sem exigir uma segunda chamada.
 *
 * @mixin Empresa
 */
class EmpresaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'setor' => $this->setor,
            'status' => $this->status,
            'statusTag' => $this->status_tag,
            'socio' => [
                'nome' => $this->socio->nome,
                'cargo' => $this->socio->cargo,
                'email' => $this->socio->email,
                'telefone' => $this->socio->telefone,
                'participacao' => $this->socio->participacao,
                'desde' => $this->socio->desde,
            ],
            'fontes' => $this->fontes->map(fn (Fonte $fonte) => [
                'tipo' => $fonte->tipo,
                'nome' => $fonte->nome,
                'info' => $fonte->info,
            ])->all(),
            'totalReunioes' => $this->reunioes_count ?? $this->reunioes()->count(),
            'ultimaReuniao' => $this->whenLoaded('reunioes', function () {
                $ultima = $this->reunioes->first();

                return $ultima === null ? null : [
                    'tipo' => $ultima->tipo,
                    'data' => $ultima->data->format('d/m/Y'),
                ];
            }),
        ];
    }
}
