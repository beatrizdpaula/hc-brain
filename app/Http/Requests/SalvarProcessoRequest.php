<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SalvarProcessoRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'descricao' => ['required', 'string', 'max:2000'],
            'area' => ['required', 'string', 'max:120'],
            'responsavel' => ['required', 'string', 'max:255'],
            'frequencia' => ['required', 'string', 'max:60'],
            // Um processo sem etapa nenhuma não documenta nada.
            'etapas' => ['required', 'array', 'min:1'],
            'etapas.*' => ['required', 'string', 'max:500'],
        ];
    }

    public function attributes(): array
    {
        return ['frequencia' => 'frequência'];
    }

    public function messages(): array
    {
        return ['etapas.min' => 'Descreva ao menos uma etapa do processo.'];
    }

    public function paraOBanco(): array
    {
        return [
            'nome' => $this->string('nome')->toString(),
            'descricao' => $this->string('descricao')->toString(),
            'area' => $this->string('area')->toString(),
            'responsavel' => $this->string('responsavel')->toString(),
            'frequencia' => $this->string('frequencia')->toString(),
            'etapas' => array_values($this->array('etapas')),
            'atualizado_em' => today()->format('d/m/Y'),
        ];
    }
}
