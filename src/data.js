// ---------------------------------------------------------------------------
// HMO Sneak-In Detection — training content
// All copy lives here so App.jsx stays focused on layout and state.
// ---------------------------------------------------------------------------

export const coreRule =
  '"Active" does not mean eligible for KYT PPO processing.'

export const angelaCase = {
  name: 'Angela Cho',
  dob: '10/04/1991',
  age: 34,
  bookedVia: 'Zocdoc',
  daysAgo: 4,
  note: '32 weeks pregnant',
  zocdocSelection: 'PPO',
  carrier: 'Aetna',
  planName: 'Dental PPO/PDN Commercial PPO',
  memberId: 'Not specified',
  zocdocNetwork: 'In-network (per Zocdoc)',
  osCoverage: 'Active Coverage',
  osPlanIndicator: 'DHMO/HMO',
  intake: 'Not completed before visit',
}

// Fields staff must confirm before marking a patient "Confirmed"
export const requiredFields = [
  'Patient name',
  'Date of birth',
  'Carrier',
  'Plan type',
  'PPO vs HMO/DHMO',
  'Assigned dentist requirement',
  'Member ID status',
  'Effective date',
  'Network status',
  'Zocdoc insurance selection',
  'New patient intake completed or not',
  'Eligibility source and timestamp',
]

// Internal risk-signal vocabulary (never patient-facing)
export const riskSignals = [
  {
    label: 'Insurance mismatch',
    detail: 'Zocdoc selection (e.g. PPO) does not match the plan type returned by OS eligibility.',
  },
  {
    label: 'Verification failure',
    detail: 'Required fields — member ID, plan type, network status — are missing or unconfirmed.',
  },
  {
    label: 'Missing member ID',
    detail: 'Zocdoc shows "member ID not specified." Treat as Unverified, not Active.',
  },
  {
    label: 'Unsubmitted intake',
    detail: 'New patient intake form was not completed before the visit.',
  },
  {
    label: 'Same-day or near-date booking gap',
    detail: 'Zocdoc bookings are not auto-imported into the OS — a gap window exists for unverified coverage to slip through.',
  },
]

export const internalNote =
  'Internally, this pattern is sometimes referred to as "intentional PPO misclassification" — a patient selecting PPO on Zocdoc when their actual plan is HMO/DHMO. This term is for internal training only and is never used in front of or about a patient. Patient-facing and chart language stays factual: "risk signal," "insurance mismatch," "verification failure."'

// OS status labels (recommended patient status taxonomy)
export const statusLabels = [
  { label: 'Unverified', tone: 'neutral' },
  { label: 'PPO Pending Verification', tone: 'teal' },
  { label: 'Active PPO Confirmed', tone: 'gold' },
  { label: 'Active HMO/DHMO Not Eligible', tone: 'red' },
  { label: 'Missing Member ID', tone: 'red' },
  { label: 'Zocdoc Insurance Mismatch', tone: 'red' },
  { label: 'Intake Not Submitted', tone: 'red' },
  { label: 'Needs Front Desk Review', tone: 'teal' },
]

// 11-step Zocdoc booking workflow
export const zocdocSteps = [
  'A same-day booking appears on Zocdoc.',
  'Staff manually creates or updates the patient inside the OS.',
  'Copy over patient name, DOB, phone, email, referral source = Zocdoc, appointment reason, carrier, and member ID if available.',
  'If Zocdoc says member ID not specified, mark the record "Unverified."',
  'Run eligibility inside the OS.',
  'Do not mark "Confirmed" unless plan type is confirmed as PPO and accepted by the office.',
  'If the OS says Active but shows DHMO/HMO, mark "Insurance mismatch."',
  'Contact the patient before the appointment when possible.',
  'If unreachable, allow the patient to come in — but do not promise insurance coverage.',
  'At arrival, have the patient complete intake in-room before clinical services.',
  'Explain any eligibility issue clearly before treatment begins.',
]

export const chairsideScript = {
  mismatch:
    'Your plan is active, but it appears to be an HMO/DHMO plan. That type of dental plan usually requires you to see the assigned office listed by the insurance carrier. We are happy to see you today, but it would not process here the same way a PPO plan does.',
  options:
    'Today you have a few options. You can contact your insurance to find or change your assigned HMO office. If you still want to be seen here today, we can do the emergency exam option, or if you do not want to use insurance here, you can consider the KYT Membership plan.',
}

