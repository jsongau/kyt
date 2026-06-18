# CORRECTIVE_REBILL_APPEAL_WORKFLOW.md
### Workflows for problem claims — corrective, void/replacement, rebill, appeal
*Built around real KYT situations. Every problem claim gets a clear path, a template, and a follow-up date.*

---

## 0. Plain-English purpose
Not every claim pays the first time. A payer might lose it, pay part of it, deny it, or we might have sent it with the wrong tooth or fee. This module gives staff named workflows for each situation, pre-written cover notes, and reference-number logging — so a stuck claim becomes a tracked task with an owner and a next step, not a sticky note.

## 1. Real KYT scenarios → workflow
| Scenario (from KYT history) | Workflow | Stedi mechanism |
|---|---|---|
| Guardian claim pending too long | Pending follow-up → 276/277 status check → escalate | 276/277 |
| GEHA corrective claim needed | Corrected/replacement claim | 837D `claimFrequencyCode = 7` |
| Claim says "not received" | Rebill | new 837D (new PCN) + cover note |
| Partial payment | Appeal or write-off | from 835 |
| Missing attachment | Corrective with attachment | 837D + `reportInformation` |
| Wrong DOS | Void + replace, or replacement | `claimFrequencyCode = 8` then `7` (or `7`) |
| Wrong fee | Replacement claim | `claimFrequencyCode = 7` |
| Wrong tooth number | Replacement claim | `claimFrequencyCode = 7` |
| Primary EOB missing (secondary) | Add COB + resubmit | `otherSubscriberInformation` + EOB |
| Secondary claim stuck | COB follow-up → 276/277 | 276/277 |

## 2. The four core workflows

### 2.1 Corrected / replacement claim
- **When:** the original was received but had wrong info (fee, tooth, DOS, code) or needs added documentation.
- **How:** open the original (read-only) → create a linked child → edit → set **`claimFrequencyCode = 7`** (replacement) and reference the original payer claim #/PCN → Pre-Flight → sign-off → submit.
- **Requires:** a **corrected claim reason** (Pre-Flight blocks without it). Writes `corrective_claims` link (kind = corrective).

### 2.2 Void / replacement
- **When:** the original must be cancelled (e.g., billed wrong patient/DOS) before re-submitting.
- **How:** submit a **void** (`claimFrequencyCode = 8`) referencing the original, then submit a fresh corrected claim (`7` or new original). (Stedi: see "Resubmit or cancel claims.")

### 2.3 Rebill (claim not received)
- **When:** payer says they never got it and there's no 277CA/835 after the aging threshold.
- **How:** confirm via 276/277 first; if truly not received, generate a **new 837D with a new PCN**, attach the "not received" cover note (original date + PCN + rep + date), submit. Link as `corrective_claims` (kind = rebill).

### 2.4 Appeal (denied / underpaid)
- **When:** Denied or Partially Paid with a disputable reason.
- **How:** open Appeal → denial reason (from 835 CARC/RARC) prefilled → attach original claim, EOB/denial, supporting radiographs + clinical narrative → generate appeal letter → track to resolution. Writes `appeals` row.

## 3. Templates to generate
Each is structured (fields → assembled text), human-approved, audited:
1. **Pending adjudication follow-up** — "Claim {pcn} submitted {date}, status pending per {rep} on {date}; expected resolution {date}." Logs to `billing_notes`, sets follow-up.
2. **Claim not received rebill note** — original date/PCN, payer "not received" reference, rep/date; accompanies the rebilled 837D.
3. **Corrected claim cover note** — what changed and why; references original claim #.
4. **Appeal for denied crown** — medical-necessity narrative + radiograph/PA references + frequency justification.
5. **Appeal for bone graft** — indication (socket/ridge preservation/defect), material, radiograph references.
6. **Appeal for partial denture** — edentulous span, missing-tooth documentation, medical necessity.

All clinical appeal templates require **provider sign-off**; the risky-wording linter runs before submission (ATTACHMENT_AND_NARRATIVE_ENGINE.md).

## 4. Payer call notes & reference logging
- Every payer call captured as a structured `billing_notes` entry: rep name, **reference number**, date/time, what was said, outcome, **next action + follow-up date**.
- Reference numbers and Stedi response IDs are first-class fields on the claim (CLAIM_TRACKING_AND_STATUS.md), never on paper.
- Document resubmission (re-sending attachments) is tracked with path (Stedi 275 vs payer portal) + control numbers.

## 5. The six questions, in this module
- **Missing?** corrected reason, EOB, attachment, sign-off.
- **Risky?** timely-filing window closing; repeated "not received"; weak appeal grounds.
- **Do now?** the chosen workflow's next step (call / rebill / appeal / void).
- **Last?** the claim timeline + last backnote.
- **Follow up?** the tickler date set on the task.
- **Who?** assigned staff on the `billing_tasks` item.

## 6. Acceptance criteria
- [ ] Each scenario in §1 opens the correct workflow with the original claim linked.
- [ ] Corrected/void claims set `claimFrequencyCode` 7/8 and require a reason + original reference.
- [ ] Rebill creates a new PCN and the "not received" cover note.
- [ ] Appeals prefill denial reason from the 835 and require provider sign-off on clinical grounds.
- [ ] Payer calls log rep + reference number + follow-up date.
- [ ] Every problem claim becomes a tracked `billing_tasks` item with an owner and follow-up date.

## 7. Developer tasks
- Build child-claim creation with parent linkage + `claimFrequencyCode` handling.
- Implement the 6 templates (config + assembler + sign-off + linter).
- Build `billing_tasks` + payer-call note capture + reference logging.
- Wire 835 denial reasons into appeal prefill; wire 276/277 into rebill confirmation.

---
### Sources (Stedi)
- [Resubmit or cancel claims (frequency codes 7/8)](https://www.stedi.com/docs/healthcare/resubmit-cancel-claims)
- [Check claim status (276/277)](https://www.stedi.com/docs/healthcare/check-claim-status)
- [Submit dental claims (COB, attachments)](https://www.stedi.com/docs/healthcare/submit-dental-claims)
