#!/bin/sh
set -e

cd /var/www/html

# Estructura de storage (el volumen puede llegar vacío)
mkdir -p storage/app/public storage/app/private storage/framework/cache/data \
         storage/framework/sessions storage/framework/views storage/logs
chown -R www-data:www-data storage bootstrap/cache

artisan() { runuser -u www-data -- php artisan "$@"; }

[ -L public/storage ] || php artisan storage:link --no-interaction

# Solo el contenedor web ejecuta migraciones (RUN_MIGRATIONS=true)
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    artisan migrate --force --no-interaction
fi

artisan optimize

# Apache baja privilegios por sí mismo; el resto (queue, artisan) corre como www-data
if [ "$1" = "apache2-foreground" ]; then
    exec "$@"
fi
exec runuser -u www-data -- "$@"
