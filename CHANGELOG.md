# Changelog

## v1.0.0 - 2026-06-12

Premiere version stable de ShopLite.

- Strategie Git : branches main/develop/feature, protection de main (PR + review + CI verte), template de PR
- Tests automatises : integration /products avec PostgreSQL reel, scenarios d'erreur 400/404/500/503, couverture bloquante 80%
- Qualite : ESLint (flat config) + Prettier bloquant en CI
- CI GitHub Actions : lint, tests matrix Node 20/22, audit dependances, build des images Docker
- CD GitHub Actions : deploiement staging automatique sur develop, production simulee sur tag v* avec validation manuelle
- Backup PostgreSQL : dump horodate sur l'hote, retention 7, restauration testee dans une base temporaire

## 0.1.0

- Projet starter ShopLite.
