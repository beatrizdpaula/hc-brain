<?php

namespace App\Http\Resources;

use App\Models\Projeto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Projeto */
class ProjetoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $hoje = today();

        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'descricao' => $this->descricao,
            'status' => $this->status,
            'prioridade' => $this->prioridade,
            'responsavel' => $this->responsavel,
            'area' => $this->area,
            'progresso' => $this->progresso,
            // Datas saem em ISO porque a tela também as edita: um
            // `<input type="date">` só entende este formato.
            'inicio' => $this->inicio->toDateString(),
            'prazo' => $this->prazo->toDateString(),
            // Quem decide se um projeto está atrasado é o servidor: o relógio
            // do navegador de quem abre a tela não é fonte confiável de data.
            'diasRestantes' => (int) $hoje->diffInDays($this->prazo, false),
            'empresaId' => $this->empresa_id,
            'empresa' => $this->whenLoaded(
                'empresa',
                fn () => $this->empresa?->nome,
                null,
            ),
        ];
    }
}
