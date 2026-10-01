<?php

namespace App\Http\Requests;

use App\Models\Projeto;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SalvarProjetoRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'descricao' => ['required', 'string', 'max:2000'],
            'status' => ['required', Rule::in(Projeto::STATUS)],
            'prioridade' => ['required', Rule::in(Projeto::PRIORIDADES)],
            'responsavel' => ['required', 'string', 'max:255'],
            'area' => ['required', 'string', 'max:120'],
            'progresso' => ['required', 'integer', 'between:0,100'],
            'inicio' => ['required', 'date'],
            // Um prazo antes do início não é um prazo apertado, é um erro de
            // digitação — e ele quebraria a conta de dias restantes.
            'prazo' => ['required', 'date', 'after_or_equal:inicio'],
            'empresaId' => ['nullable', 'string', 'exists:empresas,id'],
        ];
    }

    public function attributes(): array
    {
        return ['empresaId' => 'empresa'];
    }

    public function messages(): array
    {
        return [
            'prazo.after_or_equal' => 'O prazo não pode ser anterior ao início do projeto.',
            'empresaId.exists' => 'A empresa escolhida não está na carteira.',
        ];
    }

    public function paraOBanco(): array
    {
        return [
            'nome' => $this->string('nome')->toString(),
            'descricao' => $this->string('descricao')->toString(),
            'status' => $this->string('status')->toString(),
            'prioridade' => $this->string('prioridade')->toString(),
            'responsavel' => $this->string('responsavel')->toString(),
            'area' => $this->string('area')->toString(),
            'progresso' => $this->integer('progresso'),
            'inicio' => $this->date('inicio'),
            'prazo' => $this->date('prazo'),
            'empresa_id' => $this->input('empresaId'),
        ];
    }
}
