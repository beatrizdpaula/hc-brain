<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * O id da empresa no automacao-2-hc. É por ele que a sincronização reconhece
 * uma empresa que já veio antes, mesmo que o nome tenha mudado por lá; as
 * cadastradas direto no HC Brain ficam com ele nulo.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->unsignedBigInteger('automacao_id')->nullable()->unique()->after('id');
        });
    }

    public function down(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->dropUnique(['automacao_id']);
            $table->dropColumn('automacao_id');
        });
    }
};
