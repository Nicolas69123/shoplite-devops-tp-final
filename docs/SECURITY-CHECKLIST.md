# Checklist securite ShopLite

Etat au 2026-06-12, verifie sur la branche develop.

## 1. Secrets

| Verification | Resultat | Risque |
|---|---|---|
| Aucun vrai secret commite dans Git (`git grep` sur password/secret/token/api_key) | OK : seuls `.env.example`, `ci.yml` et `docker-compose.yml` matchent, uniquement des valeurs par defaut de dev/test (`shoplite_password`) | Faible |
| Le vrai `.env` est ignore par Git (`.gitignore` : `.env`, `.env.*`, sauf `.env.example`) | OK | Faible |
| Aucun secret dans les Dockerfiles (pas de COPY de .env, pas de ENV sensible) | OK | Faible |
| Aucun secret dans les logs applicatifs (le logger ne journalise ni body ni headers) | OK | Faible |
| GitHub Secrets par environnement (staging / production) pour les vraies valeurs | Configures, distincts par environment | Faible |

Note : `shoplite_password` est une valeur par defaut LOCALE assumee (compose dev et
service de test CI). En staging/production reelle, la valeur vient des GitHub
Secrets de l'environment, jamais du code.

## 2. Rotation des secrets

- Les secrets d'environment GitHub sont renouveles a chaque demande (depart d'un
  membre, fuite suspectee) et au minimum tous les 6 mois.
- Procedure : generer la nouvelle valeur, mettre a jour le GitHub Secret de
  l'environment concerne, redeployer (le prochain deploiement la consomme),
  invalider l'ancienne valeur cote PostgreSQL (`ALTER ROLE ... PASSWORD`).

## 3. Ports exposes

| Service | Port interne | Expose sur l'hote | Justification |
|---|---|---|---|
| proxy (nginx) | 80 | 8080 (dev) / 8081 (staging) / 8082 (prod simulee) | Seul point d'entree |
| api | 3000 | NON expose | Accessible uniquement via le proxy |
| frontend | 80 | NON expose | Accessible uniquement via le proxy |
| db (PostgreSQL) | 5432 | NON expose | Accessible uniquement par l'API via le reseau Docker |

Risque : faible. Un seul port public par environnement.

## 4. Dependances (npm audit / npm outdated du 2026-06-12)

- `npm audit --audit-level=high` : **0 vulnerabilite**.
- `npm outdated` :

| Paquet | Actuel | Latest | Analyse |
|---|---|---|---|
| dotenv | 16.6.1 | 17.x | Majeure : API changee, mise a jour non testee = risque moyen |
| eslint | 9.39.4 | 10.x | Majeure : outillage seulement, risque faible |
| express | 4.22.2 | 5.x | Majeure : framework coeur, migration a planifier, risque moyen |
| jest | 29.7.0 | 30.x | Majeure : outillage de test, risque faible |
| prettier | 3.8.3 | 3.8.4 | Patch : sans risque |

Decision : pas de montee de version majeure non testee pendant le TP (le risque
d'une mise a jour non testee depasse le benefice). Les patchs/mineures sont pris
par `npm ci` via les ranges du package.json.

## 5. Image Docker

- Base figee `node:20-alpine` (pas de tag latest).
- `USER node` : le process ne tourne pas en root.
- `npm ci --omit=dev` : pas de dependances de dev dans l'image.
- Scan Trivy en CI (job `security`) : severite HIGH/CRITICAL bloquante,
  vulnerabilites sans correctif ignorees (`ignore-unfixed`).

## 6. Classement des risques identifies

| Risque | Niveau |
|---|---|
| Valeur par defaut `shoplite_password` utilisee en local/CI | Faible (jamais en prod, documente) |
| Dependances majeures en retard (express 5, dotenv 17) | Moyen (migration a planifier) |
| Pas de HTTPS sur le proxy local | Faible (TP local ; en production reelle : TLS obligatoire au niveau du reverse proxy) |
| Pas de rate limiting sur l'API | Moyen (a ajouter avant une vraie mise en production) |
