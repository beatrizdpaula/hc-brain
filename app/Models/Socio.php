<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['empresa_id', 'nome', 'cargo', 'email', 'telefone', 'participacao', 'desde'])]
class Socio extends Model
{
    protected $table = 'socios';

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }
}
