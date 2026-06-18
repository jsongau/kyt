# KYT OS — Dental Billing Module · Spec Index
*Replacing the manual iDentalSoft + Vyne billing loop with one KYT OS workflow: create → validate → package → submit → track → correct → rebill → document.*

## Read in this order
1. **BILLING_MASTER_PLAN.md** — the vision, lifecycle, module map, success metrics.
2. **CURRENT_WORKFLOW_TO_REPLACE.md** — the old iDentalSoft/Vyne process, mapped step-by-step to its replacement.
3. **CLAIM_CREATION_UI.md** — the New Claim builder + the Readiness Score gate.
4. **NARRATIVE_TEMPLATE_LIBRARY.md** — 20 structured narrative templates + provider sign-off.
5. **AI_XRAY_ATTACHMENT_REVIEW.md** — the "billing support review" attachment checker (not clinical diagnosis).
6. **CLAIM_STATUS_ENGINE.md** — the 17 statuses, the state machine, and per-claim tracking fields.
7. **VYNE_INTEGRATION_REQUIREMENTS.md** — what we need from Vyne + the exact onboarding questions.
8. **DATABASE_SCHEMA.md** — all 17 tables, relationships, indexes, no-hard-delete rules.
9. **BILLING_SAFETY_RULES.md** — the binding guardrails (these win over any other spec).
10. **MVP_BUILD_PLAN.md** — the 5-phase delivery plan (ship the builder first, integrate later).

## Canonical lists (single source of truth — keep these consistent everywhere)
- **Readiness states:** Ready · Needs X-ray · Needs narrative · Needs perio chart · Needs better PA · Needs tooth number · Needs primary EOB · Needs corrected claim reason → *CLAIM_CREATION_UI.md*
- **Claim statuses:** Ready to Bill · Needs Review · Submitted · Accepted by Clearinghouse · Rejected by Clearinghouse · Pending Payer · Processed · Paid · Partially Paid · Denied · Not Paid · Request Deleted · Corrective Needed · Rebill Needed · Appeal Needed · Write-off Review · ERA Received → *CLAIM_STATUS_ENGINE.md*
- **Tables (17):** patients · insurance_policies · claims · claim_procedures · claim_attachments · claim_narratives · claim_status_events · payer_directory · eras · payments · writeoffs · appeals · corrective_claims · billing_notes · ai_attachment_reviews · submission_batches · audit_logs → *DATABASE_SCHEMA.md*

## Non-negotiables (from BILLING_SAFETY_RULES.md)
No auto-submit · provider sign-off on clinical narratives · AI suggests, humans approve · full HIPAA audit trail · billing language ≠ clinical diagnosis · never hard-delete (use Request Deleted).
