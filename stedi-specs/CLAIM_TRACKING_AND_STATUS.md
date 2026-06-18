# CLAIM_TRACKING_AND_STATUS.md
### Post-submission tracking — statuses, events, aging queues
*Turns the Claims Tracker into a command center that always says what happened last and what to do next.*

---

## 0. Plain-English purpose
After we submit, a claim has a life: Stedi acks it, the payer acks it, it pends, it pays or denies, an ERA arrives. Staff need one place that shows exactly where every claim is, who owns it, and when to chase it. This module is the state machine + the work queues that make nothing fall through the cracks.

## 1. Statuses
| Status | Meaning | Driven by |
|---|---|---|
| **Draft** | Being built | builder |
| **Ready to Bill** | Pre-Flight passed, awaiting submit | pre-flight |
| **Pre-Flight Failed** | Below threshold; blocked | pre-flight |
| **Pre-Flight Passed** | Score ≥ pass; ready to submit | pre-flight |
| **Submitted** | Sent to Stedi | submit API |
| **Accepted by Stedi** | Passed Stedi's claim edits (277CA from Stedi OK) | 277CA |
| **Rejected by Stedi** | Failed Stedi edits (277CA reject) | 277CA |
| **Accepted by Payer** | Payer acknowledged/accepted (277CA from payer) | 277CA |
| **Rejected by Payer** | Payer rejected at intake | 277CA |
| **Pending Payer** | At payer, adjudicating | 276/277 |
| **Processed** | Payer rendered a decision | 277/835 |
| **Paid** | Paid in full (per allowed) | 835 |
| **Partially Paid** | Paid less than expected | 835 |
| **Denied** | Payer denied | 835/277 |
| **Not Paid** | Aged, no payment/response | aging |
| **Corrective Needed** | Needs corrected/replacement | staff/denial |
| **Rebill Needed** | Needs resubmission ("not received") | staff/276 |
| **Appeal Needed** | Needs formal appeal | staff/denial |
| **ERA Received** | 835 ingested for this claim | 835 |
| **Write-off Review** | Residual balance pending decision | posting |
| **Request Deleted** | Soft-deleted, retained | staff (manager-restorable) |

### State flow (high level)
```
Draft → Ready to Bill → (Pre-Flight Passed) → Submitted
Submitted → Accepted by Stedi → Accepted by Payer → Pending Payer → Processed → Paid | Partially Paid | Denied
Submitted → Rejected by Stedi → (fix) → Submitted
Accepted by Stedi → Rejected by Payer → Corrective/Rebill Needed
Pending Payer → (aging) → Not Paid → Rebill/Appeal Needed
835 → ERA Received → posts Paid/Partially/Denied
Denied → Appeal Needed | Corrective Needed | Write-off Review
any → Request Deleted (soft)
```
Illegal transitions are rejected. Inbound 277CA/277/835 (poll or webhook) drive automated transitions.

## 2. What each status event stores
Every transition = one append-only `claim_status_events` row:
| Field | Notes |
|---|---|
| **Timestamp** | when it happened |
| **User** | actor (or system) |
| **Source** | human / 277CA / 277 / 835 / aging / webhook |
| **Stedi response ID** | `correlationId` / `rhclaimNumber` / `traceId` |
| **Payer reference number** | payer claim # |
| **Message** | human-readable + raw code (CARC/RARC, reject reason) |
| **Raw payload link** | stored 277CA/277/835 |
| **Next action** | what to do now |
| **Follow-up date** | when to chase |

## 3. Aging queues
Buckets by days since **Submitted** (or since last payer contact):
- **0–15 days** · **16–30** · **31–60** · **61–90** · **90+**
Each bucket is a work queue, grouped by **assigned staff**, overdue-first. 90+ raises urgency (timely-filing risk → Appeal/Rebill prompt). When Stedi/payer is quiet past a threshold, KYT OS suggests a **276/277** status check automatically.

## 4. The six questions on every claim row
- **Missing?** pre-submit blockers / post-submit "needs corrected reason" etc.
- **Risky?** aging 60+, partial pay, denial reason present.
- **Do now?** the `next_action` (attach, call payer, appeal, rebill, post).
- **Last?** latest status event (timeline).
- **Follow up?** `follow_up_date`.
- **Who?** `assigned_staff`.

## 5. Tracker UI
- Tabs = statuses (mirrors existing Claims Tracker + new states).
- Filters: payer, status, assigned staff, aging bucket, provider, CDT.
- Row badges: Pre-Flight score, ERA received, denial, appeal in progress, "not received."
- Bulk: assign, set follow-up, move Rejected→Rebill, run 276 status check, export.
- Claim timeline: chronological status events with raw-payload links.

## 6. Acceptance criteria
- [ ] All statuses reachable and shown as tracker filters.
- [ ] Only legal transitions allowed; each writes an append-only event with the §2 fields.
- [ ] 277CA from Stedi vs payer map to the correct Accepted/Rejected states.
- [ ] Aging buckets compute correctly; 90+ flags timely-filing risk.
- [ ] Quiet-claim threshold triggers a 276/277 suggestion.
- [ ] Request Deleted retains data and is manager-restorable.

## 7. Developer tasks
- Implement the state machine (transition table + guards).
- Build `claim_status_events` append-only store + timeline UI.
- Wire inbound 277CA/277/835 (webhook receiver + poller) to transitions.
- Build aging queues + assignment + follow-up ticklers.
- Implement `GET /api/claims/:id/status` (+ on-demand 276/277).

---
### Sources (Stedi)
- [Check claim status (276/277)](https://www.stedi.com/docs/healthcare/check-claim-status)
- [Acknowledgments & ERAs overview (277CA)](https://www.stedi.com/docs/healthcare/claim-responses-overview)
- [Get, correlate, and interpret 277CAs and ERAs](https://www.stedi.com/docs/healthcare/receive-claim-responses)
- [Configure webhooks / event destinations](https://www.stedi.com/docs/healthcare/configure-webhooks)
