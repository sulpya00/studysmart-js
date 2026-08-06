# StudySmart JS — History-Aware AI Study Assistant

StudySmart is a React, Express, PostgreSQL, and Prisma application that creates study summaries, flashcards, practice questions, and a chat assistant.

## What is included in this version

- Simplified login where any password works
- No demo-account button
- Empty title, subject, and study-note fields after login
- Top-level AI model dropdown
- Dynamic Gemini model discovery through the configured API key
- Dynamic discovery of locally installed Ollama models
- Local demonstration model when an external model is unavailable
- PostgreSQL-backed study-topic history
- Saved notes, summaries, key points, flashcards, and questions
- Saved global chat history
- History screen for reopening or deleting previous topics
- Chat retrieval across all topics saved under the login email
- Relevant previous notes are selected automatically for each chat question

## Important login behavior

This academic project uses simplified login rather than secure authentication. The email address acts as the user identifier. Enter the same email later to retrieve its saved history. The password is not verified or saved.

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- Docker Desktop, or a locally installed PostgreSQL server
- A Gemini API key for Gemini models, or Ollama for local AI models

## First-time installation on Windows

Extract the ZIP, open PowerShell in the folder containing the root `package.json`, then run:

```powershell
npm.cmd install
```

The package contains `server/.env`. Review its database and AI settings. When starting from the template instead, create it with:

```powershell
Copy-Item server/.env.example server/.env
```

Start PostgreSQL:

```powershell
docker compose up -d
```

Generate the Prisma client and create/update the database tables:

```powershell
npm.cmd run db:generate
npm.cmd run db:push
```

Start the frontend and backend:

```powershell
npm.cmd run dev
```

Open:

```text
http://localhost:5173
```

## Existing PostgreSQL installation

When PostgreSQL is already installed, update `DATABASE_URL` in `server/.env` and run:

```powershell
npm.cmd run db:generate
npm.cmd run db:push
npm.cmd run dev
```

`prisma db push` updates the database to match the included schema without requiring you to manually create every table.

## Gemini setup

Edit `server/.env`:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=your_preferred_default_model
```

The dropdown requests the list of models available to the key. The model selected in the dropdown is sent to the backend for each study-pack or chat request.

## Ollama setup

Install Ollama, start it, and pull at least one model:

```powershell
ollama pull gemma3:4b
```

Edit `server/.env`:

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:4b
```

Restart the application. Models returned by Ollama's local `/api/tags` endpoint appear in the dropdown.

## How saved history works

Creating a study pack saves a `Note` with its latest `Summary`, `FlashcardSet`, and `QuestionSet`. The History screen loads those records using the signed-in email. Opening a topic restores the original notes and generated study materials.

Study Chat uses one saved global chat session per email. Before answering, the backend:

1. Loads the summaries of saved topics.
2. Scores titles, subjects, summaries, and notes against the question.
3. Selects the most relevant full-note excerpts.
4. Sends the summary index, relevant notes, and recent chat to the selected model.
5. Saves both the student's question and the assistant's answer.

## Main API endpoints

```text
GET    /api/health
GET    /api/ai/models
POST   /api/ai/study-pack
POST   /api/ai/chat
POST   /api/ai/flashcards
GET    /api/history/topics?userEmail=...
GET    /api/history/topics/:topicId?userEmail=...
DELETE /api/history/topics/:topicId?userEmail=...
GET    /api/history/chat?userEmail=...
```

## Common issue: history does not load

Confirm PostgreSQL is running, then run:

```powershell
npm.cmd run db:generate
npm.cmd run db:push
```

Also confirm that `DATABASE_URL` in `server/.env` points to the running `studysmart` database.
