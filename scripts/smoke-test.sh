#!/bin/sh
# Smoke test post-deploiement : verifie que l'application repond.
# Usage : BASE_URL=http://localhost:8081 ./scripts/smoke-test.sh
set -eu

BASE_URL="${BASE_URL:-http://localhost:8080}"
MAX_RETRIES="${MAX_RETRIES:-15}"
RETRY_DELAY="${RETRY_DELAY:-2}"

check() {
  path="$1"
  attempt=1

  while [ "$attempt" -le "$MAX_RETRIES" ]; do
    if curl -fsS --max-time 5 "$BASE_URL$path" > /dev/null 2>&1; then
      echo "OK    $BASE_URL$path"
      return 0
    fi
    echo "WAIT  $BASE_URL$path (tentative $attempt/$MAX_RETRIES)"
    attempt=$((attempt + 1))
    sleep "$RETRY_DELAY"
  done

  echo "FAIL  $BASE_URL$path apres $MAX_RETRIES tentatives"
  return 1
}

echo "Smoke test sur $BASE_URL"
check /api/health
check /api/products

echo "Smoke test OK"
