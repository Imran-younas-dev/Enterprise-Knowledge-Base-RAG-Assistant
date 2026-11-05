# Enterprise Knowledge Base RAG Assistant

![AI Knowledge RAG dashboard](apps/web/UI.jpeg)

Internal assistant that answers questions from company documents and shows citations. The visual target is `apps/web/UI.jpeg`.

The API follows `apps/api/NESTJS-STRUCTURE.md` (JavaScript, Babel, one action per service). The build schedule is `docs/30-day-plan.md`. Product and routes: `docs/architecture.md`.

## Layout

| Path | Purpose |
|---|---|
| `apps/api` | NestJS API — HTTP `index.js`, queue worker `queue.index.js`, cron `cron.index.js` |
| `apps/web` | React + TypeScript UI (Vite) |
| `docs/30-day-plan.md` | Day-by-day implementation plan |
| `docs/architecture.md` | Stack, flows, and HTTP routes |

## Prerequisites

- **Node.js 20+**
- **Docker** (MySQL 9 and Redis via Compose)
- **Cloudinary** account — set `CLOUDINARY_URL` in `.env` so uploads can be stored (free tier is enough for demo)

## First-time setup

From the repository root:

```bash
cp .env.example .env
```

Edit `.env`:

- `CLIENT_SECRET` — any long random string (JWT signing)
- `CLOUDINARY_URL` — from the Cloudinary dashboard (`cloudinary://key:secret@cloud_name`)
- Database — defaults match Docker Compose (`DB_USER=rag`, `DB_PASSWORD=rag`, `DB_NAME=rag`)

Start data services:

```bash
docker compose up -d
```

Wait until MySQL accepts connections, then prepare the API database:

```bash
cd apps/api
npm install
npm run migrate
npm run seed
```

The seed creates a development user (see **Demo** below). An optional seeded document row may stay `queued` without a real file; you can ignore it or delete it after upload.

Install the web app once:

```bash
cd apps/web
npm install
```

## Run the apps (development)

Use **three terminals** while working with uploads:

**Terminal 1 — API**

```bash
cd apps/api
npm run dev
```

Health: http://localhost:6000/api/health (checks API, database, and Redis)

**Terminal 2 — queue worker** (required for ingestion)

```bash
cd apps/api
npm run queue-dev
```

**Terminal 3 — web**

```bash
cd apps/web
npm run dev
```

Open http://localhost:5173 (Vite prints the URL; if port 5173 is busy it may use **5174** — both are allowed by the API CORS settings).

The web dev server proxies `/api` to `http://localhost:6000`.

Optional fourth terminal: `npm run cron-dev` in `apps/api` (not required for the demo path).

## Demo

Follow these steps in order on a **fresh database** (`docker compose down -v`, then `docker compose up -d`, then `npm run migrate` and `npm run seed` in `apps/api`). Keep the API, **queue worker**, and web running.

### 1. Start infrastructure and apps

```bash
docker compose up -d
cd apps/api && npm run migrate && npm run seed
```

Start `npm run dev`, `npm run queue-dev`, and `npm run dev` in `apps/web` as above.

### 2. Sign in

Open the web URL. Use the seeded account:

| Field | Value |
|---|---|
| Email | `imran@localhost` |
| Password | `development-password` |

### 3. Upload a document

Go to **Documents** → **Choose file** → select `apps/api/samples/note.md` (or `samples/harbor-audit.pdf`).

Wait until the row shows status **ready** (the queue worker must be running). If it stays **queued** or **processing**, check the queue terminal and **Settings → API health** (Redis and database must be up).

### 4. Ask a grounded question

Open **Dashboard**. Leave **Web Search** selected. Ask:

```text
When a reconciliation job fails, what should we do?
```

You should get an answer that mentions retrying once and recording the error, with **References** and citation marks. Click a citation or reference to highlight the matching **Document Chunk**.

### 5. Ask something the files do not contain

Ask:

```text
What is the CEO's salary?
```

The answer should indicate **insufficient evidence** (no fabricated salary).

### 6. Delete the document

Go to **Documents**, select the uploaded file, click **Delete**, then **Confirm delete**. The row disappears from the list and from the dashboard source list.

### 7. Confirm health (optional)

**Settings** lists **API**, **Database**, and **Redis**. Stop Redis (`docker compose stop redis`) and refresh Settings — Redis should show as down; restart Redis to recover.

---

If any step fails, see **Troubleshooting** below.

## Troubleshooting

| Symptom | What to check |
|---|---|
| Sign-in fails | Migrations and seed ran; MySQL is up; `DB_*` in `.env` matches Compose |
| Upload error “storage is not configured” | Set `CLOUDINARY_URL` in `.env` and restart the API |
| Document stuck `queued` | `npm run queue-dev` is running; Redis is up |
| Document `failed` | Row shows a short error summary; file type/size limits in `UPLOAD_MAX_BYTES` |
| Dashboard “API is not reachable” | API on port 6000; web proxy; CORS if you use a non-default port |
| Empty list after sign-in | Normal for a new account until you upload |

## Local data services

```bash
docker compose up -d
```

| Service | URL | Credentials |
|---|---|---|
| MySQL 9 | `localhost:3306` | user `rag`, password `rag`, database `rag` |
| Redis | `localhost:6379` | none |

Copy `.env.example` to `.env` before running the API against Docker. Never commit `.env`.
