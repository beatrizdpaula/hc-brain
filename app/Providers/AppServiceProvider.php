<?php

namespace App\Providers;

use App\Support\RespondePerguntas;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        /*
         * Quem responde pela Sofia sai da configuração, e não de um `new` no
         * meio do código: é por esta linha que a IA de vocês entra no lugar
         * da implementação padrão.
         */
        $this->app->bind(RespondePerguntas::class, (string) config('hc.sofia.ia.classe'));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
