# Use PHP 8.1 as the base image
FROM php:8.1-cli

# Install necessary dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    git \
    unzip \
    libzip-dev && \
    docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install gd zip pdo pdo_mysql

# Set the working directory to /var/www
WORKDIR /var/www

# Copy composer from the official composer image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy Laravel application files into the container
COPY . /var/www/

# Set the proper permissions for Laravel files
RUN chown -R www-data:www-data /var/www && \
    chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Install PHP dependencies using Composer
RUN composer install --no-dev --optimize-autoloader

# Install npm dependencies and build assets
RUN npm install --legacy-peer-deps && npm run build

# Expose the Railway PORT environment variable
ARG PORT
ENV PORT=${PORT:-8000}
EXPOSE ${PORT}

# Start Laravel's built-in server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=${PORT}"]
