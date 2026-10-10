# Enterprise Knowledge Base RAG Assistant

Starter monorepo for an internal assistant that answers questions from company documents, with citations.

This checkout only boots the API and web app. Document upload, retrieval, and chat are empty modules to fill in next.

## Layout

- `apps/api` — NestJS API (`auth`, `documents`, `ingestion`, `retrieval`, `chat`)
- `apps/web` — React + TypeScript UI (Vite)
- `workers` — background ingestion jobs (not implemented yet)
- `docs` — architecture and implementation plan

## Run the apps

Requires Node.js 20+.

```bash
cd apps/api
npm install
npm run start:dev
```

API: http://localhost:3000/api/health

```bash
cd apps/web
npm install
npm run dev
```

Web: http://localhost:5173 (proxies `/api` to the API)

Production builds:

```bash
cd apps/api && npm run build && npm run start:prod
cd apps/web && npm run build && npm run preview
```

## Local data services

PostgreSQL with pgvector and Redis are defined for later phases. They are not required to start the starter apps.

```bash
docker compose up -d
```

| Service | URL | Credentials |
|---|---|---|
| PostgreSQL | `localhost:5432` | user `rag`, password `rag`, database `rag` |
| Redis | `localhost:6379` | none |
