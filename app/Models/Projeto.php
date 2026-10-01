<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'id', 'nome', 'descricao', 'status', 'prioridade', 'responsavel',
    'area', 'progresso', 'inicio', 'prazo', 'empresa_id', 'ordem',
])]
class Projeto extends Model
{
    protected $table = 'projetos';

    public const STATUS = ['Em andamento', 'Em revisão', 'Planejado', 'Concluído'];

    public const PRIORIDADES = ['Alta', 'Média', 'Baixa'];

    public $incrementing = false;

    protected $keyType = 'string';

    protected function casts(): array
    {
        return [
            'inicio' => 'date',
            'prazo' => 'date',
            'progresso' => 'integer',
        ];
    }

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }
}
