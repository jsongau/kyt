# VYNE_INTEGRATION_REQUIREMENTS.md
### Integration requirements & discovery questions for Vyne (clearinghouse)
*Purpose: define what KYT OS needs from Vyne, capture what is publicly known, and list the exact questions to confirm with Vyne's integration team before building the submission layer.*

---

## 1. What we know (verify before relying on it)
From Vyne Dental's public materials (June 2026 — confirm directly, marketing pages move):
- **Vyne Trellis®** is Vyne's revenue-acceleration / e-claims platform: electronic claims, unlimited electronic attachments, claim tracking, and **ERA auto-posting** (provider must enroll to receive ERAs).
- **Vyne APIs are RESTful, hosted on AWS, HTTPS, encrypted in transit and at rest.** Vyne markets the ability to "send eligibility and benefit queries to submitting claims right within your own application" without directly handling EDI/SFTP/faxback.
- **Eligibility & Benefits APIs** exist (incl. "ClearCoverage"); the developer API portal is associated with **Onederful** (developers.onederful.co). 
- **Attachments:** 800+ payer connections for electronic attachments; long heritage in dental attachments (FastAttach lineage).
- **Claim status / acknowledgements:** a 277 Claim Acknowledgement returns an AckCode of **A (accepted)** or **R (rejected)**.
- **PMS integrations** exist (Dentrix, Eaglesoft, Open Dental, Denticon), proving claim+attachment interchange is supported for partners.
- **Developer support contact:** dentalvendorsupport@vynedental.com (confirm current).

> Treat the above as starting hypotheses. The questions in §4 must be answered in writing by Vyne before we commit an integration architecture.

## 2. What KYT OS needs from the integration
KYT OS must be able to, ideally via API (fallback: SFTP/portal):
1. **Electronic dental claim submission** — send an **837D** (single + batch).
2. **Payer ID directory lookup** — authoritative, current payer list with attachment/ERA capability flags.
3. **Attachment submission** — send x-rays/photos/perio/EOB/clearance tied to a claim, per payer rules.
4. **Claim status inquiry** — **276/277** (request/response) or webhook push of status changes.
5. **ERA retrieval** — inbound **835** for payment posting.
6. **Clearinghouse rejection messages** — structured reasons for 277 = R and front-end edits.
7. **Batch claim submission** — submit/track many claims in one transaction.
8. **Corrected/replacement claim submission** — 837D with the right frequency/claim-type codes.
9. **Eligibility verification** — **270/271** real-time, if available (likely yes via Onederful/ClearCoverage).
10. **Audit logs** — delivery receipts/trace numbers for every transaction.
11. **Webhook callbacks** — push status/ERA into KYT OS vs. polling.
12. **Transport options** — REST API vs. SFTP vs. HL7 vs. raw X12; understand each.
13. **EDI formats** — 837D (claims), 835 (ERA), 276/277 (status), 270/271 (eligibility).

## 3. Required capabilities mapped to KYT OS features
| KYT OS need | Vyne capability (to confirm) | EDI | Consumed by |
|---|---|---|---|
| Submit claim | Claims API / Trellis submission | 837D | CLAIM_STATUS_ENGINE (Submitted) |
| Get payer ID | Payer directory API | — | payer_directory table |
| Send attachments | Attachment API (800+ payers) | — / X12 275 | claim_attachments |
| Status updates | Status API / webhook | 276/277 | status engine (Accepted/Rejected/Pending) |
| Get payments | ERA delivery (enroll) | 835 | eras, payments, posting |
| Rejections | 277 reject + front-end edits | 277 | Rejected by Clearinghouse |
| Batch | Batch submission | 837D batch | submission_batches |
| Corrected claim | Replacement claim support | 837D (freq code) | corrective_claims |
| Eligibility | Onederful/ClearCoverage | 270/271 | policy verification |
| Trace/audit | Delivery receipts | — | audit_logs |

## 4. Questions to send Vyne (the discovery checklist)
Group these into one onboarding email/call. The **bolded** ones are the user's must-asks.

**Claims & format**
- **Can KYT OS generate an 837D and send it to Vyne via API?** If so, which endpoint, auth, and 837D version/companion guide?
- Do you accept raw X12 837D, or must we use a Vyne JSON schema that you convert to 837D?
- Single and **batch** submission limits (claims per batch, rate limits, file size)?
- How are **corrected/replacement claims** submitted (claim frequency code 7/8, original ref handling)?

