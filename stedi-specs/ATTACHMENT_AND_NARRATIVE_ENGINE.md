# ATTACHMENT_AND_NARRATIVE_ENGINE.md
### Attachment checklist + narrative template library
*Gives every claim the right documents and the right words — with human approval, no fabrication, and payer-specific guidance.*

---

## 0. Plain-English purpose
Most dental denials come down to two things: the wrong/weak **attachment** or a missing/weak **narrative**. This engine fixes both. For each procedure it tells staff exactly which documents to attach and gives a structured **narrative template** that captures the data points payers look for. AI may help phrase, but a human (provider for clinical narratives) must approve. We never invent clinical findings.

## 1. How it connects to Stedi
- Attachments are referenced on the 837D via `claimInformation.claimSupplementalInformation.reportInformation(s)`.
- **Reality:** Stedi's unsolicited **275** attachment transmission covers only a **subset** of dental payers. For others, staff upload to the payer portal/NEA out-of-band and KYT OS records the reference + control number. The engine tracks which path each payer uses (per `payers` table).

## 2. Template structure (every template has these)
- **Required fields** (enforced by Pre-Flight → "Needs narrative" until complete).
- **Optional fields.**
- **Attachment checklist** (what to attach; drives "Needs X-ray / perio chart").
- **Narrative skeleton** (assembled from fields; editable).
- **Risky wording to avoid** (flagged before sign-off — e.g., guarantees, diagnoses beyond support, upcoding language).
- **Payer-specific notes** (e.g., "Delta wants a PA showing the apex"; "GEHA: include prior placement date").
- **Human approval checkbox** (provider sign-off for clinical templates; biller approval for administrative ones).

## 3. The library
Each entry: required (R) / optional (O) fields · attachments · skeleton · risky wording · payer notes.

### 3.1 Crown — new
- **R:** tooth #, clinical reason (non-restorable/large failing restoration), radiographic finding, material; **O:** symptoms.
- **Attach:** pre-op PA (apex visible) ± BW; photo optional.
- **Skeleton:** "Tooth #{t} restored with {material} crown due to {reason}; radiograph shows {finding}; not restorable by direct restoration."
- **Risky:** "preventive crown," guarantees. **Payer:** some require BW + PA.

### 3.2 Crown — replacement
- **R:** tooth #, **existing crown placement date**, **reason for replacement**, **radiographic finding**, **clinical finding**, material; **O:** symptoms, supporting x-ray type.
- **Attach:** PA showing existing crown + failure.
- **Skeleton:** "Existing crown on #{t} placed {date} (~{age} yrs); replacement required due to {reason}; radiograph shows {finding}."
- **Risky:** replacing within payer frequency without justification. **Payer:** many enforce 5–7 yr frequency.

### 3.3 Bridge — new
- **R:** abutments, pontic(s), missing-tooth status, reason, finding, material. **Attach:** PA(s) all units.

### 3.4 Bridge — replacement
- **R:** units, prior placement date, age, failure reason, finding. **Attach:** PA showing existing + failure.

### 3.5 Build-up (D2950)
- **R:** tooth #, substance-loss rationale, reason. **Attach:** pre-op PA (post-endo / insufficient structure). **Risky:** "build-up for retention only."

### 3.6 Root canal
- **R:** tooth #, symptoms, pulpal/periapical reason, radiographic finding. **Attach:** pre-op PA (apex visible).

### 3.7 Retreatment
- **R:** tooth #, original RCT date, failure reason, finding. **Attach:** PA showing prior RCT + pathology.

### 3.8 Surgical extraction
- **R:** tooth #, surgical justification (bone removal/sectioning/flap), finding. **Attach:** PA. **Risky:** billing surgical when simple.

### 3.9 Bone graft
- **R:** site/tooth, indication (socket/ridge preservation, defect), material, finding. **Attach:** PA (± pre/post).

### 3.10 Membrane (GTR)
- **R:** site, defect type, material, indication. **Attach:** PA/probing.

### 3.11 Partial denture
- **R:** arch, edentulous span/missing teeth, reason, material. **Attach:** pano/FMX + missing-tooth documentation.

### 3.12 Implant crown
- **R:** site/tooth, implant placement date, reason, material. **Attach:** PA of implant; missing-tooth status (watch clause).

### 3.13 D4346 (gingivitis cleaning)
- **R:** generalized moderate–severe inflammation extent, bleeding, **no attachment loss**. **Attach:** perio chart/photos + radiographs showing no bone loss.

### 3.14 D4910 (perio maintenance)
- **R:** prior active therapy date (SRP/surgery), current perio status, interval. **Attach:** perio chart + therapy history.

### 3.15 Corrective claim
- **R:** **corrected claim reason**, original claim reference (PCN/payer claim #), what changed. **Sets** 837D `claimFrequencyCode = 7` (replacement) or `8` (void). **No fabrication.**

### 3.16 Rebill — claim not received
- **R:** original submission date, original PCN/trace, payer "not received" reference, rep + date confirmed.
- **Skeleton:** "Resubmission of claim originally submitted {date}, PCN {pcn}; payer indicates not received per {rep} on {date}."

### 3.17 Appeal — denied claim
- **R:** denial reason, denial date, clinical justification, supporting-doc list. **Attach:** original claim, EOB/denial, radiographs/narrative supporting necessity.

## 4. Approval & guardrails
- Clinical templates require **provider sign-off** (`signed_by`/`signed_at`); administrative ones require biller approval.
- AI phrasing is labeled "suggested — review before signing" and **cannot add un-entered clinical facts**.
- A **risky-wording linter** scans before sign-off (guarantees, over-reach, internal inconsistencies, copy-paste from another patient).
- Versioned; the **signed** version is what submits.

## 5. Data
`claim_narratives` (template_id, structured_fields, body, ai_assisted, version, signed_by, signed_at). `claim_attachments` (type, tooth, file_ref, hash, control number, transmission_path: stedi_275 | payer_portal | nea, ai_review_id). Template configs in a `narrative_templates`/`attachment_rules` config keyed by CDT + payer. (DATABASE_SCHEMA.md.)

## 6. Acceptance criteria
- [ ] Selecting a CDT suggests the right template + attachment checklist.
- [ ] Missing required fields → Pre-Flight "Needs narrative"; missing perio chart → "Needs perio chart."
- [ ] Corrective sets `claimFrequencyCode` and requires a reason + original reference.
- [ ] Clinical narratives require provider sign-off; signed version submits.
- [ ] Risky-wording linter flags before sign-off; AI never adds un-entered findings.
- [ ] Each payer's attachment path (275 vs portal) is recorded and surfaced to staff.

## 7. Developer tasks
- Build template + attachment-rule config (versioned) keyed by CDT + payer.
- Implement field renderer + skeleton assembler + risky-wording linter.
- Implement sign-off RBAC + version lock on submit.
- Track per-payer attachment transmission path; wire references into 837D `reportInformation(s)`.
