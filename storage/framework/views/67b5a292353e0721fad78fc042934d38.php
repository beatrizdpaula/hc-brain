
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?php echo $__env->yieldContent('titulo'); ?> • HC Brain</title>
    <link rel="icon" href="<?php echo e(asset('favicon.svg')); ?>" />

    <?php echo app('Illuminate\Foundation\Vite')(['resources/css/comum/base.css', 'resources/css/erro.css']); ?>
  </head>

  <body>
    <main class="erro">
      <div class="erro-card">
        <span class="erro-marca">
          <span class="erro-marca-mark">HC</span>
          HC Brain
        </span>

        <p class="erro-codigo"><?php echo $__env->yieldContent('codigo'); ?></p>
        <h1><?php echo $__env->yieldContent('titulo'); ?></h1>
        <p class="erro-texto"><?php echo $__env->yieldContent('texto'); ?></p>

        <a class="erro-voltar" href="<?php echo e(url('/')); ?>">Voltar para o início</a>
      </div>
    </main>
  </body>
</html>
<?php /**PATH C:\Users\beatr\Downloads\HC\hc-brain-laravel-v2\hc-brain-laravel\resources\views/errors/layout.blade.php ENDPATH**/ ?>