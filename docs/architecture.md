# Architecture and Repository Conventions

## Current architecture

StudySmart uses a React/Vite browser interface, an Express API, and
PostgreSQL accessed through Prisma. The backend calls Gemini, Ollama,
or the mock provider through the AI service layer.

The browser sends requests to /api through the Vite development proxy.
Provider credentials remain in the backend environment.

## Folder responsibilities

| Path | Responsibility |
|---|---|
| client/src | React interface, components, and styles |
| server/src/routes | API route definitions |
| server/src/controllers | Request handling and workflow coordination |
| server/src/services | AI integration, history, and persistence logic |
| server/src/services/ai/providers | Gemini, Ollama, and mock adapters |
| server/src/ai | Provider and model selection support |
| server/src/middleware | Shared error and request handling |
| server/src/lib | Shared Prisma client |
| server/prisma | Database schema |
| docs | Setup, architecture, test records, reflection, and engineering logs |
| evidence | Redacted screenshots, terminal output, and test evidence |

## Main execution path

1. The student enters notes and selects a provider/model.
2. React sends a study-pack request to Express.
3. The backend validates input and resolves the provider.
4. The selected adapter generates the study material.
5. The backend processes the response and saves the topic and artifacts.
6. React displays the result.
7. History endpoints retrieve saved topics from PostgreSQL.

The study-pack workflow generates summary, key points, flashcards, and
questions together. Opening a saved topic retrieves existing results;
it does not regenerate them.

## Baseline interfaces

| Method and route | Purpose |
|---|---|
| GET /api/health | Report API availability and configured default provider |
| GET /api/ai/models | List model choices |
| POST /api/ai/study-pack | Generate and persist a study pack |
| POST /api/ai/chat | Generate a chat response using saved context |
| GET /api/history/topics | List topics for the supplied email |
| GET /api/history/topics/:topicId | Retrieve a saved topic |
| DELETE /api/history/topics/:topicId | Delete a saved topic |
| GET /api/history/chat | Retrieve saved chat messages |

Email-based lookup is not authentication. See the risk and issue log.

## Relationship to Assignment 4

This baseline retains the modular architecture from the design review.
The formal evaluation recorder, stricter output validation, and proposed
deadline changes are planned work, not completed baseline capabilities.
The current smoke tests do not replace the full evaluation plan.

## Branch and release conventions

- Preserve master as the existing stable branch.
- Use dev for integration and baseline preparation.
- Use feature/<short-description> or fix/<short-description> for later work.
- Review changes and relevant test results before merging into dev.
- Promote a verified release to master without rewriting existing history.
- Use an annotated tag such as v0.2.0-baseline for the submitted baseline.
- Record the actual commit and tag after they are created.

These are the workflow conventions adopted for subsequent work.
They do not imply that earlier commits followed this process.

## Naming conventions

- React component filenames: PascalCase, following existing components.
- JavaScript functions and variables: camelCase.
- Documentation filenames: lowercase words separated by hyphens.
- Risk identifiers: RSK-01, RSK-02, and so on.
- Issue identifiers: ISS-01, ISS-02, and so on.
- Smoke-test identifiers: SM-01, SM-02, and so on.
- Commit messages: concise action and purpose.

## Artifact storage

Keep source code, dependency manifests, the lockfile, configuration
examples, and maintained documentation in Git.

Store small, redacted baseline evidence under evidence/.
Use descriptive filenames and record the tested revision and date.

Exclude .env files, node_modules, and generated client/dist output.
Do not include credentials or private notes in evidence.

Keep large videos outside the source repository and reference their
submission location in the check-in package.

## Documentation maintenance

Update CHANGELOG.md when changes are made.
Update docs/risk-and-issue-log.md when findings or status change.
Record test procedures and actual outcomes in docs/smoke-tests.md.
Update docs/setup.md whenever installation or configuration changes.
