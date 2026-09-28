{{--
  SHELL DAS PÁGINAS
  Menu lateral, barra superior e modais são iguais em todas as telas, e são
  montados pelo TypeScript a partir do pacote entregue aqui em `window.HC_BRAIN`.
  Por isso o Blade de cada tela só traz o conteúdo dela.
--}}
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <title>{{ $titulo }} • HC Brain</title>
    <meta name="description" content="{{ $descricao }}" />
    <link rel="icon" href="{{ asset('favicon.svg') }}" />

    <script>
      window.HC_BRAIN = @json(\App\Support\Bootstrap::paraNavegador(auth()->user()));
    </script>

    @vite(\App\Support\Telas::assets($tela))
  </head>

  <body>
    <div class="app">
      <aside class="sidebar" data-sidebar></aside>

      <main class="main">
        <header class="topbar" data-topbar></header>

        @yield('conteudo')
      </main>
    </div>

    {{-- Sair é uma ação que muda estado, então sai por POST com o token da sessão. --}}
    <form method="POST" action="{{ route('logout') }}" data-form-sair hidden>@csrf</form>
  </body>
</html>
