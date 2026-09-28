<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A empresa é a entidade principal do banco: tudo o mais (sócio, fontes,
 * reuniões, financeiro) pendura nela pelo id textual usado também na URL.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empresas', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('nome')->unique();
            $table->string('setor');
            $table->string('status');
            $table->string('status_tag');
            $table->timestamps();
        });

        Schema::create('socios', function (Blueprint $table) {
            $table->id();
            $table->string('empresa_id')->unique();
            $table->string('nome');
            $table->string('cargo');
            $table->string('email');
            $table->string('telefone');
            $table->string('participacao');
            $table->string('desde');
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->cascadeOnDelete();
        });

        Schema::create('fontes', function (Blueprint $table) {
            $table->id();
            $table->string('empresa_id');
            $table->string('tipo');
            $table->string('nome');
            $table->string('info');
            $table->unsignedInteger('ordem')->default(0);
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->cascadeOnDelete();
        });

        // Junta o relacionamento financeiro (regime, honorários, LTV) com a
        // posição consolidada usada no detalhe do cliente.
        Schema::create('empresa_financeiros', function (Blueprint $table) {
            $table->id();
            $table->string('empresa_id')->unique();
            $table->string('regime');
            $table->date('desde');
            $table->unsignedInteger('primeiro');
            $table->unsignedInteger('atual');
            $table->unsignedInteger('total');
            $table->integer('saldo');
            $table->integer('receber');
            $table->integer('despesas');
            $table->unsignedInteger('margem');
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->cascadeOnDelete();
        });

        Schema::create('receitas_mensais', function (Blueprint $table) {
            $table->id();
            $table->string('empresa_id');
            $table->string('mes');
            $table->integer('valor');
            $table->unsignedInteger('ordem')->default(0);
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->cascadeOnDelete();
        });

        Schema::create('transacoes', function (Blueprint $table) {
            $table->id();
            $table->string('empresa_id');
            $table->string('data');
            $table->string('descricao');
            $table->string('categoria');
            $table->string('tipo');
            $table->integer('valor');
            $table->string('status');
            $table->unsignedInteger('ordem')->default(0);
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transacoes');
        Schema::dropIfExists('receitas_mensais');
        Schema::dropIfExists('empresa_financeiros');
        Schema::dropIfExists('fontes');
        Schema::dropIfExists('socios');
        Schema::dropIfExists('empresas');
    }
};
