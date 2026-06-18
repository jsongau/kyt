# NARRATIVE_TEMPLATE_LIBRARY.md
### Selectable, structured narrative templates with provider sign-off
*Surface: Claim Builder → per-procedure Narrative.*

---

## 1. Goal
Replace free-typed, inconsistent narratives with **structured templates** that capture exactly the data points payers look for, generate clean billing-support language, and require **provider sign-off** before a claim is Ready. Templates speed the biller up and raise approval rates without inventing clinical facts.

## 2. How a template works
1. Biller picks a template matching the procedure (auto-suggested from the CDT code).
2. The template presents **structured fields** (below). Required fields are enforced by the Readiness Score (**Needs narrative** until complete).
3. KYT OS assembles a draft narrative from the fields. **AI may suggest phrasing; it must not add clinical findings the biller/provider did not enter** (BILLING_SAFETY_RULES.md).
4. **Provider reviews + signs.** Sign-off stamps `signed_by`/`signed_at` on `claim_narratives`. Without sign-off, a clinical narrative cannot reach Ready.

## 3. Universal field set (every template draws from these)
| Field | Notes / validation |
|---|---|
| Tooth number | Universal numbering; validated vs. code |
| Initial placement date | For replacements/retreatment; drives missing-tooth & frequency logic |
| Existing restoration age | Years since prior restoration (replacement justification) |
| Clinical reason | Structured reason + free text (e.g., fracture, recurrent decay, non-restorable) |
| Radiographic finding | What the image supports (e.g., periapical radiolucency, bone loss %) |
| Symptoms | Pain, swelling, mobility, sensitivity, none |
| Material used | e.g., porcelain-fused-to-metal, zirconia, composite |
| Prognosis | Good / fair / guarded / poor |
| Supporting attachment checklist | Per-template required attachments (links to AI review) |

Not every field applies to every template; each template marks which are **required**, **optional**, or **hidden**.

## 4. The template library
Each entry lists: required fields (R), key attachments, and a sample assembled stem. Sample text is **billing-support language**, editable, and subject to provider sign-off.

### 4.1 Crown — new (e.g., D2740/D2750)
- **R:** tooth number, clinical reason, radiographic finding, material, prognosis.
- **Attachments:** pre-op PA (apex visible) and/or BW; photo optional.
- **Stem:** "Tooth #{tooth} restored with {material} crown due to {clinical_reason}; radiograph demonstrates {radiographic_finding}. Tooth non-restorable by direct restoration. Prognosis {prognosis}."

### 4.2 Crown — replacement of existing
- **R:** tooth number, initial placement date, existing restoration age, clinical reason, radiographic finding, material.
- **Attachments:** PA showing existing restoration + failure.
- **Stem:** adds "Existing crown placed {initial_placement_date} (~{age} yrs); replacement required due to {clinical_reason}." (Frequency/age rules checked.)

### 4.3 Bridge — new (D6xxx)
- **R:** abutment teeth, pontic tooth/teeth, clinical reason, radiographic finding, material.
- **Attachments:** PA(s) covering all units; missing-tooth status documented.

### 4.4 Bridge — replacement of existing
- **R:** units, initial placement date, age, failure reason, radiographic finding.
- **Attachments:** PA showing existing bridge + failure.

### 4.5 Core build-up (D2950)
- **R:** tooth number, remaining tooth structure rationale, clinical reason.
- **Attachments:** PA pre-op (shows insufficient structure / post-endo).
- **Note:** payers scrutinize "build-up for retention only"; field prompts for substance loss.

### 4.6 Root canal (D3310/D3320/D3330)
- **R:** tooth number, symptoms, radiographic finding (periapical status), pulpal/periapical diagnosis reason.
- **Attachments:** pre-op PA (apex visible); working-length/post-op optional per payer.

### 4.7 Retreatment (D3346/D3347/D3348)
- **R:** tooth number, initial RCT date, reason for failure, radiographic finding.
- **Attachments:** PA showing prior RCT + pathology.

### 4.8 Extraction (D7140)
- **R:** tooth number, clinical reason (non-restorable, perio hopeless, etc.), radiographic finding.
- **Attachments:** PA.

### 4.9 Surgical extraction (D7210)
- **R:** tooth number, surgical justification (bone removal/sectioning/flap), radiographic finding.
- **Attachments:** PA; document surgical necessity vs. simple extraction.

