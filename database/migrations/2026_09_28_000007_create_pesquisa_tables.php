<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resultados_pesquisa', function (Blueprint $table) {
            $table->id();
            $table->string('tipo');
            $table->string('area');
            $table->string('titulo');
            $table->text('texto');
            $table->string('meta');
            $table->unsignedInteger('ordem')->default(0);
            $table->timestamps();
        });

        Schema::create('sugestoes_sofia', function (Blueprint $table) {
            $table->id();
            $table->string('icone');
            $table->string('texto');
            $table->unsignedInteger('ordem')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sugestoes_sofia');
        Schema::dropIfExists('resultados_pesquisa');
    }
};
