<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['pessoa', 'empresa', 'conteudo', 'status', 'progresso', 'data', 'ordem'])]
class TreinamentoHistorico extends Model
{
    protected $table = 'treinamento_historicos';
}
