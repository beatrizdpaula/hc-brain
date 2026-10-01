<?php

namespace App\Http\Requests;

use App\Models\Empresa;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Cadastro e edição de uma empresa junto com o sócio responsável: os dois
 * chegam na mesma requisição porque uma empresa sem sócio não é um registro
 * completo em nenhuma tela do HC Brain.
 */
class SalvarEmpresaRequest extends FormRequest
{
    public function rules(): array
    {
        $empresa = $this->route('empresa');
        $id = $empresa instanceof Empresa ? $empresa->id : null;

        return [
            'nome' => ['required', 'string', 'max:255', Rule::unique('empresas', 'nome')->ignore($id)],
            'setor' => ['required', 'string', 'max:120'],
            'status' => ['required', 'string', 'max:60'],
            'statusTag' => ['required', Rule::in(Empresa::TAGS)],

            'socio.nome' => ['required', 'string', 'max:255'],
            'socio.cargo' => ['required', 'string', 'max:120'],
            'socio.email' => ['required', 'email', 'max:255'],
            'socio.telefone' => ['required', 'string', 'max:40'],
            'socio.participacao' => ['required', 'string', 'max:20'],
            'socio.desde' => ['required', 'string', 'max:60'],
        ];
    }

    public function attributes(): array
    {
        return [
            'statusTag' => 'cor do status',
            'socio.nome' => 'nome do sócio',
            'socio.cargo' => 'cargo do sócio',
            'socio.email' => 'e-mail do sócio',
            'socio.telefone' => 'telefone do sócio',
            'socio.participacao' => 'participação do sócio',
            'socio.desde' => 'cliente desde',
        ];
    }

    public function messages(): array
    {
        return ['nome.unique' => 'Já existe uma empresa com este nome na carteira.'];
    }

    /** @return array<string, string> */
    public function dadosDoSocio(): array
    {
        /** @var array<string, string> $socio */
        $socio = $this->validated('socio');

        return $socio;
    }
}
