#!/bin/sh
# Espera a que PostgreSQL esté listo antes de sembrar e iniciar la app.
echo "Esperando a PostgreSQL en $DB_HOST:$DB_PORT..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE" > /dev/null 2>&1; do
  echo "PostgreSQL no está listo, reintentando en 2s..."
  sleep 2
done
echo "PostgreSQL listo."

echo "Ejecutando seeder (idempotente)..."
npx tsx src/scripts/seed.ts

echo "Iniciando aplicación..."
exec node dist/main
