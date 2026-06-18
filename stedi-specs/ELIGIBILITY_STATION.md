# ELIGIBILITY_STATION.md
### KYT OS Eligibility Station — verify coverage via Stedi 270/271 before the patient is in the chair
*Answers, on screen: what's missing, what's risky (HMO/DMO!), what to do now, what happened last, when to recheck, who ran it.*

---

## 0. Plain-English purpose
Before a patient comes in, we want to know: are they covered, what kind of plan is it, and what will it actually pay. The Eligibility Station sends a **270** request through Stedi and reads back the **271** answer, then translates that EDI answer into a clean benefits screen any front-desk staffer can read in seconds. **Critical KYT rule: "active" does not mean "active PPO." Always hunt for HMO/DMO/capitation red flags before we promise a patient anything.**

## 1. Workflow
```
Patient books appointment
   └─ Staff enters or imports insurance (or runs Insurance Discovery)
        └─ KYT OS builds a 270 and sends via Stedi  →  POST /api/eligibility/check
             └─ Stedi returns 271 (synchronous)
                  └─ KYT OS parses benefits + stores raw 271
                       └─ Plan Type Detection runs → PPO / HMO / DMO / capitation flag
                            └─ Staff sees Coverage Summary + Benefit Breakdown + Warnings
                                 └─ Saved to Eligibility History; re-run before DOS if stale
```

## 2. Required input fields (what we send in the 270)
| Field | Why | Stedi mapping (confirm in eligibility API) |
|---|---|---|
| Patient name | identify member/dependent | `subscriber`/`dependent` firstName,lastName |
| Patient DOB | identity match | `dateOfBirth` |
| Subscriber name | policyholder | `subscriber.firstName/lastName` |
| Subscriber DOB | policyholder identity | `subscriber.dateOfBirth` |
| Member ID | policy lookup | `subscriber.memberId` |
| Group number | plan within payer | `subscriber.groupNumber` |
| Payer | route the request | `tradingPartnerName` |
| Payer ID | exact routing | `tradingPartnerServiceId` (Stedi Payer Network) |
| Relationship to subscriber | self/spouse/child | `dependent` vs `subscriber` placement |
| Provider NPI | who's asking | `provider.npi` |
| Office Tax ID | billing entity | provider/organization `employerId` |
| Date of service | benefits as of date | `encounter`/service date |

> Note (from Stedi): if a dependent has their **own** member ID, send them in the `subscriber` object and omit `dependent`. An eligibility check itself can reveal the dependent's member ID.

## 3. UI sections
A single station screen with these panels:

### 3.1 Coverage Summary (top, glanceable)
- Active / Inactive badge (color + text, never color alone).
- Payer, plan/product name, member, group, effective + term dates.
- **Plan type chip** (see 3.2) — the most important pixel on the screen.
- "As of {DOS}" and "Checked {timestamp} by {staff}."

### 3.2 Plan Type Detection (the KYT safety rule)
Do **not** stop at "active." Parse the 271 for plan-type and capitation signals and render one of:
- **PPO** (green) — proceed normally.
- **HMO / DMO** (red) — "Capitation/managed-care plan — KYT may be out-of-network; confirm assignment before treating."
- **Capitation detected** (red) — flag explicitly.
- **EPO / Discount / Unknown** (amber) — "Verify manually."
Detection inputs: insurance type / plan coverage description codes in the 271, service-type responses, network indicators, and known payer/product patterns. When ambiguous, default to **amber "Verify manually,"** never silent green. (See §6 Warnings.)

### 3.3 Benefit Breakdown
Translate the 271 into a benefits table:
- **Annual maximum** and **remaining benefit** (used vs. left).
- **Deductible** (individual/family, met vs. remaining).
- Coverage % by category: **Preventive / Basic / Major** (and Ortho if present).
- **Waiting periods** by category (if returned).
- **Missing tooth clause** (if returned/derivable).
- **Ortho** lifetime max + age limits (if present).
Each line shows the source (so staff can trust it) and a "not returned by payer" state when absent — never blank-implying-zero.

