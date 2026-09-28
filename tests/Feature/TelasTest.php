<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Telas;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * O menu lateral é montado a partir de App\Support\Telas, então percorrer esse
 * mapa garante que nenhum item do menu aponte para uma rota que não existe.
 */
class TelasTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, array{string}> */
    public static function rotasDoMenu(): array
    {
        return collect(Telas::MENU)
            ->mapWithKeys(fn (array $tela) => [$tela['id'] => [$tela['rota']]])
            ->all();
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('rotasDoMenu')]
    public function test_tela_do_menu_abre_para_quem_tem_sessao(string $rota): void
    {
        $this->seed();

        $this->actingAs(User::firstOrFail())->get($rota)->assertOk();
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('rotasDoMenu')]
    public function test_tela_do_menu_exige_sessao(string $rota): void
    {
        $this->get($rota)->assertRedirect('/login');
    }

    public function test_detalhe_do_cliente_abre_pela_url(): void
    {
        $this->seed();

        $this->actingAs(User::firstOrFail())
            ->get('/clientes/empresaX')
            ->assertOk()
            ->assertSee('Empresa X');
    }

    public function test_cliente_inexistente_responde_404(): void
    {
        $this->seed();

        $this->actingAs(User::firstOrFail())
            ->get('/clientes/empresa-que-nao-existe')
            ->assertNotFound()
            ->assertSee('Empresa não encontrada');
    }
}