### 4.10 Bone graft (D7953 / socket preservation)
- **R:** site/tooth, indication (ridge/socket preservation, defect), material, radiographic finding.
- **Attachments:** PA; pre/post if available.

### 4.11 Membrane (GTR, D4266/D4267)
- **R:** site, defect type, material, indication.
- **Attachments:** PA/probing where applicable.

### 4.12 Partial denture (D5213/D5214 etc.)
- **R:** arch, missing teeth/edentulous span, clinical reason, material.
- **Attachments:** pano or FMX; missing-tooth documentation.

### 4.13 Scaling & root planing (D4341/D4342)
- **R:** quadrant, number of teeth, perio findings (pocket depths), radiographic bone loss.
- **Attachments:** **perio chart (required)** + radiographs showing bone loss.
- **Note:** drives **Needs perio chart** readiness blocker.

### 4.14 D4346 — gingivitis cleaning (generalized moderate–severe gingival inflammation, no bone loss)
- **R:** generalized inflammation extent, bleeding, absence of attachment loss.
- **Attachments:** perio chart / photos showing inflammation; radiographs showing no bone loss.

### 4.15 D4910 — periodontal maintenance
- **R:** prior active perio therapy date (SRP/surgery), current perio status, interval.
- **Attachments:** perio chart; history of prior therapy.

### 4.16 Implant crown (D6058/D6065 etc.)
- **R:** tooth/site, implant placement date, clinical reason, material.
- **Attachments:** PA of implant; missing-tooth status (watch missing-tooth clause).

### 4.17 Corrective claim
- **R:** **corrected claim reason code**, original claim reference (trace/payer ID), what changed.
- **Use:** payer processed with wrong info; producing a corrected/replacement claim.
- **Note:** drives **Needs corrected claim reason** readiness blocker; creates a `corrective_claims` link.

### 4.18 Rebill — claim not received
- **R:** original submission date, original trace number, payer "not received" reference, rep/date of confirmation.
- **Stem:** "Resubmission of claim originally submitted {date}, trace {trace}; payer indicates not received per rep {rep} on {date}."

### 4.19 Appeal — not paid / denied
- **R:** denial reason, denial date, clinical justification, supporting documents list.
- **Attachments:** original claim, EOB/denial, radiographs/narrative supporting medical necessity.

### 4.20 Delayed claim follow-up
- **R:** last follow-up date, payer status given, reference number, next action + next follow-up date.
- **Use:** logs a structured backnote into `billing_notes` and advances ticklers (not a clinical narrative; no sign-off required, but still audited).

## 5. Authoring rules (guardrails)
- Templates **assemble** language from entered fields; they never assert findings not entered.
- AI phrasing suggestions are clearly labeled "suggested wording — review before signing."
- Any template tagged **clinical** requires provider `signed_by`/`signed_at` before Ready.
- All edits are versioned; the signed version is the one submitted (BILLING_SAFETY_RULES.md).
- Risky/over-reaching language (e.g., absolute guarantees, diagnoses beyond support) is flagged pre-sign.

## 6. Data fields
`claim_narratives`: id, claim_id, procedure_id, template_id, structured_fields(json), body, ai_assisted(bool), version, signed_by, signed_at, created_by, created_at.
Template definitions stored in a `narrative_templates` config (id, name, cdt_codes[], required_fields[], optional_fields[], attachment_requirements[], stem_text, clinical(bool)).

## 7. Acceptance criteria
- [ ] Selecting a CDT code suggests the matching template(s).
- [ ] Required fields missing → **Needs narrative** readiness blocker.
- [ ] SRP/D4346/D4910 templates require a perio chart (→ **Needs perio chart**).
- [ ] Corrective/Rebill/Appeal templates require a reason/reference (→ **Needs corrected claim reason** where applicable).
- [ ] A clinical narrative cannot reach Ready without provider sign-off; sign-off is recorded with actor + timestamp.
- [ ] AI suggestions are labeled and never introduce un-entered clinical findings.
- [ ] All narrative versions are retained; the signed version is what submits.

## 8. Developer tasks
- Build `narrative_templates` config + admin to edit templates (versioned).
- Implement the structured-field renderer + stem assembler.
- Integrate AI phrasing suggestions with the no-fabrication constraint + risky-language flagger.
- Implement provider sign-off (RBAC: only providers can sign) and version locking on submit.
