<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CadastrarUsuarioRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'perfil' => ['required', Rule::in(['Administrador', 'Gestor', 'Colaborador'])],
            'area' => ['required', Rule::in(['Gestão', 'Comercial', 'Operações', 'Atendimento', 'Financeiro', 'Projetos'])],
            'status' => ['required', Rule::in(['Ativo', 'Inativo'])],
            'senha' => ['required', 'string', 'min:6'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Já existe um usuário com este e-mail na base.',
        ];
    }
}
