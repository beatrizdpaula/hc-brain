<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Equipe inicial com acesso ao HC Brain. A senha sai de `HC_SENHA_SEMEADA`,
 * que só existe no ambiente de desenvolvimento: sem ela cada pessoa nasce com
 * uma senha aleatória, então semear a base em produção não cria credencial
 * conhecida por quem leu o repositório.
 */
class UsuarioSeeder extends Seeder
{
    /**
     * nome, e-mail, perfil, área, status e último acesso. O último acesso é
     * relativo a hoje, então a lista continua coerente independente de quando
     * for semeada.
     */
    private const EQUIPE = [
        ['Beatriz', 'beatriz@healthcare.com.br', 'Administrador', 'Gestão', 'Ativo', '-0 days 10:42'],
        ['Matheus', 'matheus@healthcare.com.br', 'Gestor', 'Comercial', 'Ativo', '-0 days 09:18'],
        ['Carlos Mendes', 'carlos.mendes@healthcare.com.br', 'Gestor', 'Operações', 'Ativo', '-1 days 17:46'],
        ['Mariana Costa', 'mariana.costa@healthcare.com.br', 'Colaborador', 'Atendimento', 'Ativo', '-1 days 15:21'],
        ['Rafael Nogueira', 'rafael.nogueira@healthcare.com.br', 'Colaborador', 'Financeiro', 'Ativo', '-4 days 14:03'],
        ['Ana Souza', 'ana.souza@healthcare.com.br', 'Colaborador', 'Projetos', 'Inativo', '-11 days 11:12'],
        ['Luciana Almeida', 'luciana.almeida@healthcare.com.br', 'Gestor', 'Comercial', 'Ativo', '-5 days 16:34'],
    ];

    public function run(): void
    {
        $senha = config('hc.senha_semeada');

        if ($senha === null) {
            $this->command?->warn(
                'HC_SENHA_SEMEADA não definida: a equipe será criada com senhas aleatórias.'
            );
        }

        foreach (self::EQUIPE as [$nome, $email, $perfil, $area, $status, $acesso]) {
            User::updateOrCreate(['email' => $email], [
                'name' => $nome,
                'password' => $senha ?? Str::password(32),
                'perfil' => $perfil,
                'area' => $area,
                'status' => $status,
                'ultimo_acesso' => self::momento($acesso),
            ]);
        }
    }

    /** Converte "-1 days 17:46" em um instante contado a partir de hoje. */
    private static function momento(string $descricao): Carbon
    {
        [$dias, $hora] = explode(' days ', $descricao);
        [$horas, $minutos] = explode(':', $hora);

        return Carbon::today()
            ->addDays((int) $dias)
            ->setTime((int) $horas, (int) $minutos);
    }
}
