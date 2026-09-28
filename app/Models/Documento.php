<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['nome', 'exibicao', 'tipo', 'pasta', 'detalhe', 'ordem'])]
class Documento extends Model
{
    protected $table = 'documentos';
}
