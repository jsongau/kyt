# DATABASE_SCHEMA.md
### Supabase / Postgres schema for KYT OS Dental Billing
*23 tables. PHI-aware, RLS-enforced, append-only where noted, never-hard-delete on clinical/financial records.*

---

## 0. Conventions
- `id uuid default gen_random_uuid()` PK; `created_at/updated_at timestamptz`; `created_by/updated_by → auth.users`.
- Money in **integer cents**. Dates as `date`; EDI dates stored as given + normalized.
- **Soft delete only** on clinical/financial tables (status `request_deleted` or `deleted_at/deleted_by`); enforced by trigger.
- **RLS** on every table: practice/tenant scoping + role (biller/provider/manager/auditor). Auditor = read-only.
- **PHI** columns flagged; encryption at rest (Supabase/pgcrypto for the most sensitive tokens), access logged to `audit_logs`.

## 1. Table index
patients · patient_insurance_policies · payers · providers · claims · claim_lines · claim_attachments · claim_narratives · eligibility_checks · eligibility_benefits · preflight_results · preflight_issues · stedi_submissions · claim_status_events · eras · era_lines · payments · writeoffs · appeals · corrective_claims · billing_tasks · billing_notes · audit_logs

---

## 2. Tables

### patients
- **Purpose:** demographics. **PHI: high.**
- **Columns:** id, chart_number(unique), first_name, last_name, dob, sex, address jsonb, phone, email, created/updated_*.
- **Rel:** 1‑M patient_insurance_policies, claims, eligibility_checks.
- **Indexes:** (chart_number), (last_name, dob).
- **RLS/PHI:** tenant + role read; all access logged.

### patient_insurance_policies
- **Purpose:** coverage on file. **PHI: high.**
- **Columns:** id, patient_id→patients, payer_id→payers, coverage_order enum(primary,secondary,tertiary), subscriber_name, subscriber_dob, member_id, group_number, relationship_to_subscriber, effective_date, term_date, plan_type enum(ppo,hmo,dmo,epo,unknown), created/updated_*.
- **Rel:** referenced by claims, eligibility_checks.
- **Indexes:** (patient_id), (member_id).
- **RLS/PHI:** member_id sensitive; logged.

### payers
- **Purpose:** Stedi payer directory cache + per-payer rules. **PHI: none.**
- **Columns:** id, payer_name, stedi_payer_id(unique), aliases text[], supports_837d bool, requires_claim_enrollment bool, supports_era bool, requires_era_enrollment bool, supports_275_attachments bool, supports_realtime_eligibility bool, timely_filing_days int, corrected_claim_method text, attachment_path enum(stedi_275,payer_portal,nea), attachment_rules jsonb, version, synced_at.
- **Indexes:** (stedi_payer_id), GIN(aliases).
- **Note:** synced from Stedi Payer Network / Payers API.

### providers
- **Purpose:** billing/rendering providers + enrollment state. **PHI: low.**
- **Columns:** id, type enum(billing,rendering,both), npi(unique), tax_id, taxonomy_code, first_name, last_name, organization_name, address jsonb, stedi_submitter_id, stedi_provider_record_id, enrollment_status jsonb (per payer/transaction), can_sign bool.
- **Indexes:** (npi).

### claims
- **Purpose:** the claim header. **PHI: high.**
- **Columns:** id, patient_id, policy_id, payer_id, coverage_order, billing_provider_id, rendering_provider_id, service_facility jsonb, date_of_service, place_of_service_code, claim_type enum(original,corrective,rebill,appeal,void), parent_claim_id→claims, claim_frequency_code, status enum(see CLAIM_TRACKING_AND_STATUS), preflight_score int, preflight_band enum(ready,minor_warning,needs_review,blocked), patient_control_number(unique, ≤17), claim_charge_cents, allowed_cents, paid_cents, patient_resp_cents, claim_filing_code, prior_auth_number, date_submitted, payer_reference_number, last_follow_up_date, next_follow_up_date, assigned_staff_id, submission_batch_id, created/updated_*.
- **Rel:** 1‑M claim_lines, claim_attachments, claim_narratives, claim_status_events, billing_notes; M‑1 policy/payer.
- **Indexes:** (status), (assigned_staff_id, next_follow_up_date), (payer_id, status), (patient_control_number), (date_submitted).

