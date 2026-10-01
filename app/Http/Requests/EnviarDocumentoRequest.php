<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EnviarDocumentoRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'arquivo' => [
                'required',
                'file',
                'max:'.config('hc.documentos.tamanho_maximo'),
                'mimes:'.implode(',', config('hc.documentos.extensoes')),
            ],
            'pastaId' => ['required', 'integer', 'exists:pastas,id'],
            // Sem nome escolhido, o documento fica com o nome do arquivo.
            'nome' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'arquivo.required' => 'Escolha um arquivo para enviar.',
            'arquivo.max' => 'O arquivo passa do limite de :max KB.',
            'arquivo.mimes' => 'Este tipo de arquivo não é aceito no banco de documentos.',
            'pastaId.exists' => 'A pasta escolhida não existe mais.',
        ];
    }
}
