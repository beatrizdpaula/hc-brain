@extends('layouts.app', [
    'tela' => 'usuarios',
    'titulo' => 'Usuários',
    'descricao' => 'Usuários com acesso ao HC Brain, perfis, áreas e últimos acessos.',
])

@section('conteudo')
  {{-- Gerenciamento dos usuários e acessos da equipe. --}}
  <section class="page active" id="usuarios">
    <div class="page-header">
      <div class="page-header-copy">
        <span class="page-overline">Acesso • equipe da HC</span>
        <h1>Usuários</h1>
        <p class="muted">
          Gerencie os usuários que possuem acesso ao HC Brain e acompanhe seus perfis
          e últimos acessos.
        </p>
      </div>

      <div class="page-header-actions">
        <button class="primary" id="novoUsuarioBtn" type="button">Cadastrar usuário</button>
      </div>
    </div>

    <div class="usuarios-summary">
      <div class="usuario-kpi">
        <span>Total de usuários</span><strong id="usuariosTotal">0</strong>
      </div>
      <div class="usuario-kpi">
        <span>Usuários ativos</span><strong id="usuariosAtivos">0</strong>
      </div>
      <div class="usuario-kpi">
        <span>Administradores</span><strong id="usuariosAdmins">0</strong>
      </div>
      <div class="usuario-kpi">
        <span>Último acesso</span><strong id="usuariosUltimo" class="usuario-kpi-texto">—</strong>
      </div>
    </div>

    <div class="filtros">
      <div class="campo">
        <label for="usuarioSearch">Pesquisar usuário</label>
        <input id="usuarioSearch" placeholder="Nome, e-mail ou área..." autocomplete="off" />
      </div>
      <div class="campo">
        <label for="usuarioRoleFilter">Perfil</label>
        <select id="usuarioRoleFilter">
          <option value="Todos">Todos os perfis</option>
          <option value="Administrador">Administrador</option>
          <option value="Gestor">Gestor</option>
          <option value="Colaborador">Colaborador</option>
        </select>
      </div>
      <div class="campo">
        <label for="usuarioStatusFilter">Status</label>
        <select id="usuarioStatusFilter">
          <option value="Todos">Todos</option>
          <option value="Ativo">Ativos</option>
          <option value="Inativo">Inativos</option>
        </select>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <h2>Usuários cadastrados</h2>
        <span class="panel-count" id="usuariosCount">0 usuários</span>
      </div>
      <div class="tabela-wrap">
        <table class="tabela usuarios-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Perfil</th>
              <th>Área</th>
              <th>Status</th>
              <th>Último acesso</th>
            </tr>
          </thead>
          <tbody id="usuariosTableBody">
            <tr>
              <td colspan="5">
                <div class="estado-carregando">Carregando usuários…</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  {{-- MODAL CADASTRO DE USUÁRIO --}}
  <div class="modal" id="novoUsuarioModal" role="dialog" aria-modal="true" aria-labelledby="novoUsuarioTitulo">
    <div class="modal-box">
      <button class="icon-button close" id="fecharNovoUsuario" type="button" aria-label="Fechar"><i data-lucide="x"></i></button>
      <h2 id="novoUsuarioTitulo">Cadastrar novo usuário</h2>
      <p>
        Adicione uma pessoa ao ambiente do HC Brain e defina o perfil e a área de acesso.
      </p>
      <form id="novoUsuarioForm">
        <div class="usuario-form-grid">
          <div class="campo">
            <label for="novoUsuarioNome">Nome completo</label>
            <input id="novoUsuarioNome" required placeholder="Ex.: João da Silva" />
          </div>
          <div class="campo">
            <label for="novoUsuarioEmail">E-mail</label>
            <input id="novoUsuarioEmail" type="email" required placeholder="joao@healthcare.com.br" />
          </div>
          <div class="campo">
            <label for="novoUsuarioPerfil">Perfil</label>
            <select id="novoUsuarioPerfil">
              <option>Administrador</option>
              <option>Gestor</option>
              <option selected>Colaborador</option>
            </select>
          </div>
          <div class="campo">
            <label for="novoUsuarioArea">Área</label>
            <select id="novoUsuarioArea">
              <option>Gestão</option>
              <option>Comercial</option>
              <option>Operações</option>
              <option>Atendimento</option>
              <option>Financeiro</option>
              <option>Projetos</option>
            </select>
          </div>
          <div class="campo">
            <label for="novoUsuarioStatus">Status</label>
            <select id="novoUsuarioStatus">
              <option selected>Ativo</option>
              <option>Inativo</option>
            </select>
          </div>
          <div class="campo">
            <label for="novoUsuarioSenha">Senha inicial</label>
            <input
              id="novoUsuarioSenha"
              type="password"
              required
              minlength="6"
              autocomplete="new-password"
              placeholder="Mínimo de 6 caracteres"
            />
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="secondary" id="cancelarNovoUsuario">Cancelar</button>
          <button type="submit" class="primary">Cadastrar usuário</button>
        </div>
      </form>
    </div>
  </div>
@endsection
