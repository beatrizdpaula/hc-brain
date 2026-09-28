<?php

use App\Http\Controllers\Api;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\TelaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| HC Brain
|--------------------------------------------------------------------------
| Cada tela tem a sua URL. Qualquer página sem sessão volta para o login
| guardando o destino pretendido, e a API que alimenta o TypeScript vive na
| mesma sessão do navegador — por isso ela fica aqui, e não em routes/api.php.
*/

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    // O limite é por IP e por e-mail: tentar mil senhas em um minuto não é
    // uso normal, e sem isso qualquer conta fica exposta a força bruta.
    Route::post('/login', [LoginController::class, 'store'])->middleware('throttle:10,1');
});

Route::post('/logout', [LoginController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/', [TelaController::class, 'inicio'])->name('inicio');
    Route::get('/pesquisa', [TelaController::class, 'pesquisa'])->name('pesquisa');
    Route::get('/documentos', [TelaController::class, 'documentos'])->name('documentos');
    Route::get('/sofia-ia', [TelaController::class, 'sofiaIa'])->name('sofia-ia');
    Route::get('/treinamentos', [TelaController::class, 'treinamentos'])->name('treinamentos');
    Route::get('/clientes', [TelaController::class, 'clientes'])->name('clientes');
    Route::get('/clientes/{empresa}', [TelaController::class, 'cliente'])->name('cliente');
    Route::get('/usuarios', [TelaController::class, 'usuarios'])->name('usuarios');
    Route::get('/comercial', [TelaController::class, 'comercial'])->name('comercial');
    Route::get('/reunioes', [TelaController::class, 'reunioes'])->name('reunioes');
    Route::get('/financeiro', [TelaController::class, 'financeiro'])->name('financeiro');
    Route::get('/projetos', [TelaController::class, 'projetos'])->name('projetos');
    Route::get('/processos', [TelaController::class, 'processos'])->name('processos');

    Route::prefix('api')->group(function () {
        Route::get('/contadores', [Api\ContadorController::class, 'index']);
        Route::get('/inicio', [Api\InicioController::class, 'index']);
        Route::get('/empresas', [Api\EmpresaController::class, 'index']);
        Route::get('/empresas/{empresa}', [Api\EmpresaController::class, 'show']);
        Route::get('/reunioes', [Api\ReuniaoController::class, 'index']);
        Route::get('/documentos', [Api\DocumentoController::class, 'index']);
        Route::get('/treinamentos', [Api\TreinamentoController::class, 'index']);
        Route::get('/projetos', [Api\ProjetoController::class, 'index']);
        Route::get('/processos', [Api\ProcessoController::class, 'index']);
        Route::get('/comercial/{periodo}', [Api\ComercialController::class, 'show']);
        Route::get('/financeiro', [Api\FinanceiroController::class, 'index']);
        Route::get('/pesquisa', [Api\PesquisaController::class, 'index']);
        Route::get('/usuarios', [Api\UsuarioController::class, 'index']);
        Route::post('/usuarios', [Api\UsuarioController::class, 'store']);
        Route::get('/sofia/sugestoes', [Api\SofiaController::class, 'sugestoes']);
        Route::post('/sofia/perguntar', [Api\SofiaController::class, 'perguntar']);
    });
});