### 3.4 Frequency Limits
- Cleanings/exams (e.g., 2×/yr), bitewings, pano, FMX, perio maintenance, etc.
- Show "last used / next eligible date" where the 271 returns history.

### 3.5 Warnings (the "what's risky" panel)
Auto-raised flags, e.g.:
- HMO/DMO/capitation detected.
- Coverage inactive or terminated before DOS.
- Annual max nearly exhausted.
- Waiting period not yet satisfied for planned work.
- Missing-tooth clause present.
- Payer returned partial/ambiguous data → "verify manually."

### 3.6 Raw 271 Viewer
- Collapsible, read-only view of the parsed 271 (and the raw X12/JSON) for billers who want the source of truth. Stored, linkable, exportable (Stedi also offers an eligibility PDF).

### 3.7 Staff Notes
- Free-text + structured note (e.g., "Called Guardian, confirmed PPO, rep #12345"). Saved to history with author + timestamp.

### 3.8 Eligibility History
- Every check for this patient: date, staff, plan type detected, active/inactive, link to raw 271. Shows "what happened last" and supports re-checks before each DOS.

## 4. The six questions, answered here
- **Missing?** required 270 fields not yet entered; benefits the payer didn't return.
- **Risky?** the Warnings panel (HMO/DMO, exhausted max, waiting periods).
- **Do now?** "Verify manually," "Confirm network assignment," or "Proceed — PPO active."
- **Last?** Eligibility History.
- **Follow up?** re-check date if coverage is near term-date or stale.
- **Who?** the staffer who ran the check (stored).

## 5. Data stored
`eligibility_checks` (one per 270/271 round trip: inputs, status, plan_type_detected, raw_271_ref, checked_by, checked_at) and `eligibility_benefits` (parsed lines: category, coverage_pct, deductible, annual_max, remaining, waiting_period, frequency, source). See DATABASE_SCHEMA.md.

## 6. HMO/DMO detection rules (explicit)
1. Parse 271 insurance-type / plan-coverage codes; map known DMO/HMO/capitation codes → red.
2. If service-type benefits show capitation or $0/“covered-in-full via assigned office” patterns → red.
3. If payer+product is a known managed-care product → red.
4. If network status indicates out-of-network for our NPI → amber + "confirm."
5. If nothing conclusive → amber "Verify manually." **Never auto-green on "active" alone.**

## 7. Acceptance criteria
- [ ] Staff can run an eligibility check in **under 30 seconds** from a saved patient.
- [ ] The raw 271 is stored and viewable; an eligibility PDF can be produced.
- [ ] Benefits render human-readably (max, deductible, %, waiting periods, frequencies).
- [ ] HMO/DMO/capitation is flagged red; ambiguous coverage flags amber, never silent green.
- [ ] Every check is written to Eligibility History with staff + timestamp.
- [ ] "Not returned by payer" is shown distinctly from a real zero/none.

## 8. Developer tasks
- Build `POST /api/eligibility/check` → Stedi eligibility (JSON), server-side key.
- Build the 271 parser → `eligibility_benefits` + plan-type detector (rule table, versioned).
- Build the station UI (8 panels) with raw viewer + history.
- Implement re-check/staleness prompts tied to DOS.
- Store raw 271 (PHI: encrypted, access-logged).

---
### Sources (Stedi)
- [Real-Time Eligibility Check (270/271) JSON](https://www.stedi.com/docs/healthcare/api-reference/post-healthcare-eligibility)
- [Eligibility responses: active coverage, plan details](https://www.stedi.com/docs/healthcare/eligibility-active-coverage-benefits)
- [Eligibility: patient responsibility](https://www.stedi.com/docs/healthcare/eligibility-patient-responsibility-benefits)
- [Provider network status / authorizations](https://www.stedi.com/docs/healthcare/eligibility-network-status-authorization-referrals)
- [Insurance discovery checks](https://www.stedi.com/docs/healthcare/insurance-discovery)
