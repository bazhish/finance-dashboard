# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [Unreleased]

### Added

- **LGPD:** exclusão de conta (`DELETE /api/auth/me`), exportação de dados
  (`GET /api/privacy/export`), registro de consentimento (`consents` + aceite no
  cadastro), página pública `/privacidade` e contato do encarregado (DPO).
- **Segurança:** proteção CSRF double-submit (`X-CSRF-Token`) para sessões por cookie.
- Camada `app/core` real (`config`, `database`, `security`, `storage`) extraída do monólito.
- Fotos de perfil em Supabase Storage privado (URL assinada), com fallback em disco no dev.
- Endpoints de saúde separados: `/api/health` (readiness, com DB) e `/api/health/live` (liveness).
- Login e cadastro com identidade Trevo, demo do produto e OAuth (Google, GitHub, Facebook) preparado por variáveis de ambiente.
- Documentação reorganizada em `docs/` (produto, arquitetura, segurança, guias).
- Templates GitHub (issues, PR), `LICENSE` (MIT), `SECURITY.md`, `CONTRIBUTING.md`.

### Changed

- Configuração centralizada em `app/core/config.py` (fonte única).
- Camada de dados serverless-safe (pool em container, conexão-por-request no Vercel).
- OAuth state agora é stateless assinado (funciona entre invocações serverless).
- CI: gate de cobertura (`--cov-fail-under=60`) e `pip-audit` no lugar do `safety` (descontinuado).
- CSP endurecida (remoção de origens externas de script/fonte não usadas).
- README profissional para open source.
- `.gitignore` ampliado para artefatos Python, Node, logs e secrets.

### Security

- Remoção de `__pycache__` versionado por engano.
- Guia de secrets e rotação em `docs/security/security.md`.

<!-- Versões tagueadas devem ser documentadas abaixo quando houver releases formais. -->
