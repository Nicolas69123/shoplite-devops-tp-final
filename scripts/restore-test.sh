#!/bin/sh
# Teste la restauration d'un dump dans une base TEMPORAIRE.
# Un backup non restaurable ne sert a rien : ce script prouve que le dump
# est exploitable, sans toucher a la base de production.
# Usage : ./scripts/restore-test.sh [chemin/du/dump.sql]
#         (par defaut : le dump le plus recent de backups/)
set -eu

POSTGRES_USER="${POSTGRES_USER:-shoplite}"
DB_SERVICE="${DB_SERVICE:-db}"
BACKUP_DIR="${BACKUP_DIR:-backups}"
TEST_DB="shoplite_restore_test"

DUMP_FILE="${1:-$(ls -1t "$BACKUP_DIR"/backup-*.sql 2>/dev/null | head -1)}"
if [ -z "$DUMP_FILE" ] || [ ! -f "$DUMP_FILE" ]; then
  echo "ERREUR : aucun dump trouve (lancez ./scripts/backup.sh d'abord)"
  exit 1
fi
echo "Test de restauration du dump : $DUMP_FILE"

# Base temporaire propre
docker compose exec -T "$DB_SERVICE" \
  psql -U "$POSTGRES_USER" -d postgres \
  -c "DROP DATABASE IF EXISTS $TEST_DB" -c "CREATE DATABASE $TEST_DB" > /dev/null

# Restauration du dump dans la base temporaire
docker compose exec -T "$DB_SERVICE" \
  psql -U "$POSTGRES_USER" -d "$TEST_DB" --quiet < "$DUMP_FILE" > /dev/null

# Verification : la table products doit exister et contenir des lignes
COUNT="$(docker compose exec -T "$DB_SERVICE" \
  psql -U "$POSTGRES_USER" -d "$TEST_DB" -tA \
  -c "SELECT COUNT(*) FROM products")"

# Nettoyage de la base temporaire
docker compose exec -T "$DB_SERVICE" \
  psql -U "$POSTGRES_USER" -d postgres \
  -c "DROP DATABASE $TEST_DB" > /dev/null

if [ "$COUNT" -ge 1 ]; then
  echo "RESTAURATION OK : $COUNT produits restaures dans $TEST_DB"
else
  echo "ERREUR : la table products est vide apres restauration"
  exit 1
fi
