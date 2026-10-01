<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Empresa, projeto, processo e treinamento têm id textual porque ele aparece
 * na URL e nos links entre telas. Quando o registro nasce pela interface esse
 * id vem do nome, e não de um número: `/clientes/clinica-vida` diz o que é.
 */
final class Chave
{
    public static function apartirDe(string $texto, string $tabela): string
    {
        $base = Str::slug($texto) ?: 'registro';
        $chave = $base;
        $sufixo = 2;

        // Duas empresas podem se chamar parecido o bastante para gerar o mesmo
        // slug; o sufixo mantém o id único sem recusar o cadastro.
        while (DB::table($tabela)->where('id', $chave)->exists()) {
            $chave = "{$base}-{$sufixo}";
            $sufixo++;
        }

        return $chave;
    }
}
