
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>" />
    <title><?php echo e($titulo); ?> • HC Brain</title>
    <meta name="description" content="<?php echo e($descricao); ?>" />
    <link rel="icon" href="<?php echo e(asset('favicon.svg')); ?>" />

    <script>
      window.HC_BRAIN = <?php echo json_encode(\App\Support\Bootstrap::paraNavegador(auth()->user()), 15, 512) ?>;
    </script>

    <?php echo app('Illuminate\Foundation\Vite')(\App\Support\Telas::assets($tela)); ?>
  </head>

  <body>
    <div class="app">
      <aside class="sidebar" data-sidebar></aside>

      <main class="main">
        <header class="topbar" data-topbar></header>

        <?php echo $__env->yieldContent('conteudo'); ?>
      </main>
    </div>

    
    <form method="POST" action="<?php echo e(route('logout')); ?>" data-form-sair hidden><?php echo csrf_field(); ?></form>
  </body>
</html>
<?php /**PATH C:\Users\beatr\Downloads\HC\hc-brain-laravel-v2\hc-brain-laravel\resources\views/layouts/app.blade.php ENDPATH**/ ?>