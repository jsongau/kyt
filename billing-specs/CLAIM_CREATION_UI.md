# CLAIM_CREATION_UI.md
### New Claim — Claim Builder flow & Readiness Score
*Surface: the "New Claim" tab on the Insurance Ledger / Claims Tracker.*

---

## 1. Goal
Let a biller turn a completed treatment into a submission-ready claim in one screen, where the system does the remembering: it pre-fills from the chart, enforces the fields each code/payer needs, runs AI checks, and refuses to let an incomplete claim leave the building. The output is a clean 837D packet + attachments, or a clear list of what's missing.

## 2. Entry points
1. **Auto-draft from chart:** when ADA/CDT codes are marked COMPLETE, a draft claim lands in **Ready to Bill**. Opening it enters the Builder pre-populated.
2. **Manual New Claim:** biller clicks New Claim and selects a patient.
3. **From a denial:** Corrective/Rebill/Appeal opens the Builder pre-filled from the original claim (read-only original + editable child).

## 3. The Builder — step by step
A single screen with a left **form rail** and a right **live Readiness panel**. Steps are jump-navigable, not a forced wizard.

### Step 1 · Patient
- Search by name / DOB / chart #. Show photo, DOB, chart #, alerts.
- Pull active **insurance_policies** for the patient.
- **Fields written:** `claims.patient_id`.

### Step 2 · Date of Service (DOS)
- Date picker defaults to the completed-procedure date from the chart; editable with reason if changed.
- Validate DOS ≤ today and within payer timely-filing window (warn if close/over).
- **Fields:** `claims.date_of_service`.

### Step 3 · Insurance carrier & coverage order
- Select carrier from the patient's policies; choose **coverage type: Primary / Secondary / Tertiary**.
- Auto-attach the verified **Vyne payer ID** and network from `payer_directory`.
- If Secondary/Tertiary: system flags that the **primary EOB** attachment will be required (see Readiness).
- **Fields:** `claims.policy_id`, `claims.coverage_order`, `claims.payer_id`.

### Step 4 · Provider
- Select rendering + billing provider (NPI, TIN, taxonomy). Default to the treating provider from the chart.
- **Fields:** `claims.rendering_provider_id`, `claims.billing_provider_id`.

### Step 5 · Completed ADA/CDT codes
- Show completed procedures from the chart as selectable line items; biller confirms which to bill.
- Each line expands to capture procedure-specific data (Step 6).
- **Fields:** rows in `claim_procedures`.

### Step 6 · Per-procedure clinical/billing data
For each selected code, capture as applicable (the system knows which fields each code requires):
- **Tooth number** (Universal 1–32 / A–T; validate vs. code — e.g., crown needs a tooth, prophy does not).
- **Surfaces** (M/O/D/B/L/I) — required for restorative codes.
- **Quadrant** (UR/UL/LR/LL) — required for SRP (D4341/D4342), etc.
- **Arch** (maxillary/mandibular) — required for dentures/some surgeries.
- **Narrative** (opens the template picker — NARRATIVE_TEMPLATE_LIBRARY.md).
- **Diagnosis reason / clinical justification** (structured + free text).
- **Fee** (from fee schedule; editable with permission).
- **Fields:** `claim_procedures.*`, link to `claim_narratives`.

### Step 7 · Attachments
- Drag-drop or pull from the chart's imaging: **x-rays (PA/BW/pano), intraoral photos, perio chart, primary EOB, medical clearance, prior-claim documents**.
- Each attachment is **tagged to a tooth/procedure** and a type.
- AI attachment review runs on upload (AI_XRAY_ATTACHMENT_REVIEW.md) and posts a billing-support result per image.
- **Fields:** rows in `claim_attachments`, linked `ai_attachment_reviews`.

### Step 8 · AI validation & Readiness
- The Readiness panel (right rail) updates live as fields/attachments change (Section 4).
- Provider sign-off control appears for any procedure carrying a clinical narrative (BILLING_SAFETY_RULES.md).

### Step 9 · Review & submit
- Final packet preview: 837D summary, attachment list, narratives, fees, payer.
- **Submit** is enabled only when Readiness = **Ready**. Submitting writes a status event and routes to Vyne (or, Phase 1, generates the claim packet PDF for manual Vyne upload).

