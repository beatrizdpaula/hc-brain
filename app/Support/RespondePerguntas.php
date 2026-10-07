<?php

namespace App\Support;

/**
 * QUEM RESPONDE PELA SOFIA
 * O encaixe da IA. Qualquer classe que cumpra este contrato pode ser a voz da
 * Sofia: aponte `hc.sofia.ia.classe` para ela e a tela passa a responder por
 * ela, sem mudar mais nada no caminho.
 *
 * Devolver `null` é dizer "não sei responder agora" — por falta de
 * configuração, de resposta do serviço ou do que for. Quem chama entende isso
 * e cai nas respostas montadas direto do banco, em `RespostaDaBase`, então a
 * tela nunca fica sem resposta por causa da IA.
 */
interface RespondePerguntas
{
    public function responder(PerguntaParaSofia $pergunta): ?string;
}
