# STEDI_INTEGRATION_MASTER_PLAN.md
### How KYT OS sits on top of Stedi to become a real dental billing operating system
*Tool is **Stedi** (a modern healthcare EDI clearinghouse with JSON + X12 APIs). Pre-flight = readiness checking **before** submission. This doc is the spine; the other 13 docs detail each part.*

---

## 0. Plain-English summary (for the whole office, not just developers)
Today we create claims in iDentalSoft and push them through Vyne, then chase status by phone. **Stedi is a clearinghouse with an API** — it speaks the insurance industry's electronic language (EDI) so we don't have to. KYT OS becomes the friendly front end the staff actually use; Stedi is the plumbing that carries our eligibility checks, claims, and payments to and from the payers.

The goal isn't just "send claims." It's a system that, on **every screen**, answers six questions:
1. **What is missing?**
2. **What is risky?**
3. **What should I do now?**
4. **What happened last?**
5. **When do I follow up?**
6. **Who is responsible?**

## 1. Target architecture
```
        ┌─────────────────────────────────────────────┐
        │                  KYT OS                      │
        │  Dashboard · HR · Training · Inventory ·     │
        │  Account · Messaging · Insurance Ledger      │
        │                                              │
        │  NEW: Eligibility Station · Pre-Flight ·     │
        │  Claim Builder (837D) · Tracking · ERA ·     │
        │  Corrective/Rebill/Appeal · AI X-ray review  │
        └───────────────┬──────────────────────────────┘
                        │  HTTPS (server-side only; keys never client-side)
                        ▼
        ┌─────────────────────────────────────────────┐
        │              Stedi Healthcare APIs            │
        │  Eligibility (270/271) · Dental Claims (837D) │
        │  Claim Status (276/277) · 277CA acks ·        │
        │  ERA (835) · Attachments (275, subset) ·      │
        │  Enrollment API · Payer Network · Webhooks    │
        └───────────────┬──────────────────────────────┘
                        │  EDI (X12) over Stedi's clearinghouse
                        ▼
        ┌─────────────────────────────────────────────┐
        │   Payers (Guardian, Delta, UHC, Aetna, …)    │
        └─────────────────────────────────────────────┘
```
KYT OS never talks to payers directly. It composes requests in **Stedi's JSON** (or X12), Stedi validates + routes them, and returns structured responses (synchronous results + asynchronous 277CA/835 via **polling or webhooks**).

## 2. Main functions KYT OS gains
| Function | Stedi transaction(s) | KYT OS doc |
|---|---|---|
| Eligibility verification | 270 → 271 | ELIGIBILITY_STATION.md |
| Claim pre-flight validation | (internal, pre-submit) | PRE_FLIGHT_ENGINE.md |
| Dental claim submission | 837D | CLAIM_BUILDER_837D.md |
| Claim acknowledgement tracking | 277CA | CLAIM_TRACKING_AND_STATUS.md |
| Claim status checks | 276 → 277 | CLAIM_TRACKING_AND_STATUS.md |
| ERA retrieval | 835 | ERA_835_PAYMENT_POSTING.md |
| Payment posting | (from 835) | ERA_835_PAYMENT_POSTING.md |
| Denial tracking | 835 + 277 | CLAIM_TRACKING_AND_STATUS.md |
| Corrective claims | 837D (frequency 7/8) | CORRECTIVE_REBILL_APPEAL_WORKFLOW.md |
| Rebilling workflows | 837D resubmission | CORRECTIVE_REBILL_APPEAL_WORKFLOW.md |
| Attachments | 275 (subset) or out-of-band ref | ATTACHMENT_AND_NARRATIVE_ENGINE.md |

## 3. The transactions, in plain English
Think of these as standardized "forms" the industry uses. Stedi turns our JSON into these forms and back.

- **270 — Eligibility request.** "Is this patient covered, and what are their benefits?" We send patient + plan + provider info.
- **271 — Eligibility response.** The payer's answer: active/inactive, plan type, annual maximum, deductible, remaining benefits, coverage %, waiting periods, frequencies. (Detail varies by payer.)
- **837D — Dental claim.** The actual bill we send the payer: patient, provider, procedures (CDT codes), teeth/surfaces, fees, attachments-by-reference, narratives.
- **277CA — Claim acknowledgement.** "We got it / we couldn't read it." The first response after submission. **Stedi itself returns a 277CA** for its own pre-submission edits, and the payer returns one too. This tells us *accepted into the pipeline* vs *rejected at the door*.
- **276 — Claim status request.** "Where is claim #X?" We ask when we haven't heard back.
- **277 — Claim status response.** The payer's status answer (pending, finalized, paid, denied).
- **835 — ERA (Electronic Remittance Advice).** The electronic EOB: what was allowed, paid, patient responsibility, deductible, write-off, denial/adjustment reason codes (CARC/RARC). This drives payment posting.

> Correlation key: every claim carries a **Patient Control Number (PCN)** we generate (≤17 chars, random). Stedi/payers echo it back in 277CA and 835 so KYT OS can match responses to the originating claim. Each service line also carries a **provider control number** echoed back as `lineItemControlNumber`.

