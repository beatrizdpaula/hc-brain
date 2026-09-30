FROM php:8.5-apache

WORKDIR /app

# Dependências do sistema e PHP
RUN apt-get update && \
    apt-get install -y \
        curl \
        ca-certificates \
        libicu-dev \
        libzip-dev \
        libsqlite3-dev \
        libonig-dev \
        libxml2-dev \
        libcurl4-openssl-dev \
        unzip \
        && rm -rf /var/lib/apt/lists/*

# Instala extensões PHP
RUN docker-php-ext-install \
    pdo_sqlite \
    bcmath \
    intl \
    zip

# Apache: habilita URLs do Laravel
RUN a2enmod rewrite

# Configura o Apache para a pasta public/
ENV APACHE_DOCUMENT_ROOT=/app/public

RUN sed -ri \
    -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/sites-available/000-default.conf \
    /etc/apache2/apache2.conf && \
    echo '<Directory /app/public>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' >> /etc/apache2/apache2.conf

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

# Dependências JS e Build do Vite
RUN npm install && npm run build

# Render usa PORT=10000 por padrão
EXPOSE 10000

CMD ["sh", "-c", "mkdir -p database storage/logs storage/framework/{cache,sessions,views} bootstrap/cache && touch database/database.sqlite && php artisan storage:link --force && chown -R www-data:www-data /app/public database storage bootstrap/cache && chmod -R 775 /app/public storage bootstrap/cache database && php artisan config:clear && php artisan route:clear && php artisan view:clear && php artisan migrate --force && sed -i \"s/Listen 80/Listen ${PORT:-10000}/\" /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf && sed -i \"s/<VirtualHost \\*:80>/<VirtualHost *:${PORT:-10000}>/\" /etc/apache2/sites-available/000-default.conf && apache2-foreground"]