# ACCEPTANCE_CRITERIA.md
### "Done" criteria for KYT OS Dental Billing on Stedi
*Consolidated, testable acceptance criteria. Each maps to a spec and a phase. A feature isn't done until its boxes are checked in sandbox and (where noted) production.*

---

## 0. Product principle (the bar every screen must clear)
KYT OS doesn't just submit claims — it tells staff **what to do next**. Every screen must answer: **What is missing? · What is risky? · What should I do now? · What happened last? · When do I follow up? · Who is responsible?** A screen that can't answer these is not done.

## 1. Eligibility (ELIGIBILITY_STATION.md)
- [ ] Staff can run an eligibility check in **under 30 seconds** from a saved patient.
- [ ] System **stores the raw 271** response (and can produce an eligibility PDF).
- [ ] System displays **human-readable benefits**: annual max, remaining, deductible, coverage % (preventive/basic/major), waiting periods, frequencies.
- [ ] System **flags HMO/DMO/capitation risk** (red), ambiguous coverage (amber); never silent green on "active" alone.
- [ ] Every check is saved to **Eligibility History** with staff + timestamp.

## 2. Pre-Flight (PRE_FLIGHT_ENGINE.md)
- [ ] System **blocks claims with missing required fields/attachments** (score < 50 = hard block).
- [ ] System gives **clear, plain-English action items** per issue with a Fix link.
- [ ] System **stores the score and issues** and recomputes on edit.
- [ ] Score bands behave exactly: 100 Ready · 80–99 Minor warning · 50–79 Needs review · <50 Blocked.
- [ ] Clinical narratives must be **signed** to reach 100.

## 3. Claim submission (CLAIM_BUILDER_837D.md)
- [ ] System can **submit a test 837D in Stedi sandbox** (`usageIndicator T`) and store the response.
- [ ] System **stores the Stedi response** (`correlationId`, `rhclaimNumber`, PCN, line control numbers, 277CA).
- [ ] System **updates the claim timeline** (Submitted → Accepted/Rejected by Stedi).
- [ ] **Idempotency key** is sent; duplicate submissions are prevented.
- [ ] Secondary claims populate COB (`paymentResponsibilityLevelCode` + `otherSubscriberInformation`).
- [ ] All **CONFIRM** mapping items resolved against Stedi docs before production.

## 4. ERA / posting (ERA_835_PAYMENT_POSTING.md)
- [ ] System **imports an ERA** (poll or webhook).
- [ ] System **matches claim lines** via PCN + `lineItemControlNumber` (incl. partial-line ERAs).
- [ ] Staff can **post or review** (post / partial / appeal / corrective / write-off / patient balance), each audited.
- [ ] Unmatched ERAs route to a queue; no auto-post on a weak match.
- [ ] Claim and ERA totals **reconcile to the cent**.

## 5. Tracking & status (CLAIM_TRACKING_AND_STATUS.md)
- [ ] All statuses reachable; only legal transitions allowed.
- [ ] Each transition stores timestamp, user, source, Stedi response ID, payer reference #, message, raw payload link, next action, follow-up date.
- [ ] **Aging queues** (0–15/16–30/31–60/61–90/90+) populate; 90+ flags timely-filing risk.
- [ ] Quiet claims auto-suggest a **276/277** status check.

## 6. Attachments & narratives (ATTACHMENT_AND_NARRATIVE_ENGINE.md)
- [ ] Selecting a CDT suggests the right template + attachment checklist.
- [ ] Missing required narrative/perio chart → correct Pre-Flight blocker.
- [ ] Clinical narratives require **provider sign-off**; signed version submits.
- [ ] Risky-wording linter flags before sign-off; AI never adds un-entered findings.
- [ ] Per-payer attachment path (275 vs portal/NEA) recorded and shown.

## 7. AI x-ray review (AI_XRAY_REVIEW.md)
- [ ] Each upload yields Image Quality + Billing Support scores + disclaimer.
- [ ] Apex/quality/wrong-tooth/duplicate/wrong-patient handled (retake or hard flag).
- [ ] **Human approval always required**; no path auto-submits on AI alone.
- [ ] `model_version` + confidence stored; overrides logged with reason.

## 8. Corrective/rebill/appeal (CORRECTIVE_REBILL_APPEAL_WORKFLOW.md)
- [ ] Each KYT scenario opens the correct workflow with the original linked.
- [ ] Corrected/void set `claimFrequencyCode` 7/8 + reason + original reference.
- [ ] Rebill creates a new PCN + "not received" cover note.
- [ ] Appeals prefill denial reason from 835; clinical grounds require sign-off.
- [ ] Payer calls log rep + reference number + follow-up; problem claims become tracked tasks.

## 9. Data & platform (DATABASE_SCHEMA.md, API_ARCHITECTURE.md)
- [ ] All 23 tables exist with FKs, indexes, RLS; auditor is read-only.
- [ ] Append-only on status_events, billing_notes, audit_logs; **no hard delete** on protected tables.
- [ ] **No Stedi key reachable client-side**; all PHI access logged; webhooks signature-verified.
- [ ] Pre-Flight re-validated **server-side** on submit (client cannot bypass).

## 10. Compliance (cross-cutting)
- [ ] BAA in place with Stedi and any AI provider; synthetic PHI only in non-prod.
- [ ] Transaction/ERA enrollment tracked per payer/provider; Vyne cutover sequenced without breaking live billing.
- [ ] HIPAA audit trail answers "who did what, when" for every claim.

## 11. Phase exit gates (MVP_BUILD_PLAN.md)
- [ ] **P1:** eligibility <30s + scored claim packet export (no Stedi submit).
- [ ] **P2:** sandbox 837D round-trip + 277CA timeline + enrollment tracking.
- [ ] **P3:** 835 auto-match + reconcile to the cent + denial/aging dashboards.
- [ ] **P4:** AI review + AI narrative (sign-off) + payer rules in Pre-Flight.
- [ ] **P5:** predictive follow-up + one-approval rebill/appeal drafts; measured A/R improvement.
