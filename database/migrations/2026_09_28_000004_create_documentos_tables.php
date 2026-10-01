<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * O banco de documentos. A pasta é chave estrangeira, e não um nome repetido
 * em cada linha, para que renomear uma pasta não desgarre os arquivos dela.
 * O que a tela mostra ("Atualizado ontem • 1,8 MB") é montado na exibição a
 * partir do tamanho e do timestamp — a frase não é guardada.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pastas', function (Blueprint $table) {
            $table->id();
            $table->string('nome')->unique();
            $table->unsignedInteger('ordem')->default(0);
            $table->timestamps();
        });

        Schema::create('documentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pasta_id')->constrained('pastas')->cascadeOnDelete();
            $table->string('nome');
            $table->string('extensao', 16);
            /** Caminho dentro do disco configurado em `config/hc.php`. */
            $table->string('arquivo')->nullable();
            $table->unsignedBigInteger('tamanho')->default(0);
            $table->string('mime')->nullable();
            $table->foreignId('enviado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('pasta_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documentos');
        Schema::dropIfExists('pastas');
    }
};
