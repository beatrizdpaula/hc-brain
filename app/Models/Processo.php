<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'id', 'nome', 'descricao', 'area', 'responsavel',
    'frequencia', 'atualizado_em', 'etapas', 'ordem',
])]
class Processo extends Model
{
    protected $table = 'processos';

    public $incrementing = false;

    protected $keyType = 'string';

    protected function casts(): array
    {
        return ['etapas' => 'array'];
    }
}
