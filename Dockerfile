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
        libpq-dev \
        libonig-dev \
        libxml2-dev \
        libcurl4-openssl-dev \
        unzip \
        && rm -rf /var/lib/apt/lists/*

# Instala extensões PHP
RUN docker-php-ext-install \
    pdo_sqlite \
    pdo_pgsql \
    bcmath \
    intl \
    zip

# Apache: habilita URLs do Laravel
RUN a2enmod rewrite

# Copia a configuração do Apache
COPY docker/vhost.conf /etc/apache2/sites-available/000-default.conf

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

# Torna o script de entrada executavel
RUN chmod +x docker/entrypoint.sh

# Render usa PORT=10000 por padrão
EXPOSE 10000

ENTRYPOINT ["docker/entrypoint.sh"]