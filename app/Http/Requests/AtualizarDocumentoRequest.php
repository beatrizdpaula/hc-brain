<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** Renomear um documento e movê-lo de pasta — o arquivo em si não muda. */
class AtualizarDocumentoRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'pastaId' => ['required', 'integer', 'exists:pastas,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'pastaId.exists' => 'A pasta escolhida não existe mais.',
        ];
    }
}
