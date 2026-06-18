# AI_XRAY_ATTACHMENT_REVIEW.md
### AI attachment checker — "billing support review," not clinical diagnosis
*Surface: Claim Builder → Attachments. Runs on every uploaded image.*

---

## 1. Goal & hard boundary
When staff attach x-rays/photos, AI gives a fast **billing-support review**: is this image usable to support this claim, is it the right type, is it on the right tooth, and is it diagnostic quality. 

**Hard boundary:** the AI assists *billing*, it does **not** render a final clinical diagnosis. All output uses the phrase **"billing support review"** and frames findings as "appears / consistent with / supports," never "the patient has." Final clinical interpretation belongs to the provider. (See BILLING_SAFETY_RULES.md.)

## 2. What the AI evaluates (the checklist)
For each attached image, tied to a specific tooth/procedure, the AI answers:
1. **Tooth visible?** Is the billed tooth in frame?
2. **Apex visible (if needed)?** For RCT/retreatment/extraction, is the root apex captured?
3. **Diagnostic quality?** Adequate contrast, sharpness, exposure to support the code?
4. **Pathology visible (billing-relevant)?** Does it *appear to show* decay / fracture / bone loss / periapical change consistent with the billed code? (Support language only.)
5. **Crown margin visible?** For crown/build-up codes, is the margin/remaining structure shown?
6. **PA vs. BW appropriateness?** Is the attached type the right one for this code, or would a PA/BW be stronger?
7. **Correct-tooth attachment?** Is the image tagged to the tooth it actually depicts?
8. **Image defects?** Too dark / too light / blurry / cropped / duplicated / wrong side (left/right reversed) / mounted incorrectly.

## 3. Output format (per image)
A structured `ai_attachment_reviews` record + a UI card:
```
Billing Support Review — Image {file}, tagged Tooth #{n}, Code {cdt}
Verdict: USABLE | NEEDS REVIEW | NOT USABLE
Checks:
  Tooth in frame:        Pass / Fail / N/A
  Apex captured:         Pass / Fail / N/A (required for {code}: yes/no)
  Diagnostic quality:    Pass / Borderline / Fail
  Supports billed code:  Appears to support / Inconclusive / Does not appear to support
  Crown margin shown:    Pass / Fail / N/A
  Type vs. code:         PA appropriate / BW appropriate / Suggest {better type}
  Correct tooth tagged:  Match / Possible mismatch
  Image defects:         none | dark | light | blurry | cropped | duplicate | wrong-side
Confidence: 0–100
Recommended action: e.g., "Retake PA showing apex for D3330" 
Disclaimer: Billing support review only — not a clinical diagnosis. Provider confirms clinical interpretation.
```

## 4. How verdicts map to Readiness
| AI verdict / check | Readiness effect (CLAIM_CREATION_UI.md) |
|---|---|
| No diagnostic image where code requires one | **Needs X-ray** |
| PA present but apex/quality fails for the code | **Needs better PA** |
| Image tagged to wrong tooth | blocks; prompts re-tag (can trigger **Needs tooth number** mismatch) |
| Perio code without perio chart | **Needs perio chart** (perio chart handled as an attachment type) |
| USABLE on all required checks | contributes a green check toward **Ready** |

The AI **recommends**; the biller/provider **decides**. A human can override a NEEDS REVIEW with a documented reason (audited), but cannot bypass a hard missing-required-attachment block.

## 5. Language constraints (enforced)
- Every output card shows the **"Billing support review only — not a clinical diagnosis"** disclaimer.
- Allowed verbs: *appears, suggests, consistent with, supports, inconclusive, not visible.*
- Forbidden: definitive diagnostic claims, treatment recommendations beyond image adequacy, prognoses.
- The model is instructed and tested to refuse to "diagnose"; if asked, it returns billing-adequacy language only.

## 6. Edge cases
- **Duplicate detection:** hash + visual similarity to flag the same image attached twice or reused from another patient (PHI risk — flag hard).
- **Wrong patient image:** if metadata/patient mismatch is detectable, hard-flag and block.
- **Wrong-side/flipped mounts:** flag left/right reversal for PA/BW.
- **Multiple teeth in one image:** allow tagging to several procedures; verify the billed tooth among them.
- **Non-image attachments** (EOB, medical clearance, perio chart PDF): run type/page checks (is it an EOB? is it legible? right patient?) rather than radiographic checks.

## 7. Data fields
`ai_attachment_reviews`: id, attachment_id, claim_id, procedure_id, tooth_number, verdict, checks(json), confidence, recommended_action, model_version, reviewed_at, human_override(bool), override_reason, overridden_by.

## 8. Privacy, safety, audit
- Images are PHI: encrypted in transit/at rest; access logged (audit_logs).
- Model version recorded per review for traceability and recall.
- No image leaves the compliant boundary without a BAA-covered processor.
- Human override always recorded with actor + reason.

## 9. Acceptance criteria
- [ ] Uploading an image produces a billing-support review card within the Builder.
- [ ] An RCT/extraction code with no apex-visible PA yields **Needs better PA** or **Needs X-ray**.
- [ ] A wrong-tooth-tagged image is flagged and blocks until re-tagged.
- [ ] Every AI card displays the non-diagnosis disclaimer and uses support-only language.
- [ ] Duplicate/wrong-patient images are hard-flagged.
- [ ] Human overrides are recorded with reason + actor; required-attachment blocks cannot be bypassed.
- [ ] Each review stores model_version and confidence.

## 10. Developer tasks
- Define the per-CDT attachment-requirement matrix (which codes need PA vs. BW vs. perio chart vs. pano).
- Integrate the vision model behind a BAA-compliant service; enforce the language constraint + disclaimer at the API boundary.
- Build duplicate/wrong-patient detection (hashing + similarity + metadata checks).
- Wire review verdicts into the Readiness service and the attachment UI cards.
- Implement override flow with mandatory reason + audit.
