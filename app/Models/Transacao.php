<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['empresa_id', 'data', 'descricao', 'categoria', 'tipo', 'valor', 'status', 'ordem'])]
class Transacao extends Model
{
    protected $table = 'transacoes';

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }
}
