<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Um registro por período (AAAA-MM). Séries e rankings do painel são listas
 * fechadas daquele mês, então ficam em colunas JSON em vez de tabelas soltas.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('indicadores_comerciais', function (Blueprint $table) {
            $table->string('periodo')->primary();
            $table->unsignedInteger('leads');
            $table->unsignedInteger('qualified');
            $table->unsignedInteger('meetings');
            $table->unsignedInteger('proposals');
            $table->unsignedInteger('closed');
            $table->unsignedInteger('revenue');
            $table->unsignedInteger('average_ticket');
            $table->unsignedInteger('in_process');
            $table->json('monthly');
            $table->json('origins');
            $table->json('losses');
            $table->json('sales');
            $table->json('team');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('indicadores_comerciais');
    }
};
