# KYT OS Dental Billing on Stedi — Blueprint Index
*Tool is **Stedi** (modern healthcare EDI clearinghouse, JSON + X12 APIs). Pre-flight = pre-submission readiness checking. Architecture: **KYT OS → Stedi APIs → Payers**.*

## Read in this order
1. **STEDI_INTEGRATION_MASTER_PLAN.md** — architecture, the 7 transactions in plain English, how KYT OS sits on Stedi.
2. **ELIGIBILITY_STATION.md** — 270/271 verification; HMO/DMO safety rule; benefits UI.
3. **PRE_FLIGHT_ENGINE.md** — readiness scoring (100 / 80–99 / 50–79 / <50) before submit.
4. **CLAIM_BUILDER_837D.md** — New Claim builder + **real Stedi 837D field mapping table**.
5. **ATTACHMENT_AND_NARRATIVE_ENGINE.md** — templates, attachment checklist, payer notes, sign-off.
6. **AI_XRAY_REVIEW.md** — billing-support image review (not diagnosis); human approval always.
7. **CLAIM_TRACKING_AND_STATUS.md** — statuses, status events, aging queues.
8. **ERA_835_PAYMENT_POSTING.md** — match/post 835 payments + staff actions.
9. **CORRECTIVE_REBILL_APPEAL_WORKFLOW.md** — problem-claim workflows + templates.
10. **DATABASE_SCHEMA.md** — 23 Supabase/Postgres tables, RLS, PHI, no-hard-delete.
11. **API_ARCHITECTURE.md** — Next.js + Supabase + StediClient; 8 API routes; security.
12. **MVP_BUILD_PLAN.md** — 5 phases (eligibility-first, submission, ERA, AI, command center).
13. **QUESTIONS_FOR_STEDI.md** — 30 onboarding questions (some pre-answered from docs).
14. **ACCEPTANCE_CRITERIA.md** — consolidated, testable "done" criteria.

## The product principle (every screen must answer)
**What is missing? · What is risky? · What should I do now? · What happened last? · When do I follow up? · Who is responsible?**

## Canonical lists (keep consistent across all docs)
- **Stedi transactions:** 270/271 eligibility · 837D dental claim · 277CA acknowledgement · 276/277 claim status · 835 ERA.
- **Claim statuses:** Draft · Ready to Bill · Pre-Flight Failed · Pre-Flight Passed · Submitted · Accepted by Stedi · Rejected by Stedi · Accepted by Payer · Rejected by Payer · Pending Payer · Processed · Paid · Partially Paid · Denied · Not Paid · Corrective Needed · Rebill Needed · Appeal Needed · ERA Received · Write-off Review · Request Deleted → *CLAIM_TRACKING_AND_STATUS.md*
- **Pre-Flight bands:** 100 Ready · 80–99 Minor warning · 50–79 Needs review · <50 Blocked → *PRE_FLIGHT_ENGINE.md*
- **23 tables:** patients · patient_insurance_policies · payers · providers · claims · claim_lines · claim_attachments · claim_narratives · eligibility_checks · eligibility_benefits · preflight_results · preflight_issues · stedi_submissions · claim_status_events · eras · era_lines · payments · writeoffs · appeals · corrective_claims · billing_tasks · billing_notes · audit_logs → *DATABASE_SCHEMA.md*

## Key verified Stedi facts (June 2026 — confirm against your account/payers)
- Dental Claims API (837D) is **GA**; JSON or X12; Stedi validates + runs claim edits, returns a **277CA**.
- Endpoints on `healthcare.us.stedi.com/2024-04-01/...`; **Idempotency-Key** recommended; **`usageIndicator: T`** for test.
- Correlation via **`patientControlNumber` (PCN, ≤17 chars)** + per-line **control numbers** echoed in 277CA/835.
- **275 attachments** supported for only a **subset** of dental payers; otherwise submit out-of-band and reference via `reportInformation(s)`.
- Some payers require **transaction enrollment** (837) and **provider enrollment** (ERA). Enrolling 837 via Stedi **may cancel existing Vyne enrollments** — sequence the cutover.
- Responses via **polling or webhooks**.

## Non-negotiables
No auto-submit · provider sign-off on clinical narratives · AI suggests/humans approve · full HIPAA audit trail · billing language ≠ clinical diagnosis · never hard-delete (Request Deleted) · Stedi keys server-side only.
