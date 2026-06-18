# CURRENT_WORKFLOW_TO_REPLACE.md
### The manual iDentalSoft + Vyne billing loop (the "before" state)
*Purpose: document exactly what KYT OS is replacing, where it hurts, and what each manual step must become inside KYT OS.*

---

## 1. Why document the old way
You cannot replace a workflow you haven't written down. This file is the source of truth for the *current* process so that (a) nothing silently gets dropped in the rebuild, and (b) every manual step maps to a KYT OS feature with an owner. Each step below ends with **→ Replaced by** so the migration is traceable.

## 2. The current end-to-end process

### Step 1 — Create the claim in iDentalSoft
Biller opens iDentalSoft after treatment, finds the patient, confirms completed procedures, and builds the claim: provider, DOS, CDT codes, tooth numbers, surfaces, fees, and insurance plan. Data already in the chart is effectively re-entered into the claim form.
- **Pain:** duplicate entry; easy to miss a surface, tooth, or code; fee-schedule mismatches.
- **→ Replaced by:** CLAIM_CREATION_UI.md — claim auto-drafts from completed ADA codes; biller confirms rather than re-keys.

### Step 2 — Find the payer ID in Vyne
Biller looks up the correct payer ID / network in Vyne's payer directory and matches it to the patient's plan, watching for the many same-name-different-ID payer variants.
- **Pain:** wrong payer ID = rejection or misrouting; tribal knowledge about "which Delta is which."
- **→ Replaced by:** `payer_directory` table + carrier picker that stores the verified Vyne payer ID on the policy (DATABASE_SCHEMA.md, CLAIM_CREATION_UI.md).

### Step 3 — Gather and attach supporting documents
Through iDentalSoft and/or Vyne, the biller attaches whatever the code/payer needs: x-rays (PA/BW/pano), perio chart, intraoral photos, narratives, primary EOB (for secondary claims), medical clearance, or prior-claim documentation.
- **Pain:** missing/weak attachments are the leading denial cause; wrong tooth, dark/blurry images, or "should've been a PA not a BW"; no check until the payer denies.
- **→ Replaced by:** AI_XRAY_ATTACHMENT_REVIEW.md (billing-support quality check) + the attachment checklist per code in CLAIM_CREATION_UI.md and NARRATIVE_TEMPLATE_LIBRARY.md.

### Step 4 — Write the narrative
Biller free-types a narrative justifying the procedure (initial placement date, restoration age, clinical reason, radiographic finding, symptoms, material, prognosis), often from memory or copy-paste.
- **Pain:** inconsistent quality; missing the exact data points payers want; no provider sign-off trail.
- **→ Replaced by:** NARRATIVE_TEMPLATE_LIBRARY.md — structured, selectable templates with required fields and provider sign-off.

### Step 5 — Submit electronically
Biller submits the claim + attachments through Vyne to the payer.
- **Pain:** submission happens regardless of completeness; no enforced pre-flight check.
- **→ Replaced by:** Readiness Score gate + 837D generation and Vyne transport (CLAIM_STATUS_ENGINE.md, VYNE_INTEGRATION_REQUIREMENTS.md).

### Step 6 — Track payer status manually
Biller watches Vyne and/or payer portals and mentally tracks where each claim sits, often in a spreadsheet or on paper.
- **Pain:** no single queue; claims fall through cracks; "pending" with no next action.
- **→ Replaced by:** the status engine + tickler dates (last/next follow-up) and assigned staff (CLAIM_STATUS_ENGINE.md).

### Step 7 — Call insurance when delayed
For stalled claims, biller calls the payer, navigates IVR/hold, and records a reference number and rep notes.
- **Pain:** time sink; notes live in scattered places; no standard backnote format.
- **→ Replaced by:** `billing_notes` (structured backnotes incl. reference number, rep, call outcome) attached to the claim timeline.

### Step 8 — Rebill if pending too long or "not received"
If a payer says it never arrived or it's aged out, biller rebills, sometimes recreating the whole claim.
- **Pain:** rework; risk of duplicate-claim denials; unclear which version is authoritative.
- **→ Replaced by:** Rebill flow producing a linked `corrective_claims`/rebill child that references the original trace number (CLAIM_STATUS_ENGINE.md).

### Step 9 — Use reference numbers and backnotes
Throughout, billers rely on clearinghouse trace numbers, payer claim IDs, and handwritten backnotes to prove status and history.
- **Pain:** these live outside any system of record; lost when staff turn over.
- **→ Replaced by:** first-class fields on every claim: clearinghouse trace number, payer reference number, status events, and `billing_notes`.

## 3. Side-by-side: before → after
| Manual step (today) | System used | KYT OS replacement | Spec |
|---|---|---|---|
| Build claim | iDentalSoft | Auto-draft from completed codes + Claim Builder | CLAIM_CREATION_UI |
| Find payer ID | Vyne | Verified payer ID stored on policy | DATABASE_SCHEMA |
| Attach docs | iDentalSoft/Vyne | Per-code checklist + AI quality review | AI_XRAY_ATTACHMENT_REVIEW |
| Write narrative | Free text | Template library + sign-off | NARRATIVE_TEMPLATE_LIBRARY |
| Submit | Vyne | Readiness gate → 837D → Vyne | VYNE_INTEGRATION_REQUIREMENTS |
| Track status | Memory/spreadsheet | Status engine + ticklers | CLAIM_STATUS_ENGINE |
| Call payer | Phone | Structured backnotes + reference fields | DATABASE_SCHEMA |
| Rebill | iDentalSoft/Vyne | Linked rebill child claim | CLAIM_STATUS_ENGINE |
| Reference #s | Paper | Trace/reference fields on claim | DATABASE_SCHEMA |

## 4. What must NOT be lost in the rebuild (institutional knowledge)
- Payer quirks: which payers need which attachments; which delay; which want corrected-claim vs. void/replace.
- Secondary-claim discipline: primary EOB must accompany secondary submission.
- "Not received" patterns by payer (feeds predictive engine).
- Backnote habits: always capture reference number + rep + date.
- Never delete — mark Request Deleted (already a tracker tab; carry it forward).

## 5. Migration acceptance criteria
- [ ] Every manual step above has a named KYT OS feature and owner.
- [ ] A biller can complete a full claim lifecycle without opening iDentalSoft to *create* a claim (read-only reference during transition is acceptable).
- [ ] All reference numbers/backnotes that were previously on paper now have a structured home.
- [ ] Parallel-run plan: run KYT OS alongside the manual process for N claims to validate parity before cutover.

## 6. Developer tasks
- Map iDentalSoft completed-procedure export → KYT OS claim draft (file/API/manual import for Phase 1).
- Import existing Vyne payer-ID list into `payer_directory`.
- Define the parallel-run reconciliation report (KYT OS vs. manual) for cutover sign-off.
