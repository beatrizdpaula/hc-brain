<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pastas', function (Blueprint $table) {
            $table->id();
            $table->string('nome')->unique();
            $table->string('rotulo');
            $table->unsignedInteger('total');
            $table->unsignedInteger('ordem')->default(0);
            $table->timestamps();
        });

        Schema::create('documentos', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('exibicao');
            $table->string('tipo');
            $table->string('pasta');
            $table->string('detalhe');
            $table->unsignedInteger('ordem')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documentos');
        Schema::dropIfExists('pastas');
    }
};
