<?php

namespace App\Http\Resources;

use App\Models\Treinamento;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Treinamento */
class TreinamentoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tipo' => $this->tipo,
            'titulo' => $this->titulo,
            'categoria' => $this->categoria,
            'nivel' => $this->nivel,
            'descricao' => $this->descricao,
            'trilha' => $this->trilha,
            'cursos' => $this->cursos,
            'processo' => $this->processo,
        ];
    }
}
