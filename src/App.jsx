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
} from './data.js'

const SECTIONS = [
  { id: 'pipeline',    label: 'Pipeline',        num: '01' },
  { id: 'zocdoc',     label: 'Zocdoc Intake',    num: '02' },
  { id: 'intake',     label: 'Intake Form',      num: '03' },
  { id: 'eligibility',label: 'Eligibility',      num: '04' },
  { id: 'status',     label: 'Status System',    num: '05' },
  { id: 'window',     label: '24-Hour Window',   num: '06' },
  { id: 'scripts',    label: 'Scripts',          num: '07' },
  { id: 'financial',  label: 'Financial Paths',  num: '08' },
  { id: 'checkout',   label: 'Checkout',         num: '09' },
  { id: 'membership', label: 'Membership',       num: '10' },
  { id: 'billing',    label: 'Billing',          num: '11' },
  { id: 'scenarios',  label: 'Scenarios',        num: '12' },
  { id: 'quiz',       label: 'Quiz',             num: '13' },
  { id: 'glossary',   label: 'Glossary',         num: '14' },
  { id: 'policy',     label: 'Manager Policy',   num: '15' },
]

const PORTFOLIO_KEY = 'kyt-training-portfolio'

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

function QuizSection({ onNav }) {
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
      const raw = localStorage.getItem(PORTFOLIO_KEY)
      if (raw) setPortfolio(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  function selectTen() {
    const shuffled = [...quizBank].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 10)
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
      const finalScore = score + (selected === questions[qIndex].correct ? 0 : 0)
      const tier = scoreTier(answers.filter(a => a.correct).length + (selected === questions[qIndex]?.correct ? 1 : 0))
      const credits = tier.pct >= 90 ? 10 : tier.pct >= 80 ? 10 : tier.pct >= 70 ? 5 : 0
      const next = { attempts: portfolio.attempts + 1, totalCredits: portfolio.totalCredits + credits, bestScore: Math.max(portfolio.bestScore, score + (selected === questions[qIndex]?.correct ? 1 : 0)) }
      try { localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      setPortfolio(next)
      setPhase('results')
    }
  }

  function reset() {
    try { localStorage.removeItem(PORTFOLIO_KEY) } catch { /* ignore */ }
    setPortfolio({ attempts: 0, totalCredits: 0, bestScore: 0 })
  }

  if (phase === 'intro') return (
    <div>
      <ModuleHeader num="13" title="Eligibility Quiz"
        lede="Ten randomly selected questions from a bank of 30. Categories include Zocdoc intake, eligibility validation, membership rules, office error, and more. Score 90% or higher to earn New Patient Intake Guardian status." />
      {portfolio.attempts > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Your training record</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div><div style={{ fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{portfolio.attempts}</div><div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Attempts</div></div>
            <div><div style={{ fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>{portfolio.bestScore}/10</div><div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Best score</div></div>
            <div><div style={{ fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--teal)' }}>{portfolio.totalCredits}</div><div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Credits earned</div></div>
          </div>
          <button className="reveal-btn secondary" style={{ marginTop: '14px', fontSize: '10px', padding: '5px 10px' }} onClick={reset}>Reset (admin / testing)</button>
        </div>
      )}
      <button className="start-btn" onClick={startQuiz}>Start quiz</button>
      <PrevNext current="quiz" onChange={onNav} />
    </div>
  )

  if (phase === 'active') {
    const q = questions[qIndex]
    return (
      <div>
        <p className="eyebrow">Module 13 — Quiz</p>
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
      <p className="eyebrow">Module 13 — Results</p>
      <h1 className="page-title">Quiz Complete</h1>
      <div className="card results-card">
        <div className="results-score">{finalScore}<span>/10</span></div>
        <span className={`badge ${tier.tone} results-tier`}>{tier.title}</span>
        <p className="results-detail">{tier.detail}</p>
        {categories.length > 0 && (
          <div style={{ marginBottom: '16px', textAlign: 'left', maxWidth: '420px', margin: '0 auto 16px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px' }}>Review these modules</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {categories.map(c => <span key={c} className="badge red" style={{ fontSize: '10px' }}>{c}</span>)}
            </div>
          </div>
        )}
        <div className="results-actions">
          <button className="reveal-btn secondary" onClick={startQuiz}>Retake quiz</button>
        </div>
      </div>
      <StockSurprise score={finalScore} lifetimeShares={portfolio.totalCredits} />
      <PrevNext current="quiz" onChange={onNav} />
    </div>
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
          {SECTIONS.map((s) => (
            <button key={s.id} className={`os-nav-item ${section === s.id ? 'active' : ''}`} onClick={() => setSection(s.id)}>
              <span className="num">{s.num}</span>
              {s.label}
            </button>
          ))}
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
        {section === 'quiz'        && <QuizSection onNav={setSection} />}
        {section === 'glossary'    && <GlossarySection onNav={setSection} />}
        {section === 'policy'      && <PolicySection onNav={setSection} />}
      </main>
    </div>
  )
}
