<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\PerguntaParaSofia;
use App\Support\RespondePerguntas;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use RuntimeException;
use Tests\TestCase;

/**
 * O encaixe da IA na Sofia: ligada, é ela quem responde, e recebe a pergunta
 * com a conversa e o retrato da base; desligada, quebrada ou muda, a resposta
 * volta a sair das consultas ao banco e a tela nunca fica sem resposta.
 */
class SofiaIaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
        config()->set('hc.sofia.ia.ativa', true);
    }

    /** Guarda o que a IA recebeu e devolve o que o teste mandar devolver. */
    private function iaQue(callable $resposta): object
    {
        $duble = new class($resposta) implements RespondePerguntas
        {
            public ?PerguntaParaSofia $recebeu = null;

            public int $chamadas = 0;

            public function __construct(private $resposta) {}

            public function responder(PerguntaParaSofia $pergunta): ?string
            {
                $this->recebeu = $pergunta;
                $this->chamadas++;

                return ($this->resposta)($pergunta);
            }
        };

        $this->app->instance(RespondePerguntas::class, $duble);

        return $duble;
    }

    /**
     * @param  list<array{autor: string, texto: string}>  $historico
     */
    private function perguntar(string $pergunta, array $historico = []): TestResponse
    {
        return $this->actingAs(User::firstOrFail())
            ->postJson('/api/sofia/perguntar', [
                'pergunta' => $pergunta,
                'historico' => $historico,
            ]);
    }

    public function test_a_resposta_vem_da_ia_quando_ela_esta_ligada(): void
    {
        $ia = $this->iaQue(fn () => 'A Empresa X abriu em 2019.');

        $this->perguntar('Quando a Empresa X abriu?')
            ->assertOk()
            ->assertJsonPath('resposta', 'A Empresa X abriu em 2019.');

        $this->assertSame(1, $ia->chamadas);
    }

    public function test_a_ia_recebe_a_pergunta_a_conversa_e_a_base(): void
    {
        $ia = $this->iaQue(fn () => 'Tudo certo.');

        $this->perguntar('E a última reunião dela?', [
            ['autor' => 'user', 'texto' => 'Quem é o sócio da Empresa X?'],
            ['autor' => 'bot', 'texto' => 'É a Flávia Silva.'],
        ])->assertOk();

        $recebeu = $ia->recebeu;

        $this->assertNotNull($recebeu);
        $this->assertSame('E a última reunião dela?', $recebeu->texto);
        $this->assertSame([
            ['autor' => 'user', 'texto' => 'Quem é o sócio da Empresa X?'],
            ['autor' => 'bot', 'texto' => 'É a Flávia Silva.'],
        ], $recebeu->historico);

        // O retrato da base é o que impede a IA de inventar nomes.
        $this->assertStringContainsString('Empresa X', $recebeu->contexto);
        $this->assertStringContainsString('Flávia Silva', $recebeu->contexto);
    }

    public function test_a_conversa_vai_para_a_ia_como_lista_de_mensagens(): void
    {
        $ia = $this->iaQue(fn () => 'Certo.');

        $this->perguntar('E a última reunião dela?', [
            ['autor' => 'user', 'texto' => 'Quem é o sócio da Empresa X?'],
            ['autor' => 'bot', 'texto' => 'É a Flávia Silva.'],
        ])->assertOk();

        $mensagens = $ia->recebeu?->mensagens() ?? [];

        $this->assertSame(['system', 'user', 'assistant', 'user'], array_column($mensagens, 'role'));
        $this->assertSame('E a última reunião dela?', end($mensagens)['content']);
    }

    public function test_so_as_ultimas_mensagens_vao_junto(): void
    {
        config()->set('hc.sofia.ia.memoria', 2);
        $ia = $this->iaQue(fn () => 'Certo.');

        $this->perguntar('E agora?', [
            ['autor' => 'user', 'texto' => 'Primeira'],
            ['autor' => 'bot', 'texto' => 'Segunda'],
            ['autor' => 'user', 'texto' => 'Terceira'],
            ['autor' => 'bot', 'texto' => 'Quarta'],
        ])->assertOk();

        $this->assertSame(
            ['Terceira', 'Quarta'],
            array_column($ia->recebeu?->historico ?? [], 'texto'),
        );
    }

    public function test_a_resposta_cai_na_base_quando_a_ia_falha(): void
    {
        $this->iaQue(fn () => throw new RuntimeException('o serviço caiu'));

        $this->perguntar('Quais empresas temos?')
            ->assertOk()
            ->assertJsonPath('resposta', fn (string $r) => str_starts_with($r, 'Temos 5 empresas'));
    }

    public function test_a_resposta_cai_na_base_quando_a_ia_nao_responde(): void
    {
        $this->iaQue(fn () => null);

        $this->perguntar('Quais empresas temos?')
            ->assertOk()
            ->assertJsonPath('resposta', fn (string $r) => str_starts_with($r, 'Temos 5 empresas'));
    }

    public function test_a_ia_desligada_nem_chega_a_ser_chamada(): void
    {
        config()->set('hc.sofia.ia.ativa', false);
        $ia = $this->iaQue(fn () => throw new RuntimeException('não devia ter sido chamada'));

        $this->perguntar('Quais empresas temos?')
            ->assertOk()
            ->assertJsonPath('resposta', fn (string $r) => str_starts_with($r, 'Temos 5 empresas'));

        $this->assertSame(0, $ia->chamadas);
    }

    public function test_a_conversa_enviada_precisa_ter_forma_de_conversa(): void
    {
        $this->perguntar('E agora?', [['autor' => 'ninguem', 'texto' => 'Oi']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('historico.0.autor');
    }

    public function test_a_tela_conta_que_ha_ia_no_caminho(): void
    {
        $this->actingAs(User::firstOrFail())
            ->get('/sofia-ia')
            ->assertOk()
            ->assertSee('data-ia="1"', false);
    }
}
