

<?php $__env->startSection('conteudo'); ?>
  <div class="login-screen" id="loginScreen">
    <div class="login-card">
      <div class="login-brand">
        <div class="login-logo">HC</div>
        <div>
          <strong>HC Brain</strong>
          <span>Ambiente de conhecimento da Health Care</span>
        </div>
      </div>

      <h1 class="login-title">Entrar no HC Brain</h1>
      <p class="login-subtitle">
        Acesse a memória central da HC, empresas, reuniões, documentos, treinamentos,
        financeiro e a Sofia.
      </p>

      <?php if(session('status')): ?>
        <div class="login-aviso" role="status"><?php echo e(session('status')); ?></div>
      <?php endif; ?>

      <form id="loginForm" method="POST" action="<?php echo e(route('login')); ?>">
        <?php echo csrf_field(); ?>

        <div class="login-field">
          <label for="loginEmail">E-mail</label>
          <input
            id="loginEmail"
            name="email"
            type="email"
            autocomplete="username"
            placeholder="Digite seu e-mail"
            value="<?php echo e(old('email', $emailLembrado)); ?>"
            required
          />
        </div>

        <div class="login-field">
          <label for="loginPassword">Senha</label>
          <input
            id="loginPassword"
            name="password"
            type="password"
            autocomplete="current-password"
            placeholder="Digite sua senha"
            required
          />
        </div>

        <div class="login-options">
          <label class="login-check">
            <input id="rememberLogin" name="remember" type="checkbox" value="1"
                   <?php if(old('remember', $emailLembrado !== null)): echo 'checked'; endif; ?> />
            <span>Lembrar meu acesso</span>
          </label>
          <a class="login-link" href="<?php echo e(route('senha.solicitar')); ?>">
            Esqueci minha senha
          </a>
        </div>

        <button class="login-submit" type="submit">Entrar no HC Brain</button>

        <div class="login-error <?php $__errorArgs = ['email'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> show <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>" id="loginError">
          <?php $__errorArgs = ['email'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><?php echo e($message); ?><?php else: ?> E-mail ou senha incorretos. Verifique os dados e tente novamente. <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
        </div>
      </form>
    </div>
  </div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.auth', [
    'tela' => 'login',
    'titulo' => 'Entrar',
    'descricao' => 'Acesse a memória central da Health Care.',
], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\beatr\Downloads\HC\hc-brain-laravel-v2\hc-brain-laravel\resources\views/telas/login.blade.php ENDPATH**/ ?>