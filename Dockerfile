FROM dunglas/frankenphp:php8.5

WORKDIR /app

# Extensões PHP
RUN install-php-extensions \
    pdo_sqlite \
    mbstring \
    bcmath \
    intl \
    zip \
    opcache

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Node.js + npm
RUN apt-get update && \
    apt-get install -y curl ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copia o projeto
COPY . .

# Dependências do Laravel
RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction

# Cria o banco SQLite
RUN touch database/database.sqlite

# Cria as tabelas do banco
RUN php artisan migrate --force

# Dependências do JavaScript
RUN npm install

# Compila TypeScript + Vite
RUN npm run build

# Pastas necessárias do Laravel
RUN mkdir -p \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    bootstrap/cache

RUN chmod -R 775 storage bootstrap/cache

# Limpa caches
RUN php artisan optimize:clear

# Porta do Render
EXPOSE 10000

# Inicia o Laravel
CMD ["sh", "-c", "php artisan migrate --force && frankenphp php-server --listen 0.0.0.0:${PORT:-10000} -r public/"]