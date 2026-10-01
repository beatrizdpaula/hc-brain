<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Storage;

abstract class TestCase extends BaseTestCase
{
    /** A senha da equipe semeada, para os testes que passam pelo login. */
    protected const SENHA = 'senha-de-teste';

    protected function setUp(): void
    {
        parent::setUp();

        // Documento é arquivo de verdade. Sem o disco falso, rodar a suíte
        // encheria storage/app com os arquivos do seeder.
        Storage::fake(config('hc.documentos.disco'));
    }
}
