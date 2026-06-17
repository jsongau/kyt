# HMO Sneak-In Detection — Zocdoc + OS Eligibility Training

A front office training module for KYT Dental Services. Built as a single-page
React + Vite app — no backend, no database. Quiz scores and a small "stock
portfolio" reward are stored in the browser's `localStorage`.

## What's inside

| Module | Covers |
|---|---|
| 01 Overview | Core rule, why "Active" isn't enough, interactive Angela Cho case file |
| 02 Red Flags | The 12-field checklist, internal risk-signal vocabulary |
| 03 OS Workflow | Required eligibility fields, recommended status labels |
| 04 Zocdoc Workflow | The 11-step process for handling Zocdoc bookings |
| 05 Chairside Script | Mismatch script, compliance wording, KYT Membership facts, mistake recovery policy |
| 06 Quiz | 10 multiple-choice questions, score tally, and an HMOX "stock" reward animation |

## Run it locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview   # optional: serve the production build locally
```

The build output goes to `dist/`.

## Deploy to GitHub

```bash
git init
git add .
git commit -m "HMO Sneak-In Detection training module"
git branch -M main
git remote add origin https://github.com/<your-org>/<your-repo>.git
git push -u origin main
```

## Deploy to Vercel

**Option A — Vercel dashboard**
1. Push the repo to GitHub (above).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Framework preset: Vercel auto-detects **Vite**. Leave the defaults:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click **Deploy**.

**Option B — Vercel CLI**

```bash
npm install -g vercel
vercel        # first deploy, follow the prompts
vercel --prod # promote to production
```

No environment variables are required — this app has no backend calls.

## Notes for whoever maintains this

- All training copy lives in `src/data.js`. Update the checklist, workflow
  steps, quiz questions, or membership pricing there without touching
  `App.jsx`.
- The quiz and the HMOX "stock purchase" reward are independent of any real
  data — scores and lifetime shares are stored only in the visiting browser's
  `localStorage` under the key `kyt-eligibility-portfolio`. Clearing browser
  storage resets progress.
- The Eligibility Guardian tier (score 9–10) triggers the confetti moment;
  scores below that still show the stock card without confetti, scaled to
  the score.
