# QUESTIONS_FOR_STEDI.md
### Exact questions to send Stedi before/while integrating
*Some answers are already known from Stedi's public docs (noted as **Likely yes — confirm**). Send this as one onboarding packet to Stedi support/sales engineering. Confirm everything against your specific payers and account.*

---

## 0. Context to give Stedi
"We're KYT Dental building an internal dental billing OS (KYT OS) on Next.js + Supabase. We currently bill via iDentalSoft + Vyne and want to move eligibility, 837D dental claims, claim status, and ERA onto Stedi. Below are our questions."

## 1. Eligibility (270/271)
1. Do you support dental **270/271** for these payers: **Guardian, Delta Dental, UnitedHealthcare, Aetna, Cigna, MetLife, Humana, Ameritas, GEHA, Principal**? (Per-payer coverage + any caveats.) *(Likely yes for most — confirm per payer in the Payer Network.)*
2. Can we retrieve **plan type — PPO vs HMO/DMO/capitation** — reliably from the 271? Which fields/STC codes carry it, and how do you recommend detecting managed-care/capitation?
3. Can we retrieve **remaining annual maximum, deductible (met/remaining), frequency limits, waiting periods, and missing-tooth clause**? Which of these are typically returned vs. payer-dependent for dental?
4. Do you support **batch eligibility** and **insurance discovery** for dental?
5. Is there an **eligibility PDF** and structured benefits view we can surface to staff?

## 2. Claims (837D)
6. Do you support **837D dental claim** submission to our payer list, JSON and X12? *(Yes — Dental Claims API is GA; confirm payer coverage.)*
7. How are **attachments** handled for dental? Specifically: which of our payers support **unsolicited 275** through Stedi vs. require **payer-portal/NEA** out-of-band submission? *(275 is a subset — need the exact list for our payers.)*
8. Do you support **dental attachment control numbers** (e.g., NEA #)? How do we reference an out-of-band attachment on the 837D (`reportInformation(s)`) so the payer links it?
9. Can **Stedi transmit attachments directly to the payer** for our payers, and what are the file type/size limits?
10. How do we receive **277CA** — synchronously on submit, by polling, and/or webhook? What distinguishes Stedi-edit rejections from payer rejections?
11. How do we check claim status with **276/277** (real-time)? Any rate limits or payer support gaps?
12. How do we retrieve the **payer claim ID / reference number**, and in which response field does it appear?
13. Confirm **corrected/void** handling: `claimFrequencyCode` 7 (replacement) and 8 (void) behavior, and how to reference the original claim per payer.
14. Best practices for **PCN** and **line control numbers** for correlation (we plan ≤17-char nanoid PCNs).

## 3. ERA (835)
15. Do you support **835 ERA** for our dental payers? Which require **provider enrollment** to receive ERAs through Stedi?
16. Can ERA be fetched by **API and/or webhook** (event destinations)? What's the recommended retrieval pattern?
17. Can we reliably **map ERA lines to dental CDT procedures** via `lineItemControlNumber`/PCN, including partial-line payments?
18. How are **CARC/RARC** adjustment/remark codes returned, and do you provide code descriptions?

## 4. Enrollment & compliance
19. What **onboarding** is required to go live (account, submitter ID, BAA, security review)?
20. Which payers require **transaction enrollment** for 837 claims, and what are typical **lead times**?
21. Which payers require **provider enrollment for ERA (835)**?
22. **Important:** if we enroll 837 claims through Stedi, will it **cancel our existing Vyne claim enrollments**? How do we sequence the cutover safely (per payer) without breaking current billing?
23. What is the **certification/testing** process and timeline (claim edits, test payer, validation)?
24. What is the **sandbox vs production** process (test mode, Stedi Test Payer for test ERAs, promoting to prod)?
25. **Pricing:** per-transaction (eligibility/claim/status/ERA), monthly minimums, attachment costs?
26. **Security/HIPAA:** BAA, data residency, encryption, audit, and any PHI-handling constraints (e.g., API client recommendations — you advise against Postman for PHI).
27. **Support & SLAs:** support channel for integration, response times, status page, and a technical contact/solutions engineer.
28. **Webhooks/event destinations:** signature verification scheme, retry/delivery guarantees, event types for 277CA/835.
29. **Coordination of benefits:** recommended COB check usage for dental secondary/tertiary, and how to populate `otherSubscriberInformation` from a prior payer's 835.
30. **MCP / AI tooling:** is the Stedi MCP server / "Build with AI" tooling appropriate for accelerating our integration, and any guidance for PHI-safe use?

## 5. Answers to capture (tracking table)
| # | Question | Stedi answer | Per-payer notes | Confirmed by/date |
|---|---|---|---|---|
| 1–30 | … | … | … | … |

---
### Sources (Stedi — what we already believe to be true; confirm)
- [Dental Claims API GA (blog)](https://www.stedi.com/blog/dental-claims-api-is-generally-available)
- [Submit dental claims (275 subset, COB, frequency)](https://www.stedi.com/docs/healthcare/submit-dental-claims)
- [Transaction enrollment](https://www.stedi.com/docs/healthcare/transaction-enrollment)
- [Supported payers / Payer Network](https://www.stedi.com/docs/healthcare/supported-payers)
- [Eligibility (270/271)](https://www.stedi.com/docs/healthcare/api-reference/post-healthcare-eligibility)
- [Acknowledgments & ERAs](https://www.stedi.com/docs/healthcare/claim-responses-overview)
- [Pricing](https://www.stedi.com/pricing) · [Trust Center](https://www.stedi.com/docs/healthcare/trust-center) · [Support](https://www.stedi.com/docs/healthcare/support)
