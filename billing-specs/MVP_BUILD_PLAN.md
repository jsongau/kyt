# MVP_BUILD_PLAN.md
### Phased delivery plan for KYT OS Dental Billing
*Goal: ship value early (a better claim builder) before the heavy integration work, then layer AI, EDI, payments, and prediction.*

---

## 0. Sequencing logic
Each phase is independently valuable and de-risks the next. Phase 1 proves the builder + validation with **zero clearinghouse dependency** (manual upload to Vyne). Phases 2–5 progressively automate. We never block Phase 1 value on Vyne API answers (VYNE_INTEGRATION_REQUIREMENTS.md).

---

## Phase 1 — Internal claim builder + checklist + narratives (no API)
**Outcome:** a biller builds, validates, and packages a claim in KYT OS, then uploads the packet to Vyne manually. Eliminates re-keying and missing-attachment denials immediately.

**Scope**
- Claim Builder UI (CLAIM_CREATION_UI.md) with auto-draft from completed codes.
- Readiness Score with all blocker states (manual/rule-based, no AI yet).
- Narrative template library + provider sign-off (NARRATIVE_TEMPLATE_LIBRARY.md).
- Attachment upload + per-code attachment **checklist** (human-checked; AI in Phase 2).
- Status engine core + tracker tabs (CLAIM_STATUS_ENGINE.md) with manual status updates.
- **Export claim packet (PDF + attachments)** for manual Vyne upload.
- Schema, RBAC, audit, no-hard-delete (DATABASE_SCHEMA.md, BILLING_SAFETY_RULES.md).

**Acceptance**
- [ ] Claim auto-drafts to Ready to Bill from completed codes.
- [ ] Submit blocked unless Readiness = Ready (rule-based).
- [ ] Provider sign-off enforced for clinical narratives.
- [ ] Packet PDF generates with claim data + tagged attachments + narrative.
- [ ] Full audit trail; no hard deletes.

**Dev tasks:** schema migrations; Builder UI; readiness rules; templates + sign-off; PDF packet exporter; tracker + manual status; audit/RBAC.

---

## Phase 2 — AI x-ray quality checker + missing-info detector
**Outcome:** AI reduces denials by catching bad/wrong attachments and missing data before submission.

**Scope**
- AI attachment review (AI_XRAY_ATTACHMENT_REVIEW.md): tooth visible, apex, diagnostic quality, type-vs-code, correct-tooth, defects, duplicates.
- AI missing-info detector feeding Readiness (Needs X-ray / better PA / narrative / perio chart / tooth number / primary EOB / corrected reason).
- Risky-language linter for narratives (BILLING_SAFETY_RULES.md R8).
- All AI advisory; human approves; disclaimers + model_version recorded.

**Acceptance**
- [ ] Uploads get a billing-support review card; verdicts drive readiness.
- [ ] Wrong-tooth / non-diagnostic / duplicate images flagged.
- [ ] No fabrication; disclaimer present; overrides logged.

**Dev tasks:** vision model behind BAA service; review→readiness wiring; duplicate/wrong-patient detection; linter.

---

## Phase 3 — Vyne API/SFTP integration (837D + attachments + status)
**Outcome:** submit electronically from KYT OS; receive accept/reject + trace/reference numbers automatically.

**Scope**
- `ClearinghouseClient` abstraction (API or SFTP), per VYNE answers.
- 837D generator + validator (single + batch); attachment transport.
- Inbound 277 (Accepted/Rejected) → automated status transitions.
- Corrected/replacement claim submission; submission_batches.
- Trace/reference capture into claims; transaction audit.

**Acceptance**
- [ ] Test 837D round-trips in Vyne sandbox; trace number stored.
- [ ] 277 A/R updates status automatically.
- [ ] Attachments sent + linked; corrected claims supported.
- [ ] BAA/onboarding/certification complete.

**Dev tasks:** client abstraction; 837D gen/validate; 277 handler/webhook; batch; payer_directory sync.

---

## Phase 4 — ERA/payment posting + denial analytics
**Outcome:** payments post themselves from 835s; denials become structured, analyzable data.

**Scope**
- 835/ERA ingest → `eras`, `payments`; auto-post to claims (Paid/Partially/Denied).
- Write-off Review flow; patient-responsibility calc; adjustment (CARC/RARC) capture.
- Denial analytics: reasons by payer/code/provider; aging dashboards.

**Acceptance**
- [ ] 835 posts against originating claim; status transitions correctly.
- [ ] Partial pays route to appeal/write-off review.
- [ ] Denial + aging dashboards live, sliceable by payer/code/staff.

**Dev tasks:** 835 parser; posting/reconciliation; write-off workflow; analytics warehouse + dashboards.

---

## Phase 5 — Predictive billing engine
**Outcome:** the system gets ahead of problems — predicting attachments, weak narratives, slow payers, denial-prone codes, and rebill needs.

**Scope (predictions)**
- **Which claims need attachments** (by code/payer history) — prompt before submit.
- **Which narratives are weak** — score and suggest strengthening pre-sign.
- **Which payers delay** — dynamic follow-up timing per payer.
- **Which codes get denied** — risk score at claim build.
- **Which claims need rebill** — "likely not received / will age out" early warning.

**Acceptance**
- [ ] Each prediction surfaces in the Builder or Work Queue with a confidence + rationale.
- [ ] Predictions are advisory (BILLING_SAFETY_RULES.md R4) and measured against outcomes.
- [ ] Demonstrated lift in clean-claim rate and reduction in days-in-A/R vs. baseline.

**Dev tasks:** feature store from claims/events/ERAs; models per prediction; feedback loop; UI surfacing + A/B measurement.

---

## Cross-phase: definition of done & guardrails
Every phase must satisfy BILLING_SAFETY_RULES.md (no auto-submit, sign-off, audit, no hard delete, billing≠diagnosis) and keep the HMO/existing tracker behavior intact. Ship behind a branch → preview → review → merge process; parallel-run against the manual workflow (CURRENT_WORKFLOW_TO_REPLACE.md §5) before cutover.

## Suggested milestones
| Phase | Theme | Gate to next |
|---|---|---|
| 1 | Builder + packet export | Billers prefer it to iDentalSoft for creation |
| 2 | AI quality/missing-info | Measurable denial-prevention in parallel run |
| 3 | Vyne EDI | Sandbox round-trip + onboarding done |
| 4 | ERA + analytics | Auto-posting reconciles to the penny |
| 5 | Prediction | Lift vs. baseline proven |
