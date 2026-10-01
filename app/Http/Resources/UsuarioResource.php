<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

/** @mixin User */
class UsuarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->name,
            'email' => $this->email,
            'perfil' => $this->perfil,
            'area' => $this->area,
            'status' => $this->status,
            'ultimoAcesso' => self::quando($this->ultimo_acesso),
            'iniciais' => $this->iniciais,
        ];
    }

    /**
     * "Hoje, 10:42" em vez de uma data crua: é assim que se lê um último
     * acesso. O banco guarda o instante; o texto é montado aqui.
     */
    private static function quando(?Carbon $momento): string
    {
        if ($momento === null) {
            return 'Nunca acessou';
        }

        $hora = $momento->format('H:i');

        return match ((int) now()->startOfDay()->diffInDays($momento->copy()->startOfDay(), false)) {
            0 => "Hoje, {$hora}",
            -1 => "Ontem, {$hora}",
            default => $momento->format('d/m/Y').", {$hora}",
        };
    }
}
