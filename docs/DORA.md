# Fiche DORA — ShopLite

Les 4 indicateurs DORA mesures sur la duree du TP (donnees reelles du depot :
PRs #10 a #18, runs GitHub Actions, incident du 2026-06-12).

## 1. Lead time for changes (delai commit -> production)

**Mesure : < 1 heure** entre l'ouverture d'une PR et son deploiement staging.

Chaque PR suit le meme chemin : commit -> CI (lint, tests matrix, audit, build,
Trivy ~3 min) -> review par le binome -> merge sur develop -> deploiement
staging automatique (~2 min). Le passage en production demande en plus un tag
`v*` et une approbation manuelle (exemple v1.0.0 : merge release + tag +
validation = ~10 minutes).

## 2. Deployment frequency (frequence de deploiement)

**Mesure : un deploiement staging par merge sur develop** (5 deploiements
staging automatiques depuis la mise en place de la CD) **+ 1 deploiement
production simulee** (v1.0.0, valide manuellement).

La frequence est pilotee par le flux de PR : chaque feature mergee est deployee
immediatement en staging, sans action manuelle.

## 3. MTTR (Mean Time To Recovery)

**Mesure : ~1 minute** sur l'incident controle du 2026-06-12
(voir docs/INCIDENT.md) :

- 13:31:02 detection (smoke test rouge sur /api/products)
- 13:31:45 service retabli apres `git revert` + `./scripts/rollback.sh v1.0.0`

Le MTTR est court parce que les conditions etaient preparees : image stable
taguee disponible, script de rollback teste, backup recent, smoke test
automatise pour confirmer le retablissement.

## 4. Change failure rate (taux d'echec des changements)

**Mesure : 2 echecs sur 9 livraisons ~ 22 %.**

| Echec | Cause | Correction |
|---|---|---|
| 1er deploiement staging (PR #12) | bit executable manquant sur smoke-test.sh (exit 126) | PR #13 (`git update-index --chmod=+x`) |
| Incident catalogue (PR #16) | colonne SQL inexistante (incident controle) | revert + rollback v1.0.0 |

Lecture honnete : le second echec etait volontaire (scenario impose par le TP).
Hors incident controle, le taux reel est de 1/9 ~ 11 %, detecte et corrige en
moins de 30 minutes grace au smoke test post-deploiement.
