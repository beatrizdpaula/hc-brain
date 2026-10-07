<?php

namespace App\Support;

use RuntimeException;

/**
 * O ENCAIXE DA IA — É AQUI QUE VOCÊ ESCREVE A CHAMADA
 *
 * O caminho até aqui já está pronto: a tela manda a pergunta e a conversa, o
 * `ContextoDaHc` monta o retrato da base, e `$pergunta->mensagens()` entrega
 * tudo no formato de lista de mensagens que quase toda IA de chat espera.
 * Falta só falar com o serviço.
 *
 * Dois caminhos, escolha um:
 *
 * 1. Preencha `chamar()` abaixo — é o lugar da requisição, e nada mais
 *    precisa mudar.
 * 2. Escreva a sua própria classe implementando `RespondePerguntas` e aponte
 *    `HC_SOFIA_IA_CLASSE` para ela.
 *
 * Em qualquer um dos dois, ligue a IA com `HC_SOFIA_IA=true` no ambiente.
 * Enquanto ela estiver desligada, mal configurada ou fora do ar, a pergunta
 * cai em `RespostaDaBase` e a tela responde como sempre respondeu.
 */
final class RespostaDeIa implements RespondePerguntas
{
    public function responder(PerguntaParaSofia $pergunta): ?string
    {
        if (! self::configurada()) {
            return null;
        }

        $resposta = $this->chamar($pergunta->mensagens());

        return $resposta !== null && trim($resposta) !== '' ? trim($resposta) : null;
    }

    /** Sem endereço não há para onde mandar a pergunta. */
    public static function configurada(): bool
    {
        return filled(config('hc.sofia.ia.url'));
    }

    /**
     * A conversa vai, o texto da resposta volta. Devolver `null` é dizer que
     * a IA não respondeu — e aí a Sofia usa a resposta da base.
     *
     * Um esqueleto do que costuma entrar aqui, para uma API HTTP:
     *
     *     $resposta = Http::withToken((string) config('hc.sofia.ia.chave'))
     *         ->connectTimeout(5)
     *         ->timeout((int) config('hc.sofia.ia.timeout'))
     *         ->acceptJson()
     *         ->post((string) config('hc.sofia.ia.url'), [
     *             'model' => config('hc.sofia.ia.modelo'),
     *             'messages' => $mensagens,
     *         ])
     *         ->throw();
     *
     *     return $resposta->json('choices.0.message.content');
     *
     * Lançar exceção aqui é seguro: `Sofia` registra o erro e responde pela
     * base, então uma falha da IA não vira uma tela quebrada.
     *
     * @param  list<array{role: string, content: string}>  $mensagens
     */
    private function chamar(array $mensagens): ?string
    {
        throw new RuntimeException(
            'A IA da Sofia está ligada mas ninguém escreveu a chamada ainda: '
            .'preencha RespostaDeIa::chamar() ou aponte HC_SOFIA_IA_CLASSE para a sua classe. '
            .'Foram '.count($mensagens).' mensagens montadas e não enviadas.'
        );
    }
}
