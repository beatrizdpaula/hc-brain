<?php

namespace App\Support;

use App\Models\Documento;
use App\Models\Empresa;
use App\Models\Fonte;
use App\Models\Processo;
use App\Models\Projeto;
use App\Models\Reuniao;
use App\Models\Treinamento;
use App\Models\User;

/**
 * Leituras compartilhadas por todas as telas: os números do menu lateral e do
 * Início vêm daqui, então empresa, reunião e usuário significam a mesma coisa
 * em qualquer lugar do app.
 */
final class Contadores
{
    /** Data de referência do protótipo, usada nos cálculos financeiros. */
    public const HOJE = '2026-09-08';

    /**
     * Os três números do menu lateral. Ficam separados dos demais porque são
     * carregados em toda página — o Início pede o resto quando precisa.
     *
     * @return array{empresas: int, reunioes: int, usuarios: int}
     */
    public static function todos(): array
    {
        return [
            'empresas' => Empresa::count(),
            'reunioes' => Reuniao::count(),
            'usuarios' => User::count(),
        ];
    }

    /**
     * O painel do Início. Antes esses números eram digitados na view; agora
     * cada um é uma contagem de verdade, então cadastrar um cliente muda o
     * que a primeira tela mostra.
     *
     * @return array<string, int>
     */
    public static function doInicio(): array
    {
        return [
            ...self::todos(),
            'documentos' => Documento::count(),
            'fontes' => Fonte::count(),
            'treinamentos' => Treinamento::count(),
            'projetos' => Projeto::count(),
            'processos' => Processo::count(),
        ];
    }
}
