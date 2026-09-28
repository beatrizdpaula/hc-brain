<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AutenticacaoTest extends TestCase
{
    use RefreshDatabase;

    private function beatriz(): User
    {
        $this->seed();

        return User::where('email', 'beatriz@healthcare.com.br')->firstOrFail();
    }

    public function test_visitante_vai_para_o_login(): void
    {
        $this->get('/')->assertRedirect('/login');
    }

    public function test_destino_pretendido_e_retomado_apos_o_login(): void
    {
        $this->beatriz();

        $this->get('/reunioes')->assertRedirect('/login');

        $this->post('/login', [
            'email' => 'beatriz@healthcare.com.br',
            'password' => '123456',
        ])->assertRedirect('/reunioes');

        $this->assertAuthenticated();
    }

    public function test_senha_incorreta_nao_abre_a_sessao(): void
    {
        $this->beatriz();

        $this->from('/login')
            ->post('/login', [
                'email' => 'beatriz@healthcare.com.br',
                'password' => 'senha-errada',
            ])
            ->assertRedirect('/login')
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_login_registra_o_ultimo_acesso(): void
    {
        $beatriz = $this->beatriz();

        $this->post('/login', [
            'email' => $beatriz->email,
            'password' => '123456',
        ]);

        $this->assertTrue($beatriz->refresh()->ultimo_acesso->isSameMinute(now()));
    }

    /** Sem limite, a tela de login vira um alvo aberto para força bruta. */
    public function test_tentativas_seguidas_de_senha_sao_barradas(): void
    {
        $this->beatriz();

        foreach (range(1, 10) as $ignorado) {
            $this->post('/login', [
                'email' => 'beatriz@healthcare.com.br',
                'password' => 'senha-errada',
            ]);
        }

        $this->post('/login', [
            'email' => 'beatriz@healthcare.com.br',
            'password' => '123456',
        ])->assertStatus(429);

        $this->assertGuest();
    }

    public function test_lembrar_acesso_guarda_o_email_no_cookie(): void
    {
        $this->beatriz();

        $this->post('/login', [
            'email' => 'beatriz@healthcare.com.br',
            'password' => '123456',
            'remember' => 'on',
        ])->assertCookie('hc_brain_email', 'beatriz@healthcare.com.br');
    }

    public function test_sair_encerra_a_sessao(): void
    {
        $this->actingAs($this->beatriz())
            ->post('/logout')
            ->assertRedirect('/login');

        $this->assertGuest();
    }
}
