# PRE_FLIGHT_ENGINE.md
### Pre-Flight — readiness checking before a claim is submitted
*"Pre-flight" = the pre-submission checklist that predicts whether a claim will pass Stedi's edits and the payer. It scores the claim, lists exactly what to fix, and blocks bad claims from leaving the building.*

---

## 0. Plain-English purpose
A pilot runs a pre-flight checklist before takeoff. KYT OS does the same before a claim flies to Stedi: it checks every field, attachment, and rule, gives the claim a **score out of 100**, and tells staff in plain words what's missing and what's risky. This catches problems *here*, where they're cheap to fix — not three weeks later as a payer rejection. Stedi also runs its own claim edits and can reject via 277CA; Pre-Flight is our **first line of defense** so we rarely get there.

## 1. The checks
Each check is **pass / warn / fail** and maps to a data source in KYT OS.

**Identity & coverage**
1. Patient demographics complete (name, DOB, sex, address).
2. Subscriber information complete (name, DOB, member ID, relationship).
3. Insurance policy active (from latest eligibility check; warn if stale).
4. Payer ID selected (valid Stedi `tradingPartnerServiceId`).

**Providers & facility**
5. Provider NPI present (rendering).
6. Billing provider info present (NPI, Tax ID, taxonomy, org/address).
7. Rendering provider info present.
8. Tax ID present (billing `employerId`).

**Claim core**
9. Date of service valid (≤ today; within timely filing; matches completed procedure).
10. CDT codes valid (recognized D-codes; active for DOS).
11. Tooth number present **when the code requires it** (e.g., crown, extraction).
12. Surface present **when applicable** (restorative codes).
13. Quadrant/arch present **when applicable** (SRP → quadrant; dentures → arch).
14. Fee entered (per line).

**Documentation**
15. Narrative present **when required** (per code/payer; signed if clinical).
16. X-ray attached **when required** (and AI-marked diagnostic — AI_XRAY_REVIEW.md).
17. Perio chart attached **when required** (SRP / D4346 / D4910).
18. Primary EOB attached **for secondary/tertiary claims** (COB).
19. Corrected claim reason present **when claim is corrective/void/replacement**.

> The "when applicable" logic comes from a per-CDT requirement table joined with per-payer overrides (DATABASE_SCHEMA.md `payers`, ATTACHMENT_AND_NARRATIVE_ENGINE.md).

## 2. The Pre-Flight Score
A weighted roll-up of the checks into 0–100, mapped to a status band:

| Score | Status | Meaning | Can submit? |
|---|---|---|---|
| **100** | **Ready** | All required checks pass | ✅ |
| **80–99** | **Minor warning** | Non-blocking gaps (e.g., optional narrative weak) | ✅ with acknowledgement |
| **50–79** | **Needs review** | Important gaps; biller must resolve | ⛔ until resolved |
| **< 50** | **Blocked** | Missing a hard requirement (no payer ID, no NPI, required attachment absent) | ⛔ hard block |

**Scoring rules**
- **Hard-required failures** (payer ID, NPI, Tax ID, required attachment, required tooth number, secondary-EOB, corrected-reason) cap the score **below 50** regardless of other points — these are non-negotiable.
- **Important warnings** (weak/unsigned narrative, stale eligibility, borderline x-ray) land 50–99.
- A claim reaches **100** only when every required item passes and clinical narratives are **signed**.
- Score + every issue persisted to `preflight_results` / `preflight_issues` and recomputed on each edit.

## 3. Output (worked example, matches the brief)
```
Claim #12345
Patient: Robert Sato
Payer: Guardian
Pre-Flight Score: 86  →  Status: Minor warning — "Needs better attachment"

Issues:
  ⚠ BW missing for crown            (warn → attach a bitewing or confirm PA is diagnostic)
  ✓ Narrative present               (signed by Dr. {provider})
  ✓ Tooth number present            (#14)
  ✓ Eligibility verified            (PPO active, checked 2 days ago)
Next action: Attach a diagnostic BW (or mark PA sufficient with reason) → re-run pre-flight.
Assigned: {biller}   Follow-up: today
```
The card always answers the six questions: **missing** (BW), **risky** (attachment may not support D2740), **do now** (attach BW), **last** (eligibility 2 days ago), **follow-up** (today), **who** (assigned biller).

## 4. UI behavior
- Lives in the Claim Builder right rail (CLAIM_BUILDER_837D.md) and as a column/badge in the Claims Tracker.
- Big score chip + status band; expandable issue list, each issue with a **Fix** deep-link and plain-English "why."
- Green checks for satisfied items (show the work, build trust).
- **Submit button** is enabled only for Ready or acknowledged Minor-warning; disabled for Needs-review/Blocked.
- "Re-run Pre-Flight" recomputes after any change.

## 5. Relationship to Stedi
Pre-Flight mirrors and pre-empts **Stedi's claim edits** (Stedi validates 837D against spec and may reject via 277CA). Where we can encode a Stedi/payer edit locally, we do, so failures surface in KYT OS first. Stedi remains the authority; Pre-Flight reduces round-trips.

## 6. Acceptance criteria
- [ ] Every check in §1 runs and is visible with pass/warn/fail + plain-English text.
- [ ] Hard-required failures force score < 50 and **block** submission.
- [ ] Score bands behave exactly as §2 (100 ready / 80–99 minor / 50–79 review / <50 blocked).
- [ ] Score + issues stored (`preflight_results`, `preflight_issues`) and recomputed on edit.
- [ ] The Builder submit button respects the band; clinical narratives must be signed to reach 100.
- [ ] Secondary claims without a primary EOB cannot exceed "Blocked/Needs review."

## 7. Developer tasks
- Build the per-CDT requirement table + per-payer overrides.
- Implement the Pre-Flight service (pure function: claim + attachments + eligibility + sign-offs → score + issues).
- Wire AI x-ray verdicts and eligibility freshness into checks 16 and 3.
- Build the score chip + issue list UI with Fix deep-links.
- Persist results; expose `POST /api/claims/preflight` (API_ARCHITECTURE.md).
