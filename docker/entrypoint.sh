#!/bin/bash
set -e

# Prepara diretorios essenciais
mkdir -p database storage/logs storage/framework/sessions storage/framework/views storage/framework/cache/data bootstrap/cache
touch database/database.sqlite

# Ajusta permissoes
chown -R www-data:www-data /app/public database storage bootstrap/cache
chmod -R 777 /app/public storage bootstrap/cache database

# Configura porta do Apache sem quebrar o ficheiro conf
sed -i "s/Listen 80/Listen ${PORT:-10000}/" /etc/apache2/ports.conf

# Links e Migracoes (ignora erros de URI se variaveis estiverem em transicao)
php artisan storage:link --force || true
rm -f bootstrap/cache/*.php || true
php artisan migrate:fresh --seed --force || true

# Inicia o Apache
exec apache2-foreground