## 4. The end-to-end flow KYT OS orchestrates
```
Eligibility Station (270/271) ──► benefits stored, HMO/DMO flagged
        │
Treatment completed → codes complete ──► Claim Builder drafts 837D
        │
Pre-Flight Engine ──► score 0–100; block < 50; human review
        │
Human approval (provider sign-off on clinical narratives)
        │
Submit 837D via Stedi ──► synchronous claimReference + 277CA (Stedi edits)
        │
Payer 277CA ──► Accepted/Rejected by Payer
        │
(Quiet too long?) 276/277 status check
        │
835 ERA ──► payment posting · denial tracking · write-off review
        │
If problem ──► Corrective / Rebill / Appeal ──► new 837D (frequency 7/8) ──► back to tracking
```

## 5. Key Stedi facts that shape our design (verified from Stedi docs, June 2026)
- **Dental Claims API (837D) is generally available**; JSON or raw X12; Stedi validates against the 837D spec and runs **claim edits** before sending, returning a 277CA immediately if it fails.
- **Endpoints:** `POST /2024-04-01/dental-claims/submission` (JSON) and `/dental-claims/raw-x12-submission` (X12) on `healthcare.us.stedi.com`.
- **Idempotency-Key** header is strongly recommended to avoid duplicate claims.
- **Test mode:** `usageIndicator: "T"` (JSON) / `ISA15 = T` (X12) — Stedi processes but doesn't send to payer; returns a test 277CA. Real test ERAs require the **Stedi Test Payer**.
- **Attachments:** unsolicited **275** is supported for only a **subset** of dental payers. Where unsupported, submit attachments to the payer portal out-of-band and **reference** them in `claimInformation.claimSupplementalInformation.reportInformation(s)`.
- **Enrollment:** some payers require **transaction enrollment** before 837 submission; ERAs may require **provider enrollment**. Check the **Payer Network**/Payers API per payer. (Note: enrolling 837 through Stedi may cancel existing claim enrollments via other clearinghouses — coordinate the Vyne cutover.)
- **Responses:** poll Stedi or configure **webhooks/event destinations** for processed 277CA and 835.
- **COB:** Stedi offers a coordination-of-benefits check; secondary/tertiary claims set `paymentResponsibilityLevelCode` `S`/`T` + `otherSubscriberInformation`.

## 6. Design principles
1. **Front end for humans, API for machines.** Staff see plain-English benefits and action items; Stedi sees JSON.
2. **Readiness before submission.** Nothing submits below a passing Pre-Flight score; nothing clinical submits without provider sign-off.
3. **Never assume.** Active coverage ≠ active PPO — always detect HMO/DMO/capitation (ELIGIBILITY_STATION.md).
4. **Everything correlates.** PCN + line control numbers tie every response back to a claim/line.
5. **Everything is an event.** Status changes, edits, submissions are append-only, attributed events.
6. **Never destroy.** Deletes are a status (Request Deleted), never a row deletion.
7. **Keys server-side only.** Stedi API keys never touch the browser; all PHI access logged.

## 7. How this reduces iDentalSoft + Vyne dependency (phased)
- **Phase 1** delivers value without submitting through Stedi: Eligibility Station + claim packet builder + narratives + pre-flight UI. (MVP_BUILD_PLAN.md)
- **Phases 2–3** move submission and ERA onto Stedi.
- **Cutover caution:** coordinate enrollment so we don't break existing Vyne claim flows mid-stream; run parallel before switching a payer.

## 8. Module-level acceptance criteria
- [ ] Staff can verify eligibility via Stedi and see human-readable benefits with HMO/DMO flagging.
- [ ] A claim cannot submit below the Pre-Flight pass threshold or without required sign-off.
- [ ] A test 837D submits in Stedi sandbox and returns a 277CA stored against the claim.
- [ ] 277CA/835 responses correlate to the originating claim/line via PCN + control numbers.
- [ ] 835 posts payments and surfaces denial/adjustment reasons.
- [ ] Corrective/rebill/appeal produce linked 837D resubmissions.
- [ ] No Stedi key is exposed client-side; all PHI access is logged.

## 9. Document map
1. STEDI_INTEGRATION_MASTER_PLAN (this) · 2. ELIGIBILITY_STATION · 3. PRE_FLIGHT_ENGINE · 4. CLAIM_BUILDER_837D · 5. ATTACHMENT_AND_NARRATIVE_ENGINE · 6. AI_XRAY_REVIEW · 7. CLAIM_TRACKING_AND_STATUS · 8. ERA_835_PAYMENT_POSTING · 9. CORRECTIVE_REBILL_APPEAL_WORKFLOW · 10. DATABASE_SCHEMA · 11. API_ARCHITECTURE · 12. MVP_BUILD_PLAN · 13. QUESTIONS_FOR_STEDI · 14. ACCEPTANCE_CRITERIA.

---
### Sources (Stedi docs, verified June 2026)
- [Submit dental claims — API and UI](https://www.stedi.com/docs/healthcare/submit-dental-claims)
- [Dental Claims (837D) JSON — API reference](https://www.stedi.com/docs/healthcare/api-reference/post-healthcare-dental-claims)
- [Healthcare developer docs](https://www.stedi.com/docs/healthcare)
- [Real-time eligibility (270/271)](https://www.stedi.com/docs/healthcare/api-reference/post-healthcare-eligibility)
- [Real-time claim status (276/277)](https://www.stedi.com/docs/healthcare/check-claim-status)
- [Acknowledgments & ERAs overview](https://www.stedi.com/docs/healthcare/claim-responses-overview)
- [Transaction enrollment](https://www.stedi.com/docs/healthcare/transaction-enrollment)
- [Dental Claims API is generally available (blog)](https://www.stedi.com/blog/dental-claims-api-is-generally-available)
