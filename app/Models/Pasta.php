<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nome', 'ordem'])]
class Pasta extends Model
{
    protected $table = 'pastas';

    public function documentos(): HasMany
    {
        return $this->hasMany(Documento::class);
    }
}
