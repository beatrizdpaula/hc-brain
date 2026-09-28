
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>" />
    <title><?php echo e($titulo); ?> • HC Brain</title>
    <meta name="description" content="<?php echo e($descricao); ?>" />
    <link rel="icon" href="<?php echo e(asset('favicon.svg')); ?>" />

    <?php echo app('Illuminate\Foundation\Vite')(\App\Support\Telas::assets($tela, ['base', 'modal'])); ?>
  </head>

  <body>
    <?php echo $__env->yieldContent('conteudo'); ?>
  </body>
</html>
<?php /**PATH C:\Users\beatr\Downloads\HC\hc-brain-laravel-v2\hc-brain-laravel\resources\views/layouts/auth.blade.php ENDPATH**/ ?>