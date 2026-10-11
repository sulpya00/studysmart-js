# Changelog

## Unreleased - Assignment 5 baseline preparation

### Added
- Safe server/.env.example configuration template.
- Environment record and frontend build output.
- Risk and known-issues log.
- Manual smoke-test record.

### Changed
- Removed the decorative star from the empty summary screen.

### Verified
- Local application startup and API health response.
- Mock generation and saved-topic reopening after application restart.
- Mock and Gemini provider selection through request/response inspection.
- Successful Gemini generation using gemini-3.1-flash-lite.
- Frontend production build.

### Known limitations
- Email-based identification does not verify passwords.
- Model selection displayed when reopening a topic can be misleading.
- Clean-copy installation remains unverified.
- Screenshots and baseline release tag are pending.

## Existing prototype - 1d008b5

- React/Vite frontend and Express backend.
- PostgreSQL persistence through Prisma.
- Study-pack generation, saved topics, and Study Chat.
- Gemini, Ollama, and mock provider adapters.

These features existed before this sprint; this entry does not claim that
all existing features were tested during baseline preparation.
