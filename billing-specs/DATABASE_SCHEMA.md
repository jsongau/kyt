# DATABASE_SCHEMA.md
### KYT OS Dental Billing — data model
*Relational schema (Postgres-style). Append-only where noted. All PHI tables encrypted at rest; access via RBAC; all writes audited.*

---

## 1. Conventions
- `id` = UUID primary key. `created_at`/`updated_at` = timestamptz. `created_by`/`updated_by` = users.id.
- **Soft delete only** for clinical/financial records: a `status` of `request_deleted` (claims) or a `deleted_at`/`deleted_by` pair — **never hard delete** (BILLING_SAFETY_RULES.md).
- Money in integer cents. Enums implemented as Postgres enums or lookup tables.
- Foreign keys shown as `→ table`.

## 2. Entity overview
```
patients ──< insurance_policies ──┐
   │                               │
   └──< claims >── policy_id ──────┘
         ├──< claim_procedures
         │        └──< claim_narratives
         ├──< claim_attachments ──< ai_attachment_reviews
         ├──< claim_status_events
         ├──< billing_notes
         ├──< corrective_claims (self-link parent/child)
         ├──< appeals
         └──< payments >── eras
payer_directory ── referenced by insurance_policies & claims
submission_batches ──< claims
writeoffs >── claims
audit_logs ── references everything
```

## 3. Tables

### patients
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| chart_number | text | unique per practice |
| first_name, last_name | text | |
| dob | date | |
| sex | text | |
| address_json | jsonb | |
| phone, email | text | |
| created_by, created_at, updated_by, updated_at | | |

### insurance_policies
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| patient_id | → patients | |
| payer_id | → payer_directory | verified Vyne payer ID |
| coverage_order | enum(primary, secondary, tertiary) | |
| subscriber_name, subscriber_dob, member_id, group_number | text | |
| relationship_to_subscriber | text | self/spouse/child |
| effective_date, term_date | date | |
| annual_maximum_cents, deductible_cents, remaining_max_cents | int | from eligibility |
| eligibility_last_checked_at | timestamptz | 270/271 |
| eligibility_snapshot_json | jsonb | frequencies, history |
| created_*/updated_* | | |

### payer_directory
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| payer_name | text | |
| vyne_payer_id | text | authoritative routing ID |
| supports_attachments | bool | |
| supports_era | bool | enrollment required flag |
| supports_realtime_eligibility | bool | |
| timely_filing_days | int | per-payer A/R aging threshold |
| corrected_claim_method | text | corrected vs void/replace |
| attachment_rules_json | jsonb | per-code attachment needs |
| version, source_synced_at | | from Vyne sync |

### claims
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| patient_id | → patients | |
| policy_id | → insurance_policies | |
| payer_id | → payer_directory | denormalized for routing |
| coverage_order | enum | primary/secondary/tertiary |
| rendering_provider_id, billing_provider_id | → users/providers | NPI/TIN/taxonomy |
| date_of_service | date | |
| claim_type | enum(original, corrective, rebill, appeal) | |
| parent_claim_id | → claims (nullable) | lineage |
| status | enum (see CLAIM_STATUS_ENGINE) | current state |
| readiness_state | enum(ready, needs_xray, needs_narrative, needs_perio_chart, needs_better_pa, needs_tooth_number, needs_primary_eob, needs_corrected_reason) | |
| readiness_blockers | jsonb (array) | all current blockers |
| billed_total_cents, allowed_total_cents, paid_total_cents, patient_resp_cents | int | |
| date_submitted | timestamptz | |
| clearinghouse_trace_number | text | from Vyne |
| payer_reference_number | text | payer claim ID |
| last_follow_up_date, next_follow_up_date | date | ticklers |
| assigned_staff_id | → users | |
| submission_batch_id | → submission_batches (nullable) | |
| created_*/updated_* | | |

### claim_procedures
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| claim_id | → claims | |
| cdt_code | text | ADA/CDT |
| tooth_number | text | Universal 1–32 / A–T |
| surfaces | text | M/O/D/B/L/I |
| quadrant | enum(UR,UL,LR,LL, null) | |
| arch | enum(maxillary, mandibular, null) | |
| diagnosis_reason | text | structured + free |
| fee_cents | int | |
| allowed_cents, paid_cents | int | from ERA |
| line_status | text | per-line adjudication |
| narrative_id | → claim_narratives (nullable) | |

### claim_narratives
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| claim_id | → claims | |
| procedure_id | → claim_procedures | |
| template_id | text | → narrative_templates config |
| structured_fields | jsonb | tooth, placement date, age, reason, finding, symptoms, material, prognosis |
| body | text | assembled narrative |
| ai_assisted | bool | |
| version | int | versioned; signed version submits |
| signed_by | → users (provider) | sign-off |
| signed_at | timestamptz | |
| created_*/ | | |

### claim_attachments
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| claim_id | → claims | |
| procedure_id | → claim_procedures (nullable) | |
| type | enum(pa, bw, pano, photo, perio_chart, primary_eob, medical_clearance, prior_claim_doc, other) | |
| tooth_number | text | tagged tooth |
| file_ref | text | encrypted blob store key |
| file_hash | text | duplicate detection |
| nea_attachment_number | text | if returned by Vyne |
| ai_review_id | → ai_attachment_reviews (nullable) | |
| uploaded_by, uploaded_at | | audit |

