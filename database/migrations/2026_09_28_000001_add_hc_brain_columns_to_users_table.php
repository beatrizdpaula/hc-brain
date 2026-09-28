<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('perfil')->default('Colaborador');
            $table->string('area')->default('Gestão');
            $table->string('status')->default('Ativo');
            // Data, não texto: "Hoje, 10:42" é como a tela mostra, e isso é
            // decisão de apresentação — quem guarda o instante é o banco.
            $table->timestamp('ultimo_acesso')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['perfil', 'area', 'status', 'ultimo_acesso']);
        });
    }
};
