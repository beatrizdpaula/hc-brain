<?php

/**
 * Mensagens de validação em português.
 *
 * Só estão aqui as regras que o HC Brain realmente usa — o login e o cadastro
 * de usuário. Uma regra nova entra nesta lista junto com o `rules()` que a
 * introduziu; o resto cai no texto padrão do Laravel, em inglês, e isso
 * apareceria na tela.
 */
return [
    'email' => 'Informe um e-mail válido.',
    'in' => 'O valor selecionado para :attribute não é válido.',
    'max' => [
        'string' => 'O campo :attribute não pode ter mais de :max caracteres.',
    ],
    'min' => [
        'string' => 'O campo :attribute precisa de pelo menos :min caracteres.',
    ],
    'required' => 'O campo :attribute é obrigatório.',
    'string' => 'O campo :attribute precisa ser um texto.',
    'unique' => 'Este :attribute já está em uso.',

    'attributes' => [
        'area' => 'área',
        'email' => 'e-mail',
        'nome' => 'nome',
        'password' => 'senha',
        'perfil' => 'perfil',
        'pergunta' => 'pergunta',
        'senha' => 'senha',
        'status' => 'status',
    ],
];
