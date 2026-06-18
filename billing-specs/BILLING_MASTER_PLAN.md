# BILLING_MASTER_PLAN.md
### KYT OS — Dental Billing Module · Master Plan
*Version 0.1 · Owner: KYT OS · Status: Draft for build*

---

## 0. One-sentence vision
Replace the manual "create the claim in iDentalSoft, attach in Vyne, submit, then babysit it by phone" loop with a single KYT OS workflow that **creates, validates, packages, submits, tracks, corrects, rebills, and documents** every dental insurance claim — with AI assisting and humans approving.

## 1. Why this exists (the problem)
Today billing lives across two systems and a phone. Staff re-key the same claim into iDentalSoft, hunt the payer ID in Vyne, manually attach x-rays/perio/narratives, submit, then track status by memory, sticky notes, and phone calls. The cost: duplicate data entry, missed attachments (the #1 cause of denials), weak narratives, claims that "were never received," slow rebills, and no single source of truth for where a dollar is in its lifecycle.

KYT OS already owns the **Insurance Ledger / Claims Tracker** surface — tabs for New Claim, Ortho, Corrective, ERA, payer filters, claim-status filters, and the Ready to Bill / Pending / Not Paid / Processed / Write-offs / Request Deleted buckets. This module turns that tracker from a *list* into an *operating system*: the place a claim is born, validated, sent, and resolved.

## 2. Outcomes we are optimizing for
- **Clean-claim rate** (accepted by clearinghouse on first pass) → target ≥ 95%.
- **Attachment-complete-before-submit rate** → target 100% of claims that require an attachment.
- **Days in A/R** (DOS → paid) → measurable reduction vs. current baseline.
- **Re-keying eliminated:** a claim is entered once, in KYT OS.
- **Auditability:** every create/edit/submit/correct/delete is attributable to a person and timestamp.

## 3. The end-to-end lifecycle (the spine of the product)
```
Patient seen
   └─ Treatment completed
        └─ ADA (CDT) codes marked COMPLETE in the chart
             └─ Claim auto-drafts into "Ready to Bill" queue
                  └─ Claim Builder: patient · DOS · carrier · coverage order · provider · codes · tooth/surface/quadrant/arch · narrative · diagnosis reason
                       └─ Attachment & narrative check (x-rays, perio, EOB, medical clearance, prior claim docs)
                            └─ AI VALIDATION (missing-field + attachment-quality + narrative-strength) → Readiness Score
                                 └─ HUMAN APPROVAL (provider sign-off for clinical narratives)
                                      └─ SUBMIT to Vyne / payer (837D + attachments)
                                           └─ Clearinghouse ack (Accepted / Rejected 277)
                                                └─ TRACKING (Pending Payer → Processed)
                                                     └─ ERA / 835 received → PAYMENT POSTING
                                                          ├─ Paid / Partially Paid → reconcile, write-off review
                                                          └─ Denied / Not Paid / "never received"
                                                               └─ FOLLOW-UP → Corrective / Rebill / Appeal
                                                                    └─ Resubmit → back into tracking
```

Every arrow above is a state transition recorded in `claim_status_events` (see DATABASE_SCHEMA.md), and every status maps to a tab/filter already present in the Claims Tracker.

## 4. Module map (what we are building)
| # | Capability | Primary spec | Tracker surface |
|---|---|---|---|
| 1 | Claim creation & validation | CLAIM_CREATION_UI.md | New Claim tab |
| 2 | Narrative authoring | NARRATIVE_TEMPLATE_LIBRARY.md | Claim Builder → Narrative |
| 3 | AI attachment review | AI_XRAY_ATTACHMENT_REVIEW.md | Claim Builder → Attachments |
| 4 | Status & lifecycle | CLAIM_STATUS_ENGINE.md | All status filters |
| 5 | Submission / EDI | VYNE_INTEGRATION_REQUIREMENTS.md | Submit + ERA tab |
| 6 | Data model | DATABASE_SCHEMA.md | — |
| 7 | Guardrails | BILLING_SAFETY_RULES.md | Global |
| 8 | Delivery sequencing | MVP_BUILD_PLAN.md | — |
| 9 | What we're replacing | CURRENT_WORKFLOW_TO_REPLACE.md | — |

## 5. Personas
- **Front-office biller** — creates, validates, submits, follows up. Primary user. Wants speed + "tell me what's missing."
- **Provider (DDS)** — signs off clinical narratives; never writes EDI. Wants a 10-second approve/edit.
- **Office manager** — owns A/R, denials, write-off review, staff assignment. Wants dashboards and accountability.
- **Auditor / compliance** — read-only; wants a complete, immutable trail (HIPAA).

## 6. Design principles
1. **Enter once.** Data flows from the chart → claim; no re-keying into iDentalSoft.
2. **AI suggests, humans approve.** Nothing clinical is submitted without provider sign-off; nothing is auto-submitted (see BILLING_SAFETY_RULES.md).
3. **Billing language ≠ clinical diagnosis.** AI output is framed as "billing support review," never a final diagnosis.
4. **Block before you bleed.** A claim cannot leave the building missing a required attachment or field — the Readiness Score gates submission.
5. **Never destroy records.** Deletes are a *status* (Request Deleted), not a row deletion.
6. **Everything is an event.** Status changes, edits, and document actions are append-only events for audit and analytics.

## 7. Scope boundaries (MVP)
**In scope:** dental (CDT/ADA) claims — primary/secondary/tertiary; attachments; narratives; status tracking; ERA posting; corrective/rebill/appeal flows; audit trail.
**Out of scope (for now):** medical cross-coding (CMS-1500/medical claims), patient billing/statements, treatment planning, scheduling, payroll, and clinical charting (KYT OS consumes "codes complete" from the chart but is not the charting system).
**Dependencies:** a source of completed ADA codes (chart/iDentalSoft export or KYT OS chart), a Vyne/clearinghouse account, payer enrollment for ERA.

## 8. Success metrics & instrumentation
- Funnel counts per status, per payer, per provider, per code.
- First-pass acceptance %, denial reasons, attachment-related denials.
- Mean/median days in each status; aging buckets (0–30/31–60/61–90/90+).
- Rebill rate and "not received" rate by payer (feeds the Phase 5 predictive engine).
- Every metric sliceable by assigned staff for accountability, never for public shaming.

## 9. Acceptance criteria (module-level "definition of done")
- [ ] A completed-treatment patient appears in **Ready to Bill** without manual claim creation in iDentalSoft.
- [ ] A claim cannot reach **Submitted** unless its Readiness Score = **Ready** (all required fields + attachments + provider sign-off present).
- [ ] Every status in CLAIM_STATUS_ENGINE.md is reachable and recorded as an event with actor + timestamp.
- [ ] A submitted claim can receive a clearinghouse Accepted/Rejected result and surface it in the tracker.
- [ ] An 835/ERA can post a payment against the originating claim and move it to Paid/Partially Paid.
- [ ] Corrective, Rebill, and Appeal each produce a linked child claim referencing the original.
- [ ] No record is ever hard-deleted; "deletion" is a status with full history retained.
- [ ] HIPAA audit log captures who uploaded, edited, submitted, corrected, or deleted each claim.

## 10. Developer tasks (epics)
- **EPIC-A Claim intake:** chart → Ready-to-Bill drafting; New Claim builder (CLAIM_CREATION_UI.md).
- **EPIC-B Validation engine:** required-field rules per code/payer; Readiness Score service.
- **EPIC-C Narrative system:** template library + provider sign-off (NARRATIVE_TEMPLATE_LIBRARY.md).
- **EPIC-D AI attachment review:** image-quality + correct-tooth checks (AI_XRAY_ATTACHMENT_REVIEW.md).
- **EPIC-E Status engine:** state machine + events + tracker filters (CLAIM_STATUS_ENGINE.md).
- **EPIC-F Submission:** 837D generation, attachment packaging, Vyne transport (VYNE_INTEGRATION_REQUIREMENTS.md).
- **EPIC-G ERA/posting:** 835 ingest, payment reconciliation, write-off review.
- **EPIC-H Follow-up:** corrective/rebill/appeal workflows + tickler dates.
- **EPIC-I Platform:** schema, RBAC, audit, HIPAA logging (DATABASE_SCHEMA.md, BILLING_SAFETY_RULES.md).
- **EPIC-J Analytics:** denial/aging dashboards → predictive billing (MVP Phase 5).

## 11. Risks & mitigations
| Risk | Mitigation |
|---|---|
| AI "diagnoses" beyond billing scope | Hard language constraints + human sign-off (BILLING_SAFETY_RULES.md) |
| Vyne API limits unknown | VYNE doc is a requirements/question set; Phase 1 ships with PDF packet export as fallback |
| PHI exposure | Encryption in transit/at rest, RBAC, audit log, minimum-necessary fields |
| Bad attachment slips through | Submission gate requires AI review + human confirm on attachment-required codes |
| Payer-specific rules drift | Payer directory carries per-payer requirement flags, versioned |

## 12. Glossary
**837D** dental claim EDI transaction · **835** ERA/remittance · **276/277** claim status request/response · **270/271** eligibility request/response · **CDT/ADA code** dental procedure code · **PA** periapical x-ray · **BW** bitewing x-ray · **EOB** explanation of benefits · **ERA** electronic remittance advice · **DOS** date of service · **Clearinghouse** Vyne, the routing layer between KYT OS and payers.
