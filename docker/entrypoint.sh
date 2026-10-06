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

# Atualiza o schema sem apagar nada: o Render reinicia o contêiner sozinho, e
# um `migrate:fresh` aqui levaria junto tudo o que foi cadastrado pelo site.
php artisan migrate --force

# Semeia só se a base estiver vazia e garante o acesso inicial do ambiente.
php artisan hc:preparar

# O agendador (sincronização de empresas, de hora em hora) roda ao lado do
# Apache e como o mesmo usuário dele, para que o que ele grava em storage
# continue acessível ao site.
runuser -u www-data -- php artisan schedule:work &

# Inicia o servidor Apache
exec apache2-foreground