## 4. Readiness Score (the gate)
A live, per-claim evaluation that resolves to a single primary state plus a checklist of blockers. The submit button is disabled unless state = **Ready**.

### 4.1 Primary readiness states
| State | Meaning | Submit allowed? |
|---|---|---|
| **Ready** | All required fields, attachments, narratives, and sign-offs present | ✅ |
| **Needs X-ray** | Code/payer requires a radiograph not attached (or AI marked non-diagnostic) | ❌ |
| **Needs narrative** | Code/payer requires a narrative; none present or unsigned | ❌ |
| **Needs perio chart** | SRP/perio maintenance code without a perio chart attached | ❌ |
| **Needs better PA** | A PA exists but AI flags apex not visible / not diagnostic for this code | ❌ |
| **Needs tooth number** | Tooth-specific code missing a valid tooth number | ❌ |
| **Needs primary EOB** | Secondary/tertiary claim missing the primary EOB | ❌ |
| **Needs corrected claim reason** | Corrective/rebill/appeal child without a documented reason code | ❌ |

> A claim can have multiple blockers; the panel lists **all** of them, but the headline shows the highest-priority one. Priority order: tooth number → narrative → perio chart → x-ray → better PA → primary EOB → corrected reason.

### 4.2 How readiness is computed
- **Rule source:** per-code requirements (e.g., crown → tooth + narrative + radiograph; SRP → quadrant + perio chart + radiograph) joined with **per-payer overrides** from `payer_directory`.
- **AI inputs:** attachment quality verdicts (diagnostic? correct tooth? apex visible?) from `ai_attachment_reviews`.
- **Sign-off input:** narrative `signed_by`/`signed_at` present where a clinical narrative exists.
- Output persisted on `claims.readiness_state` + `claims.readiness_blockers[]`, recomputed on every edit.

### 4.3 Readiness panel UI
- Big status chip (color + label), then a checklist of blockers each with a **Fix** deep-link to the offending step.
- Green checks for satisfied requirements (build confidence, show the work).
- "Why" microcopy per blocker (e.g., "Delta requires a PA showing the apex for D2740").

## 5. Data fields (summary written by this flow)
`claims`: patient_id, date_of_service, policy_id, coverage_order, payer_id, rendering_provider_id, billing_provider_id, readiness_state, readiness_blockers, status, created_by, created_at.
`claim_procedures`: claim_id, cdt_code, tooth_number, surfaces, quadrant, arch, fee, diagnosis_reason, narrative_id.
`claim_attachments`: claim_id, procedure_id, type, tooth_number, file_ref, ai_review_id.
`claim_narratives`: claim_id, procedure_id, template_id, body, signed_by, signed_at.

## 6. Accessibility & UX requirements
- Keyboard-navigable; every field reachable by tab with visible focus.
- The Readiness panel uses label + icon, never color alone.
- Autosave drafts continuously; never lose work on navigation.
- Mobile/tablet usable at the front desk (≥ 768px primary; degrade gracefully).

## 7. Acceptance criteria
- [ ] Opening an auto-drafted claim pre-fills patient, DOS, provider, codes from the chart.
- [ ] Selecting Secondary/Tertiary forces a **Needs primary EOB** blocker until an EOB is attached.
- [ ] A tooth-specific code with no tooth number yields **Needs tooth number** and blocks submit.
- [ ] An SRP code without a perio chart yields **Needs perio chart**.
- [ ] Submit is disabled unless Readiness = **Ready**; enabling/disabling is driven by `readiness_state`.
- [ ] Submitting writes a `claim_status_events` row (Submitted) and a packet (EDI or PDF) is produced.
- [ ] Provider sign-off is required before a claim with a clinical narrative can be Ready.

## 8. Developer tasks
- Build the per-code requirement rule table + per-payer override join.
- Implement the Readiness service (pure function of claim + attachments + reviews + sign-offs).
- Build the Builder UI (form rail + live Readiness panel) with autosave.
- Wire attachment upload → AI review → readiness recompute.
- Implement submit gate + packet generation handoff to the submission layer.