**Attachments**
- **Can KYT OS send attachments directly to Vyne** via API, tied to a specific claim/tooth?
- Supported file types, sizes, per-payer attachment rules, and how attachment-to-claim linkage is keyed (trace number? attachment reference?).
- Is there a NEA-style attachment number returned to put on the claim?

**Status & acknowledgements**
- **Can Vyne return accepted/rejected status into KYT OS** — via 276/277 API, polling, or **webhook**?
- **Can Vyne return the payer claim ID / reference number** back to us, and at which lifecycle point?
- What do front-end (clearinghouse) edit rejections look like (structured codes vs. text)?

**ERA / payments**
- **Can Vyne return ERA/835 into KYT OS** (API pull or push)? What enrollment is required per payer?
- 835 format/version + how remits map back to our claim/trace numbers.

**Eligibility**
- Is **270/271 real-time eligibility** available through the same credentials (Onederful/ClearCoverage)? Coverage of payers, response detail (frequencies, maximums, history)?

**Transport, security, onboarding**
- Transport options: **REST API / SFTP / HL7 / X12** — which are supported and recommended for a partner like KYT OS building our own app?
- **Webhook callbacks**: available for status + ERA? Retry/signature model?
- Auth model (API keys / OAuth), sandbox/test environment, and test payer set?
- **What certification or onboarding is required?** EDI enrollment, payer enrollment lead times, BAA, trading-partner agreement, vendor certification, go-live testing?
- Rate limits, SLAs, support channel, and **audit log/delivery-receipt** availability per transaction?
- Pricing model (per-claim, per-attachment, monthly, API tier)?

## 5. Integration architecture (provisional — finalize after §4 answers)
- **Preferred:** REST API for submit + attachments + status + ERA, with **webhooks** for status/ERA push; KYT OS stores trace numbers and reconciles.
- **Fallback A:** SFTP exchange of X12 (837D out; 835/277 in) on a schedule.
- **Fallback B (Phase 1 ship):** KYT OS generates a **claim packet (PDF + attachments)** and the biller uploads to Trellis manually — proves the builder/validation value before API work (see MVP_BUILD_PLAN.md Phase 1).
- All inbound (277/835/webhooks) flows into the status engine to drive automated transitions.

## 6. Compliance & security requirements for the integration
- Signed **BAA** and trading-partner agreement before any PHI exchange.
- TLS in transit; encryption at rest; secrets in a vault, never in code.
- Every transaction logged with trace number → `audit_logs`.
- Sandbox testing with synthetic PHI only.

## 7. Acceptance criteria (integration readiness)
- [ ] Written answers to all §4 questions on file from Vyne.
- [ ] Chosen transport + auth validated in Vyne's sandbox with a test 837D round-trip.
- [ ] A submitted test claim returns a trace number and a 277 A/R into KYT OS.
- [ ] A test 835 posts against the originating claim.
- [ ] Attachment round-trip verified (sent, linked, acknowledged).
- [ ] BAA + onboarding/certification completed; payer enrollment timelines documented.

## 8. Developer tasks
- Build an abstraction layer (`ClearinghouseClient`) so transport (API/SFTP) is swappable.
- Implement 837D generator + validator against Vyne's companion guide.
- Implement inbound handlers for 277 and 835 (+ webhook receiver with signature verification).
- Implement payer-directory sync into `payer_directory`.
- Build the Phase-1 PDF claim-packet exporter as the fallback path.
- Record every transaction's trace number and raw payload reference for audit.

---
### Sources (Vyne, public — verify directly during onboarding)
- [Vyne Trellis — Dental eClaims/Billing](https://vynedental.com/vyne-trellis/)
- [Vyne Dental — Eligibility & Benefits APIs](https://vynedental.com/api-eligibility-benefits/)
- [Vyne ClearCoverage API](https://vynedental.com/clearcoverage-api/)
- [Vyne API Documentation Portal (Onederful)](https://developers.onederful.co/documentation/)
- [Vyne Dental — Clearinghouse Connections for Payers](https://vynedental.com/payers/)
- [Open Dental — Vyne Dental integration (277 AckCode A/R reference)](https://www.opendental.com/manual/eclaimsvyne.html)
