#!/bin/sh
# Sauvegarde PostgreSQL horodatee + retention des 7 derniers dumps.
# Le dump est ecrit sur l'HOTE (dossier backups/), pas dans le container :
# meme si les containers sont detruits, les sauvegardes restent.
# Usage : ./scripts/backup.sh
set -eu

POSTGRES_USER="${POSTGRES_USER:-shoplite}"
POSTGRES_DB="${POSTGRES_DB:-shoplite}"
DB_SERVICE="${DB_SERVICE:-db}"
BACKUP_DIR="${BACKUP_DIR:-backups}"
RETENTION="${RETENTION:-7}"

mkdir -p "$BACKUP_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="$BACKUP_DIR/backup-$STAMP.sql"

echo "Sauvegarde de $POSTGRES_DB vers $OUT_FILE"
docker compose exec -T "$DB_SERVICE" \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$OUT_FILE"

SIZE="$(wc -c < "$OUT_FILE" | tr -d ' ')"
if [ "$SIZE" -lt 100 ]; then
  echo "ERREUR : dump anormalement petit ($SIZE octets), sauvegarde invalide"
  rm -f "$OUT_FILE"
  exit 1
fi
echo "Dump cree : $OUT_FILE ($SIZE octets)"

# Retention : on conserve les $RETENTION dumps les plus recents
OLD_DUMPS="$(ls -1t "$BACKUP_DIR"/backup-*.sql 2>/dev/null | tail -n +"$((RETENTION + 1))")"
if [ -n "$OLD_DUMPS" ]; then
  echo "Retention ($RETENTION) : suppression des anciens dumps :"
  echo "$OLD_DUMPS"
  echo "$OLD_DUMPS" | xargs rm -f
fi

echo "Dumps presents :"
ls -1t "$BACKUP_DIR"/backup-*.sql
