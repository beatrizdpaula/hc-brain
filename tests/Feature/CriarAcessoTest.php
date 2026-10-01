<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * O comando que cria o primeiro acesso. Em produção o seeder dá senhas
 * aleatórias de propósito, então é por aqui que alguém entra pela primeira vez.
 */
class CriarAcessoTest extends TestCase
{
    use RefreshDatabase;

    public function test_cria_o_acesso_com_a_senha_digitada(): void
    {
        $this->artisan('hc:acesso', [
            '--nome' => 'Beatriz de Paula',
            '--email' => 'beatriz@healthcare.com.br',
            '--perfil' => 'Administrador',
            '--area' => 'Gestão',
        ])
            ->expectsQuestion('Senha (mínimo de 8 caracteres)', 'uma-senha-boa')
            ->expectsQuestion('Repita a senha', 'uma-senha-boa')
            ->assertSuccessful();

        $usuario = User::where('email', 'beatriz@healthcare.com.br')->firstOrFail();

        $this->assertSame('Administrador', $usuario->perfil);
        $this->assertSame('Ativo', $usuario->status);
        $this->assertTrue(Hash::check('uma-senha-boa', $usuario->password));
    }

    public function test_senha_repetida_errada_pede_de_novo(): void
    {
        $this->artisan('hc:acesso', [
            '--nome' => 'Beatriz',
            '--email' => 'beatriz@healthcare.com.br',
            '--perfil' => 'Gestor',
            '--area' => 'Gestão',
        ])
            ->expectsQuestion('Senha (mínimo de 8 caracteres)', 'uma-senha-boa')
            ->expectsQuestion('Repita a senha', 'outra-coisa')
            ->expectsQuestion('Senha (mínimo de 8 caracteres)', 'uma-senha-boa')
            ->expectsQuestion('Repita a senha', 'uma-senha-boa')
            ->assertSuccessful();

        $this->assertDatabaseHas('users', ['email' => 'beatriz@healthcare.com.br']);
    }

    public function test_senha_curta_nao_cria_acesso(): void
    {
        $this->artisan('hc:acesso', [
            '--nome' => 'Beatriz',
            '--email' => 'beatriz@healthcare.com.br',
            '--perfil' => 'Administrador',
            '--area' => 'Gestão',
        ])
            ->expectsQuestion('Senha (mínimo de 8 caracteres)', 'curta')
            ->expectsQuestion('Repita a senha', 'curta')
            ->assertFailed();

        $this->assertDatabaseMissing('users', ['email' => 'beatriz@healthcare.com.br']);
    }

    /** Digitar escondido nem sempre funciona no terminal de quem está usando. */
    public function test_senha_pode_vir_por_opcao(): void
    {
        $this->artisan('hc:acesso', [
            '--nome' => 'Beatriz',
            '--email' => 'beatriz@healthcare.com.br',
            '--perfil' => 'Administrador',
            '--area' => 'Gestão',
            '--senha' => 'senha-escolhida',
        ])->assertSuccessful();

        $usuario = User::where('email', 'beatriz@healthcare.com.br')->firstOrFail();

        $this->assertTrue(Hash::check('senha-escolhida', $usuario->password));
    }

    /** Rodar de novo para a mesma pessoa é trocar a senha, não duplicar o acesso. */
    public function test_email_que_ja_existe_atualiza_o_acesso(): void
    {
        $this->seed();

        $this->artisan('hc:acesso', [
            '--nome' => 'Beatriz',
            '--email' => 'beatriz@healthcare.com.br',
            '--perfil' => 'Administrador',
            '--area' => 'Gestão',
            '--senha-aleatoria' => true,
        ])->assertSuccessful();

        $this->assertSame(1, User::where('email', 'beatriz@healthcare.com.br')->count());
    }
}