export const complianceWording = [
  'Present self-pay emergency exam or membership options before services are rendered.',
  'Do not combine membership with active dental insurance.',
  'Do not misrepresent membership as insurance.',
  'Document the conversation.',
]

export const membershipPlans = [
  {
    name: 'Essential Plan',
    price: '$499/year',
    includes: [
      '2 cleanings',
      '2 periodic exams',
      'Routine X-rays as clinically needed',
      '1 emergency exam',
      'Screenings',
      '10% off treatment',
    ],
  },
  {
    name: 'Advanced Plan',
    price: '$749/year',
    includes: [
      '3 periodontal maintenance visits',
      '2 exams',
      'Routine X-rays as clinically needed',
      '1 emergency exam',
      'Full periodontal charting',
      '15% off treatment',
    ],
  },
]

export const membershipFacts = [
  'KYT Membership is for patients without active PPO/HMO dental benefits.',
  'It is not insurance.',
  'It cannot be combined with active PPO or HMO benefits.',
  'Membership starts the same day after enrollment and is valid 12 months.',
]

export const mistakeRecoveryPolicy = [
  'If staff misses the HMO issue and the patient is already seen, provide the standard exam/cleaning experience professionally.',
  'Document the eligibility mismatch in the chart.',
  'Do not blame the patient chairside.',
  'Ask for a review only if the visit went well and the patient was satisfied.',
]

