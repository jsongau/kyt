# API_ARCHITECTURE.md
### Backend architecture — Next.js + Supabase + Stedi
*Keys server-side only. Every PHI access logged. Webhooks + background jobs for async Stedi responses.*

---

## 0. Plain-English purpose
This is how the app is wired under the hood. The browser never talks to Stedi directly — it talks to our own server routes, which hold the Stedi key and the database connection. Async responses from Stedi (acknowledgements, ERAs) arrive by webhook and are processed by background workers. Everything that touches patient data is logged.

## 1. Stack
- **Next.js (App Router)** — UI + server actions/route handlers (the only place Stedi keys live).
- **Supabase (Postgres + Auth + Storage + RLS)** — database, auth, encrypted file storage for attachments, row-level security.
- **Server actions or API routes** — all Stedi calls run server-side.
- **Stedi integration layer** — a typed `StediClient` wrapping eligibility, dental claims, claim status, 835/277CA retrieval, enrollment.
- **Secure environment variables** — `STEDI_API_KEY`, webhook signing secret, DB keys — server-only, in a secret manager.
- **Audit logging** — middleware writes `audit_logs` for PHI access + mutations.
- **Background jobs / queue worker** — process inbound 277CA/835, aging sweeps, batch eligibility.
- **Webhook receiver** — verified endpoint for Stedi event destinations.

## 2. Layered architecture
```
Browser (React)
  │  fetch (no PHI to 3rd parties; no keys)
  ▼
Next.js route handlers / server actions  ── RLS via Supabase auth context
  │            │
  │            └─ audit middleware → audit_logs
  ▼
StediClient (server)  ──► Stedi Healthcare APIs ──► payers
  ▲
  │  webhooks (event destinations)
Webhook receiver → Queue → Worker → DB (claims, status_events, eras)
```

## 3. API routes (server-side)
| Route | Method | Purpose | Stedi call |
|---|---|---|---|
| `/api/eligibility/check` | POST | Run 270/271 | Eligibility (JSON) |
| `/api/claims/preflight` | POST | Score a claim (internal) | none |
| `/api/claims/submit` | POST | Submit 837D | Dental Claims (JSON) |
| `/api/stedi/webhooks` | POST | Receive 277CA/835 events | (inbound) |
| `/api/claims/:id/status` | GET | Get status (+ on-demand 276/277) | Claim Status |
| `/api/era/import` | POST | Pull/ingest 835 | 835 report |
| `/api/attachments/review` | POST | AI x-ray review | AI service |
| `/api/narratives/generate` | POST | AI-assisted narrative | AI service |

### Route behaviors
- **/api/eligibility/check:** validate inputs → `StediClient.eligibility()` → parse 271 → store `eligibility_checks`/`benefits` → return human-readable + plan-type flag.
- **/api/claims/submit:** re-run Pre-Flight server-side (never trust client) → require pass band + sign-off → serialize to Stedi JSON → attach **Idempotency-Key** → submit → store `stedi_submissions` + initial 277CA → emit status event. Reject if Pre-Flight fails server-side.
- **/api/stedi/webhooks:** verify signature → enqueue → 200 fast. Worker correlates by PCN/line control number → updates status / writes `eras`.
- **/api/claims/:id/status:** read cached status; optionally fire 276/277 for a live check.
- **/api/era/import:** pull 835s (or accept webhook payloads) → parse → match → `eras`/`era_lines`.
- **/api/attachments/review & /api/narratives/generate:** call the BAA-covered AI service; enforce disclaimers + no-fabrication; human approval still required downstream.

## 4. StediClient (integration layer)
- Single typed module; methods: `eligibility()`, `submitDentalClaim()`, `claimStatus()`, `get277ca()`, `get835()`, `enrollment()`, `payers()`.
- Centralizes base URL (`healthcare.us.stedi.com/2024-04-01/...`), auth header, idempotency, retries with backoff, error normalization, and **test vs prod** (`usageIndicator`).
- All PHI redaction for logs happens here; raw payloads stored only in encrypted storage with references.

## 5. Background jobs / queue
- **Webhook worker:** process 277CA/835 events → transitions + posting prep.
- **Aging sweep (cron):** move Pending→Not Paid past thresholds; populate aging queues; auto-suggest 276/277.
- **Batch eligibility (cron):** refresh eligibility before scheduled DOS.
- **Enrollment monitor:** track Stedi transaction-enrollment status per payer/provider.
- Idempotent workers; dead-letter queue for failures; retries.

## 6. Security (hard requirements)
- **Never expose Stedi API keys client-side** — all calls server-side; keys in a secret manager, not in the repo.
- **Log every PHI access** — reads + writes → `audit_logs` (actor, entity, before/after, ip/agent).
- **Encrypt sensitive tokens** — at rest (pgcrypto/KMS); TLS in transit everywhere.
- **Role-based access (RBAC)** via Supabase RLS — biller/provider/manager/auditor; least privilege.
- **Webhook verification** — validate Stedi signatures; reject unsigned.
- **No PHI to third parties** without a BAA (AI vision/LLM providers must be BAA-covered).
- **Idempotency** on claim submission to prevent duplicates.
- **Sandbox isolation** — test mode (`usageIndicator T`) and synthetic PHI in non-prod.

## 7. Acceptance criteria
- [ ] All 8 routes implemented; Stedi calls occur only server-side.
- [ ] No Stedi key is reachable from the browser bundle.
- [ ] Webhook endpoint verifies signatures and processes 277CA/835 idempotently.
- [ ] Pre-Flight is re-validated server-side on submit; client cannot bypass.
- [ ] Every PHI read/write produces an `audit_logs` row.
- [ ] Background workers handle aging + ERA + eligibility refresh with retries.

## 8. Developer tasks
- Scaffold Next.js App Router + Supabase (Auth, RLS, Storage).
- Build `StediClient` + secret management + idempotency/retry.
- Implement the 8 routes + audit middleware.
- Build webhook receiver + queue + workers (277CA/835, aging, batch eligibility).
- Wire AI endpoints behind BAA service with guardrails.

---
### Sources (Stedi)
- [Configure webhooks / event destinations](https://www.stedi.com/docs/healthcare/configure-webhooks)
- [API reference (auth, idempotency, concurrency)](https://www.stedi.com/docs/healthcare/api-reference)
- [Test mode](https://www.stedi.com/docs/healthcare/test-mode)
- [Trust Center](https://www.stedi.com/docs/healthcare/trust-center)
