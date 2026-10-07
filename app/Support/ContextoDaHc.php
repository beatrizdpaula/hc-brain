<?php

namespace App\Support;

use App\Models\Documento;
use App\Models\Empresa;
use App\Models\Processo;
use App\Models\Projeto;
use App\Models\Reuniao;
use App\Models\Treinamento;

/**
 * O RETRATO DA BASE PARA A IA
 * Uma IA genérica não conhece a HC. Esta classe transforma o banco em texto
 * para ir junto com a pergunta, e é por isso que a Sofia responde sobre
 * empresas e reuniões de verdade em vez de inventar.
 *
 * A base da HC é pequena — dezenas de registros, não milhares — então cabe
 * inteira no pedido e não há por que escolher trechos. Se ela crescer a ponto
 * de estourar o limite do modelo, é aqui que entra a seleção por relevância,
 * e `resumo()` passa a receber a pergunta para guiar o recorte.
 */
final class ContextoDaHc
{
    /** Quanto de texto livre de cada reunião entra no retrato. */
    private const LIMITE_DO_RESUMO = 400;

    public static function resumo(): string
    {
        return implode("\n\n", array_filter([
            self::empresas(),
            self::reunioes(),
            self::projetos(),
            self::processos(),
            self::treinamentos(),
            self::documentos(),
        ]));
    }

    private static function empresas(): string
    {
        $empresas = Empresa::with(['socio', 'fontes'])->withCount('reunioes')->get();

        if ($empresas->isEmpty()) {
            return '';
        }

        return self::bloco('EMPRESAS', $empresas->map(function (Empresa $empresa): string {
            $socio = $empresa->socio;
            $responsavel = $socio !== null
                ? "sócio {$socio->nome} ({$socio->cargo}, {$socio->participacao}, {$socio->email})"
                : 'sem sócio cadastrado';
            $fontes = $empresa->fontes->pluck('nome')->implode(', ');

            return "- {$empresa->nome} | {$empresa->setor} | {$empresa->status} | {$responsavel} "
                ."| {$empresa->reunioes_count} reuniões"
                .($fontes !== '' ? " | fontes: {$fontes}" : '');
        })->all());
    }

    private static function reunioes(): string
    {
        $reunioes = Reuniao::with('empresa')->orderByDesc('data')->get();

        if ($reunioes->isEmpty()) {
            return '';
        }

        return self::bloco('REUNIÕES', $reunioes->map(function (Reuniao $reuniao): string {
            $horario = $reuniao->horario !== null ? " {$reuniao->horario}" : '';

            /* Campo vazio sai fora: "decisões:" sem nada depois é ruído que a
               IA ainda tem que ler, e reunião agendada quase nunca tem. */
            $detalhes = array_filter([
                'participantes' => implode(', ', $reuniao->participantes),
                'resumo' => self::cortar($reuniao->resumo),
                'decisões' => self::cortar(implode('; ', $reuniao->decisoes)),
                'próximos passos' => self::cortar(implode('; ', $reuniao->proximos_passos)),
            ], fn (string $valor) => $valor !== '');

            $linha = "- {$reuniao->data->format('d/m/Y')}{$horario} | {$reuniao->tipo} | "
                ."{$reuniao->empresa->nome} | {$reuniao->status} | responsável {$reuniao->responsavel}";

            foreach ($detalhes as $rotulo => $valor) {
                $linha .= "\n  {$rotulo}: {$valor}";
            }

            return $linha;
        })->all());
    }

    private static function projetos(): string
    {
        $projetos = Projeto::orderBy('ordem')->get();

        if ($projetos->isEmpty()) {
            return '';
        }

        return self::bloco('PROJETOS', $projetos->map(
            fn (Projeto $projeto): string => "- {$projeto->nome} | {$projeto->status} | "
                ."{$projeto->progresso}% | responsável {$projeto->responsavel} | "
                .'prazo '.$projeto->prazo->format('d/m/Y')
        )->all());
    }

    private static function processos(): string
    {
        $processos = Processo::orderBy('ordem')->get();

        if ($processos->isEmpty()) {
            return '';
        }

        return self::bloco('PROCESSOS INTERNOS', $processos->map(
            fn (Processo $processo): string => "- {$processo->nome} | {$processo->area} | "
                ."responsável {$processo->responsavel} | etapas: ".implode(' > ', $processo->etapas)
        )->all());
    }

    private static function treinamentos(): string
    {
        $treinamentos = Treinamento::orderBy('ordem')->get();

        if ($treinamentos->isEmpty()) {
            return '';
        }

        return self::bloco('TREINAMENTOS', $treinamentos->map(function (Treinamento $item): string {
            $processo = $item->processo !== null ? " | processo {$item->processo}" : '';

            return "- {$item->titulo} | {$item->tipo} | {$item->categoria}{$processo}"
                ."\n  {$item->descricao}";
        })->all());
    }

    private static function documentos(): string
    {
        $documentos = Documento::with('pasta')->orderBy('nome')->get();

        if ($documentos->isEmpty()) {
            return '';
        }

        return self::bloco('DOCUMENTOS', $documentos->map(
            fn (Documento $documento): string => "- {$documento->nome} | pasta "
                .($documento->pasta->nome ?? 'sem pasta')
        )->all());
    }

    /**
     * @param  list<string>  $linhas
     */
    private static function bloco(string $titulo, array $linhas): string
    {
        return $titulo.' ('.count($linhas).")\n".implode("\n", $linhas);
    }

    private static function cortar(string $texto): string
    {
        return str($texto)->squish()->limit(self::LIMITE_DO_RESUMO)->value();
    }
}
