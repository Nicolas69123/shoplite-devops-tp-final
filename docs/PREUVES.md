# Dossier de preuves — ShopLite

Index des preuves demandees par le sujet, avec leur emplacement verifiable.

| Preuve | Ou la verifier |
|---|---|
| **Git** : historique, branches, PR, tags, revert | [PRs #10 a #18](../../pulls?q=is%3Apr+is%3Amerged) · tag [v1.0.0](../../tags) · commit casse + revert visibles dans [PR #16](../../pull/16) · protection de main (Settings > Branches) |
| **Docker** : images, taille, healthcheck, variables | `api/Dockerfile` (multi-stage, USER node, HEALTHCHECK) · job CI "Build images Docker" (taille affichee) · `docker inspect shoplite_api` |
| **Compose** : services healthy, volumes, reseau, rotation | `docker-compose.yml` (healthchecks, volume nomme, logging 10Mo x3, limits) · `docker compose ps` |
| **CI/CD** : runs verts, artefacts, badges, build image | [Actions](../../actions) · badges en tete du README · artefacts coverage-node-20/22 sur chaque run CI |
| **Tests** : /api/products vert, rouge pendant incident, vert apres | Runs CI de la branche `feature/rollback-scenario` : commit casse = failure, revert = success ([PR #16](../../pull/16)) |
| **Backup** : dump cree, restauration testee, retention | [PR #14](../../pull/14) : dump 2 357 octets, restauration 3 produits, retention 10 -> 7 dumps |
| **Rollback** : version stable, rollback effectue, donnees conservees | [PR #16](../../pull/16) : timeline complete, products = 3 avant/apres, `scripts/rollback.sh` |
| **Securite** : scan, audit, secrets, ports | [PR #17](../../pull/17) : Trivy 2 HIGH puis 11 HIGH corrigees puis scan vert · `docs/SECURITY-CHECKLIST.md` |
| **Observabilite** : /ready, request_id, niveaux, sanitization | [PR #18](../../pull/18) : request_id nginx propage dans les logs JSON |
| **Communication** : rapport incident + fiche DORA | `docs/INCIDENT.md` · `docs/DORA.md` |
| **Organisation** : RACI, qui a fait quoi | `docs/RACI.md` · assignations des issues · [board projet](https://github.com/users/Nicolas69123/projects/3) |
