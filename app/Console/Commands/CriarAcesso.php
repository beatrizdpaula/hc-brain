<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Cria (ou atualiza) um acesso ao HC Brain pelo terminal.
 *
 * É por aqui que nasce o primeiro administrador em produção: lá o seeder dá
 * senhas aleatórias de propósito, então sem este comando ninguém entraria no
 * sistema recém-publicado. A senha é digitada escondida e nunca fica no
 * repositório, no histórico do shell ou em um seeder.
 */
class CriarAcesso extends Command
{
    protected $signature = 'hc:acesso
        {--nome= : Nome que aparece na tela de Usuários}
        {--email= : E-mail usado para entrar}
        {--perfil= : Administrador, Gestor ou Colaborador}
        {--area= : Área da pessoa}
        {--senha-aleatoria : Gera a senha em vez de pedir, e a mostra uma vez}';

    protected $description = 'Cria ou atualiza um acesso ao HC Brain';

    public function handle(): int
    {
        $email = $this->option('email') ?: $this->ask('E-mail');
        $existente = User::where('email', $email)->first();

        if ($existente) {
            $this->components->info("{$existente->name} já tem acesso: o comando vai atualizar o cadastro.");
        }

        $nome = $this->option('nome') ?: $this->ask('Nome', $existente?->name);
        $perfil = $this->option('perfil') ?: $this->choice('Perfil', User::PERFIS, $existente?->perfil ?? 'Administrador');
        $area = $this->option('area') ?: $this->choice('Área', User::AREAS, $existente?->area ?? 'Gestão');

        $senha = $this->senha();

        $erros = Validator::make(
            ['nome' => $nome, 'email' => $email, 'perfil' => $perfil, 'area' => $area, 'senha' => $senha],
            [
                'nome' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255'],
                'perfil' => ['required', Rule::in(User::PERFIS)],
                'area' => ['required', Rule::in(User::AREAS)],
                'senha' => ['required', 'string', 'min:8'],
            ]
        )->errors();

        if ($erros->isNotEmpty()) {
            foreach ($erros->all() as $erro) {
                $this->components->error($erro);
            }

            return self::FAILURE;
        }

        User::updateOrCreate(['email' => $email], [
            'name' => $nome,
            'password' => $senha,
            'perfil' => $perfil,
            'area' => $area,
            'status' => 'Ativo',
        ]);

        $this->components->info(($existente ? 'Acesso atualizado' : 'Acesso criado')." para {$email}.");

        return self::SUCCESS;
    }

    /**
     * Digitada duas vezes e escondida, ou gerada. Errar a senha de um acesso
     * que ainda não existe deixaria a pessoa trancada do lado de fora, então
     * a confirmação não é opcional.
     */
    private function senha(): string
    {
        if ($this->option('senha-aleatoria')) {
            $senha = Str::password(20);

            $this->components->warn("Senha gerada: {$senha}");
            $this->components->warn('Ela não será mostrada de novo. Troque-a no primeiro acesso.');

            return $senha;
        }

        while (true) {
            $senha = (string) $this->secret('Senha (mínimo de 8 caracteres)');

            if ($senha === (string) $this->secret('Repita a senha')) {
                return $senha;
            }

            $this->components->error('As senhas não conferem. Tente de novo.');
        }
    }
}
