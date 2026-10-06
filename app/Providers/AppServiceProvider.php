<?php

namespace App\Providers;

use Illuminate\Foundation\DevCommands;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // O `php artisan dev` sobe o agendador junto, para a sincronização de
        // empresas rodar no desenvolvimento como roda no servidor.
        if ($this->app->runningInConsole()) {
            DevCommands::artisan('schedule:work', 'scheduler');
        }
    }
}
