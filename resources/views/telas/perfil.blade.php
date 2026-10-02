@extends('layouts.app', [
    'tela' => 'perfil',
    'titulo' => 'Meu perfil',
    'descricao' => 'Os dados da sua conta no HC Brain: perfil de acesso, área e último acesso.',
])

@section('conteudo')
  {{--
    Tela de leitura: o que está aqui é o cadastro de quem está logado, vindo
    do servidor junto com a página. Alterar o próprio acesso é outra decisão,
    então nenhum campo é editável.
  --}}
  <section class="page active" id="perfil">
    <div class="page-header">
      <div class="page-header-copy">
        <span class="page-overline">Conta • seus dados</span>
        <h1>Meu perfil</h1>
        <p class="muted">
          Como o HC Brain conhece você: o acesso que você tem, a área a que está
          vinculada e quando entrou pela última vez.
        </p>
      </div>
    </div>

    <div class="perfil-identidade">
      <span class="avatar perfil-avatar" aria-hidden="true">{{ $usuario->iniciais }}</span>
      <div class="perfil-identidade-texto">
        <h2>{{ $usuario->name }}</h2>
        <p>{{ $usuario->email }}</p>
      </div>
      <div class="perfil-identidade-tags">
        <span class="tag gray">{{ $usuario->perfil }}</span>
        <span class="tag {{ $usuario->status === 'Ativo' ? 'green' : 'red' }}">
          {{ $usuario->status }}
        </span>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <h2>Dados da conta</h2>
        <span class="panel-count">Somente leitura</span>
      </div>
      <div class="panel-body">
        <dl class="perfil-dados">
          <div>
            <dt>Nome</dt>
            <dd>{{ $usuario->name }}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{{ $usuario->email }}</dd>
          </div>
          <div>
            <dt>Perfil de acesso</dt>
            <dd><span class="tag gray">{{ $usuario->perfil }}</span></dd>
          </div>
          <div>
            <dt>Área</dt>
            <dd>{{ $usuario->area ?: 'Não informada' }}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <span class="tag {{ $usuario->status === 'Ativo' ? 'green' : 'red' }}">
                {{ $usuario->status }}
              </span>
            </dd>
          </div>
          <div>
            <dt>Último acesso</dt>
            {{-- Quem nunca entrou não tem data: o texto vem pronto do servidor. --}}
            <dd class="perfil-acesso">{{ $ultimoAcesso }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <h2>Acesso e segurança</h2>
      </div>
      <div class="panel-body">
        <p class="muted perfil-nota">
          O perfil, a área e o status são definidos por quem administra o HC Brain na
          tela de Usuários — é lá que também se define uma nova senha para alguém da
          equipe. Se algum dado acima estiver errado, fale com quem administra.
        </p>
        <a class="secondary" href="{{ route('usuarios') }}">
          <i data-lucide="users"></i>
          Abrir Usuários
        </a>
      </div>
    </div>
  </section>
@endsection
