# ShopLite — TP final integrateur DevOps

[![CI](https://github.com/Nicolas69123/shoplite-devops-tp-final/actions/workflows/ci.yml/badge.svg)](https://github.com/Nicolas69123/shoplite-devops-tp-final/actions/workflows/ci.yml)
[![CD](https://github.com/Nicolas69123/shoplite-devops-tp-final/actions/workflows/cd.yml/badge.svg)](https://github.com/Nicolas69123/shoplite-devops-tp-final/actions/workflows/cd.yml)

Mini application e-commerce (API Node.js/Express + frontend statique +
PostgreSQL) industrialisee de bout en bout : Git, Docker, Compose, CI/CD,
environnements, observabilite, securite, backup et rollback sans perte de
donnees.

**Equipe** : [@Nicolas69123](https://github.com/Nicolas69123) ·
[@Aho0000](https://github.com/Aho0000) —
[suivi des taches (GitHub Project)](https://github.com/users/Nicolas69123/projects/3)

## Lancement rapide (dev)

```bash
docker compose up -d --build
```

| Quoi | URL |
|---|---|
| Application | http://localhost:8080 |
| Sante (liveness) | http://localhost:8080/api/health |
| Readiness | http://localhost:8080/api/ready |
| Catalogue | http://localhost:8080/api/products |

Arret sans perte de donnees : `docker compose down` (jamais `-v` : le volume
PostgreSQL `shoplite_pgdata` doit survivre).

## Environnements

| Env | Commande | URL | Deploiement CD |
|---|---|---|---|
| dev | `docker compose up -d --build` | http://localhost:8080 | manuel |
| staging | `docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d` | http://localhost:8081 | auto sur push `develop` |
| production simulee | `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d` | http://localhost:8082 | tag `v*` + approbation manuelle |

Les secrets reels vivent dans les GitHub Secrets de chaque environment
(staging / production), jamais dans le code. Voir `.env.example` pour les
variables attendues.

## Tests et qualite

```bash
cd api
npm ci
npm test            # Jest, couverture bloquante a 80%
npm run lint        # ESLint
npm run format:check
```

Les tests d'integration `/products` utilisent un PostgreSQL reel
(`DATABASE_URL`). En CI, un service PostgreSQL 16 est demarre automatiquement
et les tests tournent sur Node 20 et 22.

## CI/CD

- **CI** (`.github/workflows/ci.yml`) : lint + format, tests matrix Node 20/22
  contre PostgreSQL, audit des dependances, build des images Docker, scan
  Trivy (HIGH/CRITICAL bloquant).
- **CD** (`.github/workflows/cd.yml`) : deploiement staging automatique a
  chaque merge sur `develop` ; production simulee uniquement sur tag `v*`
  apres approbation manuelle. Smoke test post-deploiement systematique.
- Branche `main` protegee : PR obligatoire, 1 review, 4 checks CI verts,
  regle appliquee aux administrateurs.
- Workflow d'equipe : l'assigne de l'issue cree la PR, l'autre membre review
  et merge.

## Backup et rollback

```bash
./scripts/backup.sh          # pg_dump horodate dans backups/, retention 7
./scripts/restore-test.sh    # restaure le dernier dump dans une base temporaire
./scripts/rollback.sh v1.0.0 # rollback de l'API vers une image stable taguee
./scripts/smoke-test.sh      # verifie /api/health et /api/products
```

Le rollback ne touche jamais aux volumes : les donnees PostgreSQL sont
conservees (verifie : 3 produits avant et apres l'incident du 2026-06-12).

## Suivi d'incident

| Symptome | Heure | Cause | Commande utilisee | Resultat |
|---|---|---|---|---|
| /api/products en 500, catalogue vide | 2026-06-12 13:31 | colonne SQL inexistante (`price_discounted`) | `docker compose logs api`, `git diff v1.0.0` | cause identifiee en ~20 s |
| — retablissement | 13:31:40 | — | `git revert` + `./scripts/rollback.sh v1.0.0` | service retabli, 0 perte |

Commandes de diagnostic standard :

```bash
docker compose ps
docker compose logs --tail=100 api
curl http://localhost:8080/api/health
curl http://localhost:8080/api/ready
docker inspect shoplite_api
```

## Documentation

| Document | Contenu |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Diagrammes (runtime + chaine CI/CD), environnements, observabilite |
| [docs/INCIDENT.md](docs/INCIDENT.md) | Rapport d'incident complet avec timeline |
| [docs/DORA.md](docs/DORA.md) | Les 4 indicateurs DORA mesures sur le TP |
| [docs/RACI.md](docs/RACI.md) | Roles, matrice RACI, qui a fait quoi |
| [docs/SECURITY-CHECKLIST.md](docs/SECURITY-CHECKLIST.md) | Secrets, ports, dependances, risques classes |
| [docs/PREUVES.md](docs/PREUVES.md) | Index du dossier de preuves |
| [CHANGELOG.md](CHANGELOG.md) | Historique des versions |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Branches, commits conventionnels, process de PR |
