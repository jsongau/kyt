# CLAIM_STATUS_ENGINE.md
### Claim lifecycle: statuses, transitions, per-claim tracking fields
*Surface: every status filter/tab on the Insurance Ledger / Claims Tracker.*

---

## 1. Goal
Give every claim a single, authoritative status and a complete, append-only history of how it got there. The status engine drives the tracker tabs, the follow-up ticklers, and the analytics. It is a **state machine**: defined statuses, defined transitions, every transition recorded as an event with an actor.

## 2. The statuses
| Status | Meaning | Typical next states |
|---|---|---|
| **Ready to Bill** | Draft built; Readiness = Ready; awaiting submit | Needs Review, Submitted, Request Deleted |
| **Needs Review** | Blocker present (missing field/attachment/sign-off) | Ready to Bill, Request Deleted |
| **Submitted** | Sent to Vyne/clearinghouse | Accepted by Clearinghouse, Rejected by Clearinghouse |
| **Accepted by Clearinghouse** | Passed clearinghouse edits (277 = A) | Pending Payer |
| **Rejected by Clearinghouse** | Failed clearinghouse edits (277 = R) | Needs Review → Rebill Needed |
| **Pending Payer** | At payer, adjudicating | Processed, Denied, Rebill Needed |
| **Processed** | Payer adjudicated (decision rendered) | Paid, Partially Paid, Denied |
| **Paid** | Paid in full per allowed amount | Write-off Review (if balance), ERA Received |
| **Partially Paid** | Paid less than billed/expected | Appeal Needed, Write-off Review |
| **Denied** | Payer denied | Appeal Needed, Corrective Needed, Write-off Review |
| **Not Paid** | Aged with no payment/response | Rebill Needed, Appeal Needed |
| **Request Deleted** | Soft-deleted (never hard-deleted) | (terminal; restorable by manager) |
| **Corrective Needed** | Needs corrected/replacement claim | Ready to Bill (child) |
| **Rebill Needed** | Needs resubmission (e.g., "not received") | Ready to Bill (child) |
| **Appeal Needed** | Needs formal appeal | Appeal in progress → Processed |
| **Write-off Review** | Residual balance pending write-off decision | Write-off approved / reversed |
| **ERA Received** | 835 ingested for this claim | Paid, Partially Paid, Denied (posts detail) |

> These map 1:1 to existing tracker tabs/filters (Ready to Bill, Pending, Not Paid, Processed, Write-offs, Request Deleted, plus New Claim / Corrective / ERA).

## 3. State machine (allowed transitions)
```
Ready to Bill ──submit──► Submitted
Needs Review ──fix──► Ready to Bill
Submitted ──277 A──► Accepted by Clearinghouse ──► Pending Payer
Submitted ──277 R──► Rejected by Clearinghouse ──► Needs Review / Rebill Needed
Pending Payer ──► Processed ──► Paid | Partially Paid | Denied
Pending Payer ──aging──► Not Paid
835 ingest ──► ERA Received ──posts──► Paid | Partially Paid | Denied
Paid/Partially ──balance──► Write-off Review
Denied ──► Appeal Needed | Corrective Needed | Write-off Review
Not Paid ──► Rebill Needed | Appeal Needed
Corrective Needed | Rebill Needed | Appeal Needed ──► new linked child claim ──► Ready to Bill
any active ──► Request Deleted (soft, manager-restorable)
```
- Illegal transitions are rejected by the engine (e.g., Ready to Bill → Paid).
- Aging transitions (Pending Payer → Not Paid) are time-driven by payer timely-filing/follow-up thresholds.
- Child claims (corrective/rebill/appeal) reference `parent_claim_id` and original trace/reference numbers.

## 4. Per-claim tracking fields (required on every claim)
| Field | Source / notes |
|---|---|
| **Status** | current state (above) |
| **Date submitted** | timestamp of Submitted event |
| **Payer** | carrier name |
| **Payer ID** | verified Vyne payer ID |
| **Clearinghouse trace number** | returned by Vyne on submission |
| **Reference number** | payer claim ID / call reference |
| **Last follow-up date** | most recent follow-up event |
| **Next follow-up date** | tickler; drives the work queue |
| **Assigned staff** | owner responsible for next action |
| **Notes / backnotes** | structured `billing_notes` (rep, ref #, outcome) |
| **Documents attached** | from `claim_attachments` (with AI verdicts) |

Plus lineage: `parent_claim_id`, `claim_type` (original / corrective / rebill / appeal).

## 5. Events & history
Every transition writes a `claim_status_events` row: claim_id, from_status, to_status, reason_code, actor_id, source (human/277/835/system-aging), trace/reference snapshot, timestamp, note. The claim timeline UI renders these chronologically. **Append-only** — events are never edited or deleted.

## 6. Follow-up engine (ticklers)
- Each non-terminal status has a default follow-up interval (configurable per payer).
- `next_follow_up_date` populates a **Work Queue** grouped by assigned staff and overdue-first.
- Aging buckets: 0–30 / 31–60 / 61–90 / 90+ days since submission.
- Crossing a payer's timely-filing threshold raises a flag (appeal/rebill urgency).

## 7. Tracker UI behaviors
- Tabs = status filters; counts per tab update live.
- Multi-filter: payer + status + assigned staff + aging bucket + provider + code.
- Bulk actions: assign staff, set next follow-up, move Rejected→Rebill, export.
- Row badges: readiness blockers (for pre-submit), ERA received, appeal in progress, "not received."

## 8. Acceptance criteria
- [ ] Every status above is reachable and rendered as a tracker filter.
- [ ] Only legal transitions are permitted; illegal ones are rejected with a message.
- [ ] Each transition writes an immutable `claim_status_events` row with actor + source.
- [ ] A 277 result moves Submitted → Accepted/Rejected automatically.
- [ ] An 835 ingest creates ERA Received and posts Paid/Partially/Denied with detail.
- [ ] Aging past threshold moves Pending Payer → Not Paid and raises a follow-up flag.
- [ ] Corrective/Rebill/Appeal create linked child claims referencing the parent + trace.
- [ ] Request Deleted never removes data and is manager-restorable.
- [ ] Every claim exposes all Section-4 tracking fields.

## 9. Developer tasks
- Implement the state machine (allowed transition table + guard checks).
- Build `claim_status_events` append-only store + timeline UI.
- Build the follow-up/tickler engine + Work Queue.
- Wire 277/835 inbound to automated transitions (VYNE_INTEGRATION_REQUIREMENTS.md).
- Implement child-claim linkage for corrective/rebill/appeal.
- Build aging buckets + per-payer threshold config.
