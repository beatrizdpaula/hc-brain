FROM php:8.5-apache

WORKDIR /app

# Dependências do sistema e PHP
RUN apt-get update && \
    apt-get install -y \
        curl \
        ca-certificates \
        libicu-dev \
        libzip-dev \
        libxml2-dev \
        libcurl4-openssl-dev \
        unzip \
        && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install \
    pdo_sqlite \
    mbstring \
    bcmath \
    intl \
    zip \
    opcache \
    curl \
    xml

# Apache: habilita URLs do Laravel
RUN a2enmod rewrite

# Faz o Apache servir a pasta public/
ENV APACHE_DOCUMENT_ROOT=/app/public

RUN sed -ri \
    -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/sites-available/000-default.conf \
    /etc/apache2/apache2.conf

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Node.js + npm
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copia o projeto
COPY . .

# Dependências PHP
RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction

# Banco SQLite
RUN touch database/database.sqlite

# Cria as tabelas
RUN php artisan migrate --force

# Dependências JavaScript
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

# Limpa os caches
RUN php artisan optimize:clear

# Render usa PORT=10000 por padrão
EXPOSE 10000

CMD ["sh", "-c", "php artisan migrate --force && sed -i \"s/Listen 80/Listen ${PORT:-10000}/\" /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf && sed -i \"s/<VirtualHost \\*:80>/<VirtualHost *:${PORT:-10000}>/\" /etc/apache2/sites-available/000-default.conf && apache2-foreground"]