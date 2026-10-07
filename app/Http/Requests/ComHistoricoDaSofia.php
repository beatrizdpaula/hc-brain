<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

/**
 * O pedaço de conversa que acompanha uma pergunta à Sofia. Vale para os dois
 * caminhos — pergunta escrita e áudio — porque uma conversa por voz esquecer
 * o que acabou de ser dito seria pior do que não ter memória nenhuma.
 */
trait ComHistoricoDaSofia
{
    /** Teto de mensagens aceitas, acima do que a tela manda. */
    private const MAXIMO_DE_MENSAGENS = 40;

    /**
     * @return array<string, list<mixed>>
     */
    protected function regrasDoHistorico(): array
    {
        return [
            'historico' => ['sometimes', 'array', 'max:'.self::MAXIMO_DE_MENSAGENS],
            'historico.*.autor' => ['required', Rule::in(['user', 'bot'])],
            'historico.*.texto' => ['required', 'string', 'max:4000'],
        ];
    }

    /**
     * O histórico já na forma que `Sofia` espera, da mensagem mais antiga
     * para a mais recente e sem nenhuma chave a mais.
     *
     * @return list<array{autor: string, texto: string}>
     */
    public function historico(): array
    {
        return array_map(
            fn (array $mensagem): array => [
                'autor' => $mensagem['autor'],
                'texto' => $mensagem['texto'],
            ],
            array_values($this->validated('historico', [])),
        );
    }
}
