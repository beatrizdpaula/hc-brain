<?php

namespace App\Http\Resources;

use App\Models\Documento;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Documento */
class DocumentoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'exibicao' => $this->nomeDoArquivo(),
            'tipo' => $this->tipo(),
            'extensao' => $this->extensao,
            'pastaId' => $this->pasta_id,
            'pasta' => $this->whenLoaded('pasta', fn () => $this->pasta->nome),
            'tamanho' => $this->tamanho,
            // A linha de apoio do cartão: quando mudou e o quanto pesa. É
            // texto de tela, montado aqui, não uma coluna que envelhece.
            'detalhe' => $this->detalhe(),
            'temArquivo' => $this->arquivo !== null,
            'enviadoPor' => $this->whenLoaded('enviadoPor', fn () => $this->enviadoPor?->name),
        ];
    }

    private function detalhe(): string
    {
        $quando = match ((int) now()->startOfDay()->diffInDays($this->updated_at->copy()->startOfDay(), false)) {
            0 => 'Atualizado hoje',
            -1 => 'Atualizado ontem',
            default => 'Atualizado em '.$this->updated_at->format('d/m/Y'),
        };

        return $this->tamanho > 0
            ? "{$quando} • ".self::peso($this->tamanho)
            : $quando;
    }

    /** Bytes em uma unidade legível, com a vírgula decimal do pt-BR. */
    private static function peso(int $bytes): string
    {
        if ($bytes < 1024) {
            return "{$bytes} B";
        }

        $kb = $bytes / 1024;
        if ($kb < 1024) {
            return number_format($kb, 0, ',', '.').' KB';
        }

        return number_format($kb / 1024, 1, ',', '.').' MB';
    }
}