### claim_lines
- **Purpose:** service lines. **PHI: high.**
- **Columns:** id, claim_id→claims, cdt_code, tooth_number, surfaces, oral_cavity_designation text[], quadrant, arch, procedure_count, line_charge_cents, line_provider_control_number(unique per claim), diagnosis_pointers int[], allowed_cents, paid_cents, line_status.
- **Indexes:** (claim_id), (line_provider_control_number).

### claim_attachments
- **Purpose:** images/docs. **PHI: high.**
- **Columns:** id, claim_id, claim_line_id, type enum(pa,bw,pano,fmx,photo,perio_chart,primary_eob,medical_clearance,prior_claim_doc,other), tooth_number, file_ref(encrypted store key), file_hash, transmission_path enum(stedi_275,payer_portal,nea), attachment_control_number, ai_review_id→ai_attachment_reviews, uploaded_by, uploaded_at.
- **Indexes:** (claim_id), (file_hash).

### claim_narratives
- **Purpose:** narratives + sign-off. **PHI: high.**
- **Columns:** id, claim_id, claim_line_id, template_id, structured_fields jsonb, body, ai_assisted bool, clinical bool, version int, signed_by→providers, signed_at, created_by, created_at.
- **Indexes:** (claim_id).

### ai_attachment_reviews
- **Purpose:** AI billing-support review. **PHI: high (links images).**
- **Columns:** id, attachment_id, claim_id, claim_line_id, tooth_number, image_quality_score, billing_support_score, visible_findings, missing_view, retake_recommendation, flags jsonb, confidence, model_version, human_review_required bool default true, human_override bool, override_reason, overridden_by, reviewed_at.
- **Indexes:** (attachment_id), (claim_id).
> (Listed in the brief under attachments; included for completeness — referenced by claim_attachments.)

### eligibility_checks
- **Purpose:** one 270/271 round trip. **PHI: high.**
- **Columns:** id, patient_id, policy_id, payer_id, request jsonb, status enum(active,inactive,error), plan_type_detected enum(ppo,hmo,dmo,epo,unknown), raw_271_ref, stedi_trace_id, checked_by, checked_at.
- **Indexes:** (patient_id, checked_at).

### eligibility_benefits
- **Purpose:** parsed 271 lines. **PHI: high.**
- **Columns:** id, eligibility_check_id→eligibility_checks, category enum(preventive,basic,major,ortho,other), coverage_pct, deductible_cents, deductible_met_cents, annual_max_cents, remaining_cents, waiting_period_text, frequency_text, missing_tooth_clause bool, source_code, raw jsonb.
- **Indexes:** (eligibility_check_id).

### preflight_results
- **Purpose:** a pre-flight run. **PHI: low.**
- **Columns:** id, claim_id, score int, band enum(ready,minor_warning,needs_review,blocked), summary, run_by, run_at.
- **Indexes:** (claim_id, run_at).

### preflight_issues
- **Purpose:** individual issues per run. **PHI: low.**
- **Columns:** id, preflight_result_id→preflight_results, check_key, severity enum(pass,warn,fail), message, fix_hint, hard_required bool.
- **Indexes:** (preflight_result_id).

### stedi_submissions
- **Purpose:** every Stedi API submission + response. **PHI: high (payload).**
- **Columns:** id, claim_id, endpoint, idempotency_key, usage_indicator, request_ref(stored payload), correlation_id, rhclaim_number, payer_id, http_status, sync_277ca_ref, trace_id, submitted_by, submitted_at.
- **Indexes:** (claim_id), (correlation_id), (idempotency_key).

### claim_status_events  *(append-only)*
- **Purpose:** lifecycle history. **PHI: low/med.**
- **Columns:** id, claim_id, from_status, to_status, source enum(human,277ca,277,835,aging,webhook), actor_id, stedi_response_id, payer_reference_number, message, raw_payload_ref, next_action, follow_up_date, occurred_at.
- **Indexes:** (claim_id, occurred_at).
- **Rule:** no update/delete.

### eras
- **Purpose:** 835 header. **PHI: high.**
- **Columns:** id, payer_id, era_835_ref, check_eft_number, total_paid_cents, received_at, raw_payload_ref, posted bool, matched bool.
- **Indexes:** (era_835_ref), (received_at).

