<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('treinamentos', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('tipo');
            $table->string('titulo');
            $table->string('categoria');
            $table->string('nivel');
            $table->text('descricao');
            $table->string('trilha')->nullable();
            $table->string('cursos')->nullable();
            $table->string('processo')->nullable();
            $table->unsignedInteger('ordem')->default(0);
            $table->timestamps();
        });

        Schema::create('treinamento_historicos', function (Blueprint $table) {
            $table->id();
            $table->string('pessoa');
            $table->string('empresa');
            $table->string('conteudo');
            $table->string('status');
            $table->unsignedInteger('progresso');
            $table->string('data');
            $table->unsignedInteger('ordem')->default(0);
            $table->timestamps();
        });

        // Conteúdos relacionados a cada empresa, mostrados no detalhe do cliente
        // e usados pela Sofia para responder "treinamentos da Empresa X".
        Schema::create('empresa_treinamento', function (Blueprint $table) {
            $table->id();
            $table->string('empresa_id');
            $table->string('treinamento_id');
            $table->unsignedInteger('ordem')->default(0);

            $table->foreign('empresa_id')->references('id')->on('empresas')->cascadeOnDelete();
            $table->foreign('treinamento_id')->references('id')->on('treinamentos')->cascadeOnDelete();
            $table->unique(['empresa_id', 'treinamento_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empresa_treinamento');
        Schema::dropIfExists('treinamento_historicos');
        Schema::dropIfExists('treinamentos');
    }
};
