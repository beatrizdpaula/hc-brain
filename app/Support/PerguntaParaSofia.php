<?php

namespace App\Support;

/**
 * O QUE A IA RECEBE
 * Tudo que a Sofia sabe na hora de responder, num pacote só: a pergunta, o
 * que já foi dito nessa conversa e o retrato da base da HC.
 *
 * O pacote existe para que acrescentar informação depois — o perfil de quem
 * pergunta, por exemplo — não quebre a assinatura de `RespondePerguntas` nem
 * a classe que você escrever.
 */
final readonly class PerguntaParaSofia
{
    /**
     * @param  list<array{autor: string, texto: string}>  $historico  Da mais
     *                                                                antiga para a mais recente, sem a pergunta atual.
     * @param  string  $contexto  O retrato da base, de `ContextoDaHc`.
     */
    public function __construct(
        public string $texto,
        public array $historico = [],
        public string $contexto = '',
    ) {}

    /**
     * A instrução de sistema: quem a Sofia é, o que ela pode usar e como
     * deve se comportar quando a base não tem a resposta.
     */
    public function instrucao(): string
    {
        return <<<TEXTO
            Você é a Sofia, a assistente interna da HC. Responda em português do Brasil,
            de forma direta e curta, sobre empresas, sócios, reuniões, documentos,
            projetos, processos e conteúdos de treinamento da HC.

            Use apenas os dados abaixo. Quando a resposta não estiver neles, diga que
            não encontrou na base da HC — não invente nomes, números nem datas.

            DADOS DA BASE DA HC
            {$this->contexto}
            TEXTO;
    }

    /**
     * A conversa no formato de lista de mensagens, que é o que quase toda IA
     * de chat espera. Os papéis saem nos nomes usuais (`system`, `user`,
     * `assistant`); se a sua IA chamar de outra coisa, traduza na sua classe.
     *
     * @return list<array{role: string, content: string}>
     */
    public function mensagens(): array
    {
        $mensagens = [['role' => 'system', 'content' => $this->instrucao()]];

        foreach ($this->historico as $anterior) {
            $mensagens[] = [
                'role' => $anterior['autor'] === 'bot' ? 'assistant' : 'user',
                'content' => $anterior['texto'],
            ];
        }

        $mensagens[] = ['role' => 'user', 'content' => $this->texto];

        return $mensagens;
    }
}
