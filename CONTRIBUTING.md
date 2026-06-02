# Contribuer a ShopLite

Ce document definit la strategie Git et les conventions de contribution du projet.
Toute contribution doit respecter ces regles pour garder un historique propre et une integration continue fiable.

## Modele de branches

Le projet suit un GitFlow simplifie a deux branches longues plus des branches de travail courtes.

| Branche | Role | Protegee |
|---------|------|----------|
| `main` | Code stable, deployable. Reflete la production. | Oui |
| `develop` | Branche d'integration. On y fusionne les fonctionnalites terminees. | Non |
| `feature/<nom>` | Nouvelle fonctionnalite. Part de `develop`, y retourne. | Non |
| `fix/<nom>` | Correction de bug non urgente. Part de `develop`. | Non |
| `hotfix/<nom>` | Correction urgente en production. Part de `main`, fusionnee dans `main` et `develop`. | Non |

Regles :

- On ne pousse jamais directement sur `main`. Tout passe par une Pull Request.
- Une branche de travail traite une seule chose (une issue, une fonctionnalite).
- On supprime la branche apres fusion.

Exemples de nommage :

```text
feature/ci-pipeline
feature/backup-postgres
fix/health-503-quand-db-ko
hotfix/proxy-timeout
```

## Format des commits (Conventional Commits)

Chaque message de commit suit la convention `<type>: <description a l'imperatif>`.

Types utilises :

| Type | Usage |
|------|-------|
| `feat` | Nouvelle fonctionnalite |
| `fix` | Correction de bug |
| `docs` | Documentation uniquement |
| `test` | Ajout ou modification de tests |
| `ci` | Pipeline CI/CD, GitHub Actions |
| `chore` | Maintenance, dependances, config |
| `refactor` | Refactorisation sans changement de comportement |

Regles :

- Description a l'imperatif present : "ajoute le pipeline CI", pas "ajout du pipeline" ni "ajoute".
- Premiere ligne <= 72 caracteres.
- Pas d'emoji.
- Un commit = un changement coherent.

Exemples :

```text
feat: ajoute le pipeline CI (test, audit, docker build)
fix: renvoie 503 sur /health quand la base est indisponible
docs: complete CONTRIBUTING avec la strategie de branches
test: couvre /products et la route 404
```

## Process de Pull Request

1. Creer une branche depuis `develop` (ou `main` pour un hotfix).
2. Developper, committer en suivant la convention ci-dessus.
3. Verifier en local avant de pousser :
   - `npm test` vert
   - `docker compose build` reussi
   - smoke test fonctionnel si pertinent
4. Pousser la branche et ouvrir une PR vers `develop` (ou `main` pour un hotfix).
5. Remplir le modele de PR (`.github/pull_request_template.md`) : objectif, verifications, risques et rollback.
6. Lier la PR a l'issue concernee (`Closes #N`).
7. Attendre que la CI soit verte et qu'au moins une review approuve.
8. Fusionner, puis supprimer la branche.

## Code review

L'auteur d'une PR ne la fusionne pas seul si une review est disponible. Le relecteur verifie :

- Le code repond a l'issue, sans ajout hors perimetre.
- Les tests couvrent le cas nominal et au moins un cas d'erreur.
- Aucun secret commite (mot de passe, token, `.env`).
- Pas de `console.log` oublie ni de code mort.
- La CI est verte.

Une remarque bloquante doit etre corrigee avant fusion. Une remarque non bloquante peut etre traitee dans une PR suivante si elle est tracee.

## Avant de committer

- `npm test` doit passer.
- Aucun fichier `.env` ni secret dans le commit.
- Pas d'emoji dans le code, les commits ou la documentation.
