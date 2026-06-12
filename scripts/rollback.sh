#!/bin/sh
# Rollback de l'API vers une image STABLE taguee, sans toucher aux donnees.
# Regle absolue : jamais "docker compose down -v" (les volumes PostgreSQL
# doivent survivre au rollback).
# Usage : ./scripts/rollback.sh v1.0.0
set -eu

if [ $# -lt 1 ]; then
  echo "Usage : $0 <version-cible>   (ex: $0 v1.0.0)"
  exit 1
fi

TARGET="$1"
IMAGE="shoplite-api:$TARGET"
COMPOSE_API_IMAGE="shoplite-devops-tp-final-api:latest"
LOG_DIR="${LOG_DIR:-logs}"
POSTGRES_USER="${POSTGRES_USER:-shoplite}"
POSTGRES_DB="${POSTGRES_DB:-shoplite}"

mkdir -p "$LOG_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"

echo "=== 1. Sauvegarde des logs API avant intervention ==="
docker compose logs --no-color api > "$LOG_DIR/api-before-rollback-$STAMP.log" 2>&1 || true
echo "Logs sauvegardes : $LOG_DIR/api-before-rollback-$STAMP.log"

echo "=== 2. Version actuellement deployee ==="
docker inspect --format '{{.Image}} (demarre {{.State.StartedAt}})' shoplite_api || true

echo "=== 3. Verification de l'image stable $IMAGE ==="
if ! docker image inspect "$IMAGE" > /dev/null 2>&1; then
  echo "ERREUR : l'image $IMAGE n'existe pas en local."
  echo "Images shoplite disponibles :"
  docker images --format '{{.Repository}}:{{.Tag}}' | grep shoplite || true
  exit 1
fi
echo "Image stable presente."

echo "=== 4. Donnees AVANT rollback ==="
COUNT_BEFORE="$(docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tA -c 'SELECT COUNT(*) FROM products')"
echo "products = $COUNT_BEFORE lignes"

echo "=== 5. Bascule de l'API sur l'image $TARGET (volumes intacts) ==="
docker tag "$IMAGE" "$COMPOSE_API_IMAGE"
docker compose up -d --no-build api

echo "=== 6. Smoke test post-rollback ==="
BASE_URL="${BASE_URL:-http://localhost:8080}" ./scripts/smoke-test.sh

echo "=== 7. Donnees APRES rollback ==="
COUNT_AFTER="$(docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tA -c 'SELECT COUNT(*) FROM products')"
echo "products = $COUNT_AFTER lignes"

if [ "$COUNT_BEFORE" != "$COUNT_AFTER" ]; then
  echo "ALERTE : nombre de lignes different avant/apres ($COUNT_BEFORE -> $COUNT_AFTER)"
  exit 1
fi

echo ""
echo "ROLLBACK OK : API sur $TARGET, $COUNT_AFTER produits, aucune perte de donnees."
