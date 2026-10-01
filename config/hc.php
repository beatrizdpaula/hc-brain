<?php

/*
|--------------------------------------------------------------------------
| HC Brain
|--------------------------------------------------------------------------
| As decisões do produto que mudam entre ambientes. O que é regra de negócio
| fica no código; o que depende de onde o sistema está rodando mora aqui.
*/

return [

    /*
    | Senha da equipe criada pelo `UsuarioSeeder`. Definida apenas em
    | desenvolvimento: sem ela o seeder gera senhas aleatórias, então uma base
    | semeada em produção não nasce com credencial conhecida.
    */
    'senha_semeada' => env('HC_SENHA_SEMEADA'),

    'documentos' => [

        /*
        | Onde o arquivo enviado é guardado. Em produção com mais de uma
        | instância isto precisa ser um disco compartilhado (s3), senão cada
        | servidor enxerga só o que ele mesmo recebeu.
        */
        'disco' => env('HC_DISCO_DOCUMENTOS', 'local'),

        /* Teto por arquivo, em kilobytes. */
        'tamanho_maximo' => (int) env('HC_TAMANHO_MAXIMO_DOCUMENTO', 20480),

        /*
        | Extensões aceitas no envio. A lista é curta de propósito: documento
        | é o que a HC arquiva, não qualquer binário que alguém suba.
        */
        'extensoes' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'txt', 'png', 'jpg', 'jpeg'],

    ],

];
