# Changelog

## v1.1.0 - 2026-06-12

- Rollback outille : scripts/rollback.sh (image taguee, controle des donnees), scenario incident controle execute et documente
- Securite : scan Trivy bloquant en CI, image multi-stage sans npm au runtime, checklist securite, secrets par environnement
- Trois environnements locaux isoles : dev 8080, staging 8081, production simulee 8082
- Observabilite : /ready, /health avec version, request_id propage, logs JSON a niveaux avec sanitization, rotation et resource limits
- Documentation professionnelle : README, INCIDENT, DORA, RACI, ARCHITECTURE, PREUVES

## 0.1.0

- Projet starter ShopLite.
