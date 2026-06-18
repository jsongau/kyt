# BILLING_SAFETY_RULES.md
### Guardrails for AI-assisted dental billing
*These rules are binding across every spec. If a feature conflicts with a rule here, the rule wins.*

---

## 1. Why this document is non-negotiable
Dental insurance billing touches PHI, clinical judgment, and money. Getting it wrong isn't a bug — it can mean a HIPAA violation, a false claim, or a clinical misrepresentation. KYT OS uses AI to make billers faster, never to make clinical decisions or to send claims no human approved. These guardrails make that boundary enforceable in code, not just policy.

## 2. The core rules

### R1 — Do not fabricate clinical findings
AI may **assemble** language from data a human entered and may **suggest** phrasing, but it must never introduce a clinical finding, measurement, tooth, date, or diagnosis the biller/provider did not supply. Narrative templates assemble from structured fields only (NARRATIVE_TEMPLATE_LIBRARY.md). Attachment AI describes image adequacy, not clinical truth (AI_XRAY_ATTACHMENT_REVIEW.md).
- **Enforcement:** narrative assembler is constrained to entered fields; AI suggestions are diff-checked against source fields; any added clinical assertion is rejected/flagged.

### R2 — Do not auto-submit without human approval
No claim transitions to **Submitted** by AI or automation alone. A human biller must click submit, and the Readiness gate must read **Ready** (CLAIM_CREATION_UI.md).
- **Enforcement:** the submit action requires an authenticated user; system/AI actors are forbidden from the Ready→Submitted transition in the state machine.

### R3 — Require provider sign-off for clinical narratives
Any narrative tagged **clinical** must carry `signed_by` (a provider) and `signed_at` before the claim can be Ready.
- **Enforcement:** RBAC — only users with the provider role can sign; readiness blocks without sign-off; the signed version is the one submitted.

### R4 — AI suggests, staff approve
Every AI output (readiness hints, narrative phrasing, attachment verdicts, denial-reason guesses) is advisory. A human must accept it. Humans may override advisory AI with a documented reason, but **cannot** override hard requirements (e.g., a required attachment that is absent).
- **Enforcement:** AI outputs are labeled "suggested / billing support"; overrides recorded with reason + actor.

### R5 — Keep a HIPAA audit trail
Every create, view, edit, submit, correct, rebill, appeal, sign, override, payment-post, export, and delete-request is written to `audit_logs` with actor, timestamp, IP/agent, and before/after diff (DATABASE_SCHEMA.md).
- **Enforcement:** DB audit trigger; append-only; no edit/delete of audit rows.

### R6 — Track who did what to every claim
The system always answers "who uploaded / edited / submitted / corrected / deleted this, and when." Attribution is mandatory on attachments, narratives, status events, payments, and deletions.
- **Enforcement:** non-null actor on protected writes; status events carry actor + source.

### R7 — Separate billing language from clinical diagnosis
AI and templates produce **billing-support** language ("appears to support," "consistent with"), never final clinical diagnoses. The mandatory disclaimer "Billing support review only — not a clinical diagnosis" appears on all AI attachment output.
- **Enforcement:** language constraint at the model boundary; banned-phrase list; disclaimer required in the payload.

### R8 — Flag risky language before submission
Before a narrative is signed/submitted, scan for risky/over-reaching language: guarantees of outcome, diagnoses beyond entered support, copy-paste from another patient, internally inconsistent dates/teeth, or anything that reads as upcoding.
- **Enforcement:** pre-sign linter; flags must be resolved or explicitly acknowledged (audited) before sign-off.

### R9 — Never remove records
There is no hard delete of clinical/financial records. "Deletion" is the **Request Deleted** status (manager-restorable); the data and its history are retained.
- **Enforcement:** DB triggers block hard deletes on protected tables; deletes route to status + audit event.

## 3. Additional guardrails (supporting)
- **R10 Minimum necessary:** collect only the member/PHI fields a claim needs.
- **R11 Encryption & access:** PHI encrypted in transit/at rest; RBAC (biller/provider/manager/auditor); least privilege.
- **R12 No upcoding/unbundling assistance:** AI must not suggest higher-paying codes or split codes to increase payment; it works with the codes the provider completed.
- **R13 Duplicate/wrong-patient defense:** attachments are hashed and patient-matched; cross-patient reuse is hard-flagged (AI_XRAY_ATTACHMENT_REVIEW.md).
- **R14 Model traceability:** every AI output records model_version for recall/audit.
- **R15 Override accountability:** any override of an AI flag stores reason + actor; required-field/attachment blocks are non-overridable.
- **R16 Timely-filing awareness:** the system warns, but never silently alters dates to beat a filing deadline.
- **R17 Sandbox-only test PHI:** non-production environments use synthetic data only.

## 4. Rule → enforcement matrix
| Rule | Where enforced | Spec |
|---|---|---|
| R1 no fabrication | narrative assembler, AI constraint | NARRATIVE, AI_XRAY |
| R2 no auto-submit | state machine submit guard | CLAIM_STATUS_ENGINE, CLAIM_CREATION_UI |
| R3 provider sign-off | RBAC + readiness gate | NARRATIVE, CLAIM_CREATION_UI |
| R4 suggest/approve | UI labels + override log | all |
| R5 audit trail | DB audit trigger | DATABASE_SCHEMA |
| R6 attribution | non-null actor writes | DATABASE_SCHEMA |
| R7 billing≠diagnosis | model boundary + disclaimer | AI_XRAY |
| R8 risky-language flag | pre-sign linter | NARRATIVE |
| R9 no hard delete | DB triggers + status | DATABASE_SCHEMA, CLAIM_STATUS_ENGINE |

## 5. Acceptance criteria
- [ ] AI cannot submit a claim; only an authenticated human can (verified by attempting a system-actor submit → rejected).
- [ ] A clinical narrative without provider sign-off cannot reach Ready.
- [ ] Every protected write appears in audit_logs with actor + before/after.
- [ ] All AI attachment outputs display the non-diagnosis disclaimer.
- [ ] The risky-language linter blocks/flags before sign-off.
- [ ] Hard delete of a claim/attachment/payment is impossible; only Request Deleted, retained + restorable.
- [ ] Overrides record reason + actor; required-attachment blocks cannot be overridden.

## 6. Developer tasks
- Implement the submit guard (no non-human actor in Ready→Submitted).
- Implement provider-only sign-off RBAC + readiness dependency.
- Implement the DB audit trigger + hard-delete prevention triggers.
- Implement the AI language-constraint wrapper (banned phrases, mandatory disclaimer).
- Implement the pre-sign risky-language linter.
- Implement override logging with required reason; mark non-overridable blocks.
