<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PerguntarSofiaRequest extends FormRequest
{
    use ComHistoricoDaSofia;

    public function rules(): array
    {
        return [
            'pergunta' => ['required', 'string', 'max:1000'],
            ...$this->regrasDoHistorico(),
        ];
    }
}
