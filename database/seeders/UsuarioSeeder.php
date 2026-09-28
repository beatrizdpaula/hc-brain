<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\Contadores;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Equipe com acesso ao HC Brain. Só os dois acessos demonstrativos têm senha
 * conhecida (123456); os demais entram na lista, mas sem credencial divulgada.
 */
class UsuarioSeeder extends Seeder
{
    private const SENHA_DEMO = '123456';

    /**
     * nome, e-mail, perfil, área, status, último acesso e se é acesso demo.
     * O último acesso é relativo à data de referência do protótipo, então a
     * lista continua fazendo sentido independente de quando for semeada.
     */
    private const EQUIPE = [
        ['Beatriz', 'beatriz@healthcare.com.br', 'Administrador', 'Gestão', 'Ativo', '-0 days 10:42', true],
        ['Matheus', 'matheus@healthcare.com.br', 'Gestor', 'Comercial', 'Ativo', '-0 days 09:18', true],
        ['Carlos Mendes', 'carlos.mendes@healthcare.com.br', 'Gestor', 'Operações', 'Ativo', '-1 days 17:46', false],
        ['Mariana Costa', 'mariana.costa@healthcare.com.br', 'Colaborador', 'Atendimento', 'Ativo', '-1 days 15:21', false],
        ['Rafael Nogueira', 'rafael.nogueira@healthcare.com.br', 'Colaborador', 'Financeiro', 'Ativo', '-4 days 14:03', false],
        ['Ana Souza', 'ana.souza@healthcare.com.br', 'Colaborador', 'Projetos', 'Inativo', '-11 days 11:12', false],
        ['Luciana Almeida', 'luciana.almeida@healthcare.com.br', 'Gestor', 'Comercial', 'Ativo', '-5 days 16:34', false],
    ];

    public function run(): void
    {
        foreach (self::EQUIPE as [$nome, $email, $perfil, $area, $status, $acesso, $ehDemo]) {
            User::updateOrCreate(['email' => $email], [
                'name' => $nome,
                'password' => $ehDemo ? self::SENHA_DEMO : Str::password(32),
                'perfil' => $perfil,
                'area' => $area,
                'status' => $status,
                'ultimo_acesso' => self::momento($acesso),
            ]);
        }
    }

    /** Converte "-1 days 17:46" em um instante a partir da data de referência. */
    private static function momento(string $descricao): Carbon
    {
        [$dias, $hora] = explode(' days ', $descricao);
        [$horas, $minutos] = explode(':', $hora);

        return Carbon::parse(Contadores::HOJE)
            ->addDays((int) $dias)
            ->setTime((int) $horas, (int) $minutos);
    }
}
