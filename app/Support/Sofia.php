<?php

namespace App\Support;

use Throwable;

/**
 * RESPOSTAS DA SOFIA
 * A porta por onde a tela pergunta. Dentro há dois caminhos: a IA, quando
 * configurada, e as respostas montadas direto do banco, que existem desde
 * sempre.
 *
 * A base é o chão, não um plano B envergonhado: IA desligada, mal configurada
 * ou fora do ar cai nela em silêncio, e quem está na tela recebe resposta do
 * mesmo jeito. A falha vai para o log, não para a conversa.
 */
final class Sofia
{
    /**
     * @param  list<array{autor: string, texto: string}>  $historico  O que já
     *                                                                foi dito nessa conversa, sem a pergunta atual.
     */
    public static function responder(string $pergunta, array $historico = []): string
    {
        return self::pelaIa($pergunta, $historico) ?? RespostaDaBase::responder($pergunta);
    }

    /** O texto da IA, ou null quando ela não está no jogo. */
    private static function pelaIa(string $pergunta, array $historico): ?string
    {
        if (! config('hc.sofia.ia.ativa')) {
            return null;
        }

        try {
            /*
             * A classe que responde é resolvida pelo contêiner de propósito: é
             * essa indireção que permite trocar a IA pela configuração, e um
             * teste trocar por uma dublê.
             */
            return app(RespondePerguntas::class)->responder(new PerguntaParaSofia(
                texto: $pergunta,
                historico: self::ultimasMensagens($historico),
                contexto: ContextoDaHc::resumo(),
            ));
        } catch (Throwable $excecao) {
            report($excecao);

            return null;
        }
    }

    /**
     * A conversa inteira cresce sem limite e cada mensagem custa no pedido,
     * então só as últimas vão junto.
     *
     * @param  list<array{autor: string, texto: string}>  $historico
     * @return list<array{autor: string, texto: string}>
     */
    private static function ultimasMensagens(array $historico): array
    {
        $memoria = (int) config('hc.sofia.ia.memoria');

        return $memoria > 0 ? array_slice($historico, -$memoria) : [];
    }
}
