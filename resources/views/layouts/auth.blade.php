{{-- A tela de entrada não tem menu nem barra superior: só o cartão de login. --}}
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <title>{{ $titulo }} • HC Brain</title>
    <meta name="description" content="{{ $descricao }}" />
    <link rel="icon" href="{{ asset('favicon.svg') }}" />

    @include('layouts.tema')

    @vite(\App\Support\Telas::assets($tela, ['base', 'modal']))
  </head>

  <body>
    @yield('conteudo')
  </body>
</html>
