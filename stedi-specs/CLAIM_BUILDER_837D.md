# CLAIM_BUILDER_837D.md
### New Claim builder → Stedi 837D dental claim
*Maps every KYT OS field to the real Stedi Dental Claims JSON. Field names below are taken from Stedi's published Dental Claims API; anything not directly confirmed is marked **CONFIRM**.*

---

## 0. Plain-English purpose
The Claim Builder is where a completed treatment becomes a bill. Staff confirm the patient, plan, provider, procedures, teeth, fees, and attachments; KYT OS turns that into Stedi's 837D JSON and submits it. The builder runs **Pre-Flight** continuously and won't let an incomplete claim out. Every screen answers: what's missing, what's risky, what to do now, what happened last, when to follow up, who owns it.

## 1. Workflow
```
Select patient → Select insurance (coverage order) → Select DOS → Select provider(s)
 → Select completed procedures (CDT) → per line: tooth / surface / quadrant / arch / oral cavity
 → Fee → Diagnosis / narrative → Attach documents (AI review) → Run Pre-Flight
 → Human review (provider sign-off if clinical) → Submit to Stedi as 837D → Store response
```

## 2. Stedi endpoint & mechanics (verified)
- **JSON:** `POST https://healthcare.us.stedi.com/2024-04-01/dental-claims/submission`
- **X12:** `POST .../dental-claims/raw-x12-submission` (`ST03 = 005010X224A2`)
- Headers: `Authorization: <api-key>` (server-side only), `Content-Type: application/json`, **`Idempotency-Key`** (strongly recommended — prevents duplicate claims).
- **Test:** `usageIndicator: "T"` → Stedi processes but does not send to payer; returns a test 277CA.
- **Correlation:** we generate `claimInformation.patientControlNumber` (**PCN**, ≤17 chars, random/nanoid). Per-line `providerControlNumber` → echoed as `lineItemControlNumber` in 277CA/835.
- **Synchronous response** returns `claimReference` (`correlationId`, `patientControlNumber`, `payerId`, `rhclaimNumber`, `serviceLines[].lineItemControlNumber`) + an initial **277CA** in `x12` (Stedi's edits result). Store all of it.

## 3. Field mapping table — KYT OS → Stedi 837D
> Legend: **Req?** R = always required, C = conditionally required. Source = where KYT OS gets the value.

### 3.1 Payer & envelope
| KYT OS field | EDI purpose | Req? | Source in OS | Validation rule | Stedi/API field |
|---|---|---|---|---|---|
| Payer | Route to payer | R | policy.payer | must match Payer Network | `tradingPartnerName` |
| Payer ID | Routing ID | R | payers.stedi_payer_id | valid Stedi payer ID/alias; keep leading zeros | `tradingPartnerServiceId` |
| Test/prod | Test vs live | R | system/env | `T` in sandbox | `usageIndicator` |
| Idempotency key | Dedupe | R | generated | unique per claim attempt | `Idempotency-Key` header |
| Claim filing indicator | How filed | R | policy/payer | e.g., `CI` commercial, `FI`, `MC` | `claimInformation.claimFilingCode` |

### 3.2 Submitter / receiver
| KYT OS field | EDI purpose | Req? | Source | Validation | Stedi field |
|---|---|---|---|---|---|
| Submitter org | Who submits | R | practice config | non-empty | `submitter.organizationName` |
| Submitter ID | Submitter EDI ID | R | Stedi/practice | from Stedi onboarding | `submitter.submitterIdentification` |
| Submitter contact | Contact | R | practice | phone + name | `submitter.contactInformation{phoneNumber,name}` |
| Receiver org | Payer entity | R | payers | payer name | `receiver.organizationName` |
| Payer address | Payer mailing | C | payers | when required | `payerAddress{address1,city,state,postalCode}` |

### 3.3 Subscriber / dependent (patient)
| KYT OS field | EDI purpose | Req? | Source | Validation | Stedi field |
|---|---|---|---|---|---|
| Coverage order | Primary/secondary/tertiary | R | policy.coverage_order | P/S/T | `subscriber.paymentResponsibilityLevelCode` |
| Member ID | Policy identity | R | policy.member_id | payer format | `subscriber.memberId` |
| Subscriber name | Policyholder | R | patient/subscriber | non-empty | `subscriber.firstName/lastName` |
| Group number | Plan within payer | C | policy.group_number | when present | `subscriber.groupNumber` |
| Sex | Demographics | R | patient | M/F/U | `subscriber.gender` |
| DOB | Demographics | R | patient | valid date YYYYMMDD | `subscriber.dateOfBirth` |
| Address | Demographics | R | patient | full address | `subscriber.address{...}` |
| Dependent (if separate) | Patient ≠ subscriber | C | patient | **omit if dependent has own member ID** (put in subscriber) | `dependent{...}` |

### 3.4 Providers & facility
| KYT OS field | EDI purpose | Req? | Source | Validation | Stedi field |
|---|---|---|---|---|---|
| Billing provider NPI | Who bills | R | providers | 10-digit NPI | `billing.npi` |
| Billing Tax ID | Billing entity | R | providers | EIN | `billing.employerId` |
| Billing taxonomy | Provider type | R | providers | valid taxonomy | `billing.taxonomyCode` |
| Billing org/name/addr | Billing identity | R | providers | full | `billing.organizationName/address/contactInformation` |
| Rendering provider | Who performed | R | claim.provider | NPI + name + taxonomy | `rendering{npi,firstName,lastName,taxonomyCode}` and/or `serviceLines[].renderingProvider` |
| Service facility | Where performed | C | practice locations | when ≠ billing | `claimInformation.serviceFacilityLocation{npi,organizationName,address,phoneNumber}` |
| Place of service | Setting | R | claim | e.g., `11` office, `12` home | `claimInformation.placeOfServiceCode` (and per-line `dentalService.placeOfServiceCode`) |
| Prior authorization | Auth # | C | claim | when payer required | `claimInformation.claimSupplementalInformation.priorAuthorizationNumber` |

### 3.5 Claim header
| KYT OS field | EDI purpose | Req? | Source | Validation | Stedi field |
|---|---|---|---|---|---|
| Claim ID / PCN | Correlation key | R | generated | unique, ≤17 chars | `claimInformation.patientControlNumber` |
| Total charge | Claim total | R | sum(lines) | = Σ line charges | `claimInformation.claimChargeAmount` |
| Claim frequency | New/replace/void | R | claim.type | `1` original, `7` replacement, `8` void | `claimInformation.claimFrequencyCode` |
| Signature on file | Auth | R | patient consent | Y/N | `claimInformation.signatureIndicator` |
| Release of info | HIPAA release | R | consent | Y/etc | `claimInformation.releaseInformationCode` |
| Benefits assignment | Assign payment | R | policy | Y/N | `claimInformation.benefitsAssignmentCertificationIndicator` |
| Plan participation | Par/non-par | C | provider/payer | A/etc | `claimInformation.planParticipationCode` |
| Diagnosis (optional in dental) | Dx pointer | C | narrative/dx | ICD-10 (e.g., `K081`) | `claimInformation.healthCareCodeInformation[]{diagnosisTypeCode,diagnosisCode}` |
| Tooth status (e.g., extracted/missing) | Tooth-level status | C | chart | per tooth | `claimInformation.toothStatus[]{toothNumber,toothStatusCode}` |

### 3.6 Service lines (per procedure)
| KYT OS field | EDI purpose | Req? | Source | Validation | Stedi field |
|---|---|---|---|---|---|
| CDT code | Procedure | R | completed procedure | valid D-code | `serviceLines[].dentalService.procedureCode` |
| Line charge | Fee | R | fee schedule | > 0 | `serviceLines[].dentalService.lineItemChargeAmount` |
| Service date (DOS) | When | R | chart | valid date | `serviceLines[].serviceDate` |
| Tooth number | Tooth-specific | C | chart | required for crown/ext/etc | `serviceLines[].teethInformation[].toothCode` |
| Surface(s) | Restorative | C | chart | M/O/D/B/L/I | `serviceLines[].teethInformation[].toothSurfaceCodes[]` |
| Oral cavity designation | Quadrant/arch area | C | chart | area codes | `serviceLines[].dentalService.oralCavityDesignation[]` |
| Prosthesis/crown/inlay code | Crown vs inlay etc | C | procedure | I/etc | `serviceLines[].dentalService.prosthesisCrownOrInlayCode` |
| Procedure count/units | Quantity | C | chart | ≥1 | `serviceLines[].dentalService.procedureCount` |
| Line provider control # | Line correlation | R | generated | unique/line | `serviceLines[].providerControlNumber` (→ `lineItemControlNumber`) |
| Per-line rendering provider | Who did line | C | chart | NPI | `serviceLines[].renderingProvider{...}` |
| Diagnosis pointer | Link dx | C | claim | points to header dx | `serviceLines[].dentalService.compositeDiagnosisCodePointers.diagnosisCodePointers[]` |

### 3.7 Attachments & narrative
| KYT OS field | EDI purpose | Req? | Source | Validation | Stedi field |
|---|---|---|---|---|---|
| Attachment reference | Report/attachment | C | claim_attachments | when code/payer requires | `claimInformation.claimSupplementalInformation.reportInformation` / `reportInformations[]` |
| Attachment control # | Match attachment to claim | C | NEA/portal or 275 | per payer | **CONFIRM** (275 path vs. report reference) |
| Narrative text | Justification | C | claim_narratives | signed if clinical | **CONFIRM** (note/`reportInformation` carrier) |
| Claim note | Free note to payer | C | claim | payer-dependent | **CONFIRM** (claim note field) |

> **Attachments reality (from Stedi):** unsolicited **275** is supported for only a subset of dental payers. For unsupported payers, upload to the payer portal out-of-band and **reference** the attachment via `reportInformation(s)`. Where a narrative must travel inside the claim vs. as an attachment is payer-specific — **CONFIRM** exact carrier (see QUESTIONS_FOR_STEDI.md).

### 3.8 Coordination of benefits (secondary/tertiary)
| KYT OS field | EDI purpose | Req? | Source | Validation | Stedi field |
|---|---|---|---|---|---|
| Coverage order S/T | Mark secondary/tertiary | C | policy | S or T | `subscriber.paymentResponsibilityLevelCode` |
| Prior payer info | COB | C | prior 835/EOB | from primary ERA | `claimInformation.otherSubscriberInformation[]` |
| Prior payer paid amount | COB | C | primary EOB | from 835 | `otherSubscriberInformation[].payerPaidAmount` |
| Claim-level adjustments | COB | C | primary 835 | CARC codes | `otherSubscriberInformation[].claimLevelAdjustments` |
| Line adjudication | COB line | C | primary 835 | per line | `serviceLines[].lineAdjudicationInformation[]` |

## 4. Output: the response we store
On submit, persist to `stedi_submissions`: request payload (PHI-safe ref), `correlationId`, `patientControlNumber`, `rhclaimNumber`, `payerId`, per-line `lineItemControlNumber`, the synchronous 277CA `x12`, HTTP status, `traceId`, idempotency key, submitted_by, submitted_at. Then create a `claim_status_events` row (Submitted → Accepted/Rejected by Stedi based on the 277CA).

## 5. UI (Claim Builder screen)
- Left rail: the steps in §1, each section collapsible, autosaved.
- Right rail: **Pre-Flight score** (PRE_FLIGHT_ENGINE.md) + the six-question summary.
- Per-line editor for tooth/surface/oral-cavity/units with code-aware required fields.
- Attachment panel with AI review cards (AI_XRAY_REVIEW.md).
- Submit gated by Pre-Flight band + provider sign-off.

## 6. Acceptance criteria
- [ ] Builder produces valid Stedi Dental Claims JSON for a single- and multi-line claim.
- [ ] PCN is unique ≤17 chars; per-line provider control numbers set.
- [ ] Test submission (`usageIndicator T`) returns and stores a 277CA in sandbox.
- [ ] Secondary claims populate `paymentResponsibilityLevelCode` + `otherSubscriberInformation` from the primary 835.
- [ ] Attachments are referenced via `reportInformation(s)`; unsupported-payer path documented per claim.
- [ ] All response identifiers stored for correlation.
- [ ] Every **CONFIRM** field is resolved against Stedi docs/support before production (QUESTIONS_FOR_STEDI.md).

## 7. Developer tasks
- Build the KYT OS → Stedi JSON serializer from the mapping table.
- Generate PCN + line control numbers; attach idempotency key.
- Implement submit via `POST /api/claims/submit` (server-side key) + response persistence.
- Resolve **CONFIRM** items (attachment control #, narrative/claim-note carriers) with Stedi.
- Build COB population from stored primary 835 data.

---
### Sources (Stedi)
- [Submit dental claims — API and UI](https://www.stedi.com/docs/healthcare/submit-dental-claims)
- [Dental Claims (837D) JSON — API reference](https://www.stedi.com/docs/healthcare/api-reference/post-healthcare-dental-claims)
- [Claim attachments](https://www.stedi.com/docs/healthcare/submit-claim-attachments)
- [Resubmit or cancel claims](https://www.stedi.com/docs/healthcare/resubmit-cancel-claims)
- [Claims code lists (filing indicator, qualifiers)](https://www.stedi.com/docs/healthcare/claims-code-lists)
