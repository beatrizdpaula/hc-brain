@extends('layouts.auth', [
    'tela' => 'senha',
    'titulo' => 'Recuperar acesso',
    'descricao' => 'Receba por e-mail um link para definir uma nova senha.',
])

@section('conteudo')
  <div class="login-screen">
    <div class="login-card">
      <div class="login-brand">
        <div class="login-logo">HC</div>
        <div>
          <strong>HC Brain</strong>
          <span>Ambiente de conhecimento da Health Care</span>
        </div>
      </div>

      <h1 class="login-title">Recuperar acesso</h1>
      <p class="login-subtitle">
        Informe o e-mail da sua conta. Enviamos um link para você definir uma
        nova senha.
      </p>

      @if (session('status'))
        <div class="login-aviso" role="status">{{ session('status') }}</div>
      @endif

      <form method="POST" action="{{ route('senha.enviar') }}">
        @csrf

        <div class="login-field">
          <label for="senhaEmail">E-mail</label>
          <input
            id="senhaEmail"
            name="email"
            type="email"
            autocomplete="username"
            placeholder="Digite seu e-mail"
            value="{{ old('email') }}"
            required
          />
        </div>

        <button class="login-submit" type="submit">Enviar o link</button>

        @error('email')
          <div class="login-error show">{{ $message }}</div>
        @enderror
      </form>

      <div class="login-rodape">
        <a href="{{ route('login') }}">Voltar para a tela de entrada</a>
      </div>
    </div>
  </div>
@endsection
