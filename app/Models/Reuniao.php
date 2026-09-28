<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'empresa_id', 'tipo', 'data', 'horario', 'responsavel',
    'participantes', 'resumo', 'decisoes', 'proximos_passos', 'status',
])]
class Reuniao extends Model
{
    protected $table = 'reunioes';

    public const TIPOS = ['Abertura', 'Transferência', 'Dúvidas', 'Comercial', 'Alinhamento', 'Financeira'];

    public const STATUS = ['Concluída', 'Agendada', 'Cancelada'];

    protected function casts(): array
    {
        return [
            'data' => 'date',
            'participantes' => 'array',
            'decisoes' => 'array',
            'proximos_passos' => 'array',
        ];
    }

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }
}
