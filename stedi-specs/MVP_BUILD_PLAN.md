# MVP_BUILD_PLAN.md
### Phased delivery — from Eligibility Station to full billing command center
*Ship value early without depending on live Stedi submission, then automate outward. Each phase is independently useful.*

---

## Phase 1 — Eligibility + manual claim packet (low risk, fast value)
**Theme:** prove the front end and the data without submitting claims through Stedi yet.
- **Eligibility Station** using Stedi 270/271 (ELIGIBILITY_STATION.md) — real value on day one, HMO/DMO flagging.
- **Manual claim packet builder** (CLAIM_BUILDER_837D.md UI) — build the claim, export a packet for manual submission.
- **Narrative templates** + **attachment checklist** (ATTACHMENT_AND_NARRATIVE_ENGINE.md).
- **Pre-Flight UI without submission** (PRE_FLIGHT_ENGINE.md) — scoring + action items, no send.
- Schema, RLS, audit, no-hard-delete (DATABASE_SCHEMA.md, API_ARCHITECTURE.md).

**Done when:** staff verify eligibility in <30s, build a scored claim, and export a complete packet. No Stedi claim submission required.

---

## Phase 2 — 837D submission + acknowledgements + timeline
**Theme:** move submission onto Stedi.
- **837D generation + Stedi submission** (sandbox → production), idempotency, PCN/line control numbers.
- **Stedi acknowledgements** (277CA from Stedi + payer) → status transitions.
- **Claim status event timeline** (CLAIM_TRACKING_AND_STATUS.md) + aging queues.
- Transaction **enrollment** flow per payer.

**Done when:** a test 837D submits in sandbox, returns + stores a 277CA, and the timeline updates; enrollment tracked.

---

## Phase 3 — ERA 835 + payment posting + denial analytics
**Theme:** close the money loop.
- **835 retrieval/import** (poll + webhook) → match by PCN/line (ERA_835_PAYMENT_POSTING.md).
- **Payment posting assistant** — staff post/partial/write-off with one click.
- **Denial analytics** — reasons by payer/code/provider; aging dashboards.

**Done when:** an 835 matches and posts to the originating claim/lines; denial + aging dashboards are live.

---

## Phase 4 — AI assistance + payer intelligence
**Theme:** make the system smarter.
- **AI attachment/x-ray review** (AI_XRAY_REVIEW.md) feeding Pre-Flight.
- **AI narrative builder** (assist only, no fabrication, sign-off).
- **Payer-specific claim intelligence** — per-payer attachment/narrative rules surfaced at build time.

**Done when:** uploads get billing-support reviews, narratives are AI-assisted with sign-off, and payer rules drive Pre-Flight.

---

## Phase 5 — Full billing command center
**Theme:** proactive, predictive operations.
- **Command center dashboard** — every claim, status, owner, follow-up in one view.
- **Predictive follow-up engine** — which claims will stall, which payers delay, when to chase.
- **Automated rebill/appeal drafting** — pre-drafted (human-approved) corrective/rebill/appeal packets.

**Done when:** predictions surface with confidence + rationale and measurably reduce days-in-A/R vs. baseline; rebill/appeal drafts are one approval away.

---

## Cross-phase guardrails (every phase)
- No auto-submit; provider sign-off on clinical narratives; full audit trail; never hard-delete; AI suggests, humans approve; Stedi keys server-side only.
- Each screen answers the six questions (missing / risky / do-now / last / follow-up / who).
- Coordinate Stedi enrollment vs. existing Vyne flows before cutover; parallel-run per payer.

## Milestone gates
| Phase | Gate to next |
|---|---|
| 1 | Staff prefer KYT eligibility + builder to current tools |
| 2 | Sandbox 837D round-trip + 277CA timeline working |
| 3 | 835 auto-matches and reconciles to the cent |
| 4 | AI review reduces attachment denials in parallel run |
| 5 | Predictive lift proven vs. baseline |
