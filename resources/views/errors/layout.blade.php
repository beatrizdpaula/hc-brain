{{--
  MOLDE DAS PÁGINAS DE ERRO
  Quando algo dá errado, a pessoa continua dentro do HC Brain: mesma marca,
  mesma tipografia e um caminho de volta claro. A folha é só a base, porque
  aqui não há menu, barra superior nem dados para carregar.
--}}
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@yield('titulo') • HC Brain</title>
    <link rel="icon" href="{{ asset('favicon.svg') }}" />

    @vite(['resources/css/comum/base.css', 'resources/css/erro.css'])
  </head>

  <body>
    <main class="erro">
      <div class="erro-card">
        <span class="erro-marca">
          <span class="erro-marca-mark">HC</span>
          HC Brain
        </span>

        <p class="erro-codigo">@yield('codigo')</p>
        <h1>@yield('titulo')</h1>
        <p class="erro-texto">@yield('texto')</p>

        <a class="erro-voltar" href="{{ url('/') }}">Voltar para o início</a>
      </div>
    </main>
  </body>
</html>
