<?php

namespace App\Http\Requests;

use App\Models\Pasta;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SalvarPastaRequest extends FormRequest
{
    public function rules(): array
    {
        $pasta = $this->route('pasta');

        return [
            'nome' => [
                'required',
                'string',
                'max:60',
                Rule::unique('pastas', 'nome')->ignore($pasta instanceof Pasta ? $pasta->id : null),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'Dê um nome à pasta.',
            'nome.unique' => 'Já existe uma pasta com este nome.',
        ];
    }
}