// ---------------------------------------------------------------------------
// Quiz — 10 questions
// ---------------------------------------------------------------------------
export const quizQuestions = [
  {
    id: 1,
    prompt: 'OS eligibility comes back showing "Active Coverage." What is the next step?',
    options: [
      { key: 'a', text: 'Confirm the patient immediately — Active means eligible' },
      { key: 'b', text: 'Check plan type, PPO vs HMO/DHMO, before confirming' },
      { key: 'c', text: 'Cancel the Zocdoc booking and ask the patient to call the carrier' },
      { key: 'd', text: 'Mark the chart "Confirmed PPO" and move to scheduling' },
    ],
    correct: 'b',
    explanation:
      '"Active" only confirms the plan is in force — not which plan type it is. Plan type has to be checked separately before anything is marked Confirmed.',
  },
  {
    id: 2,
    prompt: 'Zocdoc lists the plan as PPO, but the member ID field shows "not specified." What status should the record get?',
    options: [
      { key: 'a', text: 'Active PPO Confirmed' },
      { key: 'b', text: 'Unverified / PPO Pending Verification' },
      { key: 'c', text: 'No status is needed — proceed as scheduled' },
      { key: 'd', text: 'Zocdoc Insurance Mismatch' },
    ],
    correct: 'b',
    explanation:
      'A missing member ID is a verification gap, not a mismatch yet. "Unverified" or "PPO Pending Verification" keeps the chart accurate until the ID is confirmed.',
  },
  {
    id: 3,
    prompt: 'A patient arrives and has not completed the new patient intake form. What should staff do?',
    options: [
      { key: 'a', text: 'Skip intake and start treatment to stay on schedule' },
      { key: 'b', text: 'Have the patient complete intake and verify insurance before treatment' },
      { key: 'c', text: 'Reschedule the appointment automatically' },
      { key: 'd', text: 'Assume intake is on file since the patient booked online' },
    ],
    correct: 'b',
    explanation:
      'Online booking does not equal intake. Intake and insurance verification both happen before any clinical service starts.',
  },
  {
    id: 4,
    prompt: 'What does an HMO/DHMO plan type usually mean for a patient?',
    options: [
      { key: 'a', text: 'They can be seen at any PPO network office' },
      { key: 'b', text: 'The plan never requires a specific dentist' },
      { key: 'c', text: 'They may need to be seen at an assigned dental office designated by the carrier' },
      { key: 'd', text: 'The plan automatically converts to PPO at check-in' },
    ],
    correct: 'c',
    explanation:
      'HMO/DHMO plans typically route patients to a carrier-assigned office. A non-assigned office usually cannot process the plan the way a PPO is processed.',
  },
  {
    id: 5,
    prompt: "Can the KYT Membership plan be combined with a patient's active PPO or HMO dental benefits?",
    options: [
      { key: 'a', text: 'Yes, always' },
      { key: 'b', text: 'No' },
      { key: 'c', text: 'Only for cleanings' },
      { key: 'd', text: 'Only if the patient requests it' },
    ],
    correct: 'b',
    explanation:
      'Membership is offered only to patients without active PPO/HMO dental benefits. It is not insurance and is never combined with active coverage.',
  },
  {
    id: 6,
    prompt: 'Which of these is the safest way to explain a plan mismatch to a patient chairside?',
    options: [
      { key: 'a', text: '"Your insurance won\'t cover anything here."' },
      { key: 'b', text: '"Your plan appears active, but it may not be eligible here as PPO coverage."' },
      { key: 'c', text: '"You picked the wrong insurance on Zocdoc."' },
      { key: 'd', text: '"We can\'t see you today."' },
    ],
    correct: 'b',
    explanation:
      'Factual, non-blaming language keeps the conversation professional and accurate without making assumptions about how the mix-up happened.',
  },
  {
    id: 7,
    prompt: 'Zocdoc shows the office as "in-network." Is that enough to confirm coverage?',
    options: [
      { key: 'a', text: 'Yes, in-network always means confirmed' },
      { key: 'b', text: 'No, staff must still verify in the OS/payer and confirm plan type' },
      { key: 'c', text: 'Yes, but only for new patients' },
      { key: 'd', text: 'No, in-network status shown on Zocdoc is never accurate' },
    ],
    correct: 'b',
    explanation:
      'In-network status is a starting point, not a confirmation. OS/payer verification and plan-type confirmation are still required.',
  },
  {
    id: 8,
    prompt: 'Zocdoc bookings are not automatically imported into the OS. What should staff do?',
    options: [
      { key: 'a', text: 'Wait for the booking to sync overnight' },
      { key: 'b', text: 'Manually enter the booking details into the OS' },
      { key: 'c', text: 'Ask the patient to create their own OS profile' },
      { key: 'd', text: 'Treat the Zocdoc booking as already verified' },
    ],
    correct: 'b',
    explanation:
      'There is no auto-sync. Manual entry into the OS is what starts the eligibility-verification process at all.',
  },
  {
    id: 9,
    prompt: 'A patient cannot be reached before their appointment to verify insurance. What should staff do?',
    options: [
      { key: 'a', text: 'Cancel the appointment automatically' },
      { key: 'b', text: 'Let them come in, but do not promise coverage, and verify at arrival before services' },
      { key: 'c', text: 'Confirm the appointment as PPO by default' },
      { key: 'd', text: 'Turn the patient away at the door' },
    ],
    correct: 'b',
    explanation:
      'Being unreachable beforehand does not cancel the visit — it just means verification happens at arrival, before any service is rendered.',
  },
  {
    id: 10,
    prompt: 'Staff missed an HMO/DHMO mismatch and the patient was already seen. What is the correct next step?',
    options: [
      { key: 'a', text: 'Tell the patient they made a mistake on Zocdoc' },
      { key: 'b', text: 'Provide professional standard care, document the eligibility mismatch, and improve the workflow' },
      { key: 'c', text: "Bill the patient immediately for the full amount" },
      { key: 'd', text: 'Avoid documenting the issue to prevent conflict' },
    ],
    correct: 'b',
    explanation:
      'Mistakes get documented and used to improve the process — never blamed on the patient chairside, and never hidden from the chart.',
  },
]

export function scoreTier(score) {
  if (score <= 5) {
    return {
      title: 'Needs Retraining',
      tone: 'red',
      detail: 'Review the red flag checklist and both workflows, then retake the quiz.',
    }
  }
  if (score <= 8) {
    return {
      title: 'Good — Review the Red Flags',
      tone: 'teal',
      detail: 'Solid foundation. Revisit the red flag checklist before your next shift.',
    }
  }
  return {
    title: 'Eligibility Guardian',
    tone: 'gold',
    detail: 'Strong command of the verification workflow. Keep it up.',
  }
}
