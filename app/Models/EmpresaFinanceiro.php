<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'empresa_id', 'regime', 'desde', 'primeiro', 'atual', 'total',
    'saldo', 'receber', 'despesas', 'margem',
])]
class EmpresaFinanceiro extends Model
{
    protected $table = 'empresa_financeiros';

    protected function casts(): array
    {
        return ['desde' => 'date'];
    }

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }

    /** Meses completos de relacionamento até hoje. */
    public function mesesDeVida(): int
    {
        $inicio = $this->desde;
        $agora = today();

        $meses = ($agora->year - $inicio->year) * 12 + ($agora->month - $inicio->month);
        if ($agora->day < $inicio->day) {
            $meses--;
        }

        return max(0, $meses);
    }
}
