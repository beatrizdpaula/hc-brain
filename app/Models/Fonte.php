<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['empresa_id', 'tipo', 'nome', 'info', 'ordem'])]
class Fonte extends Model
{
    protected $table = 'fontes';

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }
}
