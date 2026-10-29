# Retrieval evaluation

This file records offline retrieval checks. Answer quality (grounded chat) is measured separately in Day 21 tests and in manual UI checks.

## Why retrieval is measured on its own

Retrieval decides **which passages** the model is allowed to see. If the wrong document never appears in the top `k` results, the chat step cannot cite it honestly, no matter how good the model is. Measuring Hit Rate@`k` first tells you whether indexing, embeddings, and chunking are working before you tune prompts or the reader.

## Question set

File: `evals/questions.jsonl`

- 12 questions total
- 10 expect a specific uploaded file (`expectedDocument` is the original filename)
- 4 literal wording from the corpus, 6 paraphrased
- 2 questions with `expectedDocument: null` (no answer in the corpus)

Corpus used for the run below (owner `imran@localhost`, documents in `ready` status):

- `Project_Phoenix.pdf` (payment / reconciliation note)
- `harbor-audit.pdf`
- `west-dock.docx`

## How to rerun

From `apps/api`:

```bash
npm run evaluate:retrieval
```

Optional environment:

- `EVAL_OWNER_ID` — defaults to the development seed user
- `EVAL_TOP_K` — defaults to `4` (same as web search unless `RETRIEVAL_TOP_K` overrides)
- `RETRIEVAL_TOP_K` — if set, the script uses it when `EVAL_TOP_K` is not set

The script prints one line per question (`hit` / `miss` / `unanswerable`) and a summary:

`Hit Rate@k: <rate> (<hits>/<answerable>)`

Only rows with an `expectedDocument` count toward the denominator. Unanswerable rows are listed but not scored.

## Latest run

| Date | Top k | Hit Rate@k | Hits | Answerable questions | Notes |
|------|-------|------------|------|----------------------|-------|
| 2026-10-29 | 4 | 1.000 | 10 | 10 | Chunk size unchanged (500 / 50 overlap). Local MiniLM embeddings, MySQL 8 JSON vectors. |

Command: `npm run evaluate:retrieval` on branch `day-22-evaluation-set`.
