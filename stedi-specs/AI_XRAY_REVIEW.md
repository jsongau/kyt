# AI_XRAY_REVIEW.md
### AI x-ray review for billing support (NOT clinical diagnosis)
*AI checks whether an attached image is good enough to support the billed code. A human always approves. Never auto-submit on AI alone.*

---

## 0. Plain-English purpose & hard boundary
When staff attach an x-ray or photo, AI gives a quick read: can you see the tooth, is the image clear, does it support the code we're billing, and should staff retake it. This is a **billing attachment quality review** — it is **not** a clinical diagnosis. Output uses support language ("appears / supports / not visible"), always carries a disclaimer, and always requires human approval. The provider owns clinical interpretation.

## 1. Questions the AI answers
1. Is the **tooth visible**?
2. Is the **apex visible** (if the code needs it — RCT, extraction, retreatment)?
3. Is the **crown margin visible** (crown/build-up)?
4. Is the **existing restoration visible** (replacement claims)?
5. Is the image **diagnostic quality**?
6. Is the image **blurry**?
7. Is the image **cropped**?
8. Is the image **duplicated** (same image reused / from another patient)?
9. Is the **wrong tooth** likely attached?
10. Does the attachment **support the selected CDT code**?
11. Should staff **retake** a PA / BW / photo?

## 2. Output format
Per image, a structured `ai_attachment_reviews` record + a UI card:
```
Billing Support Review — {file}, tagged Tooth #{n}, Code {cdt}
Image Quality Score:    0–100
Billing Support Score:  0–100   (does it support this code?)
Visible Findings:       e.g., "appears to show distal radiolucency; crown margin visible"
Missing View:           e.g., "apex not captured" / "none"
Retake Recommendation:  None | Retake PA (apex) | Retake BW | Add photo
Human Review Required:  Yes (always)
Flags:                  blurry | cropped | duplicate | wrong-tooth | wrong-patient | none
Disclaimer: Billing support review only — not a clinical diagnosis. Provider confirms clinical interpretation.
```

## 3. Scores → Pre-Flight
| Condition | Effect |
|---|---|
| No diagnostic image where code requires one | Pre-Flight check 16 fails → "Needs X-ray" |
| Image present but Billing Support Score low / apex missing | warn → "Needs better attachment" (the example: score 86) |
| Wrong-tooth / wrong-patient / duplicate | hard flag; block until resolved |
| Quality + support both pass | green check toward Ready |

AI **recommends**; staff **decide**. A human may override a soft flag with a logged reason, but cannot bypass a hard missing-required-attachment block.

## 4. Guardrails (see BILLING safety principles)
- Mandatory disclaimer on every card; support-only verbs; no diagnosis/treatment recommendation beyond image adequacy.
- **Never auto-submit** based on AI; human approval always required.
- Duplicate/wrong-patient detection via file hash + similarity + metadata (PHI safety).
- Record `model_version` + confidence per review for audit/recall.
- Images are PHI: encrypted, access-logged; processed only via a BAA-covered service.

## 5. Data
`ai_attachment_reviews`: id, attachment_id, claim_id, claim_line_id, tooth_number, image_quality_score, billing_support_score, visible_findings, missing_view, retake_recommendation, flags(json), confidence, model_version, human_review_required(=true), human_override, override_reason, overridden_by, reviewed_at. (DATABASE_SCHEMA.md)

## 6. Acceptance criteria
- [ ] Each upload produces a card with Image Quality + Billing Support scores and the disclaimer.
- [ ] RCT/extraction without apex-visible PA → retake recommendation + Pre-Flight "Needs X-ray/better attachment."
- [ ] Wrong-tooth / duplicate / wrong-patient are hard-flagged.
- [ ] Human approval is always required; no path auto-submits on AI alone.
- [ ] `model_version` + confidence stored; overrides logged with reason.

## 7. Developer tasks
- Integrate a vision model behind a BAA-compliant endpoint; enforce disclaimer + support-only language at the boundary.
- Implement duplicate/wrong-patient detection (hash + similarity + metadata).
- Compute Image Quality + Billing Support scores; map to Pre-Flight checks.
- Build the review card UI + override flow (`POST /api/attachments/review`).
