<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['icone', 'texto', 'ordem'])]
class SugestaoSofia extends Model
{
    protected $table = 'sugestoes_sofia';
}
