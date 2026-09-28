<?php

namespace App\Support;

use App\Models\User;

/**
 * O pacote que o layout entrega ao navegador antes de qualquer tela rodar:
 * quem está logado, o mapa de telas e os contadores do menu. Assim o shell em
 * TypeScript monta a barra lateral sem uma ida extra ao servidor.
 */
final class Bootstrap
{
    public static function paraNavegador(User $usuario): array
    {
        return [
            'usuario' => [
                'nome' => $usuario->name,
                'email' => $usuario->email,
                'perfil' => $usuario->perfil,
                'iniciais' => $usuario->iniciais,
            ],
            'paginas' => Telas::MENU,
            'auxiliares' => Telas::AUXILIARES,
            'contadores' => Contadores::todos(),
        ];
    }
}
