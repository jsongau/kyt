import { useState, useEffect, useMemo } from 'react'
import {
  workflowStages, zocdocChecklistItems, infoSourceDistinction,
  intakeSections, intakeReadinessLevels,
  verificationLevels, activeIsNotVerified, secondaryVerificationTriggers,
  statusDefinitions, zocdocTimeline, patientScripts,
  financialPathways, serviceRecoveryRules, checkoutDispositions,
  membershipScenarios, membershipEligibilityMatrix, membershipPlans, membershipFacts,
  billingTracks, billingDenialReasons, billingFAQ, billingOverview,
  scenarios, quizBank, scoreTier, managementPolicy, glossary,
  coreRule, riskSignals, internalNote, statusLabels, zocdocSteps,
  chairsideScript, complianceWording, mistakeRecoveryPolicy,
  ppoLessons, ppoPlans, ppoFilters, ppoFilterFns, ppoMatchGuide, ppoQuizBank,
  kytOsLessons, kytOsPipelineStages,
} from './data.js'

const SECTIONS = [
  // ── NEW PATIENT INTAKE ──────────────────────────────────────────────────
  { id: 'pipeline',    label: 'Pipeline',        num: '01', group: 'New Patient Intake' },
  { id: 'zocdoc',     label: 'Zocdoc Intake',    num: '02', group: 'New Patient Intake' },
  { id: 'intake',     label: 'Intake Form',      num: '03', group: 'New Patient Intake' },
  { id: 'kytos',      label: 'KYT OS Guide',     num: '18', group: 'New Patient Intake' },
  // ── ELIGIBILITY ─────────────────────────────────────────────────────────
  { id: 'eligibility',label: 'Eligibility',      num: '04', group: 'Eligibility' },
  { id: 'status',     label: 'Status System',    num: '05', group: 'Eligibility' },
  { id: 'window',     label: '24-Hour Window',   num: '06', group: 'Eligibility' },
  // ── COMMUNICATION ───────────────────────────────────────────────────────
  { id: 'scripts',    label: 'Scripts',          num: '07', group: 'Communication' },
  // ── FINANCIAL ───────────────────────────────────────────────────────────
  { id: 'financial',  label: 'Financial Paths',  num: '08', group: 'Financial' },
  { id: 'checkout',   label: 'Checkout',         num: '09', group: 'Financial' },
  { id: 'membership', label: 'Membership',       num: '10', group: 'Financial' },
  { id: 'billing',    label: 'Billing',          num: '11', group: 'Financial' },
  // ── TRAINING & REFERENCE ────────────────────────────────────────────────
  { id: 'scenarios',  label: 'Scenarios',        num: '12', group: 'Training' },
  { id: 'quiza',      label: 'Quiz — Part A',    num: '13', group: 'Training' },
  { id: 'quizb',      label: 'Quiz — Part B',    num: '13', group: 'Training' },
  { id: 'glossary',   label: 'Glossary',         num: '14', group: 'Training' },
  { id: 'policy',     label: 'Manager Policy',   num: '15', group: 'Training' },
  // ── PPO ─────────────────────────────────────────────────────────────────
  { id: 'ppo',        label: 'PPO Plans',        num: '16', group: 'PPO' },
  { id: 'ppoquiz',    label: 'PPO Quiz',         num: '17', group: 'PPO' },
]

const PORTFOLIO_KEY   = 'kyt-training-portfolio'   // legacy key kept for backwards compat
const PORTFOLIO_KEY_A = 'kyt-training-portfolio-a'
const PORTFOLIO_KEY_B = 'kyt-training-portfolio-b'

// Quiz bank split: first 15 = intake/eligibility, last 15 = insurance/communication
const quizBankA = quizBank.slice(0, 15)   // Zocdoc, OS Record, Intake Form, Member ID, Active vs Verified
const quizBankB = quizBank.slice(15)      // PPO vs HMO, Network, Unreachable, Communication, Membership, Errors, Recovery, Checkout

// ---------------------------------------------------------------------------
// Shared components
// ---------------------------------------------------------------------------
function ModuleHeader({ num, title, lede }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <p className="eyebrow">Module {num}</p>
      <h1 className="page-title">{title}</h1>
      {lede && <p className="lede">{lede}</p>}
    </div>
  )
}

function ActiveBanner() {
  return (
    <div className="active-banner">
      <div className="active-banner-hed">{activeIsNotVerified.headline}</div>
      <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: '6px 0 12px' }}>{activeIsNotVerified.body}</p>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {activeIsNotVerified.doesNotConfirm.map((item, i) => (
          <li key={i} style={{ fontSize: '12.5px', color: 'var(--red)', paddingLeft: '14px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, color: 'var(--red)' }}>✗</span>{item}
          </li>
        ))}
      </ul>
      <div className="guarantee-note">{activeIsNotVerified.guarantee}</div>
    </div>
  )
}

function StepList({ steps, tone }) {
  return (
    <div className="step-list">
      {steps.map((s, i) => (
        <div className="step-row" key={i}>
          <div className="step-num" style={tone === 'red' ? { color: 'var(--red)' } : undefined}>
            {String(i + 1).padStart(2, '0')}
          </div>
          <div className="step-text">{s}</div>
        </div>
      ))}
    </div>
  )
}

function ScriptCard({ label, text, internal, doc }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      {internal && (
        <div className="note-box" style={{ marginBottom: '8px' }}>
          <span className="tag">Internal — staff guidance</span>
          {internal}
        </div>
      )}
      <div className="script-card">
        <div className="script-label">{label || 'Say this'}</div>
        <div className="script-text">"{text}"</div>
      </div>
      {doc && (
        <div className="note-box" style={{ marginTop: '8px' }}>
          <span className="tag">Documentation note</span>
          {doc}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ label, tone }) {
  return <span className={`badge ${tone || 'neutral'}`}>{label}</span>
}

function ManagerCard({ label, value }) {
  const isPending = !value || value === 'Management confirmation required.'
  return (
    <div className="manager-card">
      <div className="manager-label">{label}</div>
      <div className={`manager-value ${isPending ? 'pending' : 'set'}`}>
        {isPending ? '⚠ Management confirmation required.' : value}
      </div>
    </div>
  )
}

function PrevNext({ current, onChange }) {
  const idx = SECTIONS.findIndex(s => s.id === current)
  const prev = idx > 0 ? SECTIONS[idx - 1] : null
  const next = idx < SECTIONS.length - 1 ? SECTIONS[idx + 1] : null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '56px', paddingTop: '24px', borderTop: '1px solid var(--border-soft)' }}>
      {prev ? (
        <button className="reveal-btn secondary" onClick={() => onChange(prev.id)}>
          ← {prev.num} {prev.label}
        </button>
      ) : <span />}
      {next ? (
        <button className="reveal-btn" onClick={() => onChange(next.id)}>
          {next.num} {next.label} →
        </button>
      ) : <span />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// MODULE 1 — PIPELINE
// ---------------------------------------------------------------------------
function PipelineSection({ onNav }) {
  const [active, setActive] = useState(null)
  return (
    <div>
      <ModuleHeader num="01" title="The New Patient Pipeline"
        lede="The complete lifecycle of a new patient — from the moment a Zocdoc booking is received to checkout and documented disposition. Every stage has a defined owner, action, and escalation point." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px' }}>
        {workflowStages.map((stage) => (
          <div key={stage.num} className="pipeline-stage" onClick={() => setActive(active === stage.num ? null : stage.num)}
            style={{ border: active === stage.num ? '1px solid var(--gold-line)' : '1px solid var(--border)', background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '16px 20px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gold)', flexShrink: 0 }}>{stage.num}</span>
              <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: active === stage.num ? 600 : 400 }}>{stage.name}</span>
              <span className="badge neutral" style={{ marginLeft: 'auto', fontSize: '10px' }}>{stage.owner}</span>
            </div>
            {active === stage.num && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-soft)', display: 'grid', gap: '12px' }}>
                <div><span className="tag" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-faint)', display: 'block', marginBottom: '4px' }}>Required action</span><p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.6 }}>{stage.action}</p></div>
                <div><span className="tag" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--teal)', display: 'block', marginBottom: '4px' }}>Completion criteria</span><p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.6 }}>{stage.criteria}</p></div>
                <div><span className="tag" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--red)', display: 'block', marginBottom: '4px' }}>Common failure</span><p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.6 }}>{stage.failure}</p></div>
                <div><span className="tag" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '4px' }}>Escalation trigger</span><p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.6 }}>{stage.escalation}</p></div>
              </div>
            )}
          </div>
        ))}
      </div>
      <PrevNext current="pipeline" onChange={onNav} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// MODULE 2 — ZOCDOC INTAKE
