import { useState, useEffect, useMemo } from 'react'
import {
  coreRule,
  angelaCase,
  requiredFields,
  riskSignals,
  internalNote,
  statusLabels,
  zocdocSteps,
  chairsideScript,
  complianceWording,
  membershipPlans,
  membershipFacts,
  mistakeRecoveryPolicy,
  quizQuestions,
  scoreTier,
} from './data.js'

const SECTIONS = [
  { id: 'lesson', label: 'Overview', num: '01' },
  { id: 'redflags', label: 'Red Flags', num: '02' },
  { id: 'os', label: 'OS Workflow', num: '03' },
  { id: 'zocdoc', label: 'Zocdoc Workflow', num: '04' },
  { id: 'script', label: 'Chairside Script', num: '05' },
  { id: 'quiz', label: 'Quiz', num: '06' },
]

const PORTFOLIO_KEY = 'kyt-eligibility-portfolio'

// --------------------------------------------------------------------------
// Small shared pieces
// --------------------------------------------------------------------------
function Field({ k, v, flag }) {
  return (
    <div className="record-field">
      <span className="k">{k}</span>
      <span className={`v${flag ? ' flag' : ''}`}>{v}</span>
    </div>
  )
}

function RecordCard() {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="record-card">
      <div className="record-head">
        <div className="who">
          <div className="name">{angelaCase.name}</div>
          <div className="meta">
            DOB {angelaCase.dob} · Age {angelaCase.age} · Booked via {angelaCase.bookedVia}, {angelaCase.daysAgo} days ago
          </div>
        </div>
        <span className={`badge ${revealed ? 'red' : 'teal'}`}>
          {revealed ? 'Active — HMO/DHMO Not Eligible' : angelaCase.osCoverage}
        </span>
      </div>
      <div className="record-fields">
        <Field k="Carrier" v={angelaCase.carrier} />
        <Field k="Plan name" v={angelaCase.planName} />
        <Field k="Zocdoc selection" v={angelaCase.zocdocSelection} />
        <Field k="Member ID" v={angelaCase.memberId} flag />
        <Field k="Zocdoc network status" v={angelaCase.zocdocNetwork} />
        <Field k="New patient intake" v={angelaCase.intake} flag />
        {revealed && <Field k="OS plan indicator" v={angelaCase.osPlanIndicator} flag />}
        {revealed && <Field k="Patient note" v={angelaCase.note} />}
      </div>
      <div className="record-footer">
        <span style={{ fontSize: '12.5px', color: 'var(--text-faint)' }}>
          {revealed
            ? 'Full eligibility detail revealed — this is the part "Active" hides.'
            : 'This is what front desk sees first: a single status, at a glance.'}
        </span>
        <button className="reveal-btn" onClick={() => setRevealed((r) => !r)}>
          {revealed ? 'Hide full detail' : 'Reveal full eligibility detail'}
        </button>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// Sections
// --------------------------------------------------------------------------
function LessonSection() {
  return (
    <div>
      <p className="eyebrow">Module 01</p>
      <h1 className="page-title">HMO Sneak-In Detection</h1>
      <p className="lede">
        Zocdoc bookings and OS eligibility checks don't always agree. This module trains front office staff to catch
        the gap before a patient is in the chair — without guessing, and without confirming on "Active" alone.
      </p>

      <div className="core-rule">
        <div className="label">Core rule</div>
        <div className="rule">{coreRule}</div>
      </div>

      <section className="panel">
        <h2 className="section-title">Why this matters</h2>
        <p className="body-text">
          "Active Coverage" inside the OS confirms a plan is in force. It does not confirm the plan type. A patient
          can select PPO on Zocdoc, the OS can return Active, and the plan underneath can still be an HMO/DHMO that
          this office cannot process the way it processes a PPO. Catching that gap before treatment is the entire
          job of this module.
        </p>
      </section>

      <section className="panel">
        <h2 className="section-title">Case file: Angela Cho</h2>
        <p className="body-text">
          Angela booked through Zocdoc four days before her visit and selected PPO during booking. Here's exactly
          what front desk saw on arrival.
        </p>
        <RecordCard />
        <p className="body-text">
          Front desk saw "Active Coverage" and treated the patient as confirmed. The plan indicator, the missing
          member ID, and the incomplete intake were all available before the appointment — they just weren't
          checked together.
        </p>
      </section>
    </div>
  )
}

function RedFlagsSection() {
  return (
    <div>
      <p className="eyebrow">Module 02</p>
      <h1 className="page-title">Red Flag Checklist</h1>
      <p className="lede">
        Twelve fields, checked together — not "Active" checked alone. If any field below is missing or unconfirmed,
        the chart is not ready for "Confirmed."
      </p>

      <section className="panel">
        <h2 className="section-title">Confirm before marking a patient "Confirmed"</h2>
        <div className="checklist-grid">
          {requiredFields.map((f) => (
            <div className="checklist-item" key={f}>
              <span className="dot" />
              {f}
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Risk signals</h2>
        <p className="body-text">Internal vocabulary only — never used in front of, or about, a patient.</p>
        <div className="card">
          {riskSignals.map((r) => (
            <div className="risk-row" key={r.label}>
              <div className="risk-label">{r.label}</div>
              <div className="risk-detail">{r.detail}</div>
            </div>
          ))}
        </div>
        <div className="note-box">
          <span className="tag">Internal training note</span>
          {internalNote}
        </div>
      </section>
    </div>
  )
}

function OsWorkflowSection() {
  return (
    <div>
      <p className="eyebrow">Module 03</p>
      <h1 className="page-title">OS Workflow</h1>
      <p className="lede">
        The OS is the source of truth for eligibility — but only once every field below has been checked, and the
        status label reflects what was actually confirmed.
      </p>

      <section className="panel">
        <h2 className="section-title">Fields the eligibility check must confirm</h2>
        <div className="field-grid">
          {requiredFields.map((f) => (
            <div className="field-chip" key={f}>
              {f}
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Patient status labels</h2>
        <p className="body-text">Use these in the OS instead of relying on "Active" by itself.</p>
        <div className="status-grid">
          {statusLabels.map((s) => (
            <span key={s.label} className={`badge ${s.tone}`}>
              {s.label}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}

function ZocdocWorkflowSection() {
  return (
    <div>
      <p className="eyebrow">Module 04</p>
      <h1 className="page-title">Zocdoc Workflow</h1>
      <p className="lede">
        Zocdoc bookings are not automatically imported into the OS. This sequence is what closes that gap for every
        booking, in order.
      </p>

      <section className="panel">
        <div className="step-list">
          {zocdocSteps.map((s, i) => (
            <div className="step-row" key={i}>
              <div className="step-num">{String(i + 1).padStart(2, '0')}</div>
              <div className="step-text">{s}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function ScriptSection() {
  return (
    <div>
      <p className="eyebrow">Module 05</p>
      <h1 className="page-title">Chairside Script</h1>
      <p className="lede">Factual, calm, and non-blaming. The patient is never told they did anything wrong.</p>

      <section className="panel">
        <h2 className="section-title">If an HMO/DHMO mismatch is discovered</h2>
        <div className="script-card">
          <div className="script-label">Say this</div>
          <div className="script-text">"{chairsideScript.mismatch}"</div>
        </div>
        <div className="script-card">
          <div className="script-label">Then offer options</div>
          <div className="script-text">"{chairsideScript.options}"</div>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Compliance wording</h2>
        <ul className="compliance-list">
          {complianceWording.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2 className="section-title">KYT Membership — the facts</h2>
        <ul className="compliance-list">
          {membershipFacts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <div className="membership-grid">
          {membershipPlans.map((p) => (
            <div className="membership-card" key={p.name}>
              <div className="plan-name">{p.name}</div>
              <div className="plan-price">{p.price}</div>
              <ul>
                {p.includes.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">If the mismatch is caught after the patient is already seen</h2>
        <ul className="compliance-list">
          {mistakeRecoveryPolicy.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}

// --------------------------------------------------------------------------
// Quiz
// --------------------------------------------------------------------------
function ResultsPanel({ score, tier, onRetake }) {
  return (
    <div className="card results-card">
      <p className="eyebrow" style={{ margin: '0 0 4px' }}>
        Quiz complete
      </p>
      <div className="results-score">
        {score}
        <span>/10</span>
      </div>
      <div className={`badge ${tier.tone} results-tier`}>{tier.title}</div>
      <p className="results-detail">{tier.detail}</p>
      <div className="results-actions">
        <button className="reveal-btn secondary" onClick={onRetake}>
          Retake quiz
        </button>
      </div>
    </div>
  )
}

function buildChartPoints(score) {
  const trend = score / 10
  const n = 10
  const ys = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const wave = Math.sin(i * 1.3) * 6 * (1 - trend * 0.5)
    const rise = trend * 75 * t
    const y = Math.max(12, Math.min(122, 112 - rise - wave))
    ys.push(y)
  }
  const xs = ys.map((_, i) => (i * 600) / (n - 1))
  const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L ${xs[n - 1].toFixed(1)} 140 L 0 140 Z`
  return { linePath, areaPath }
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.6 + Math.random() * 1.3,
        color: ['var(--gold)', 'var(--teal)', 'var(--red)', '#e9ebef'][i % 4],
        rotate: Math.round(Math.random() * 360),
      })),
    []
  )
  return (
    <>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </>
  )
}

function StockSurprise({ score, lifetimeShares }) {
  const passed = score >= 9
  const price = (8 + score * 1.4).toFixed(2)
  const value = (10 * price).toFixed(2)
  const points = useMemo(() => buildChartPoints(score), [score])

  return (
    <div className="stock-wrap">
      {passed && <Confetti />}
      <div className="stock-head">
        <div>
          <div className="stock-ticker">HMOX · KYT Eligibility Guardian Stock</div>
          <div className="stock-headline">{passed ? 'Stock Acquired' : 'Training Position Opened'}</div>
        </div>
        <div className="stock-shares">
          +10 shares
          <br />
          Lifetime: {lifetimeShares}
        </div>
      </div>
      <div className="stock-value">
        ${value}
        <span className="delta">@ ${price}/sh</span>
      </div>
      <svg className="stock-chart" viewBox="0 0 600 140" preserveAspectRatio="none">
        <path className="area" d={points.areaPath} />
        <path className="line" d={points.linePath} />
      </svg>
    </div>
  )
}

function QuizSection() {
  const [phase, setPhase] = useState('intro') // intro | active | results
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [locked, setLocked] = useState(false)
  const [score, setScore] = useState(0)
  const [portfolio, setPortfolio] = useState({ attempts: 0, totalShares: 0, bestScore: 0 })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PORTFOLIO_KEY)
      if (raw) setPortfolio(JSON.parse(raw))
    } catch {
      // ignore malformed storage
    }
  }, [])

  function startQuiz() {
    setPhase('active')
    setQIndex(0)
    setScore(0)
    setSelected(null)
    setLocked(false)
  }

  function selectOption(key) {
    if (locked) return
    setSelected(key)
    setLocked(true)
    if (key === quizQuestions[qIndex].correct) setScore((s) => s + 1)
  }

  function nextQuestion() {
    if (qIndex + 1 < quizQuestions.length) {
      setQIndex((i) => i + 1)
      setSelected(null)
      setLocked(false)
    } else {
      finishQuiz()
    }
  }

  function finishQuiz() {
    setPhase('results')
    const next = {
      attempts: portfolio.attempts + 1,
      totalShares: portfolio.totalShares + 10,
      bestScore: Math.max(portfolio.bestScore, score),
    }
    try {
      localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(next))
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
    setPortfolio(next)
  }

  if (phase === 'intro') {
    return (
      <div className="quiz-intro">
        <p className="eyebrow">Module 06</p>
        <h1 className="page-title">Eligibility Quiz</h1>
        <p className="lede">
          Ten questions covering red flags, OS status labels, and the Zocdoc workflow. Score 9 or 10 to earn
          Eligibility Guardian status.
        </p>
        <button className="start-btn" onClick={startQuiz}>
          Start quiz
        </button>
      </div>
    )
  }

  if (phase === 'active') {
    const q = quizQuestions[qIndex]
    return (
      <div>
        <p className="eyebrow">Module 06</p>
        <div className="quiz-meta-row">
          <span>
            Question {qIndex + 1} of {quizQuestions.length}
          </span>
          <span>Score {score}</span>
        </div>
        <div className="quiz-progress-track">
          <div className="quiz-progress-fill" style={{ width: `${(qIndex / quizQuestions.length) * 100}%` }} />
        </div>

        <div className="quiz-card">
          <p className="quiz-question">{q.prompt}</p>
          <div className="quiz-options">
            {q.options.map((opt) => {
              let cls = 'quiz-option'
              if (locked) {
                cls += ' locked'
                if (opt.key === q.correct) cls += ' correct'
                else if (opt.key === selected) cls += ' incorrect'
              } else if (selected === opt.key) {
                cls += ' selected'
              }
              return (
                <button key={opt.key} className={cls} onClick={() => selectOption(opt.key)} disabled={locked}>
                  <span className="opt-key">{opt.key.toUpperCase()}</span>
                  <span>{opt.text}</span>
                </button>
              )
            })}
          </div>

          {locked && (
            <div className="quiz-feedback">
              <span className={`verdict ${selected === q.correct ? 'correct' : 'incorrect'}`}>
                {selected === q.correct ? 'Correct' : 'Not quite'}
              </span>
              {q.explanation}
            </div>
          )}

          <div className="quiz-footer">
            <button className="next-btn" onClick={nextQuestion} disabled={!locked}>
              {qIndex + 1 === quizQuestions.length ? 'See results' : 'Next question'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // results
  const tier = scoreTier(score)
  return (
    <div>
      <p className="eyebrow">Module 06</p>
      <h1 className="page-title">Results</h1>
      <ResultsPanel score={score} tier={tier} onRetake={startQuiz} />
      <StockSurprise score={score} lifetimeShares={portfolio.totalShares} />
    </div>
  )
}

// --------------------------------------------------------------------------
// App shell
// --------------------------------------------------------------------------
export default function App() {
  const [section, setSection] = useState('lesson')

  return (
    <div className="app-shell">
      <nav className="os-rail">
        <div className="os-brand">
          <span className="mark">KYT Dental OS</span>
          <span className="sub">Training Environment</span>
        </div>
        <div className="os-nav">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`os-nav-item ${section === s.id ? 'active' : ''}`}
              onClick={() => setSection(s.id)}
            >
              <span className="num">{s.num}</span>
              {s.label}
            </button>
          ))}
        </div>
        <div className="os-rail-footer">
          HMO SNEAK-IN DETECTION
          <br />
          ZOCDOC + OS ELIGIBILITY
        </div>
      </nav>

      <main className="os-main">
        {section === 'lesson' && <LessonSection />}
        {section === 'redflags' && <RedFlagsSection />}
        {section === 'os' && <OsWorkflowSection />}
        {section === 'zocdoc' && <ZocdocWorkflowSection />}
        {section === 'script' && <ScriptSection />}
        {section === 'quiz' && <QuizSection />}
      </main>
    </div>
  )
}
