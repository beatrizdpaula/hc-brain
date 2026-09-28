<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Projetos e processos eram cartões escritos direto na view. Agora são
 * registro: têm responsável, prazo, progresso e vínculo com a empresa, então
 * a Sofia e a Pesquisa conseguem enxergá-los como enxergam o resto da base.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projetos', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('nome');
            $table->text('descricao');
            $table->string('status');
            $table->string('prioridade');
            $table->string('responsavel');
            $table->string('area');
            $table->unsignedTinyInteger('progresso');
            $table->date('inicio');
            $table->date('prazo');
            $table->string('empresa_id')->nullable();
            $table->unsignedInteger('ordem')->default(0);
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->nullOnDelete();
        });

        Schema::create('processos', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('nome');
            $table->text('descricao');
            $table->string('area');
            $table->string('responsavel');
            $table->string('frequencia');
            $table->string('atualizado_em');
            /** Passos do fluxo, na ordem em que são executados. */
            $table->json('etapas');
            $table->unsignedInteger('ordem')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('processos');
        Schema::dropIfExists('projetos');
    }
};
