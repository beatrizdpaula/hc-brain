<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable([
    'id', 'tipo', 'titulo', 'categoria', 'nivel', 'descricao',
    'trilha', 'cursos', 'processo', 'ordem',
])]
class Treinamento extends Model
{
    protected $table = 'treinamentos';

    public const TIPOS = ['Curso', 'Trilha', 'Manual', 'Fluxograma'];

    public const NIVEIS = ['Iniciante', 'Intermediário', 'Avançado', 'Todos'];

    public $incrementing = false;

    protected $keyType = 'string';

    public function empresas(): BelongsToMany
    {
        return $this->belongsToMany(Empresa::class, 'empresa_treinamento');
    }
}
