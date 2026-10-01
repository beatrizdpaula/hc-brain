@extends('layouts.auth', [
    'tela' => 'senha',
    'titulo' => 'Nova senha',
    'descricao' => 'Defina a nova senha do seu acesso ao HC Brain.',
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

      <h1 class="login-title">Definir nova senha</h1>
      <p class="login-subtitle">
        Escolha uma senha de pelo menos 8 caracteres. Ela passa a valer na
        próxima vez que você entrar.
      </p>

      <form method="POST" action="{{ route('senha.salvar') }}">
        @csrf
        <input type="hidden" name="token" value="{{ $token }}" />

        <div class="login-field">
          <label for="novaSenhaEmail">E-mail</label>
          <input
            id="novaSenhaEmail"
            name="email"
            type="email"
            autocomplete="username"
            value="{{ old('email', $email) }}"
            required
          />
        </div>

        <div class="login-field">
          <label for="novaSenha">Nova senha</label>
          <input
            id="novaSenha"
            name="password"
            type="password"
            autocomplete="new-password"
            minlength="8"
            placeholder="Mínimo de 8 caracteres"
            required
          />
        </div>

        <div class="login-field">
          <label for="novaSenhaConfirmacao">Repita a nova senha</label>
          <input
            id="novaSenhaConfirmacao"
            name="password_confirmation"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
          />
        </div>

        <button class="login-submit" type="submit">Salvar a nova senha</button>

        @error('email')
          <div class="login-error show">{{ $message }}</div>
        @enderror
        @error('password')
          <div class="login-error show">{{ $message }}</div>
        @enderror
      </form>

      <div class="login-rodape">
        <a href="{{ route('login') }}">Voltar para a tela de entrada</a>
      </div>
    </div>
  </div>
@endsection
