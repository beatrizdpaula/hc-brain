<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['empresa_id', 'mes', 'valor', 'ordem'])]
class ReceitaMensal extends Model
{
    protected $table = 'receitas_mensais';

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }
}