### era_lines
- **Purpose:** 835 detail mapped to claim lines. **PHI: high.**
- **Columns:** id, era_id→eras, claim_id, claim_line_id, allowed_cents, paid_cents, patient_resp_cents, deductible_cents, coinsurance_cents, writeoff_cents, denied_cents, carc text[], rarc text[], line_item_control_number.
- **Indexes:** (era_id), (claim_id), (line_item_control_number).

### payments
- **Purpose:** posted payments. **PHI: med.**
- **Columns:** id, claim_id, era_id, amount_cents, payment_type enum(insurance,patient,manual), adjustment_codes jsonb, posted_by, posted_at.
- **Indexes:** (claim_id).

### writeoffs
- **Purpose:** write-off review/approval. **PHI: low.**
- **Columns:** id, claim_id, amount_cents, reason, status enum(review,approved,reversed), approved_by, approved_at.
- **Indexes:** (claim_id), (status).

### appeals
- **Purpose:** appeal lifecycle. **PHI: high.**
- **Columns:** id, claim_id, appeal_claim_id→claims, denial_reason, denial_date, justification, supporting_docs jsonb, template_id, status enum(needed,in_progress,submitted,won,lost), created/updated_*.
- **Indexes:** (claim_id), (status).

### corrective_claims
- **Purpose:** link original ↔ corrective/rebill child. **PHI: low.**
- **Columns:** id, original_claim_id→claims, child_claim_id→claims, kind enum(corrective,rebill,void), reason_code, original_pcn, original_payer_reference, created_*.
- **Indexes:** (original_claim_id), (child_claim_id).

### billing_tasks
- **Purpose:** the work queue (follow-ups, problem claims). **PHI: low.**
- **Columns:** id, claim_id, type enum(follow_up,rebill,appeal,corrective,post_era,attachment,call_payer), status enum(open,in_progress,done), assigned_staff_id, due_date, priority, description, created/updated_*.
- **Indexes:** (assigned_staff_id, status, due_date), (claim_id).

### billing_notes  *(append-only)*
- **Purpose:** backnotes / payer calls. **PHI: med.**
- **Columns:** id, claim_id, note_type enum(call,internal,payer_response,follow_up), payer_rep_name, reference_number, outcome, next_action, next_follow_up_date, created_by, created_at.
- **Indexes:** (claim_id, created_at).

### audit_logs  *(append-only, HIPAA)*
- **Purpose:** every PHI access + mutation. **PHI: meta.**
- **Columns:** id, entity_type, entity_id, action enum(create,view,edit,submit,correct,rebill,appeal,delete_request,sign,override,post_payment,export,eligibility_check), actor_id, ip, user_agent, before jsonb, after jsonb, occurred_at.
- **Indexes:** (entity_type, entity_id), (actor_id, occurred_at).
- **Rule:** no update/delete; partition by month if needed.

## 3. RLS & PHI summary
- Every table: tenant scope + role policy. Auditor read-only. Providers can `sign`. Managers can approve write-offs + restore Request Deleted.
- **Minimum necessary:** only store member/PHI fields a claim needs.
- **View logging:** reads of high-PHI tables (patients, policies, eligibility, attachments, eras) emit an `audit_logs` view event.
- **No hard delete:** triggers block DELETE on patients, claims, claim_lines, attachments, narratives, eras, payments, status_events, audit_logs; deletion = status/`deleted_at`.

## 4. Acceptance criteria
- [ ] All 23 tables exist with columns, FKs, and indexes above.
- [ ] RLS enabled on every table; auditor role is read-only.
- [ ] Append-only enforced on status_events, billing_notes, audit_logs.
- [ ] Hard delete blocked on protected tables.
- [ ] Money in cents; enums match status + pre-flight + transaction docs.
- [ ] Audit trigger writes before/after on protected mutations; high-PHI reads logged.

## 5. Developer tasks
- Migrations for 23 tables + enums + FKs + indexes + RLS policies.
- Audit + no-hard-delete + append-only triggers.
- Payer sync job (Stedi Payer Network → payers).
- Generate TS types (Supabase) for the app.
