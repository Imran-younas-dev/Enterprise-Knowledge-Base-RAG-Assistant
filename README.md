# Enterprise Knowledge Base RAG Assistant

![AI Knowledge RAG dashboard](apps/web/UI.jpeg)

Internal assistant that answers questions from company documents and shows citations. The visual target is `apps/web/UI.jpeg`.

| Doc | Use |
|-----|-----|
| `docs/30-day-plan.md` | Original daily schedule |
| `docs/implementation-journal.md` | **What was built each day, why, and what is left for production** |
| `docs/architecture.md` | Routes, flows, processes |
| `docs/evaluation.md` | Measured retrieval and answer review |
| `apps/api/NESTJS-STRUCTURE.md` | API coding rules |

## Layout

- `apps/api` — NestJS API (`npm run dev`), queue worker (`npm run queue-dev`), cron (`npm run cron-dev`)
- `apps/web` — React + TypeScript (Vite)
- `evals/` — Offline question set for retrieval evaluation

## Prerequisites

- **Node.js 20+**
- **Docker** — MySQL 9 and Redis (`docker compose up -d`)
- **Cloudinary** — set `CLOUDINARY_URL` in `.env` (uploads store files there)

## First-time setup

```bash
cp .env.example .env
# Edit: CLIENT_SECRET, CLOUDINARY_URL (DB defaults match Docker: user/password/database rag)

docker compose up -d

cd apps/api && npm install && npm run migrate && npm run seed
cd ../web && npm install
```

Development user (seed): `imran@localhost` / `development-password`.

Run **three terminals** for a full experience: API, **queue worker**, and web.

```bash
# Terminal 1
cd apps/api && npm run dev

# Terminal 2 (required for ingestion)
cd apps/api && npm run queue-dev

# Terminal 3
cd apps/web && npm run dev
```

- API: http://localhost:6000/api/health  
- Web: http://localhost:5173 (or 5174 — both allowed by API CORS)

## Demo

End-to-end steps (clean DB: `docker compose down -v`, then compose up, migrate, seed):

1. Start Docker, API, **queue-dev**, and web.
2. Sign in as `imran@localhost` / `development-password`.
3. **Documents** → upload `apps/api/samples/note.md` (or `harbor-audit.pdf`) → wait for **ready**.
4. **Dashboard** → ask: *When a reconciliation job fails, what should we do?* → see answer + references; click a citation.
5. Ask: *What is the CEO's salary?* → insufficient evidence.
6. **Documents** → delete the file.

**Settings** shows API, database, and Redis health.

## Measured quality (2026-11-08)

Recorded on Ubuntu / Node 20.19.5 with default **local** embedding and **local grounded reader** (see `.env.example`). Details: `docs/evaluation.md`.

| Metric | Value | Notes |
|--------|-------|--------|
| Retrieval Hit Rate@4 | **1.000 (10/10)** | `evals/questions.jsonl`, answerable rows only |
| Answer review (faithful) | **10/10** | `npm run review:answers`, first 10 questions |
| Eval set size | **12 questions** (10 answerable, 2 unanswerable) | Not a large production benchmark |
| Chat latency (warm) | retrieval ~**17–21 ms**, model ~**0–1 ms** | Local reader; cold embed load can be ~550 ms once |

Do not treat these numbers as guarantees on your data or hardware without rerunning `npm run evaluate:retrieval` and `npm run review:answers`.

## Known limits

- **File types:** PDF, DOCX, TXT, Markdown (`apps/api/src/config/uploads.js`).
- **Ownership:** documents belong to one user; **no organizations or shared libraries**.
- **Retrieval:** top-k similarity only — **no reranker**.
- **Chat model:** default is a **local** passage reader, not OpenAI/Claude (`CHAT_PROVIDER=local`). External LLM is not wired in the API yet.
- **Embeddings:** default **local** MiniLM (`EMBEDDING_PROVIDER=local`); first run downloads weights.
- **Storage:** Cloudinary required for uploads; not optional for the demo path.
- **Evaluation:** small fixed set under `evals/` — expand before making product claims.
- **Auth:** JWT in browser storage — suitable for development, not a complete production auth story.

## Local data services

```bash
docker compose up -d
```

| Service | URL | Credentials |
|---|---|---|
| MySQL 9 | `localhost:3306` | user `rag`, password `rag`, database `rag` |
| Redis | `localhost:6379` | none |

Never commit `.env`.

## Tests and evaluation (API)

```bash
cd apps/api
npm test
npm run evaluate:retrieval
npm run review:answers
```
