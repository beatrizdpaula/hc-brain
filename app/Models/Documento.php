<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

#[Fillable(['pasta_id', 'nome', 'extensao', 'arquivo', 'tamanho', 'mime', 'enviado_por'])]
class Documento extends Model
{
    protected $table = 'documentos';

    /**
     * Como cada extensão é agrupada na tela. O filtro de tipo e o ícone saem
     * daqui, então um `.docx` e um `.txt` se comportam igual sem que cada
     * lugar repita a lista.
     */
    private const TIPO_POR_EXTENSAO = [
        'pdf' => 'pdf',
        'doc' => 'doc', 'docx' => 'doc', 'txt' => 'doc',
        'xls' => 'sheet', 'xlsx' => 'sheet', 'csv' => 'sheet',
        'ppt' => 'slide', 'pptx' => 'slide',
        'png' => 'imagem', 'jpg' => 'imagem', 'jpeg' => 'imagem',
    ];

    protected function casts(): array
    {
        return ['tamanho' => 'integer'];
    }

    public function pasta(): BelongsTo
    {
        return $this->belongsTo(Pasta::class);
    }

    public function enviadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'enviado_por');
    }

    public function tipo(): string
    {
        return self::TIPO_POR_EXTENSAO[$this->extensao] ?? 'outro';
    }

    /** Nome com a extensão, que é como o arquivo aparece e é baixado. */
    public function nomeDoArquivo(): string
    {
        return "{$this->nome}.{$this->extensao}";
    }

    /** Apaga o arquivo do disco junto com o registro — nada fica órfão lá. */
    public function apagarArquivo(): void
    {
        if ($this->arquivo !== null) {
            Storage::disk(config('hc.documentos.disco'))->delete($this->arquivo);
        }
    }
}
