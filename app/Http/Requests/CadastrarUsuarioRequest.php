<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CadastrarUsuarioRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'perfil' => ['required', Rule::in(User::PERFIS)],
            'area' => ['required', Rule::in(User::AREAS)],
            'status' => ['required', Rule::in(User::STATUS)],
            'senha' => ['required', 'string', 'min:8'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Já existe um usuário com este e-mail na base.',
            'senha.min' => 'A senha precisa de ao menos :min caracteres.',
        ];
    }
}
