<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['tipo', 'area', 'titulo', 'texto', 'meta', 'ordem'])]
class ResultadoPesquisa extends Model
{
    protected $table = 'resultados_pesquisa';
}
