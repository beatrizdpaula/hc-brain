<?php

namespace App\Http\Resources;

use App\Models\Processo;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Processo */
class ProcessoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'descricao' => $this->descricao,
            'area' => $this->area,
            'responsavel' => $this->responsavel,
            'frequencia' => $this->frequencia,
            'atualizadoEm' => $this->atualizado_em,
            'etapas' => $this->etapas,
        ];
    }
}
