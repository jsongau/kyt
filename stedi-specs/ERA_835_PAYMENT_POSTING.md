# ERA_835_PAYMENT_POSTING.md
### ERA (835) module — match, post, and act on payments
*When money comes back, KYT OS matches it to the claim, shows staff the breakdown, and offers the next action.*

---

## 0. Plain-English purpose
The **835 (ERA)** is the electronic version of the EOB — it tells us what the payer allowed, paid, and left for the patient, plus why (adjustment/denial reason codes). KYT OS receives the 835 from Stedi (poll or webhook), matches it to the right claim and lines using our control numbers, shows staff a clean breakdown, and offers one-click next steps (post, appeal, corrective, write-off, patient balance).

## 1. How the ERA arrives (Stedi)
- After a claim is sent, **Stedi automatically receives and processes the 835 ERA** from the payer.
- KYT OS retrieves it via the **835 report endpoint / event destination (webhook)** — `POST /api/era/import` ingests pulled or pushed 835s.
- Correlation: the 835 references our **`patientControlNumber` (PCN)** at claim level and **`lineItemControlNumber`** at line level (the per-line `providerControlNumber` we set). Because a payer may pay only some lines, an ERA can reference a PCN but cover a subset of lines.
- Provider **enrollment for ERA** may be required per payer (QUESTIONS_FOR_STEDI.md).

## 2. Matching pipeline
```
835 arrives → parse → find claim by PCN → match each ERA line to claim_line by lineItemControlNumber
   → if PCN missing/garbled: fall back to payer claim # + member + DOS + amount heuristic → flag for human match
   → write era + era_lines, link to claim/claim_lines
```
Unmatched or ambiguous ERAs go to an **"Unmatched ERA" queue** for staff to resolve (never auto-post a bad match).

## 3. What staff see (per claim)
For the claim and each line:
- **Allowed amount**
- **Insurance paid**
- **Patient responsibility** (total)
- **Deductible**
- **Co-insurance**
- **Write-off** (contractual adjustment)
- **Denied amount**
- **Adjustment reason codes (CARC)** + **Remark codes (RARC)** — shown with plain-English translations
- Check/EFT number, payer, paid date

## 4. Staff actions (the "what to do now")
One-click from the ERA view, each logged:
- **Post payment** (full) → status **Paid**.
- **Mark partial payment** → status **Partially Paid**; surface the gap.
- **Create appeal** → opens Appeal workflow with denial reason prefilled (CORRECTIVE_REBILL_APPEAL_WORKFLOW.md) → status **Appeal Needed**.
- **Create corrective claim** → opens corrective builder (frequency 7/8) → status **Corrective Needed**.
- **Move to write-off review** → status **Write-off Review**.
- **Generate patient balance** → compute patient responsibility for statement.
- **Add backnote** → structured note (`billing_notes`).

## 5. Posting rules & guardrails
- Posting is **human-confirmed** (AI/automation can pre-fill and suggest, never finalize).
- Contractual write-offs (CARC 45, etc.) can be **suggested** from the 835 but require approval in Write-off Review.
- Partial pays auto-suggest appeal vs. write-off based on denial reason + remaining balance.
- All postings + adjustments are audited (who/when/source 835).
- Money in cents; reconcile claim totals to ERA totals to the penny.

## 6. Data
`eras` (payer, era_835_ref, check/EFT #, total paid, received_at, raw_payload_ref, posted). `era_lines` (era_id, claim_id, claim_line_id, allowed, paid, patient_resp, deductible, coinsurance, writeoff, denied, carc[], rarc[]). `payments` (claim_id, era_id, amount, type, adjustment_codes, posted_by, posted_at). `writeoffs` (claim_id, amount, reason, status, approved_by). (DATABASE_SCHEMA.md)

## 7. Acceptance criteria
- [ ] An imported 835 matches to the claim via PCN and to lines via `lineItemControlNumber`.
- [ ] Partial/subset-line ERAs match only the lines they cover.
- [ ] Unmatched ERAs route to a queue; nothing auto-posts on a weak match.
- [ ] The breakdown shows allowed/paid/patient-resp/deductible/coinsurance/write-off/denied + CARC/RARC in plain English.
- [ ] Each staff action transitions status correctly and is audited.
- [ ] Claim and ERA totals reconcile to the cent.

## 8. Developer tasks
- Build `POST /api/era/import` (pull + webhook) and the 835 parser → `eras`/`era_lines`.
- Implement PCN/line matching + fallback heuristic + Unmatched queue.
- Build the ERA breakdown UI + one-click actions wired to statuses/workflows.
- Implement CARC/RARC dictionary for plain-English messages.
- Implement posting + write-off approval with audit.

---
### Sources (Stedi)
- [Acknowledgments & ERAs overview (835)](https://www.stedi.com/docs/healthcare/claim-responses-overview)
- [Get, correlate, and interpret 277CAs and ERAs](https://www.stedi.com/docs/healthcare/receive-claim-responses)
- [835 report — API reference](https://www.stedi.com/docs/healthcare/api-reference/get-healthcare-reports-835)