// ---------------------------------------------------------------------------
function ZocdocSection({ onNav }) {
  const [checked, setChecked] = useState({})
  const [activeSource, setActiveSource] = useState(null)
  const total = zocdocChecklistItems.length
  const done = Object.values(checked).filter(Boolean).length

  return (
    <div>
      <ModuleHeader num="02" title="Zocdoc Booking Intake"
        lede="Zocdoc bookings are not automatically imported into the KYT OS. Every booking requires manual OS entry using this checklist before any verification begins." />

      <div className="red-callout">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--red)', display: 'block', marginBottom: '6px' }}>Duplicate record warning</span>
        Search before creating. Duplicate patient records create verification, communication, and clinical-documentation errors.
      </div>

      <section className="panel">
        <h2 className="section-title">Booking Intake Checklist</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)' }}>{done} / {total} completed</span>
          <button className="reveal-btn secondary" style={{ fontSize: '10.5px', padding: '5px 12px' }} onClick={() => setChecked({})}>Reset</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {zocdocChecklistItems.map((item) => (
            <label key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', cursor: 'pointer', opacity: checked[item.id] ? 0.6 : 1 }}>
              <input type="checkbox" checked={!!checked[item.id]} onChange={e => setChecked(c => ({ ...c, [item.id]: e.target.checked }))} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: '13.5px', color: checked[item.id] ? 'var(--text-faint)' : 'var(--text)', textDecoration: checked[item.id] ? 'line-through' : 'none', lineHeight: 1.5 }}>{item.text}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Information source distinction</h2>
        <p className="body-text">These four sources are not interchangeable. Never treat Zocdoc-displayed information as carrier-confirmed.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {infoSourceDistinction.map((src) => (
            <div key={src.source} className="card" style={{ cursor: 'pointer', border: activeSource === src.source ? `1px solid var(--${src.color}-line, var(--border))` : '1px solid var(--border)' }}
              onClick={() => setActiveSource(activeSource === src.source ? null : src.source)}>
              <div style={{ marginBottom: '8px' }}><StatusBadge label={src.source} tone={src.color} /></div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>{src.description}</p>
              {activeSource === src.source && (
                <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {src.examples.map((ex, i) => <li key={i} style={{ fontSize: '12px', color: 'var(--text-faint)', paddingLeft: '12px', position: 'relative' }}><span style={{ position: 'absolute', left: 0 }}>·</span>{ex}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
      <PrevNext current="zocdoc" onChange={onNav} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// MODULE 3 — INTAKE FORM
// ---------------------------------------------------------------------------
function IntakeSection({ onNav }) {
  const [checked, setChecked] = useState({})
  const [openSection, setOpenSection] = useState(null)

  const totalRequired = intakeSections.flatMap(s => s.fields.filter(f => f.required)).length
  const checkedRequired = intakeSections.flatMap(s => s.fields.filter(f => f.required).map(f => `${s.id}-${f.name}`)).filter(k => checked[k]).length
  const pct = totalRequired > 0 ? Math.round((checkedRequired / totalRequired) * 100) : 0
  const readiness = intakeReadinessLevels.find(l => pct >= l.min && pct <= l.max) || intakeReadinessLevels[3]

  return (
    <div>
      <ModuleHeader num="03" title="The Complete New-Patient Intake Form"
        lede="A well-completed intake form is the foundation of verification. Every required field that is missing is a risk to the appointment." />

      <section className="panel">
        <h2 className="section-title">Intake Completeness Meter</h2>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)' }}>{checkedRequired} / {totalRequired} required fields complete</span>
            <span className={`badge ${readiness.tone}`}>{readiness.label}</span>
          </div>
          <div style={{ height: '6px', background: 'var(--surface-3)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct >= 75 ? 'var(--gold)' : pct >= 40 ? 'var(--teal)' : 'var(--red)', transition: 'width .3s ease' }} />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>{readiness.detail}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-faint)', margin: 0 }}>This meter is an administrative readiness tool only. It does not automatically deny clinical care.</p>
        </div>
        <button className="reveal-btn secondary" style={{ fontSize: '10.5px', padding: '5px 12px' }} onClick={() => setChecked({})}>Reset meter</button>
      </section>

      <section className="panel">
        <h2 className="section-title">Intake sections</h2>
        {intakeSections.map((sec) => (
          <div key={sec.id} style={{ marginBottom: '10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--surface-2)', cursor: 'pointer' }}
              onClick={() => setOpenSection(openSection === sec.id ? null : sec.id)}>
              <span style={{ fontSize: '14px', color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{sec.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>{openSection === sec.id ? '▲' : '▼'}</span>
            </div>
            {openSection === sec.id && (
              <div style={{ padding: '16px 18px', background: 'var(--surface-3)' }}>
                {sec.note && <p style={{ fontSize: '12.5px', color: 'var(--text-faint)', marginBottom: '14px', fontStyle: 'italic' }}>{sec.note}</p>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {sec.fields.map((field) => {
                    const key = `${sec.id}-${field.name}`
                    return (
                      <label key={field.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        {field.required && (
                          <input type="checkbox" checked={!!checked[key]} onChange={e => setChecked(c => ({ ...c, [key]: e.target.checked }))} />
                        )}
                        {!field.required && <span style={{ width: '13px', flexShrink: 0 }} />}
                        <span style={{ fontSize: '13px', color: checked[key] ? 'var(--text-faint)' : 'var(--text)', textDecoration: checked[key] ? 'line-through' : 'none' }}>{field.name}</span>
                        {field.required && <span className="badge red" style={{ fontSize: '9px', padding: '2px 6px' }}>required</span>}
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </section>
      <PrevNext current="intake" onChange={onNav} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// MODULE 4 — ELIGIBILITY VALIDATION
// ---------------------------------------------------------------------------
function EligibilitySection({ onNav }) {
  const [openLevel, setOpenLevel] = useState(null)
  const [showTriggers, setShowTriggers] = useState(false)

  return (
    <div>
      <ModuleHeader num="04" title="Eligibility Validation"
        lede="Verification is a structured process — not a single checkbox. Each level builds on the last. Active is not the destination." />

      <ActiveBanner />

      <section className="panel">
        <h2 className="section-title">The Verification Ladder</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          {verificationLevels.map((level) => (
            <div key={level.level} onClick={() => setOpenLevel(openLevel === level.level ? null : level.level)}
              style={{ border: `1px solid ${openLevel === level.level ? `var(--${level.tone}-line, var(--border))` : 'var(--border)'}`, borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: 'var(--surface-2)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: `var(--${level.tone})`, flexShrink: 0, width: '28px' }}>{level.level}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13.5px', color: 'var(--text)' }}>{level.name}</div>
                  <StatusBadge label={level.status} tone={level.tone} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>{openLevel === level.level ? '▲' : '▼'}</span>
              </div>
              {openLevel === level.level && (
                <div style={{ padding: '16px 18px', background: 'var(--surface-3)', borderTop: '1px solid var(--border-soft)' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.65, margin: '0 0 14px' }}>{level.description}</p>
                  {level.examples && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>Examples at this level</span>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {level.examples.map((ex, i) => <li key={i} style={{ fontSize: '12.5px', color: 'var(--text-dim)', paddingLeft: '12px', position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: 'var(--text-faint)' }}>·</span>{ex}</li>)}
                      </ul>
                    </div>
                  )}
                  {level.planTypes && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>Plan types to confirm</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {level.planTypes.map((pt, i) => <span key={i} className="badge teal">{pt}</span>)}
                      </div>
                    </div>
                  )}
                  {level.benefitFields && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-faint)', display: 'block', marginBottom: '6px' }}>Benefit fields to document</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px 12px' }}>
                        {level.benefitFields.map((f, i) => <span key={i} style={{ fontSize: '12px', color: 'var(--text-dim)' }}>· {f}</span>)}
                      </div>
                    </div>
                  )}
                  <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginTop: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '4px' }}>Next action</span>
                    <p style={{ fontSize: '12.5px', color: 'var(--text)', margin: 0 }}>{level.nextAction}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 className="section-title" style={{ margin: 0 }}>When to use DentalXChange or carrier portal</h2>
          <button className="reveal-btn secondary" style={{ fontSize: '10.5px', padding: '5px 12px' }} onClick={() => setShowTriggers(!showTriggers)}>{showTriggers ? 'Collapse' : 'Show triggers'}</button>
        </div>
        {showTriggers && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {secondaryVerificationTriggers.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--gold)', flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{t}</span>
              </div>
            ))}
          </div>
        )}
      </section>
      <PrevNext current="eligibility" onChange={onNav} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// MODULE 5 — STATUS SYSTEM
// ---------------------------------------------------------------------------
function StatusSection({ onNav }) {
  const [openCat, setOpenCat] = useState('insurance')
  const [openStatus, setOpenStatus] = useState(null)

  const cats = [
    { id: 'booking', label: 'Booking', items: statusDefinitions.booking },
    { id: 'intake', label: 'Intake', items: statusDefinitions.intake },
    { id: 'insurance', label: 'Insurance', items: statusDefinitions.insurance },
    { id: 'communication', label: 'Communication', items: statusDefinitions.communication },
    { id: 'arrival', label: 'Arrival & Financial', items: statusDefinitions.arrival },
  ]

  return (
    <div>
      <ModuleHeader num="05" title="Status System and Flags"
        lede="Every patient record carries a status at every stage. Statuses must be accurate, timely, and actionable. No patient should be in an undefined status." />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
        {cats.map(cat => (
          <button key={cat.id} className={`os-nav-item ${openCat === cat.id ? 'active' : ''}`}
            style={{ padding: '7px 14px', fontSize: '12px' }} onClick={() => setOpenCat(cat.id)}>
            {cat.label}
          </button>
        ))}
      </div>

      {cats.filter(c => c.id === openCat).map(cat => (
        <div key={cat.id}>
          {cat.items.map((item, i) => (
            <div key={i} style={{ marginBottom: '8px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--surface-2)', cursor: 'pointer' }}
                onClick={() => setOpenStatus(openStatus === `${cat.id}-${i}` ? null : `${cat.id}-${i}`)}>
                <StatusBadge label={item.label} tone={item.tone} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', marginLeft: 'auto' }}>
                  {openStatus === `${cat.id}-${i}` ? '▲' : '▼'}
                </span>
              </div>
              {openStatus === `${cat.id}-${i}` && (
                <div style={{ padding: '14px 16px', background: 'var(--surface-3)', borderTop: '1px solid var(--border-soft)', display: 'grid', gap: '10px' }}>
                  {[['Meaning', item.meaning, 'var(--text-dim)'], ['Required next action', item.nextAction, 'var(--text)'], ['Owner', item.owner, 'var(--teal)'], ['Deadline', item.deadline, 'var(--text-dim)'], ['Documentation', item.doc, 'var(--text-dim)'], ['Escalation', item.escalation, 'var(--red)']].map(([label, val, color]) => (
                    <div key={label}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-faint)', display: 'block', marginBottom: '3px' }}>{label}</span>
                      <p style={{ fontSize: '13px', color, margin: 0, lineHeight: 1.55 }}>{val}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      <PrevNext current="status" onChange={onNav} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// MODULE 6 — 24-HOUR WINDOW
// ---------------------------------------------------------------------------
function WindowSection({ onNav }) {
  const [openBranch, setOpenBranch] = useState('branchA')

  return (
    <div>
      <ModuleHeader num="06" title="The Zocdoc 24-Hour Response Window"
        lede="The first 24 hours after a booking are the strongest opportunity to resolve eligibility issues before they become chairside surprises." />

      <div className="note-box" style={{ marginBottom: '20px' }}>
        <span className="tag">Zocdoc fee note</span>
        {zocdocTimeline.feeNote}
      </div>
      <div className="manager-card" style={{ marginBottom: '24px' }}>
        <div className="manager-label">Management note</div>
        <div className="manager-value set">{zocdocTimeline.managementNote}</div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['branchA', 'branchB'].map(b => (
          <button key={b} className={`os-nav-item ${openBranch === b ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '12.5px' }} onClick={() => setOpenBranch(b)}>
            {zocdocTimeline[b].label}
          </button>
        ))}
      </div>

      {['branchA', 'branchB'].map(key => {
        const branch = zocdocTimeline[key]
        if (openBranch !== key) return null
        return (
          <div key={key}>
            <p className="body-text">{branch.description}</p>
            <section className="panel">
              <h2 className="section-title">{branch.label}</h2>
              <StepList steps={branch.steps} />
              {branch.goal && (
                <div className="core-rule" style={{ marginTop: '20px' }}>
                  <div className="label">Goal</div>
                  <div className="rule">{branch.goal}</div>
                </div>
              )}
              {branch.unreachable && (
                <div style={{ marginTop: '24px' }}>
                  <h2 className="section-title" style={{ fontSize: '16px' }}>When the patient cannot be reached</h2>
                  <StepList steps={branch.unreachable} />
                </div>
              )}
            </section>
          </div>
        )
      })}
      <PrevNext current="window" onChange={onNav} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// MODULE 7 — SCRIPTS
// ---------------------------------------------------------------------------
function ScriptsSection({ onNav }) {
  const [open, setOpen] = useState(null)

  return (
    <div>
      <ModuleHeader num="07" title="Patient Communication Scripts"
        lede="Every script is factual, non-blaming, and preserves the patient's ability to make an informed decision. Internal guidance, patient-facing language, and documentation notes are clearly separated." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {patientScripts.map((s) => (
          <div key={s.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--surface-2)', cursor: 'pointer' }}
              onClick={() => setOpen(open === s.id ? null : s.id)}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--gold)' }}>Script {s.id} — </span>
                <span style={{ fontSize: '13.5px', color: 'var(--text)' }}>{s.situation}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>{open === s.id ? '▲' : '▼'}</span>
            </div>
            {open === s.id && (
              <div style={{ padding: '16px 18px', background: 'var(--surface-3)', borderTop: '1px solid var(--border-soft)' }}>
                <ScriptCard label="Say this" text={s.script} internal={s.internal} doc={s.doc} />
              </div>
            )}
          </div>
        ))}
      </div>
      <PrevNext current="scripts" onChange={onNav} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// MODULE 8 — FINANCIAL PATHWAYS
// ---------------------------------------------------------------------------
function FinancialSection({ onNav }) {
  const [open, setOpen] = useState(null)

  return (
    <div>
      <ModuleHeader num="08" title="Financial Pathways and Service Recovery"
        lede="Every patient visit ends on one clearly documented financial pathway. The correct path is determined by the verification outcome — never after the fact." />

      <div className="core-rule">
        <div className="label">Core rule</div>
        <div className="rule">One track per visit. Determine the pathway before treatment begins.</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
        {financialPathways.map((path) => (
          <div key={path.id} style={{ border: open === path.id ? `1px solid var(--${path.tone}-line, var(--border))` : '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', background: 'var(--surface-2)', cursor: 'pointer' }}
              onClick={() => setOpen(open === path.id ? null : path.id)}>
              <StatusBadge label={path.label} tone={path.tone} />
              {path.isServiceRecovery && <span className="badge red" style={{ fontSize: '9px' }}>Service Recovery</span>}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', marginLeft: 'auto' }}>{open === path.id ? '▲' : '▼'}</span>
            </div>
            {open === path.id && (
              <div style={{ padding: '16px 18px', background: 'var(--surface-3)', borderTop: '1px solid var(--border-soft)' }}>
                <p className="body-text">{path.description}</p>
                <StepList steps={path.steps} />
                {path.patientScript && (
                  <div style={{ marginTop: '20px' }}>
                    <ScriptCard label="Service-recovery script" text={path.patientScript} />
                    <div className="note-box" style={{ marginTop: '8px' }}>
                      <span className="tag">Operational clarification</span>
                      {path.clarification}
                    </div>
                  </div>
                )}
                {path.futureCarScript && (
                  <div style={{ marginTop: '20px' }}>
                    <h2 className="section-title" style={{ fontSize: '15px', marginBottom: '10px' }}>Future-care disposition</h2>
                    <ScriptCard label="Say this at checkout" text={path.futureCarScript} />
                  </div>
                )}
                {path.isServiceRecovery && (
                  <div style={{ marginTop: '20px' }}>
                    <h2 className="section-title" style={{ fontSize: '15px', marginBottom: '12px' }}>Service Recovery Policy</h2>
                    {Object.entries(serviceRecoveryRules).map(([key, val]) => (
                      <ManagerCard key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} value={val === true ? 'Required' : val} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <PrevNext current="financial" onChange={onNav} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// MODULE 9 — CHECKOUT
// ---------------------------------------------------------------------------
function CheckoutSection({ onNav }) {
  const [open, setOpen] = useState(null)

  return (
    <div>
      <ModuleHeader num="09" title="Checkout, Recall, and Disposition"
        lede="Every new-patient visit needs a documented disposition before the patient leaves. No patient leaves in an undefined status." />

      <div className="core-rule">
        <div className="label">Core rule</div>
        <div className="rule">No patient should leave in an undefined status.</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px' }}>
        {checkoutDispositions.map((d, i) => (
          <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: 'var(--surface-2)', cursor: 'pointer' }}
              onClick={() => setOpen(open === i ? null : i)}>
              <span style={{ fontSize: '13.5px', color: 'var(--text)', flex: 1 }}>{d.outcome}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {d.reviewAppropriate && <span className="badge gold" style={{ fontSize: '9px' }}>Review ✓</span>}
                {d.reactivation && <span className="badge teal" style={{ fontSize: '9px' }}>Reactivate</span>}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>{open === i ? '▲' : '▼'}</span>
            </div>
            {open === i && (
              <div style={{ padding: '14px 16px', background: 'var(--surface-3)', borderTop: '1px solid var(--border-soft)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {[['Recall', d.recall], ['Follow-up owner', d.followUpOwner], ['Due', d.dueDate], ['Balance status', d.balanceStatus], ['Notes', d.notes], ['Records', d.records]].map(([label, val]) => (
                  <div key={label}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-faint)', display: 'block', marginBottom: '3px' }}>{label}</span>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.5 }}>{val}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <PrevNext current="checkout" onChange={onNav} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// MODULE 10 — MEMBERSHIP
// ---------------------------------------------------------------------------
function MembershipSection({ onNav }) {
  const [activeScenario, setActiveScenario] = useState(null)

  return (
    <div>
      <ModuleHeader num="10" title="Membership Plan Workflow"
        lede="The KYT Membership Plan is a core part of how the office serves patients whose insurance cannot be billed here. Three scenarios determine when and how to offer it." />

      <div className="core-rule">
        <div className="label">Core rule</div>
        <div className="rule">HMO patients → membership preferred. Active PPO → bill normally, no stacking. Exhausted PPO → membership available.</div>
      </div>

      <section className="panel">
        <h2 className="section-title">The three scenarios</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {membershipScenarios.map((s) => (
            <div key={s.id} className="card" style={{ cursor: 'pointer', border: activeScenario?.id === s.id ? `1px solid var(--${s.tone})` : '1px solid var(--border)' }}
              onClick={() => setActiveScenario(activeScenario?.id === s.id ? null : s)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: activeScenario?.id === s.id ? '16px' : '0', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <StatusBadge label={s.label} tone={s.tone} />
                  <span style={{ fontSize: '12.5px', color: 'var(--text-dim)' }}>{s.rule}</span>
                </div>
                <span className={`badge ${s.eligibleForMembership ? 'gold' : 'neutral'}`}>{s.eligibleForMembership ? 'Membership ✓' : 'No Membership'}</span>
              </div>
              {activeScenario?.id === s.id && (
                <div>
                  <p className="body-text">{s.detail}</p>
                  <h2 className="section-title" style={{ fontSize: '15px', margin: '16px 0 10px' }}>Step-by-step</h2>
                  <StepList steps={s.steps} />
                  <div style={{ marginTop: '20px' }}>
                    <ScriptCard label="Say this" text={s.script} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Eligibility quick-reference</h2>
        <div className="card">
          {membershipEligibilityMatrix.map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', padding: '12px 0', borderBottom: i < membershipEligibilityMatrix.length - 1 ? '1px solid var(--border-soft)' : 'none', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: '0 0 210px', fontSize: '13px', color: 'var(--text)' }}>{row.scenario}</div>
              <div style={{ display: 'flex', gap: '6px', flex: '0 0 160px' }}>
                <span className={`badge ${row.eligible ? 'gold' : 'red'}`}>{row.eligible ? 'Eligible' : 'Not eligible'}</span>
                {row.preferred && <span className="badge teal">Preferred</span>}
              </div>
              <div style={{ flex: 1, fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.5 }}>{row.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Plans</h2>
        <div className="membership-grid">
          {membershipPlans.map((p) => (
            <div className="membership-card" key={p.name}>
              <div className="plan-name">{p.name}</div>
              <div className="plan-price">{p.price}</div>
              <ul>{p.includes.map(i => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </div>
        <ul className="compliance-list">{membershipFacts.map(f => <li key={f}>{f}</li>)}</ul>
      </section>
      <PrevNext current="membership" onChange={onNav} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// MODULE 11 — BILLING
// ---------------------------------------------------------------------------
function BillingSection({ onNav }) {
  const [activeTrack, setActiveTrack] = useState(null)
  const [faqOpen, setFaqOpen] = useState(null)

  return (
    <div>
      <ModuleHeader num="11" title="Billing Guide"
        lede="Every patient visit runs on one of three billing tracks. The front office determines the correct track before treatment begins — never after." />

      <div className="core-rule">
        <div className="label">Core rule</div>
        <div className="rule">One track per visit. PPO, Membership, and Self-Pay are never combined for the same service.</div>
      </div>

      <section className="panel">
        <h2 className="section-title">Billing tracks</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {billingTracks.map((track) => (
            <div key={track.id} className="card" style={{ cursor: 'pointer', border: activeTrack?.id === track.id ? `1px solid var(--${track.tone}-line, var(--border))` : '1px solid var(--border)' }}
              onClick={() => setActiveTrack(activeTrack?.id === track.id ? null : track)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: activeTrack?.id === track.id ? '16px' : '0' }}>
                <StatusBadge label={track.label} tone={track.tone} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>{activeTrack?.id === track.id ? '▲ collapse' : '▼ expand'}</span>
              </div>
              {activeTrack?.id === track.id && (
                <div>
                  <div className="note-box" style={{ marginBottom: '16px' }}><span className="tag">When to use</span>{track.when}</div>
                  <h2 className="section-title" style={{ fontSize: '15px', margin: '0 0 10px' }}>Step-by-step</h2>
                  <StepList steps={track.steps} />
                  <h2 className="section-title" style={{ fontSize: '15px', margin: '20px 0 10px' }}>Key terms</h2>
                  <div className="card" style={{ background: 'var(--surface-3)' }}>
                    {track.keyTerms.map((kt, i) => (
                      <div key={i} style={{ display: 'flex', gap: '14px', padding: '10px 0', borderBottom: i < track.keyTerms.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
                        <div style={{ flex: '0 0 140px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gold)' }}>{kt.term}</div>
                        <div style={{ fontSize: '12.5px', color: 'var(--text-dim)', lineHeight: 1.55 }}>{kt.def}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Denial codes</h2>
        <div className="card">
          {billingDenialReasons.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', padding: '12px 0', borderBottom: i < billingDenialReasons.length - 1 ? '1px solid var(--border-soft)' : 'none', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: '0 0 80px' }}><span className="badge red">{d.code}</span></div>
              <div style={{ flex: '0 0 220px', fontSize: '12.5px', color: 'var(--text)', lineHeight: 1.5 }}>{d.reason}</div>
              <div style={{ flex: 1, fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.55 }}>{d.action}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Billing FAQ</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {billingFAQ.map((item, i) => (
            <div key={i} className="card" style={{ cursor: 'pointer' }} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <span style={{ fontSize: '13.5px', color: 'var(--text)', fontFamily: 'var(--font-display)', lineHeight: 1.4 }}>{item.q}</span>
                <span style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: '10px', flexShrink: 0 }}>{faqOpen === i ? '▲' : '▼'}</span>
              </div>
              {faqOpen === i && <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.65, marginTop: '12px', borderTop: '1px solid var(--border-soft)', paddingTop: '12px' }}>{item.a}</p>}
            </div>
          ))}
        </div>
      </section>
      <PrevNext current="billing" onChange={onNav} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// MODULE 12 — SCENARIOS
// ---------------------------------------------------------------------------
function ScenariosSection({ onNav }) {
  const [selected, setSelected] = useState({})
  const [revealed, setRevealed] = useState({})

  function choose(scenarioId, key) {
    if (revealed[scenarioId]) return
    setSelected(s => ({ ...s, [scenarioId]: key }))
    setRevealed(r => ({ ...r, [scenarioId]: true }))
  }

  return (
    <div>
      <ModuleHeader num="12" title="Interactive Case Simulations"
        lede="Eight fictional training scenarios. Choose the next best action, then review the correct approach, documentation requirements, and what to say — and not say — to the patient." />

      <div className="note-box" style={{ marginBottom: '24px' }}>
        <span className="tag">Privacy notice</span>
        All scenario patients are fictional. No real patient information is used in this training application.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {scenarios.map((sc) => {
          const isRevealed = !!revealed[sc.id]
          const sel = selected[sc.id]
          return (
            <div key={sc.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border-soft)' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--gold)' }}>Scenario {sc.id}</span>
                  <span className="badge neutral" style={{ fontSize: '10px' }}>{sc.disclaimer}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--text)', marginBottom: '4px' }}>{sc.title}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--teal)' }}>Patient: {sc.patient}</div>
              </div>
              <div style={{ padding: '18px 20px', background: 'var(--surface-3)' }}>
                <p style={{ fontSize: '13.5px', color: 'var(--text-dim)', lineHeight: 1.65, marginBottom: '20px' }}>{sc.situation}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {sc.options.map((opt) => {
                    let cls = 'quiz-option'
                    if (isRevealed) {
                      cls += ' locked'
                      if (opt.key === sc.correct) cls += ' correct'
                      else if (opt.key === sel) cls += ' incorrect'
                    }
                    return (
                      <button key={opt.key} className={cls} onClick={() => choose(sc.id, opt.key)} disabled={isRevealed}>
                        <span className="opt-key">{opt.key.toUpperCase()}</span>
                        <span>{opt.text}</span>
                      </button>
                    )
                  })}
                </div>
                {isRevealed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="quiz-feedback">
                      <span className={`verdict ${sel === sc.correct ? 'correct' : 'incorrect'}`}>{sel === sc.correct ? 'Correct' : 'Review recommended'}</span>
                      <strong style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text)' }}>Correct action</strong>
                      <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6 }}>{sc.correctAction}</p>
                    </div>
                    {[['Why this is correct', sc.whyCorrect, 'var(--teal)'], ['What to document', sc.document, 'var(--text-dim)'], ['What to say to the patient', sc.sayToPatient, 'var(--gold)'], ['What NOT to say', sc.doNotSay, 'var(--red)'], ['When to escalate', sc.escalate, 'var(--text-dim)']].map(([label, val, color]) => (
                      <div key={label} style={{ padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', letterSpacing: '.07em', textTransform: 'uppercase', color, display: 'block', marginBottom: '5px' }}>{label}</span>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.6 }}>{val}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <PrevNext current="scenarios" onChange={onNav} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// MODULE 13 — QUIZ
// ---------------------------------------------------------------------------
function buildChartPoints(score) {
  const trend = score / 10
  const n = 10
  const ys = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const wave = Math.sin(i * 1.3) * 6 * (1 - trend * 0.5)
    const rise = trend * 75 * t
    ys.push(Math.max(12, Math.min(122, 112 - rise - wave)))
  }
  const xs = ys.map((_, i) => (i * 600) / (n - 1))
  const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L ${xs[n - 1].toFixed(1)} 140 L 0 140 Z`
  return { linePath, areaPath }
}

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 0.5,
    duration: 1.6 + Math.random() * 1.3,
    color: ['var(--gold)', 'var(--teal)', 'var(--red)', '#e9ebef'][i % 4],
    rotate: Math.round(Math.random() * 360),
  })), [])
  return <>{pieces.map(p => <span key={p.id} className="confetti-piece" style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`, transform: `rotate(${p.rotate}deg)` }} />)}</>
}

function StockSurprise({ score, lifetimeShares }) {
  const tier = scoreTier(score)
  const passed = tier.pct >= 80
  const price = (8 + score * 1.4).toFixed(2)
  const value = (10 * price).toFixed(2)
  const points = useMemo(() => buildChartPoints(score), [score])
  if (tier.pct < 70) return null

  return (
    <div className="stock-wrap">
      {passed && <Confetti />}
      <div className="stock-head">
        <div>
          <div className="stock-ticker">KYT Training Portfolio — Simulation only</div>
          <div className="stock-headline">{passed ? 'Portfolio Credit Earned' : 'Training Badge Earned'}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px' }}>Training simulation only — no real stock, money, or compensation.</div>
        </div>
        <div className="stock-shares">+{tier.pct >= 80 ? '10' : '5'} credits<br />Lifetime: {lifetimeShares}</div>
      </div>
      <div className="stock-value">${value}<span className="delta">@ ${price}/credit</span></div>
      <svg className="stock-chart" viewBox="0 0 600 140" preserveAspectRatio="none">
        <path className="area" d={points.areaPath} />
        <path className="line" d={points.linePath} />
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared quiz engine — used by both Part A and Part B
// ---------------------------------------------------------------------------
function QuizBase({ bank, partLabel, partTitle, lede, sectionId, storageKey, onNav }) {
  const [phase, setPhase] = useState('intro')
  const [questions, setQuestions] = useState([])
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [locked, setLocked] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])
  const [portfolio, setPortfolio] = useState({ attempts: 0, totalCredits: 0, bestScore: 0 })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) setPortfolio(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [storageKey])

  function selectTen() {
    return [...bank].sort(() => Math.random() - 0.5).slice(0, 10)
  }

  function startQuiz() {
    setQuestions(selectTen())
    setPhase('active')
    setQIndex(0)
    setScore(0)
    setSelected(null)
    setLocked(false)
    setAnswers([])
  }

  function choose(key) {
    if (locked) return
    setSelected(key)
    setLocked(true)
    const correct = key === questions[qIndex].correct
    if (correct) setScore(s => s + 1)
    setAnswers(a => [...a, { question: questions[qIndex], selected: key, correct }])
  }

  function next() {
    if (qIndex + 1 < questions.length) {
      setQIndex(i => i + 1)
      setSelected(null)
      setLocked(false)
    } else {
      const fs = answers.filter(a => a.correct).length + (selected === questions[qIndex]?.correct ? 1 : 0)
      const tier = scoreTier(fs)
      const credits = tier.pct >= 80 ? 10 : 5
      const next = { attempts: portfolio.attempts + 1, totalCredits: portfolio.totalCredits + credits, bestScore: Math.max(portfolio.bestScore, fs) }
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* ignore */ }
      setPortfolio(next)
      setPhase('results')
    }
  }

  function reset() {
    try { localStorage.removeItem(storageKey) } catch { /* ignore */ }
    setPortfolio({ attempts: 0, totalCredits: 0, bestScore: 0 })
  }

  if (phase === 'intro') return (
    <div>
      <ModuleHeader num="13" title={partTitle} lede={lede} />
      <div className="note-box" style={{ marginBottom: '20px' }}>
        <span className="tag">{partLabel}</span>
        10 randomly selected questions drawn from a focused bank of 15. Each attempt pulls a different mix — retake to cover questions you haven't seen yet.
      </div>
      {portfolio.attempts > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Your record — {partLabel}</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div><div style={{ fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{portfolio.attempts}</div><div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Attempts</div></div>
            <div><div style={{ fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>{portfolio.bestScore}/10</div><div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Best score</div></div>
            <div><div style={{ fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--teal)' }}>{portfolio.totalCredits}</div><div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Credits earned</div></div>
          </div>
          <button className="reveal-btn secondary" style={{ marginTop: '14px', fontSize: '10px', padding: '5px 10px' }} onClick={reset}>Reset (admin / testing)</button>
        </div>
      )}
      <button className="start-btn" onClick={startQuiz}>Start {partLabel}</button>
      <PrevNext current={sectionId} onChange={onNav} />
    </div>
  )

  if (phase === 'active') {
    const q = questions[qIndex]
    return (
      <div>
        <p className="eyebrow">Quiz — {partLabel}</p>
        <div className="quiz-meta-row">
          <span>Question {qIndex + 1} of {questions.length}</span>
          <span>{q?.category}</span>
          <span>Score {score}</span>
        </div>
        <div className="quiz-progress-track">
          <div className="quiz-progress-fill" style={{ width: `${(qIndex / questions.length) * 100}%` }} />
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
              } else if (selected === opt.key) cls += ' selected'
              return (
                <button key={opt.key} className={cls} onClick={() => choose(opt.key)} disabled={locked}>
                  <span className="opt-key">{opt.key.toUpperCase()}</span>
                  <span>{opt.text}</span>
                </button>
              )
            })}
          </div>
          {locked && (
            <div className="quiz-feedback">
              <span className={`verdict ${selected === q.correct ? 'correct' : 'incorrect'}`}>{selected === q.correct ? 'Correct' : 'Not quite'}</span>
              {q.explanation}
            </div>
          )}
          <div className="quiz-footer">
            <button className="next-btn" onClick={next} disabled={!locked}>{qIndex + 1 === questions.length ? 'See results' : 'Next question'}</button>
          </div>
        </div>
      </div>
    )
  }

  const finalScore = answers.filter(a => a.correct).length
  const tier = scoreTier(finalScore)
  const missed = answers.filter(a => !a.correct)
  const categories = [...new Set(missed.map(a => a.question.category))]

  return (
    <div>
      <p className="eyebrow">{partLabel} — Results</p>
      <h1 className="page-title">Quiz Complete</h1>
      <div className="card results-card">
        <div className="results-score">{finalScore}<span>/10</span></div>
        <span className={`badge ${tier.tone} results-tier`}>{tier.title}</span>
        <p className="results-detail">{tier.detail}</p>
        {categories.length > 0 && (
          <div style={{ marginBottom: '16px', textAlign: 'left', maxWidth: '420px', margin: '0 auto 16px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px' }}>Review these areas</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {categories.map(c => <span key={c} className="badge red" style={{ fontSize: '10px' }}>{c}</span>)}
            </div>
          </div>
        )}
        <div className="results-actions">
          <button className="reveal-btn secondary" onClick={startQuiz}>Retake {partLabel}</button>
        </div>
      </div>
      <StockSurprise score={finalScore} lifetimeShares={portfolio.totalCredits} />
      <PrevNext current={sectionId} onChange={onNav} />
    </div>
  )
}

function QuizASection({ onNav }) {
  return (
    <QuizBase
      bank={quizBankA}
      partLabel="Part A"
      partTitle="Quiz — Part A: Intake & Eligibility"
      lede="Covers Zocdoc intake, OS record creation, intake form completeness, member ID and subscriber data, and Active vs Verified. Complete Part A before moving to Part B."
      sectionId="quiza"
      storageKey={PORTFOLIO_KEY_A}
      onNav={onNav}
    />
  )
}

function QuizBSection({ onNav }) {
  return (
    <QuizBase
      bank={quizBankB}
      partLabel="Part B"
      partTitle="Quiz — Part B: Insurance & Communication"
      lede="Covers PPO vs HMO, network participation, unreachable patients, patient communication, membership eligibility, office errors, service recovery, and checkout. Complete Part A first."
      sectionId="quizb"
      storageKey={PORTFOLIO_KEY_B}
      onNav={onNav}
    />
  )
}

// ---------------------------------------------------------------------------
// GLOSSARY
// ---------------------------------------------------------------------------
function GlossarySection({ onNav }) {
  const [search, setSearch] = useState('')
  const filtered = glossary.filter(g => g.term.toLowerCase().includes(search.toLowerCase()) || g.def.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <ModuleHeader num="14" title="Terminology Glossary"
        lede="Key terms used throughout the training. Search to find definitions quickly." />
      <input type="text" placeholder="Search terms..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', marginBottom: '24px', padding: '10px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontFamily: 'inherit', fontSize: '13.5px' }} />
      <div className="card">
        {filtered.map((g, i) => (
          <div key={g.term} style={{ display: 'flex', gap: '20px', padding: '13px 0', borderBottom: i < filtered.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
            <div style={{ flex: '0 0 180px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--gold)' }}>{g.term}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6 }}>{g.def}</div>
          </div>
        ))}
        {filtered.length === 0 && <p style={{ color: 'var(--text-faint)', fontSize: '13px', padding: '12px 0' }}>No terms match "{search}"</p>}
      </div>
      <PrevNext current="glossary" onChange={onNav} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// MANAGER POLICY
// ---------------------------------------------------------------------------
function PolicySection({ onNav }) {
  return (
    <div>
      <ModuleHeader num="15" title="Manager Policy Review"
        lede="Every field marked 'Management confirmation required' needs a decision from Isaac or the office manager before the policy is complete." />

      <div className="note-box" style={{ marginBottom: '24px' }}>
        <span className="tag">For management review</span>
        Fields below are placeholders. Each requires a confirmed office policy before staff can apply it consistently.
      </div>

      <section className="panel">
        <h2 className="section-title">Operational policy fields</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.entries(managementPolicy).map(([key, val]) => (
            <ManagerCard key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} value={val} />
          ))}
        </div>
      </section>
      <PrevNext current="policy" onChange={onNav} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// MODULE 16 — PPO PLANS
// ---------------------------------------------------------------------------
function PPOSection({ onNav }) {
  const [activeLesson, setActiveLesson] = useState('l1')
  const [completedLessons, setCompletedLessons] = useState({})
  const [activeFilter, setActiveFilter] = useState('all')
  const [hiddenPlans, setHiddenPlans] = useState({})

  function toggleComplete(id) {
    setCompletedLessons(c => ({ ...c, [id]: !c[id] }))
  }

  function applyFilter(key) {
    setActiveFilter(key)
    const hidden = {}
    if (key !== 'all') {
      ppoPlans.forEach(p => {
        const fn = ppoFilterFns[key]
        if (fn && !fn(p)) hidden[p.key] = true
      })
    }
    setHiddenPlans(hidden)
  }

  const lesson = ppoLessons.find(l => l.id === activeLesson)
  const doneCount = Object.values(completedLessons).filter(Boolean).length

  return (
    <div>
      <ModuleHeader num="16" title="Individual PPO Dental Plans"
        lede="When a patient walks in without usable coverage, an individual PPO is the fix. This module trains you to explain what a PPO is, how its waiting periods and limits work, and which of the eight plans fits the patient in front of you." />

      <div className="note-box" style={{ marginBottom: '24px' }}>
        <span className="tag">Training scope</span>
        Plan figures are indicative — waiting periods, percentages, and activation rules vary by carrier and state. Always confirm against the carrier's current Schedule of Benefits before quoting a patient.
      </div>

      {/* Lesson nav */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {ppoLessons.map(l => (
          <button key={l.id} className={`os-nav-item ${activeLesson === l.id ? 'active' : ''}`}
            style={{ padding: '8px 14px', fontSize: '12px', position: 'relative' }}
            onClick={() => setActiveLesson(l.id)}>
            {completedLessons[l.id] && <span style={{ color: 'var(--teal)', marginRight: '5px' }}>✓</span>}
            {l.num} · {l.title.split('—')[0].trim()}
          </button>
        ))}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', alignSelf: 'center', marginLeft: '6px' }}>{doneCount}/5 complete</span>
      </div>

      {/* Lesson 1 */}
      {activeLesson === 'l1' && lesson && (
        <section className="panel">
          <h2 className="section-title">{lesson.title}</h2>
          <p className="lede" style={{ marginBottom: '20px' }}>{lesson.lede}</p>
          {lesson.body.map((b, i) => <p key={i} className="body-text">{b}</p>)}

          {/* Comparison table */}
          <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', fontSize: '13px', background: 'var(--surface-2)' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 14px', background: 'var(--surface-3)', fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-faint)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}></th>
                  {['PPO (recommended)', 'HMO / DHMO', 'Discount plan'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', background: 'var(--surface-3)', fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.06em', color: h.includes('PPO') ? 'var(--gold)' : 'var(--text-faint)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lesson.comparison.map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border-soft)', fontWeight: 600, color: 'var(--text)', fontSize: '12.5px', whiteSpace: 'nowrap' }}>{row.feature}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border-soft)', color: row.ppoBest ? 'var(--teal)' : 'var(--text-dim)', fontSize: '12.5px' }}>{row.ppo}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border-soft)', color: row.hmoBad ? 'var(--red)' : 'var(--text-dim)', fontSize: '12.5px' }}>{row.hmo}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border-soft)', color: row.discountBad ? 'var(--red)' : 'var(--text-dim)', fontSize: '12.5px' }}>{row.discount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ScriptCard label="The one-line version for patients" text={lesson.script} />

          <button className={`reveal-btn ${completedLessons[lesson.id] ? '' : 'secondary'}`} style={{ marginTop: '8px' }} onClick={() => toggleComplete(lesson.id)}>
            {completedLessons[lesson.id] ? '✓ Completed' : 'Mark lesson complete'}
          </button>
        </section>
      )}

      {/* Lesson 2 */}
      {activeLesson === 'l2' && lesson && (
        <section className="panel">
          <h2 className="section-title">{lesson.title}</h2>
          <p className="lede" style={{ marginBottom: '20px' }}>{lesson.lede}</p>
          {lesson.body.map((b, i) => <p key={i} className="body-text">{b}</p>)}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
            {lesson.tiers.map((t, i) => (
              <div key={i} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: i === 0 ? 'var(--teal)' : i === 1 ? 'var(--gold)' : 'var(--text-faint)', lineHeight: 1 }}>{t.pct}</div>
                <div style={{ fontWeight: 700, fontSize: '12px', letterSpacing: '.04em', textTransform: 'uppercase', margin: '8px 0 6px', color: 'var(--text)' }}>{t.name}</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-faint)' }}>{t.ex}</div>
              </div>
            ))}
          </div>

          <div className="note-box" style={{ marginBottom: '20px' }}>
            <span className="tag">Analogy — "split the check"</span>
            {lesson.analogy}
          </div>

          {lesson.body2.map((b, i) => <p key={i} className="body-text">{b}</p>)}

          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--gold-line)', borderRadius: 'var(--radius)', padding: '18px 22px', marginBottom: '20px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--gold)', display: 'block', marginBottom: '8px' }}>Worked example</span>
            <p style={{ fontSize: '13.5px', color: 'var(--text-dim)', lineHeight: 1.65, margin: 0 }}>{lesson.workedExample}</p>
          </div>

          <p className="body-text" style={{ fontStyle: 'italic', color: 'var(--text-faint)' }}>{lesson.note}</p>

          <button className={`reveal-btn ${completedLessons[lesson.id] ? '' : 'secondary'}`} onClick={() => toggleComplete(lesson.id)}>
            {completedLessons[lesson.id] ? '✓ Completed' : 'Mark lesson complete'}
          </button>
        </section>
      )}

      {/* Lesson 3 */}
      {activeLesson === 'l3' && lesson && (
        <section className="panel">
          <h2 className="section-title">{lesson.title}</h2>
          <p className="lede" style={{ marginBottom: '20px' }}>{lesson.lede}</p>
          {lesson.body.map((b, i) => <p key={i} className="body-text">{b}</p>)}

          <div className="note-box" style={{ marginBottom: '20px' }}>
            <span className="tag">Analogy — "the new-gym rule"</span>
            {lesson.analogy}
          </div>

          {/* Wait timeline */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '22px 24px', marginBottom: '20px' }}>
            {lesson.waitTimeline.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '14px', alignItems: 'center', padding: '12px 0', borderBottom: i < lesson.waitTimeline.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>{row.label}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-faint)' }}>{row.sub}</div>
                </div>
                <div style={{ position: 'relative', height: '30px', background: 'var(--surface-3)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, height: '100%', width: `${row.width}%`,
                    background: row.tone === 'now' ? 'var(--teal)' : row.tone === 'short' ? 'var(--teal)' : 'var(--gold)',
                    opacity: row.tone === 'short' ? 0.65 : 1,
                    display: 'flex', alignItems: 'center', padding: '0 10px',
                    fontSize: '11.5px', fontWeight: 600, color: '#0a0d12', whiteSpace: 'nowrap', borderRadius: '6px',
                  }}>{row.text}</div>
                </div>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '14px', marginTop: '8px' }}>
              <div />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-faint)' }}>
                {['Day 1', '3 mo', '6 mo', '9 mo', '12 mo'].map(m => <span key={m}>{m}</span>)}
              </div>
            </div>
          </div>

          <div className="active-banner" style={{ marginBottom: '20px' }}>
            <div className="active-banner-hed">The trap: "active" ≠ "usable"</div>
            <div className="script-card" style={{ marginTop: '12px', marginBottom: 0 }}>
              <div className="script-text">{lesson.script}</div>
            </div>
          </div>

          {lesson.body2.map((b, i) => <p key={i} className="body-text">{b}</p>)}

          <button className={`reveal-btn ${completedLessons[lesson.id] ? '' : 'secondary'}`} onClick={() => toggleComplete(lesson.id)}>
            {completedLessons[lesson.id] ? '✓ Completed' : 'Mark lesson complete'}
          </button>
        </section>
      )}

      {/* Lesson 4 */}
      {activeLesson === 'l4' && lesson && (
        <section className="panel">
          <h2 className="section-title">{lesson.title}</h2>
          <p className="lede" style={{ marginBottom: '20px' }}>{lesson.lede}</p>
          {lesson.body.map((b, i) => <p key={i} className="body-text">{b}</p>)}

          <ScriptCard label="Say this verbatim before quoting any implant or bridge" text={lesson.script} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', margin: '20px 0' }}>
            {lesson.gotchas.map((g, i) => (
              <div key={i} className="card">
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--red)', marginBottom: '8px' }}>Gotcha {String(i + 2).padStart(2, '0')}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', color: 'var(--text)', marginBottom: '8px' }}>{g.label}</div>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>{g.detail}</p>
              </div>
            ))}
          </div>

          {lesson.body2.map((b, i) => <p key={i} className="body-text">{b}</p>)}

          <div className="note-box" style={{ marginBottom: '20px' }}>
            <span className="tag">Compliance line — we are educators, not sellers</span>
            {lesson.complianceNote}
          </div>

          <button className={`reveal-btn ${completedLessons[lesson.id] ? '' : 'secondary'}`} onClick={() => toggleComplete(lesson.id)}>
            {completedLessons[lesson.id] ? '✓ Completed' : 'Mark lesson complete'}
          </button>
        </section>
      )}

      {/* Lesson 5 — Plan Grid */}
      {activeLesson === 'l5' && lesson && (
        <section className="panel">
          <h2 className="section-title">{lesson.title}</h2>
          <p className="lede" style={{ marginBottom: '20px' }}>{lesson.lede}</p>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-faint)', fontWeight: 600, marginRight: '4px' }}>Patient needs:</span>
            {ppoFilters.map(f => (
              <button key={f.key} onClick={() => applyFilter(f.key)}
                style={{ border: `1px solid ${activeFilter === f.key ? 'var(--gold)' : 'var(--border)'}`, background: activeFilter === f.key ? 'var(--gold)' : 'var(--surface-2)', borderRadius: '999px', padding: '7px 14px', fontSize: '12.5px', color: activeFilter === f.key ? 'var(--bg)' : 'var(--text-dim)', cursor: 'pointer', fontWeight: activeFilter === f.key ? 600 : 400 }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Plan cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '36px' }}>
            {ppoPlans.map(p => (
              <div key={p.key} className="card" style={{ opacity: hiddenPlans[p.key] ? 0.25 : 1, filter: hiddenPlans[p.key] ? 'saturate(.5)' : 'none', transition: 'opacity .2s, filter .2s', border: p.review ? '1px dashed var(--border)' : '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-faint)', marginBottom: '3px' }}>{p.carrier}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--text)' }}>{p.name}</div>
                  </div>
                  {p.score && (
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--teal)', lineHeight: 1 }}>{p.score}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.06em' }}>rating</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {p.bestSelling && <span className="badge gold" style={{ fontSize: '10px' }}>Best selling</span>}
                  {p.vision && <span className="badge teal" style={{ fontSize: '10px' }}>+ Vision</span>}
                  {p.review && <span className="badge neutral" style={{ fontSize: '10px' }}>Gathering reviews</span>}
                </div>

                <div style={{ fontFamily: 'var(--font-display)', fontSize: p.review ? '15px' : '26px', color: p.review ? 'var(--text-faint)' : 'var(--text)', marginBottom: '4px' }}>
                  {p.monthly ? `$${p.monthly}/mo` : '~$100/mo · pending'}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--gold)', marginBottom: '10px' }}>Annual max: ${p.annualMax.toLocaleString()}</div>

                {/* Coverage lines */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderTop: '1px solid var(--border-soft)', marginBottom: '12px' }}>
                  {[
                    ['Cleanings', p.cov.preventive],
                    ['Fillings', p.cov.basic],
                    ['Crowns / RCT', p.cov.major],
                    ['Implants', p.cov.implant],
                  ].map(([label, c]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-soft)', fontSize: '12.5px' }}>
                      <span style={{ color: 'var(--text-dim)' }}>{label}</span>
                      {!c ? (
                        <span style={{ color: 'var(--text-faint)' }}>Not covered</span>
                      ) : (
                        <span style={{ color: c.wait > 0 ? 'var(--gold)' : 'var(--teal)', fontWeight: 600 }}>
                          {c.pct}% · {c.wait === 0 ? 'day 1' : `${c.wait}mo wait`}{c.note ? ` (${c.note})` : ''}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ background: 'var(--surface-3)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: '12.5px', color: 'var(--teal)', lineHeight: 1.5 }}>
                  {p.fit}
                </div>
                {p.note && <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '8px', lineHeight: 1.5 }}>{p.note}</div>}
              </div>
            ))}
          </div>

          {/* Match cheat sheet */}
          <h2 className="section-title" style={{ marginBottom: '12px' }}>Front-desk cheat sheet</h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-faint)', marginBottom: '16px' }}>Frame this as education and comparison, never a personalized sale.</p>
          <div className="card" style={{ marginBottom: '24px' }}>
            {ppoMatchGuide.map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', padding: '12px 0', borderBottom: i < ppoMatchGuide.length - 1 ? '1px solid var(--border-soft)' : 'none', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: '0 0 220px', fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--text)', lineHeight: 1.35 }}>{row.need}</div>
                <div style={{ flex: 1, fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: row.pick.replace(/([A-Z][a-z]+ (?:Dental|PPO|Premier|PrimeStar|Primary|Extend|NCD)[^\s.]*)/g, '<strong style="color:var(--teal)">$1</strong>') }} />
              </div>
            ))}
          </div>

          <button className={`reveal-btn ${completedLessons[lesson.id] ? '' : 'secondary'}`} onClick={() => toggleComplete(lesson.id)}>
            {completedLessons[lesson.id] ? '✓ Completed — head to PPO Quiz →' : 'Mark lesson complete'}
          </button>
          {completedLessons[lesson.id] && (
            <button className="reveal-btn" style={{ marginLeft: '10px' }} onClick={() => onNav('ppoquiz')}>Go to PPO Quiz →</button>
          )}
        </section>
      )}

      <PrevNext current="ppo" onChange={onNav} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// MODULE 17 — PPO QUIZ (10 questions, separate from main quiz)
// ---------------------------------------------------------------------------
const PPO_QUIZ_KEY = 'kyt-ppo-quiz-portfolio'

function PPOQuizSection({ onNav }) {
  const [phase, setPhase] = useState('intro')
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [locked, setLocked] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])
  const [record, setRecord] = useState({ attempts: 0, bestScore: 0 })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PPO_QUIZ_KEY)
      if (raw) setRecord(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  function startQuiz() {
    setPhase('active')
    setQIndex(0)
    setScore(0)
    setSelected(null)
    setLocked(false)
    setAnswers([])
  }

  function choose(key) {
    if (locked) return
    setSelected(key)
    setLocked(true)
    const correct = key === ppoQuizBank[qIndex].correct
    if (correct) setScore(s => s + 1)
    setAnswers(a => [...a, { q: ppoQuizBank[qIndex], selected: key, correct }])
  }

  function next() {
    if (qIndex + 1 < ppoQuizBank.length) {
      setQIndex(i => i + 1)
      setSelected(null)
      setLocked(false)
    } else {
      const finalScore = answers.filter(a => a.correct).length + (selected === ppoQuizBank[qIndex]?.correct ? 1 : 0)
      const next = { attempts: record.attempts + 1, bestScore: Math.max(record.bestScore, finalScore) }
      try { localStorage.setItem(PPO_QUIZ_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      setRecord(next)
      setPhase('results')
    }
  }

  const pct = answers.length > 0 ? Math.round((answers.filter(a => a.correct).length / ppoQuizBank.length) * 100) : 0
  const finalScore = answers.filter(a => a.correct).length + (phase === 'results' && selected === ppoQuizBank[ppoQuizBank.length - 1]?.correct ? 1 : 0)
  const missed = answers.filter(a => !a.correct).map(a => a.q.category)
  const missedCats = [...new Set(missed)]

  if (phase === 'intro') return (
    <div>
      <ModuleHeader num="17" title="PPO Plans Quiz"
        lede="Ten questions covering PPO fundamentals, coverage tiers, waiting periods, fine print, plan matching, and compliance. Separate from the main eligibility quiz — score here shows your PPO product knowledge specifically." />

      {record.attempts > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Your PPO quiz record</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div><div style={{ fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{record.attempts}</div><div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Attempts</div></div>
            <div><div style={{ fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>{record.bestScore}/10</div><div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Best score</div></div>
            <div><div style={{ fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--teal)' }}>{Math.round((record.bestScore / 10) * 100)}%</div><div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Best %</div></div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {['PPO Fundamentals', 'Coverage Tiers', 'Waiting Periods', 'Fine Print', 'Plan Matching', 'Compliance'].map(cat => (
          <span key={cat} className="badge neutral" style={{ fontSize: '11px' }}>{cat}</span>
        ))}
      </div>

      <button className="start-btn" onClick={startQuiz}>Start PPO Quiz</button>
      <PrevNext current="ppoquiz" onChange={onNav} />
    </div>
  )

  if (phase === 'active') {
    const q = ppoQuizBank[qIndex]
    return (
      <div>
        <p className="eyebrow">Module 17 — PPO Quiz</p>
        <div className="quiz-meta-row">
          <span>Question {qIndex + 1} of {ppoQuizBank.length}</span>
          <span>{q?.category}</span>
          <span>Score {score}</span>
        </div>
        <div className="quiz-progress-track">
          <div className="quiz-progress-fill" style={{ width: `${(qIndex / ppoQuizBank.length) * 100}%` }} />
        </div>
        <div className="quiz-card">
          <p className="quiz-question">{q.prompt}</p>
          <div className="quiz-options">
            {q.options.map(opt => {
              let cls = 'quiz-option'
              if (locked) {
                cls += ' locked'
                if (opt.key === q.correct) cls += ' correct'
                else if (opt.key === selected) cls += ' incorrect'
              } else if (selected === opt.key) cls += ' selected'
              return (
                <button key={opt.key} className={cls} onClick={() => choose(opt.key)} disabled={locked}>
                  <span className="opt-key">{opt.key.toUpperCase()}</span>
                  <span>{opt.text}</span>
                </button>
              )
            })}
          </div>
          {locked && (
            <div className="quiz-feedback">
              <span className={`verdict ${selected === q.correct ? 'correct' : 'incorrect'}`}>{selected === q.correct ? 'Correct' : 'Not quite'}</span>
              {q.explanation}
            </div>
          )}
          <div className="quiz-footer">
            <button className="next-btn" onClick={next} disabled={!locked}>{qIndex + 1 === ppoQuizBank.length ? 'See results' : 'Next question'}</button>
          </div>
        </div>
      </div>
    )
  }

  const finalPct = Math.round((finalScore / ppoQuizBank.length) * 100)
  const passed = finalPct >= 80

  return (
    <div>
      <p className="eyebrow">Module 17 — PPO Quiz Results</p>
      <h1 className="page-title">PPO Quiz Complete</h1>
      <div className="card results-card">
        <div className="results-score">{finalScore}<span>/10</span></div>
        <span className={`badge ${passed ? 'gold' : finalPct >= 70 ? 'teal' : 'red'} results-tier`}>
          {passed ? 'PPO Certified-Ready' : finalPct >= 70 ? 'Review Recommended' : 'Retraining Required'}
        </span>
        <p className="results-detail">
          {passed ? 'You can read any plan on the shelf and guide a patient honestly. Keep the cheat sheet at your desk.' : 'Review Lessons 3 and 5 — waiting periods and plan matching are where most points are lost — then retake.'}
        </p>
        {missedCats.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px' }}>Review these areas</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              {missedCats.map(c => <span key={c} className="badge red" style={{ fontSize: '10px' }}>{c}</span>)}
            </div>
          </div>
        )}
        <div className="results-actions">
          <button className="reveal-btn secondary" onClick={startQuiz}>Retake quiz</button>
          <button className="reveal-btn" onClick={() => onNav('ppo')}>← Back to PPO lessons</button>
        </div>
      </div>
      <PrevNext current="ppoquiz" onChange={onNav} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// MODULE 18 — KYT OS GUIDE
// ---------------------------------------------------------------------------
function KYTOSSection({ onNav }) {
  const [activeLesson, setActiveLesson] = useState('pipeline')

  const lesson = kytOsLessons.find(l => l.id === activeLesson)

  const toneColor = { gold: 'var(--gold)', teal: 'var(--teal)', red: 'var(--red)', neutral: 'var(--text-dim)' }

  return (
    <div>
      <ModuleHeader num="18" title="KYT OS Walkthrough"
        lede="Visual, field-by-field training on how to use the KYT OS New Patient Intake system. Screenshots of the actual interface — annotated so you know exactly what to click, what to type, and why." />

      <div className="note-box" style={{ marginBottom: '24px' }}>
        <span className="tag">Training reminder</span>
        Screenshots show the real KYT OS interface. Numbers in callouts below each image match numbered annotations. Read every callout before moving to the next lesson.
      </div>

      {/* Lesson tab strip */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '28px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        {kytOsLessons.map(l => (
          <button key={l.id}
            className={`os-nav-item ${activeLesson === l.id ? 'active' : ''}`}
            style={{ padding: '8px 13px', fontSize: '12px' }}
            onClick={() => setActiveLesson(l.id)}>
            {l.num} · {l.title}
          </button>
        ))}
      </div>

      {lesson && (
        <div>
          {/* Lesson header */}
          <div style={{ marginBottom: '28px' }}>
            <p className="eyebrow">Lesson {lesson.num} of {kytOsLessons.length}</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--text)', margin: '4px 0 10px', fontWeight: 500 }}>{lesson.title}</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.65, maxWidth: '640px' }}>{lesson.lede}</p>
          </div>

          {/* Single screenshot */}
          {lesson.screenshot && (
            <section className="panel">
              <h2 className="section-title">Interface Reference</h2>
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '20px' }}>
                <img
                  src={lesson.screenshot}
                  alt={lesson.screenshotAlt}
                  style={{ width: '100%', display: 'block', maxHeight: '520px', objectFit: 'contain', objectPosition: 'top' }}
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                />
                <div style={{ display: 'none', padding: '32px', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '10px', color: 'var(--text-faint)', fontSize: '13px' }}>
                  <span style={{ fontSize: '28px' }}>🖼</span>
                  <span>{lesson.screenshotAlt}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>{lesson.screenshot}</span>
                </div>
              </div>

              {/* Callouts */}
              {lesson.callouts && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {lesson.callouts.map(c => (
                    <div key={c.num} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                      <div style={{ flex: '0 0 28px', height: '28px', background: 'var(--gold)', color: 'var(--bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>{c.num}</div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gold)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.04em' }}>{c.label}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6 }}>{c.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Multiple screenshots (ortho lesson) */}
          {lesson.screenshots && (
            <section className="panel">
              <h2 className="section-title">Interface Reference</h2>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {lesson.screenshots.map((ss, i) => (
                  <div key={i} style={{ flex: '1 1 280px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                    <img src={ss.src} alt={ss.alt} style={{ width: '100%', display: 'block', maxHeight: '200px', objectFit: 'contain', objectPosition: 'top' }}
                      onError={e => { e.target.style.display = 'none' }} />
                    <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{ss.caption}</div>
                  </div>
                ))}
              </div>
              {lesson.callouts && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {lesson.callouts.map(c => (
                    <div key={c.num} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                      <div style={{ flex: '0 0 28px', height: '28px', background: 'var(--gold)', color: 'var(--bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>{c.num}</div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gold)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.04em' }}>{c.label}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6 }}>{c.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Rules */}
          {lesson.rules && (
            <section className="panel">
              <h2 className="section-title">Rules for this lesson</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lesson.rules.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', padding: '11px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)', fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>→</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6 }}>{r}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Source rules (lesson 04) */}
          {lesson.sourceRules && (
            <section className="panel">
              <h2 className="section-title">Source-by-source intake rules</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {lesson.sourceRules.map(sr => (
                  <div key={sr.source} className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                      <span className={`badge ${sr.tone}`} style={{ fontSize: '13px', padding: '5px 12px' }}>{sr.source}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>Start stage: {sr.startStage}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>Contact by: {sr.contactTarget}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {sr.notes.map((n, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.55 }}>
                          <span style={{ color: 'var(--teal)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>·</span>
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Insurance status guide (lesson 06) */}
          {lesson.statusGuide && (
            <section className="panel">
              <h2 className="section-title">Status decision guide</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {lesson.statusGuide.map(sg => (
                  <div key={sg.status} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span className={`badge ${sg.tone}`}>{sg.status}</span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-dim)', marginBottom: '6px', lineHeight: 1.55 }}><strong style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.05em' }}>Use when: </strong>{sg.when}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-dim)', lineHeight: 1.55 }}><strong style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.05em' }}>Then: </strong>{sg.action}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Good/bad comments examples (lesson 08) */}
          {lesson.goodExamples && (
            <section className="panel">
              <h2 className="section-title" style={{ color: 'var(--teal)' }}>✓ Good comment examples</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {lesson.goodExamples.map((ex, i) => (
                  <div key={i} style={{ padding: '12px 16px', background: 'rgba(79,158,152,0.07)', border: '1px solid rgba(79,158,152,0.3)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                    "{ex}"
                  </div>
                ))}
              </div>
              <h2 className="section-title" style={{ color: 'var(--red)' }}>✗ What NOT to write</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lesson.badExamples.map((ex, i) => (
                  <div key={i} style={{ padding: '12px 16px', background: 'rgba(194,100,95,0.07)', border: '1px solid rgba(194,100,95,0.3)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--red)', marginBottom: '5px' }}>"{ex.bad}"</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-dim)', lineHeight: 1.5 }}>Why it fails: {ex.why}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pipeline stages reference (first pipeline lesson) */}
          {lesson.id === 'pipeline' && (
            <section className="panel">
              <h2 className="section-title">All pipeline stages at a glance</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {kytOsPipelineStages.map(ps => (
                  <div key={ps.stage} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span className={`badge ${ps.tone}`}>{ps.stage}</span>
                      {ps.reasons && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>Requires archive reason</span>}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '10px', lineHeight: 1.5 }}>{ps.meaning}</p>
                    {ps.countsAs && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '5px' }}>Counts as this stage</div>
                        {ps.countsAs.map((c, i) => <div key={i} style={{ fontSize: '12.5px', color: 'var(--text-dim)', paddingLeft: '10px', lineHeight: 1.55 }}>· {c}</div>)}
                      </div>
                    )}
                    {ps.doesNotCountAs && (
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '5px' }}>Does NOT count</div>
                        {ps.doesNotCountAs.map((c, i) => <div key={i} style={{ fontSize: '12.5px', color: 'var(--text-dim)', paddingLeft: '10px', lineHeight: 1.55 }}>· {c}</div>)}
                      </div>
                    )}
                    {ps.reasons && (
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '5px' }}>Valid archive reasons</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {ps.reasons.map(r => <span key={r} className="badge neutral" style={{ fontSize: '10px' }}>{r}</span>)}
                        </div>
                      </div>
                    )}
                    <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>Next → {ps.nextAction}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Lesson navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            {kytOsLessons.findIndex(l => l.id === activeLesson) > 0 ? (
              <button className="reveal-btn secondary" onClick={() => setActiveLesson(kytOsLessons[kytOsLessons.findIndex(l => l.id === activeLesson) - 1].id)}>
                ← Previous lesson
              </button>
            ) : <div />}
            {kytOsLessons.findIndex(l => l.id === activeLesson) < kytOsLessons.length - 1 ? (
              <button className="reveal-btn" onClick={() => setActiveLesson(kytOsLessons[kytOsLessons.findIndex(l => l.id === activeLesson) + 1].id)}>
                Next lesson →
              </button>
            ) : (
              <button className="reveal-btn" onClick={() => onNav('pipeline')}>← Back to start</button>
            )}
          </div>
        </div>
      )}

      <PrevNext current="kytos" onChange={onNav} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// App shell
// ---------------------------------------------------------------------------
export default function App() {
  const [section, setSection] = useState('pipeline')

  return (
    <div className="app-shell">
      <nav className="os-rail">
        <div className="os-brand">
          <span className="mark">KYT Dental OS</span>
          <span className="sub">Intake & Eligibility Academy</span>
        </div>
        <div className="os-nav">
          {SECTIONS.map((s, i) => {
            const isNewGroup = i === 0 || SECTIONS[i - 1].group !== s.group
            return (
              <div key={s.id}>
                {isNewGroup && (
                  <div className="nav-group-label">{s.group}</div>
                )}
                <button className={`os-nav-item ${section === s.id ? 'active' : ''}`} onClick={() => setSection(s.id)}>
                  <span className="num">{s.num}</span>
                  {s.label}
                </button>
              </div>
            )
          })}
        </div>
        <div className="os-rail-footer">
          KYT NEW PATIENT INTAKE<br />
          & ELIGIBILITY ACADEMY
        </div>
      </nav>

      <main className="os-main">
        {section === 'pipeline'    && <PipelineSection onNav={setSection} />}
        {section === 'zocdoc'      && <ZocdocSection onNav={setSection} />}
        {section === 'intake'      && <IntakeSection onNav={setSection} />}
        {section === 'eligibility' && <EligibilitySection onNav={setSection} />}
        {section === 'status'      && <StatusSection onNav={setSection} />}
        {section === 'window'      && <WindowSection onNav={setSection} />}
        {section === 'scripts'     && <ScriptsSection onNav={setSection} />}
        {section === 'financial'   && <FinancialSection onNav={setSection} />}
        {section === 'checkout'    && <CheckoutSection onNav={setSection} />}
        {section === 'membership'  && <MembershipSection onNav={setSection} />}
        {section === 'billing'     && <BillingSection onNav={setSection} />}
        {section === 'scenarios'   && <ScenariosSection onNav={setSection} />}
        {section === 'quiza'       && <QuizASection onNav={setSection} />}
        {section === 'quizb'       && <QuizBSection onNav={setSection} />}
        {section === 'glossary'    && <GlossarySection onNav={setSection} />}
        {section === 'policy'      && <PolicySection onNav={setSection} />}
        {section === 'ppo'         && <PPOSection onNav={setSection} />}
        {section === 'ppoquiz'     && <PPOQuizSection onNav={setSection} />}
        {section === 'kytos'       && <KYTOSSection onNav={setSection} />}
      </main>
    </div>
  )
}
