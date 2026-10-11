# StudySmart

StudySmart is a local academic prototype that converts notes into summaries,
key points, flashcards, and practice questions. It also provides saved topic
history and Study Chat.

## Project status

CISC 699 Assignment 5: implementation baseline preparation.

The application existed before this sprint. This checkpoint focuses on
reproducible setup, engineering documentation, risk tracking, and evidence
that the existing application runs.

Manual checks confirmed application startup, API health, mock generation,
saved-topic reopening after application restart, and Gemini generation.
The frontend build also produced its output successfully.

Clean-copy setup verification, screenshots, and the baseline release
commit/tag remain pending. The full Assignment 4 evaluation has not
been completed.

## Technology

- Frontend: React and Vite
- Backend: Node.js and Express
- Database: PostgreSQL with Prisma
- Providers: Gemini, optional Ollama, and local mock

Recorded Windows environment:
Node 24.14.1, npm 11.11.0, Git 2.45.1.windows.1,
and a running native PostgreSQL 18 service.

The committed package-lock.json records dependency versions.

## Getting started

Follow [the setup guide](docs/setup.md) for installation, database creation,
configuration, schema setup, and startup.

Start with the mock provider, which needs no AI API key.
PostgreSQL is still required for saved study material.

After setup, run npm.cmd run dev from the project root.
Open http://localhost:5173.

Run npm.cmd run build to build the frontend.

## Configuration

Copy server/.env.example to server/.env for a new installation.
Fill in your own database credentials and optional provider settings.

Keep server/.env private. Commit only the placeholder example.
Do not overwrite an existing working configuration without reviewing it.

## Important limitations

- Passwords are not verified. Email identifies saved history but does
  not authenticate the user.
- Use this baseline locally with synthetic or non-sensitive material.
- The model dropdown on a reopened topic does not reliably indicate
  which provider generated its saved content.
- Mock output demonstrates application behavior, not AI content quality.
- Successful Gemini generation does not establish factual accuracy.
- Ollama is available in the code but was not tested in this sprint.
- The API health endpoint does not test database or provider connectivity.

## Engineering documentation

- [Setup guide](docs/setup.md)
- [Architecture and repository conventions](docs/architecture.md)
- [Risk and known-issues log](docs/risk-and-issue-log.md)
- [Smoke-test record](docs/smoke-tests.md)
- [Sprint reflection](docs/sprint-reflection.md)
- [Changelog](CHANGELOG.md)

## Evidence

The evidence/ folder contains the environment record and frontend build
output. Screenshots will be collected before submission.

Test records distinguish observed results from planned work.
See the smoke-test record for coverage and limitations.

## Version control

Repository: https://github.com/sulpya00/studysmart-js

Baseline preparation uses dev. Future work follows the branch conventions
in docs/architecture.md.

The baseline tag and final commit will be recorded after verification.
