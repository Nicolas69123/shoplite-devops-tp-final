# Matrice RACI — equipe ShopLite

## Equipe et repartition des roles

Equipe de 2 : chaque membre porte plusieurs roles (autorise par le sujet).

| Role | Porte par |
|---|---|
| Product Owner | Nicolas (@Nicolas69123) |
| Developpeur API | Frederic (@Aho0000) |
| Developpeur Frontend | Nicolas (@Nicolas69123) |
| DevOps / Release Manager | Nicolas (@Nicolas69123) |
| DBA / Referent donnees | Frederic (@Aho0000) |
| QA / Testeur | Frederic (@Aho0000) |
| Incident Manager | Frederic (@Aho0000) |

Rappel : **R** = realise, **A** = valide/porte la responsabilite,
**C** = consulte, **I** = informe.

## Matrice (remplie d'apres ce qui a reellement ete fait)

| Activite | PO | API | Frontend | DevOps | DBA | QA | Incident Mgr | Preuve |
|---|---|---|---|---|---|---|---|---|
| Creer la version stable Git | A | I | I | R | I | C | I | Issue #1, tag v1.0.0 |
| Mettre en place Docker Compose | I | C | C | R/A | C | I | I | docker-compose*.yml |
| Configurer la CI/CD | A | C | I | R | I | C | I | PRs #11 (CI), #12 (CD) |
| Ajouter le test /api/products | I | R | I | C | C | A | I | PR #10 |
| Sauvegarder PostgreSQL | I | I | I | R | A | I | I | PR #14, backups/ |
| Provoquer l'incident controle | A | R | I | C | I | I | I | PR #16, commit casse |
| Diagnostiquer l'incident | I | R | I | R | C | C | A | logs JSON + git diff |
| Decider le rollback | A | C | I | C | C | I | R | timeline INCIDENT.md |
| Executer le rollback | I | I | I | R/A | C | I | I | rollback.sh v1.0.0 |
| Verifier les donnees apres rollback | I | I | I | C | R/A | C | I | COUNT 3 = 3 |
| Valider les tests apres rollback | I | C | I | I | I | R/A | I | CI verte sur revert |
| Rediger le rapport d'incident | A | C | I | C | I | C | R | docs/INCIDENT.md |

## Qui a reellement fait quoi (assignations GitHub)

| Etape | Realisee par | PR |
|---|---|---|
| 1. Strategie Git + protection | Nicolas | direct + config |
| 2. Tests automatises | Frederic | #10 (review Nicolas) |
| 3. Pipeline CI | Nicolas | #11 (review Frederic) |
| 4. Pipeline CD | Frederic | #12, #13 (review Nicolas) |
| 5. Backup PostgreSQL | Nicolas | #14 (review Frederic) |
| 6. Rollback + incident controle | Frederic | #16 (review Nicolas) |
| 7. Securite + environnements | Nicolas | #17 (review Frederic) |
| 8. Documentation | Frederic | (cette PR, review Nicolas) |
| 9. Observabilite | Nicolas | #18 (review Frederic) |

Regle d'equipe appliquee : **l'assigne de l'issue cree la branche et la PR ;
l'autre membre fait la review et le merge.** Aucun merge sans relecture croisee.
