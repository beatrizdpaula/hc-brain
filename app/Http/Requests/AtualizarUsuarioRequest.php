<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AtualizarUsuarioRequest extends FormRequest
{
    public function rules(): array
    {
        $usuario = $this->route('usuario');

        return [
            'nome' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($usuario instanceof User ? $usuario->id : null),
            ],
            'perfil' => ['required', Rule::in(User::PERFIS)],
            'area' => ['required', Rule::in(User::AREAS)],
            'status' => ['required', Rule::in(User::STATUS)],
            // Em branco mantém a senha atual: editar o perfil de alguém não
            // deveria obrigar quem edita a escolher uma senha nova.
            'senha' => ['nullable', 'string', 'min:8'],
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
