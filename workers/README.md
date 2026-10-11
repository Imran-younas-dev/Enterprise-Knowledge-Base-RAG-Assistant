# Workers

Ingestion jobs run in the API repo, as a separate process, following `apps/api/NESTJS-STRUCTURE.md`.

- Entry: `apps/api/queue.index.js`
- Dev command: `npm run queue-dev` from `apps/api`
- Processors: `apps/api/src/queues/`

This folder is not a second application. The 30-day plan moves upload work onto the `ingestDocument` queue on Day 15.