### ai_attachment_reviews
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| attachment_id | → claim_attachments | |
| claim_id, procedure_id, tooth_number | | |
| verdict | enum(usable, needs_review, not_usable) | |
| checks | jsonb | tooth visible, apex, quality, supports code, margin, type-vs-code, correct-tooth, defects |
| confidence | int | 0–100 |
| recommended_action | text | |
| model_version | text | |
| human_override | bool | |
| override_reason, overridden_by | | |
| reviewed_at | timestamptz | |

### claim_status_events  *(append-only)*
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| claim_id | → claims | |
| from_status, to_status | enum | |
| reason_code | text | rejection/denial/aging reason |
| source | enum(human, edi_277, edi_835, system_aging, webhook) | |
| actor_id | → users (nullable for system) | |
| trace_snapshot, reference_snapshot | text | |
| note | text | |
| occurred_at | timestamptz | |

### submission_batches
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| transport | enum(api, sftp, manual_pdf) | |
| claim_count | int | |
| status | enum(building, submitted, acknowledged, failed) | |
| clearinghouse_batch_ref | text | |
| submitted_by, submitted_at | | |

### eras
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| payer_id | → payer_directory | |
| era_835_ref | text | clearinghouse remit id |
| check_eft_number | text | |
| total_paid_cents | int | |
| received_at | timestamptz | |
| raw_payload_ref | text | stored 835 |
| posted | bool | |

### payments
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| claim_id | → claims | |
| era_id | → eras (nullable for manual) | |
| amount_cents | int | |
| adjustment_codes_json | jsonb | CARC/RARC |
| payment_type | enum(insurance, patient, manual) | |
| posted_by, posted_at | | |

### writeoffs
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| claim_id | → claims | |
| amount_cents | int | |
| reason | text | contractual/adjustment/other |
| status | enum(review, approved, reversed) | Write-off Review flow |
| approved_by, approved_at | | manager RBAC |

### appeals
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| claim_id | → claims | original |
| appeal_claim_id | → claims (child) | |
| denial_reason | text | |
| denial_date | date | |
| justification | text | |
| supporting_docs | jsonb | attachment ids |
| status | enum(needed, in_progress, submitted, won, lost) | |
| created_*/ | | |

### corrective_claims
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| original_claim_id | → claims | |
| child_claim_id | → claims | |
| kind | enum(corrective, rebill) | |
| reason_code | text | corrected-claim reason / "not received" |
| original_trace_number, original_reference_number | text | |
| created_*/ | | |

### billing_notes  *(append-only backnotes)*
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| claim_id | → claims | |
| note_type | enum(call, internal, payer_response, follow_up) | |
| payer_rep_name, reference_number | text | |
| outcome | text | |
| next_action, next_follow_up_date | | |
| created_by, created_at | | |

### audit_logs  *(append-only, HIPAA)*
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| entity_type | text | claim/attachment/narrative/payment/... |
| entity_id | uuid | |
| action | enum(create, view, edit, submit, correct, rebill, appeal, delete_request, sign, override, post_payment, export) | |
| actor_id | → users | |
| ip, user_agent | text | |
| before_json, after_json | jsonb | change diff |
| occurred_at | timestamptz | |

### users / providers *(referenced; may live in core KYT OS)*
roles: biller, provider, manager, auditor (read-only). Providers carry NPI/TIN/taxonomy and signing rights.

## 4. Key relationships & rules
- A `claim` has many `claim_procedures`; each procedure may have one signed `claim_narrative` and many `claim_attachments`.
- Secondary/tertiary `claims` require a `claim_attachments.type = primary_eob` before Ready.
- Corrective/rebill/appeal claims set `parent_claim_id` and create a `corrective_claims`/`appeals` link.
- `claim_status_events`, `billing_notes`, `audit_logs` are **append-only**.
- Deletion = `status = request_deleted` + audit event; data retained.

## 5. Indexing & performance
- Index claims on (status), (assigned_staff_id, next_follow_up_date), (payer_id, status), (date_submitted).
- Index claim_status_events on (claim_id, occurred_at).
- Index claim_attachments on (file_hash) for duplicate detection.
- Partition audit_logs / status_events by month if volume warrants.

## 6. Acceptance criteria
- [ ] All 17 tables from the spec exist with the columns above (patients, insurance_policies, claims, claim_procedures, claim_attachments, claim_narratives, claim_status_events, payer_directory, eras, payments, writeoffs, appeals, corrective_claims, billing_notes, ai_attachment_reviews, submission_batches, audit_logs).
- [ ] No hard deletes possible on clinical/financial tables (enforced by policy + DB triggers).
- [ ] Every write produces an audit_logs row with before/after.
- [ ] Money stored in cents; enums match CLAIM_STATUS_ENGINE + readiness states.
- [ ] Foreign keys + indexes created; PHI tables encrypted at rest.

## 7. Developer tasks
- Write migrations for all tables + enums + FKs + indexes.
- Add DB triggers blocking hard deletes on protected tables.
- Add audit trigger (before/after diff → audit_logs).
- Seed payer_directory from Vyne sync; seed narrative_templates config.
- Generate TypeScript types from schema for the app layer.
