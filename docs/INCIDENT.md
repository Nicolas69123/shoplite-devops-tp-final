# Rapport d'incident — catalogue produits indisponible

## Resume

| Champ | Valeur |
|---|---|
| Date | 2026-06-12 |
| Severite | Majeure (fonctionnalite coeur indisponible) |
| Duree | ~1 minute (incident controle, detection a retablissement) |
| Statut | Clos — service retabli, zero perte de donnees |
| Versions | v1.0.0 (stable) -> version cassee -> rollback v1.0.0 |

## Impact

La route `GET /api/products` repondait **500 Internal Server Error** : le
catalogue ne s'affichait plus sur le frontend. `GET /api/health` restait en 200
(API vivante, base joignable) — seule la requete produits etait cassee.

## Timeline

| Heure | Action | Responsable | Resultat |
|---|---|---|---|
| 13:30:30 | Etat sain verifie : smoke test OK, backup pre-incident (2 357 o), products = 3 | DBA | reference saine |
| 13:30:54 | Deploiement de la version cassee (commit `feat: expose le prix remise`) | DevOps | incident demarre |
| 13:31:02 | Detection : smoke test FAIL sur /api/products, curl = 500 | QA | test rouge |
| 13:31:25 | Diagnostic logs JSON : `column "price_discounted" does not exist` + `git diff v1.0.0` (1 ligne) | DevOps + Dev API | cause identifiee |
| 13:31:40 | `git revert` du commit fautif | Dev API | code corrige |
| 13:31:40 | `./scripts/rollback.sh v1.0.0` : logs archives, bascule image, smoke OK | DevOps | service retabli |
| 13:31:45 | Verification : products = 3 avant et apres, CI verte sur le revert | QA + DBA | incident clos |

## Cause racine

Le commit `feat: expose le prix remise dans le catalogue produits` referencait
une colonne SQL inexistante (`price_discounted`) dans la requete de
`/api/products`. La table `products` ne possede pas cette colonne : chaque
requete levait une erreur PostgreSQL, transformee en 500 par l'error handler.

## Detection

- Test automatise `GET /products` : **rouge** en CI sur le commit fautif
  (run CI failure), **vert** sur le revert — preuve : PR #16.
- Smoke test post-deploiement : FAIL sur `/api/products`.
- Logs JSON : niveau `error`, message explicite, request_id correle.

## Correction

1. `git revert` du commit fautif (l'historique conserve l'incident ET sa
   correction — pas de force push).
2. Rollback applicatif vers l'image taguee `shoplite-api:v1.0.0` via
   `./scripts/rollback.sh v1.0.0`, **sans toucher au volume PostgreSQL**
   (`docker compose down -v` interdit et non utilise).
3. Verification : smoke test vert, 3 produits avant = 3 produits apres.

## Prevention

- Le test d'integration `/products` contre PostgreSQL reel est obligatoire en
  CI (bloquant) : toute requete SQL invalide est detectee avant le merge.
- Toute evolution de schema doit modifier `database/init.sql` dans la meme PR
  que le code qui l'utilise (modification SQL non destructive).
- Le rollback par image taguee est documente et scripte : MTTR ~1 minute.

## Communication (message type)

> **[INCIDENT - clos]** Catalogue indisponible de 13:30 a 13:32.
> Impact : /api/products en erreur 500, sante API non affectee.
> Cause : colonne SQL inexistante introduite par la derniere livraison.
> Action : revert du commit + rollback vers v1.0.0, donnees intactes.
> Statut : service retabli, test de non-regression vert.
