<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reunioes', function (Blueprint $table) {
            $table->id();
            $table->string('empresa_id');
            $table->string('tipo');
            $table->date('data');
            // O horário ainda não é registrado na base; a agenda mostra "—" sem ele.
            $table->string('horario')->nullable();
            $table->string('responsavel');
            $table->json('participantes');
            $table->text('resumo');
            $table->json('decisoes');
            $table->json('proximos_passos');
            $table->string('status');
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reunioes');
    }
};
