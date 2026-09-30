#!/bin/bash
set -e

# Prepara diretórios essenciais
mkdir -p database storage/logs storage/framework/sessions storage/framework/views storage/framework/cache/data bootstrap/cache
touch database/database.sqlite

# Limpa caches antigas do bootstrap que possam conter a URL antiga
rm -f bootstrap/cache/*.php

# Ajusta permissões dos diretórios
chown -R www-data:www-data /app/public database storage bootstrap/cache
chmod -R 777 /app/public storage bootstrap/cache database

# Configura a porta no Apache
sed -i "s/Listen 80/Listen ${PORT:-10000}/" /etc/apache2/ports.conf

# Força a execução das migrações e seeders
php artisan migrate:fresh --seed --force

# Inicia o servidor Apache
exec apache2-foreground