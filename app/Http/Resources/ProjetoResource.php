<?php

namespace App\Http\Resources;

use App\Models\Projeto;
use App\Support\Contadores;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

/** @mixin Projeto */
class ProjetoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $hoje = Carbon::parse(Contadores::HOJE);

        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'descricao' => $this->descricao,
            'status' => $this->status,
            'prioridade' => $this->prioridade,
            'responsavel' => $this->responsavel,
            'area' => $this->area,
            'progresso' => $this->progresso,
            'inicio' => $this->inicio->format('d/m/Y'),
            'prazo' => $this->prazo->format('d/m/Y'),
            // Quem conhece a data de referência do sistema é o servidor, então
            // é ele quem decide se um projeto está atrasado.
            'diasRestantes' => (int) $hoje->diffInDays($this->prazo, false),
            'empresa' => $this->whenLoaded(
                'empresa',
                fn () => $this->empresa?->nome,
                null,
            ),
        ];
    }
}
