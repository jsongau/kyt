// ---------------------------------------------------------------------------
// KYT New Patient Intake & Eligibility Academy — Training Content
// All copy, rules, scripts, and workflow data live here.
// src/App.jsx imports from this file and stays focused on layout and state.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// MODULE 1 — THE NEW PATIENT PIPELINE
// ---------------------------------------------------------------------------
export const workflowStages = [
  {
    num: '01',
    name: 'Booking Received',
    owner: 'Scheduling / Front Desk',
    action: 'Review the Zocdoc booking notification. Note the appointment type, provider, date, time, patient name, and insurance information supplied.',
    criteria: 'Booking details are visible in Zocdoc and understood by the receiving staff member.',
    failure: 'Booking is missed, ignored, or assumed to be auto-imported into the OS.',
    escalation: 'Any booking with no insurance information, no member ID, or a plan name that does not match a known carrier must be flagged immediately.',
  },
  {
    num: '02',
    name: 'Patient Added to OS',
    owner: 'Scheduling / Front Desk',
    action: 'Search the OS for an existing record before creating a new one. If no record exists, create a new patient record. Record referral source as Zocdoc. Enter carrier and plan exactly as shown.',
    criteria: 'A single, accurate patient record exists in the OS with Zocdoc noted as the referral source.',
    failure: 'Duplicate record created. Carrier or plan entered incorrectly. Referral source left blank.',
    escalation: 'A possible duplicate must be escalated to the office manager before proceeding.',
  },
  {
    num: '03',
    name: 'Intake Form Sent',
    owner: 'Scheduling / Front Desk',
    action: 'Send the KYT new-patient intake form to the patient immediately after the OS record is created. Set a follow-up task with an owner and due time.',
    criteria: 'Intake form sent and a follow-up reminder is scheduled.',
    failure: 'Form not sent. Form sent but not followed up. Patient arrives without completing intake.',
    escalation: 'If no intake response is received 24 hours before the appointment, escalate to the insurance verifier and front desk lead.',
  },
  {
    num: '04',
    name: 'Insurance Information Reviewed',
    owner: 'Insurance Verifier',
    action: 'Review all insurance information in the OS: carrier, plan name, member ID, group number, subscriber name, subscriber DOB, relationship to subscriber. Note any missing fields.',
    criteria: 'All available insurance fields are reviewed and gaps are documented.',
    failure: 'Verification started without confirming the subscriber. Member ID missing and not flagged.',
    escalation: 'Missing member ID or subscriber mismatch must be escalated before eligibility is run.',
  },
  {
    num: '05',
    name: 'Eligibility Researched',
    owner: 'Insurance Verifier',
    action: 'Run eligibility through the OS. If the OS returns only an Active response without plan-type detail, use DentalXChange or the carrier portal to confirm plan type and network participation.',
    criteria: 'Verification reaches at least Level 2 (plan type confirmed). Level 3 or 4 is the goal for all new patients.',
    failure: 'Staff accepts an Active response as full verification. Plan type is not confirmed. HMO indicator is missed.',
    escalation: 'Any result that cannot be confirmed beyond Active must be escalated and documented before the appointment.',
  },
  {
    num: '06',
    name: 'Patient Contacted When Necessary',
    owner: 'Insurance Verifier',
    action: 'When eligibility cannot be confirmed, a mismatch is found, or information is missing, contact the patient by phone. Leave a voicemail and send an approved text when unanswered. Document every attempt.',
    criteria: 'Patient has been informed of any eligibility issue and options have been explained.',
    failure: 'Patient is not contacted. Staff assumes the patient knows. Documentation is skipped.',
    escalation: 'If the patient cannot be reached and the appointment is within 24 hours, escalate to the office manager.',
  },
  {
    num: '07',
    name: 'Appointment Readiness Confirmed',
    owner: 'Insurance Verifier + Front Desk',
    action: 'Confirm that intake is complete, insurance is verified to the appropriate level, and the financial pathway is identified. Brief the clinical team on any unresolved items.',
    criteria: 'The patient record is marked with the correct verification status and the front desk knows the financial pathway before the patient arrives.',
    failure: 'Patient arrives with an unresolved insurance status that front desk is not aware of.',
    escalation: 'Any unresolved status must be communicated to front desk and the treating provider before the appointment begins.',
  },
  {
    num: '08',
    name: 'Patient Arrives',
    owner: 'Front Desk',
    action: 'Greet the patient. Confirm identity. Collect any missing intake items. Review the insurance status and confirm the financial pathway with the patient before seating.',
    criteria: 'Patient is welcomed, identity confirmed, intake complete, and financial pathway understood by the patient before care begins.',
    failure: 'Patient is seated before intake is complete. Financial pathway is explained after treatment.',
    escalation: 'Any new insurance information at arrival must be reviewed before services begin.',
  },
  {
    num: '09',
    name: 'Financial Pathway Explained',
    owner: 'Treatment Coordinator',
    action: 'Present the correct financial pathway based on the verification outcome. Provide a written estimate. Obtain patient acknowledgment before treatment begins.',
    criteria: 'Patient has a written estimate, understands their financial responsibility, and has acknowledged the pathway.',
    failure: 'Treatment begins without a written estimate or patient acknowledgment.',
    escalation: 'Any patient who declines to acknowledge the financial pathway must be escalated to the office manager before services begin.',
  },
  {
    num: '10',
    name: 'Visit Completed',
    owner: 'Clinical Team',
    action: 'Complete the clinical visit. Route any findings, treatment recommendations, or unresolved clinical items to the treatment coordinator and office notes.',
    criteria: 'Clinical notes are complete and any follow-up needs are documented.',
    failure: 'Clinical findings are not communicated to the front office for disposition purposes.',
    escalation: 'Any urgent or time-sensitive findings must be communicated to the patient and documented before checkout.',
  },
  {
    num: '11',
    name: 'Checkout and Disposition Documented',
    owner: 'Front Desk + Treatment Coordinator',
    action: 'Collect any remaining balance. Document the patient disposition (see Module 9). Schedule the next appointment when appropriate. Send a review request only after confirming the visit went well.',
    criteria: 'Balance collected or payment plan documented. Patient status is defined. No patient leaves in an undefined status.',
    failure: 'Patient leaves without a defined disposition or a scheduled next step.',
    escalation: 'Any unresolved balance, disputed charge, or patient concern must be escalated to the office manager before the patient leaves.',
  },
]

// ---------------------------------------------------------------------------
// MODULE 2 — ZOCDOC BOOKING INTAKE
// ---------------------------------------------------------------------------
export const zocdocChecklistItems = [
  { id: 1, text: 'Open the Zocdoc appointment and review all supplied fields.' },
  { id: 2, text: 'Search the OS for an existing patient record before creating a new one.' },
  { id: 3, text: 'Create a new-patient record only after confirming no duplicate exists.' },
  { id: 4, text: 'Record the referral source as Zocdoc.' },
  { id: 5, text: 'Enter the booked provider, appointment reason, date, and time.' },
  { id: 6, text: 'Enter the patient\'s phone number and email address.' },
  { id: 7, text: 'Enter the carrier and selected plan exactly as displayed in Zocdoc — do not guess or correct.' },
  { id: 8, text: 'Enter subscriber information when available.' },
  { id: 9, text: 'Enter the member ID and group number when available.' },
  { id: 10, text: 'Record whether insurance-card images were supplied.' },
  { id: 11, text: 'Send the KYT new-patient intake form.' },
  { id: 12, text: 'Assign an initial verification status (Unverified — Missing Information or Verification In Progress).' },
  { id: 13, text: 'Add a follow-up task with an assigned owner and a due time.' },
]

export const infoSourceDistinction = [
  {
    source: 'Zocdoc Displayed',
    color: 'teal',
    description: 'Information shown in the Zocdoc booking interface. This reflects what the patient selected or entered during booking — it is not independently verified.',
    examples: ['Carrier name selected from Zocdoc\'s list', 'Plan type chosen during booking', 'Appointment reason typed by patient'],
  },
  {
    source: 'Patient Stated',
    color: 'teal',
    description: 'Information the patient has told staff verbally or in writing. It reflects the patient\'s understanding, which may be incomplete or outdated.',
    examples: ['Carrier name given by phone', 'Member ID read from card', 'Employer group name'],
  },
  {
    source: 'Insurance Card',
    color: 'gold',
    description: 'Information visible on the physical or digital insurance card. Cards may be outdated, reflect a previous plan year, or show group rather than individual details.',
    examples: ['Carrier logo and name', 'Member ID on card', 'Group number', 'Customer service phone'],
  },
  {
    source: 'OS / Carrier Confirmed',
    color: 'gold',
    description: 'Information returned by the OS eligibility system, DentalXChange, a carrier portal, or a carrier representative. This is the only source that can support a confirmed verification status.',
    examples: ['Active response with plan type', 'In-network status', 'Deductible and maximum', 'Effective date'],
  },
]

// ---------------------------------------------------------------------------
// MODULE 3 — THE COMPLETE NEW-PATIENT INTAKE FORM
// ---------------------------------------------------------------------------
export const intakeSections = [
  {
    id: 'identity',
    label: 'A — Identity and Contact',
    fields: [
      { name: 'Legal name', required: true },
      { name: 'Preferred name', required: false },
      { name: 'Date of birth', required: true },
      { name: 'Phone number', required: true },
      { name: 'Email address', required: true },
      { name: 'Mailing address', required: true },
      { name: 'Preferred language', required: false },
      { name: 'Preferred communication method', required: false },
      { name: 'Responsible party', required: true },
      { name: 'Parent or guardian (when applicable)', required: false },
    ],
    weight: 20,
  },
  {
    id: 'purpose',
    label: 'B — Appointment Purpose',
    fields: [
      { name: 'Routine new-patient examination', required: false },
      { name: 'Cleaning request', required: false },
      { name: 'Emergency or pain visit', required: false },
      { name: 'Broken tooth', required: false },
      { name: 'Consultation', required: false },
      { name: 'Second opinion', required: false },
      { name: 'Cosmetic concern', required: false },
      { name: 'Other stated reason', required: false },
    ],
    note: 'Front-office staff should not diagnose from appointment notes. Record the patient\'s stated reason only.',
    weight: 10,
  },
  {
    id: 'insurance',
    label: 'C — Insurance and Subscriber Information',
    fields: [
      { name: 'Carrier name', required: true },
      { name: 'Plan name', required: true },
      { name: 'Member ID', required: true },
      { name: 'Group number', required: true },
      { name: 'Subscriber name', required: true },
      { name: 'Subscriber date of birth', required: true },
      { name: 'Relationship to subscriber', required: true },
      { name: 'Employer or group', required: false },
      { name: 'Insurance phone number', required: false },
      { name: 'Insurance card — front image', required: true },
      { name: 'Insurance card — back image', required: true },
      { name: 'Primary vs. secondary coverage', required: true },
      { name: 'Secondary carrier name (if applicable)', required: false },
      { name: 'Coordination of benefits questions', required: false },
      { name: 'Effective date (when available)', required: false },
    ],
    weight: 35,
  },
  {
    id: 'medical',
    label: 'D — Medical History Readiness',
    note: 'Front-office staff confirm that medical history sections are completed. Staff must not interpret or act on clinical information.',
    fields: [
      { name: 'Medication list completed', required: true },
      { name: 'Allergy section completed', required: true },
      { name: 'Medical conditions section answered', required: true },
      { name: 'Physician information (when requested)', required: false },
      { name: 'Emergency contact completed', required: true },
      { name: 'Relevant clinical alerts routed to clinical team', required: false },
    ],
    weight: 15,
  },
  {
    id: 'dental',
    label: 'E — Dental History',
    fields: [
      { name: 'Previous dentist name and location', required: false },
      { name: 'Date of last dental visit', required: false },
      { name: 'Date of last cleaning', required: false },
      { name: 'Existing X-rays available', required: false },
      { name: 'Current dental concern', required: false },
      { name: 'History of periodontal treatment', required: false },
      { name: 'Dental anxiety or accommodation needs', required: false },
      { name: 'Records-request status', required: false },
    ],
    weight: 10,
  },
  {
    id: 'consents',
    label: 'F — Consents and Policies',
    fields: [
      { name: 'Privacy acknowledgment', required: true },
      { name: 'Financial policy', required: true },
      { name: 'Communication consent', required: true },
      { name: 'Treatment consent (when applicable)', required: false },
      { name: 'Records authorization', required: false },
      { name: 'Cancellation policy acknowledgment', required: true },
      { name: 'Signature and date', required: true },
    ],
    weight: 10,
  },
]

export const intakeReadinessLevels = [
  { min: 100, max: 100, label: 'Ready', tone: 'gold', detail: 'All required fields are complete. The appointment may proceed.' },
  { min: 75, max: 99, label: 'Minor Information Missing', tone: 'teal', detail: 'One or more optional fields are incomplete. Verify at arrival if needed.' },
  { min: 40, max: 74, label: 'Verification at Risk', tone: 'red', detail: 'Required fields are missing. Contact the patient before the appointment.' },
  { min: 0, max: 39, label: 'Major Intake Intervention Required', tone: 'red', detail: 'Critical required fields are missing. Do not confirm the appointment without intervention.' },
]

// ---------------------------------------------------------------------------
// MODULE 4 — ELIGIBILITY VALIDATION
// ---------------------------------------------------------------------------
export const verificationLevels = [
  {
    level: 0,
    name: 'No Usable Insurance Information',
    status: 'Unverified — Missing Information',
    tone: 'red',
    description: 'The record does not contain sufficient information to run eligibility. Verification cannot begin.',
    examples: ['No member ID', 'No insurance card', 'Subscriber unknown', 'Incorrect date of birth', 'Carrier not identified'],
    nextAction: 'Contact the patient. Request the front and back of the insurance card and subscriber information.',
  },
  {
    level: 1,
    name: 'Electronic Patient Match Found',
    status: 'Active Response — Plan Type Unconfirmed',
    tone: 'red',
    description: 'The OS has returned an Active response, but plan type and KYT network participation have not been established. Active is not verified.',
    examples: ['OS shows Active with no plan-type detail', 'Electronic match on name and DOB only', 'No network status returned'],
    nextAction: 'Run a secondary check through DentalXChange or the carrier portal. Do not mark the patient confirmed.',
  },
  {
    level: 2,
    name: 'Plan Type Confirmed',
    status: 'Plan Type Confirmed — Network Pending',
    tone: 'teal',
    description: 'The plan type has been confirmed. KYT network participation has not yet been established.',
    planTypes: ['PPO', 'HMO / DHMO', 'Discount plan', 'Medicaid / Medi-Cal', 'Indemnity', 'Other plan structure'],
    nextAction: 'Confirm whether KYT is in-network, out-of-network, or whether the patient is assigned elsewhere.',
  },
  {
    level: 3,
    name: 'Network Relationship Confirmed',
    status: 'Network Status Confirmed',
    tone: 'teal',
    description: 'Plan type and network relationship are confirmed. Benefit details have not yet been reviewed.',
    networkOutcomes: [
      'KYT is in-network — proceed with PPO workflow',
      'KYT is out-of-network — present out-of-network estimate',
      'Patient is assigned to another office — present HMO pathway',
      'Assignment is unclear — contact carrier',
      'A referral or authorization may be required',
    ],
    nextAction: 'Review benefit details when treatment planning or patient cost estimates are needed.',
  },
  {
    level: 4,
    name: 'Benefit Details Reviewed',
    status: 'PPO Verified — KYT Participation Confirmed',
    tone: 'gold',
    description: 'Full verification. Plan type, network participation, and benefit details have been reviewed.',
    benefitFields: [
      'Effective date',
      'Deductible',
      'Deductible amount met',
      'Annual maximum',
      'Annual maximum used',
      'Preventive frequency',
      'Exam frequency',
      'X-ray frequency',
      'Waiting periods',
      'Missing-tooth clauses',
      'Downgrades',
      'Major-service percentage',
      'Orthodontic information',
      'Limitations and exclusions',
    ],
    nextAction: 'Document all fields. Present estimates to the patient with the guarantee disclaimer.',
  },
]

export const activeIsNotVerified = {
  headline: 'ACTIVE IS NOT VERIFIED',
  body: 'An "Active" response only means that some coverage may currently be in force.',
  doesNotConfirm: [
    'That the plan is PPO',
    'That KYT participates with the plan',
    'That the patient may receive in-network benefits at KYT',
    'That KYT is the assigned office',
    'That the submitted member information is accurate',
    'That the specific patient is eligible',
    'That the planned procedures are covered',
    'That deductibles, waiting periods, frequencies, annual maximums, or exclusions have been confirmed',
    'That the benefits quoted by the office are guaranteed',
  ],
  guarantee: 'Eligibility and benefits are estimates based on information supplied by the carrier. They are not a guarantee of payment.',
}

export const secondaryVerificationTriggers = [
  'The OS only shows Active without plan-type detail',
  'Plan type is missing from the electronic response',
  'The plan name is similar to multiple carrier products (e.g., "Dental PPO/PDN")',
  'The patient selected PPO on Zocdoc but the returned plan appears HMO',
  'The member ID produces multiple records or no match',
  'The subscriber information conflicts with what the patient supplied',
  'Network status is unclear or absent',
  'Assignment to another office is possible',
  'The electronic response appears incomplete or truncated',
]

// ---------------------------------------------------------------------------
// MODULE 5 — STATUS SYSTEM AND FLAGS
// ---------------------------------------------------------------------------
export const statusDefinitions = {
  booking: [
    { label: 'Zocdoc Booking Received', tone: 'teal', meaning: 'A Zocdoc appointment has been received and is pending OS entry.', nextAction: 'Create OS record immediately.', owner: 'Front Desk', deadline: 'Within 2 hours of booking', doc: 'Note booking receipt time.', escalation: 'None if record is created on time.' },
    { label: 'OS Record Created', tone: 'teal', meaning: 'The patient record has been created in the OS from the Zocdoc booking.', nextAction: 'Send intake form and assign verification task.', owner: 'Front Desk', deadline: 'Same day as booking', doc: 'Note referral source as Zocdoc.', escalation: 'None if intake is sent promptly.' },
    { label: 'Possible Duplicate Record', tone: 'red', meaning: 'A record with similar name or DOB already exists in the OS.', nextAction: 'Do not create a second record. Escalate to office manager.', owner: 'Office Manager', deadline: 'Before any further action', doc: 'Note the duplicate flag and both record IDs.', escalation: 'Office manager must resolve before proceeding.' },
    { label: 'Intake Sent', tone: 'teal', meaning: 'The new-patient intake form has been sent to the patient.', nextAction: 'Set a follow-up reminder for 24 hours before appointment.', owner: 'Front Desk', deadline: '24 hours before appointment', doc: 'Record send date and method.', escalation: 'Escalate if no response 24 hours before appointment.' },
  ],
  intake: [
    { label: 'Intake Not Started', tone: 'red', meaning: 'The patient has not begun the intake form.', nextAction: 'Send a reminder. Call if appointment is within 48 hours.', owner: 'Front Desk', deadline: '48 hours before appointment', doc: 'Record reminder attempts.', escalation: 'Escalate to insurance verifier if appointment is within 24 hours.' },
    { label: 'Intake In Progress', tone: 'teal', meaning: 'The patient has begun but not completed the intake form.', nextAction: 'Monitor for completion. Contact patient if stalled.', owner: 'Front Desk', deadline: '24 hours before appointment', doc: 'Note last activity date.', escalation: 'Escalate if incomplete 24 hours before appointment.' },
    { label: 'Intake Incomplete', tone: 'red', meaning: 'The intake form is submitted but required fields are missing.', nextAction: 'Contact the patient to complete missing fields before the visit.', owner: 'Front Desk', deadline: 'Before appointment', doc: 'List specific missing fields.', escalation: 'Escalate if insurance fields are missing.' },
    { label: 'Intake Complete', tone: 'gold', meaning: 'All required intake fields have been submitted.', nextAction: 'Route to insurance verifier for eligibility review.', owner: 'Insurance Verifier', deadline: 'Immediately upon completion', doc: 'Mark complete with date.', escalation: 'None.' },
    { label: 'Clinical Alert Requires Review', tone: 'red', meaning: 'The medical history section contains information that requires clinical team review.', nextAction: 'Route to clinical team before the appointment. Do not interpret or act on clinical information as front office.', owner: 'Clinical Team', deadline: 'Before appointment', doc: 'Route to provider; do not document clinical detail in the front-office notes.', escalation: 'Escalate to treating provider immediately.' },
  ],
  insurance: [
    { label: 'Unverified — Missing Information', tone: 'red', meaning: 'Insufficient information to run eligibility.', nextAction: 'Contact patient. Request member ID and insurance card images.', owner: 'Insurance Verifier', deadline: '48 hours before appointment', doc: 'Record what is missing and when the patient was contacted.', escalation: 'Escalate if appointment is within 24 hours and patient is unreachable.' },
    { label: 'Verification In Progress', tone: 'teal', meaning: 'Eligibility is being reviewed. A result is not yet documented.', nextAction: 'Complete verification and document the outcome.', owner: 'Insurance Verifier', deadline: '24 hours before appointment', doc: 'Update status when complete.', escalation: 'None if on track.' },
    { label: 'Active Response — Plan Type Unconfirmed', tone: 'red', meaning: 'OS returned Active, but plan type has not been confirmed. ACTIVE IS NOT VERIFIED.', nextAction: 'Run secondary verification through DentalXChange or the carrier portal.', owner: 'Insurance Verifier', deadline: 'Before appointment', doc: 'Document the Active response source and the secondary check attempt.', escalation: 'Escalate to office manager if plan type cannot be confirmed.' },
    { label: 'PPO Verified — KYT Participation Confirmed', tone: 'gold', meaning: 'Plan type is PPO and KYT is confirmed in-network.', nextAction: 'Proceed with PPO billing workflow. Review benefit details for treatment planning.', owner: 'Insurance Verifier', deadline: 'Complete before appointment', doc: 'Document verification source, date, and benefit details.', escalation: 'None.' },
    { label: 'PPO Verified — Out-of-Network', tone: 'teal', meaning: 'Plan type is PPO but KYT is not in-network with this carrier.', nextAction: 'Prepare an out-of-network written estimate. Obtain patient acknowledgment.', owner: 'Treatment Coordinator', deadline: 'Before services begin', doc: 'Document OON status, estimate presented, and patient acknowledgment.', escalation: 'Escalate if patient disputes responsibility before care.' },
    { label: 'HMO/DHMO — Assigned Office Required', tone: 'red', meaning: 'The plan is HMO or DHMO. KYT cannot bill this plan as a PPO provider.', nextAction: 'Explain assigned-office requirements. Ask about other coverage. Present self-pay or membership options.', owner: 'Treatment Coordinator', deadline: 'Before services begin', doc: 'Document explanation given, options presented, and patient decision.', escalation: 'Escalate if patient disputes or is confused about financial responsibility.' },
    { label: 'Insurance Selection Mismatch', tone: 'red', meaning: 'The plan selected on Zocdoc does not match what the carrier returned.', nextAction: 'Contact the patient. Ask whether another active plan exists.', owner: 'Insurance Verifier', deadline: 'Before appointment', doc: 'Document the mismatch, patient contact, and outcome.', escalation: 'Escalate if unresolved within 24 hours of appointment.' },
    { label: 'Coverage Inactive', tone: 'red', meaning: 'Eligibility check returned that the plan is no longer active.', nextAction: 'Contact the patient. Ask about other coverage. Present self-pay or membership.', owner: 'Insurance Verifier', deadline: 'Before appointment', doc: 'Document inactive result, date checked, and patient notification.', escalation: 'Escalate if appointment is imminent and patient is unreachable.' },
    { label: 'Subscriber Data Mismatch', tone: 'red', meaning: 'The subscriber name, DOB, or ID does not match what the carrier has on file.', nextAction: 'Contact the patient for corrected subscriber information.', owner: 'Insurance Verifier', deadline: 'Before appointment', doc: 'Document the specific mismatch and correction attempt.', escalation: 'Escalate if subscriber data cannot be corrected before the appointment.' },
    { label: 'Secondary Insurance Pending', tone: 'teal', meaning: 'The patient may have a second active plan. Coordination of benefits has not been established.', nextAction: 'Request secondary carrier information. Run COB review.', owner: 'Insurance Verifier', deadline: 'Before services begin', doc: 'Document secondary carrier information and COB result.', escalation: 'Escalate complex COB situations to the office manager.' },
    { label: 'Coordination of Benefits Pending', tone: 'teal', meaning: 'Dual coverage is confirmed but COB order has not been established.', nextAction: 'Contact both carriers to establish COB order. Document the result.', owner: 'Insurance Verifier', deadline: 'Before services begin', doc: 'Document both carriers, COB order, and combined estimate.', escalation: 'Escalate to office manager if carriers give conflicting COB guidance.' },
    { label: 'Carrier Contact Required', tone: 'red', meaning: 'Electronic verification was insufficient and a live carrier call is needed.', nextAction: 'Call the carrier. Document the representative name, reference number, and date.', owner: 'Insurance Verifier', deadline: 'Before appointment', doc: 'Document rep name, call date, time, and all information provided.', escalation: 'Escalate if carrier is unreachable before appointment.' },
  ],
  communication: [
    { label: 'Patient Contacted', tone: 'gold', meaning: 'Staff reached the patient and communicated the eligibility finding or request.', nextAction: 'Document the outcome of the conversation.', owner: 'Insurance Verifier', deadline: 'Immediately after contact', doc: 'Record date, time, staff name, and summary of conversation.', escalation: 'None.' },
    { label: 'Voicemail Left', tone: 'teal', meaning: 'Staff called and left a voicemail message.', nextAction: 'Send an approved text. Schedule a callback attempt.', owner: 'Insurance Verifier', deadline: 'Within 2 hours', doc: 'Record call date, time, and voicemail message summary.', escalation: 'Escalate if no response within 24 hours of appointment.' },
    { label: 'Text Sent', tone: 'teal', meaning: 'An approved text message has been sent to the patient.', nextAction: 'Monitor for response. Attempt a call if no response within 4 hours.', owner: 'Insurance Verifier', deadline: 'Within 4 hours', doc: 'Record text date and content.', escalation: 'Escalate if appointment is within 24 hours and patient has not responded.' },
    { label: 'Unable to Reach', tone: 'red', meaning: 'Staff has made multiple attempts and cannot reach the patient.', nextAction: 'Mark "Verify at Arrival." Brief front desk. Do not begin services until the financial pathway is explained.', owner: 'Front Desk', deadline: 'Before appointment', doc: 'Record all contact attempts with dates and times.', escalation: 'Escalate to office manager if appointment is same-day.' },
    { label: 'Patient Requested Reschedule', tone: 'teal', meaning: 'The patient was informed of the eligibility issue and chose to reschedule.', nextAction: 'Update Zocdoc and the OS. Do not pressure the patient.', owner: 'Front Desk', deadline: 'Immediately', doc: 'Record the patient\'s decision and new appointment if applicable.', escalation: 'None.' },
    { label: 'Patient Chose Cancellation', tone: 'teal', meaning: 'The patient was informed and chose to cancel.', nextAction: 'Update Zocdoc and the OS. Document accurately.', owner: 'Front Desk', deadline: 'Immediately', doc: 'Record the cancellation with date and reason as stated by patient.', escalation: 'None.' },
    { label: 'Verify at Arrival', tone: 'teal', meaning: 'Patient could not be reached. Insurance status is unresolved. Verification and financial pathway must be addressed when the patient arrives.', nextAction: 'Brief front desk. Prepare the financial pathway conversation. Do not begin services until explained.', owner: 'Front Desk', deadline: 'Upon patient arrival', doc: 'Record arrival verification conversation outcome.', escalation: 'Escalate to office manager if patient disputes at arrival.' },
  ],
  arrival: [
    { label: 'Additional Insurance Requested', tone: 'teal', meaning: 'Staff asked the patient about other active coverage and is awaiting a response.', nextAction: 'Allow patient time to respond. Do not delay unnecessarily.', owner: 'Front Desk', deadline: 'At arrival', doc: 'Document whether additional insurance was confirmed or denied.', escalation: 'None.' },
    { label: 'Self-Pay Option Discussed', tone: 'teal', meaning: 'Staff presented self-pay pricing in writing.', nextAction: 'Obtain patient acknowledgment before services begin.', owner: 'Treatment Coordinator', deadline: 'Before services begin', doc: 'Document written estimate and acknowledgment.', escalation: 'None.' },
    { label: 'Membership Eligibility Pending', tone: 'teal', meaning: 'Patient may qualify for KYT Membership but eligibility has not been confirmed.', nextAction: 'Confirm the patient has no active dental coverage before presenting membership.', owner: 'Treatment Coordinator', deadline: 'Before services begin', doc: 'Document eligibility confirmation and enrollment if applicable.', escalation: 'Escalate to office manager if eligibility is unclear.' },
    { label: 'Membership Eligible — No Active Dental Coverage', tone: 'gold', meaning: 'Patient has no active dental insurance and qualifies for KYT Membership.', nextAction: 'Present both membership plans with written descriptions. Allow patient to choose.', owner: 'Treatment Coordinator', deadline: 'Before services begin', doc: 'Document membership plan presented, enrollment date, and plan selected.', escalation: 'None.' },
    { label: 'Manager Review Required', tone: 'red', meaning: 'An unusual situation requires office manager review before proceeding.', nextAction: 'Do not begin services. Notify the manager immediately.', owner: 'Office Manager', deadline: 'Before services begin', doc: 'Document the situation and manager response.', escalation: 'Escalate to dentist if manager is unavailable.' },
    { label: 'Office-Owned Service Recovery', tone: 'red', meaning: 'The office provided incorrect verification information. Service recovery is in progress.', nextAction: 'Apply the management-approved service-recovery policy. Do not bill falsely.', owner: 'Office Manager', deadline: 'Before patient leaves', doc: 'Document the error, recovery action, any adjustments, and manager approval.', escalation: 'Escalate to dentist if clinical care is affected.' },
    { label: 'Financial Pathway Accepted', tone: 'gold', meaning: 'The patient has reviewed and acknowledged the financial pathway in writing.', nextAction: 'Proceed with the visit under the documented pathway.', owner: 'Clinical Team', deadline: 'Immediate', doc: 'Retain signed acknowledgment.', escalation: 'None.' },
    { label: 'Patient Declined to Proceed', tone: 'teal', meaning: 'The patient reviewed the financial options and chose not to proceed with the visit today.', nextAction: 'Thank the patient respectfully. Offer records transfer if needed. Document outcome.', owner: 'Front Desk', deadline: 'Immediate', doc: 'Document patient decision and any next steps they requested.', escalation: 'None.' },
  ],
}

// ---------------------------------------------------------------------------
// MODULE 6 — THE ZOCDOC 24-HOUR RESPONSE WINDOW
// ---------------------------------------------------------------------------
export const zocdocTimeline = {
  feeNote: 'Some patient cancellations made within 24 hours of booking may qualify for a Zocdoc booking-fee waiver. A waiver is not guaranteed. Staff must record the cancellation accurately and must never pressure or mislead a patient.',
  managementNote: 'Zocdoc acquisition cost is an office expense. It must not be passed to the patient or used to justify misleading communication.',
  branchA: {
    label: 'Branch A — Within 24 Hours of Booking',
    tone: 'gold',
    description: 'When a clear HMO, DHMO, inactive-plan, nonparticipating-plan, or data mismatch is identified within 24 hours of the original booking:',
    steps: [
      'Attempt phone contact with the patient.',
      'Send an approved text or leave a voicemail when the call is unanswered.',
      'Explain the eligibility finding honestly and without blame.',
      'Ask whether the patient has another active PPO plan.',
      'Request corrected insurance information when appropriate.',
      'Explain the patient\'s available options clearly.',
      'Allow the patient to decide: supply corrected information, reschedule, contact the carrier, cancel, or continue as self-pay.',
      'Document the outcome of the contact or contact attempt.',
      'Update both Zocdoc and the OS accurately.',
    ],
    goal: 'Resolve the eligibility mismatch before the appointment and prevent an unexpected financial experience.',
  },
  branchB: {
    label: 'Branch B — More Than 24 Hours Since Booking',
    tone: 'teal',
    description: 'The elapsed time does not justify withholding known information. Staff should still:',
    steps: [
      'Attempt to reach the patient.',
      'Explain any known eligibility issue.',
      'Request missing data.',
      'Document all contact attempts.',
      'Offer the same informed options as Branch A.',
    ],
    unreachable: [
      'Keep the appointment when permitted by office policy.',
      'Mark the record "Unverified — Verify at Arrival."',
      'Prepare the front desk and clinical team.',
      'Do not promise coverage.',
      'Do not begin non-urgent services until the financial pathway is explained and acknowledged.',
    ],
  },
}

// ---------------------------------------------------------------------------
// MODULE 7 — PATIENT COMMUNICATION SCRIPTS
// ---------------------------------------------------------------------------
export const patientScripts = [
  {
    id: 1,
    situation: 'Missing member ID',
    internal: 'Use when the patient has not supplied a member ID or insurance card and intake is incomplete.',
    script: 'Hi, this is [staff name] from KYT Dental Services regarding your upcoming appointment. We received your booking, but we are missing information needed to verify your dental plan. Please complete the new-patient form and send the front and back of your insurance card. Until that information is reviewed, your insurance status remains unverified.',
    doc: 'Record date, time, method of contact, and patient response or voicemail status.',
  },
  {
    id: 2,
    situation: 'Active response but plan type unknown',
    internal: 'Use when the OS returns Active but plan type cannot be confirmed from the electronic response alone.',
    script: 'We were able to locate an active dental plan, but the response does not yet confirm whether it is a PPO plan that can be used at our office. We are completing an additional review and will update you when we have more information.',
    doc: 'Note that Active was returned and secondary verification is in progress.',
  },
  {
    id: 3,
    situation: 'HMO or assigned-office result',
    internal: 'Use when the carrier confirms HMO or DHMO with an assigned office that is not KYT.',
    script: 'Your plan appears active, but the information we received indicates that it may be an HMO or assigned-office dental plan rather than PPO coverage. HMO plans generally require care through the dental office assigned by the carrier. We want to explain this before treatment so you can make an informed decision and avoid an unexpected cost.',
    doc: 'Document the specific plan type returned, what was communicated, and the patient\'s response.',
  },
  {
    id: 4,
    situation: 'Zocdoc selection mismatch',
    internal: 'Use when the plan selected during Zocdoc booking does not match the carrier\'s response.',
    script: 'The plan selected during booking does not match the plan information returned by the carrier. This can happen for several reasons. Do you have another dental plan or a different insurance card we should review?',
    doc: 'Record the mismatch details, patient response, and any corrected information supplied.',
  },
  {
    id: 5,
    situation: 'Unable to validate insurance',
    internal: 'Use when verification attempts have not produced a usable result and the appointment is approaching.',
    script: 'We were unable to validate the plan using the information supplied. That does not necessarily mean you have no coverage. It means we need corrected or additional information before we can confirm how the plan applies at our office.',
    doc: 'Note all verification attempts, sources checked, and what information is still needed.',
  },
  {
    id: 6,
    situation: 'Patient cannot be reached before arrival',
    internal: 'Use at arrival when the patient was unreachable before the appointment.',
    script: 'We reviewed the information before your visit, but we were unable to reach you to discuss the result. Before we begin, we need to explain what we found and review your available options.',
    doc: 'Document all prior contact attempts and record the arrival conversation outcome.',
  },
  {
    id: 7,
    situation: 'Asking about other coverage',
    internal: 'Use whenever the current plan cannot be used at KYT.',
    script: 'Do you currently have any other active dental insurance through your employer, spouse, parent, union, or another source?',
    doc: 'Record the patient\'s answer. If yes, collect carrier name, member ID, and card images.',
  },
  {
    id: 8,
    situation: 'No usable coverage found',
    internal: 'Use when all verification paths have been exhausted and no applicable plan is confirmed.',
    script: 'At this time, we do not have a dental plan that we can confirm for today\'s visit. We can review appropriate self-pay options. If you do not have any active dental insurance, we can also determine whether you qualify for KYT\'s in-office membership.',
    doc: 'Document the verification outcome, self-pay options presented, and membership eligibility discussion.',
  },
  {
    id: 9,
    situation: 'Neutral review request',
    internal: 'Use only after confirming the visit was completed satisfactorily and the patient was not in a disputed situation. Never connect the review request to a discount, adjustment, or gift.',
    script: 'Thank you for visiting us today. We value honest feedback about your experience. You are welcome to use our review link if you would like to share it.',
    doc: 'Note that the review request was made independently of any service-recovery action or financial adjustment.',
  },
]

// ---------------------------------------------------------------------------
// MODULE 8 — FINANCIAL PATHWAYS AND SERVICE RECOVERY
// ---------------------------------------------------------------------------
export const financialPathways = [
  {
    id: 'path-a',
    label: 'Path A — PPO Verified, KYT In-Network',
    tone: 'gold',
    description: 'The patient\'s plan is confirmed PPO and KYT is an in-network participating provider.',
    steps: [
      'Proceed using the normal PPO billing workflow.',
      'Present a written cost estimate based on current benefit details.',
      'Explain clearly that benefits are estimates and not a guarantee of payment.',
      'Collect the estimated co-pay or patient portion at time of service.',
      'Establish recall and next-visit scheduling when clinically appropriate.',
    ],
  },
  {
    id: 'path-b',
    label: 'Path B — PPO, Out-of-Network',
    tone: 'teal',
    description: 'The plan is confirmed PPO but KYT is not a participating in-network provider.',
    steps: [
      'Explain out-of-network status to the patient clearly and without apology.',
      'Present a written estimate showing the out-of-network fee and expected patient responsibility.',
      'Explain possible balance-billing responsibility based on the patient\'s OON benefits.',
      'Obtain written patient acknowledgment of OON status and estimated responsibility.',
      'Allow the patient to proceed, reschedule, or choose another in-network provider.',
    ],
  },
  {
    id: 'path-c',
    label: 'Path C — Active HMO / Assigned-Office Plan',
    tone: 'red',
    description: 'The plan is confirmed HMO or DHMO. KYT cannot bill this plan as a PPO provider and is not the assigned office.',
    steps: [
      'Explain assigned-office requirements to the patient.',
      'Ask whether another active PPO plan exists.',
      'Encourage the patient to contact their carrier to locate their assigned office.',
      'Offer records transfer when appropriate.',
      'Present self-pay options only with clear written pricing.',
      'Do not bill the HMO. Do not represent HMO coverage as PPO.',
    ],
  },
  {
    id: 'path-d',
    label: 'Path D — No Active Dental Coverage',
    tone: 'teal',
    description: 'No active dental plan can be confirmed for today\'s visit.',
    steps: [
      'Present self-pay pricing clearly and in writing.',
      'Present KYT Essential Membership and KYT Advanced Membership with written plan details.',
      'Confirm that the patient does not have active dental coverage before enrolling in membership.',
      'Do not combine membership with active dental insurance.',
      'Allow the patient to choose self-pay or membership without pressure.',
    ],
  },
  {
    id: 'path-e',
    label: 'Path E — Insurance Remains Unresolved',
    tone: 'red',
    description: 'Verification efforts have not produced a confirmed result and the patient is present.',
    steps: [
      'Mark the record Unverified.',
      'Give no guarantee of coverage to the patient.',
      'Present written self-pay responsibility before services begin.',
      'Allow the patient to delay or reschedule without pressure.',
      'Escalate unusual or disputed situations to management.',
    ],
  },
  {
    id: 'path-f',
    label: 'Path F — The Office Made an Error',
    tone: 'red',
    description: 'Staff provided incorrect verification information to the patient. A service-recovery response is required.',
    isServiceRecovery: true,
    steps: [
      'Acknowledge the office\'s mistake directly. Do not blame the patient.',
      'Notify the office manager immediately.',
      'Correct the OS record to reflect the true insurance status.',
      'Explain the true insurance status to the patient.',
      'Apply the management-approved service-recovery policy to protect the patient from charges that resulted from the office\'s representation.',
      'Do not submit a false PPO claim. Do not describe HMO coverage as PPO.',
      'Document any fee adjustment, courtesy, or write-off with manager approval.',
      'Provide any goodie bag as an unconditional patient-care gesture — not in exchange for a review.',
      'Make any review request separately and independently. Ask only for honest feedback.',
      'Do not condition care, discounts, gifts, or adjustments on a review.',
      'Route unresolved clinical findings to the dentist or manager.',
    ],
    patientScript: 'We gave you incorrect information when we said your PPO eligibility was confirmed. The response we reviewed showed active coverage, but we did not complete the plan-type validation. That was our mistake, and we are sorry. We will explain what we found, review today\'s options, and make sure you are not surprised by a charge that resulted from our error.',
    clarification: '"Treat them as a PPO patient" must not mean falsifying coverage. It means: apply the management-approved service-recovery policy to the patient responsibility for the limited services that were incorrectly represented, without misrepresenting the insurance plan or submitting an inaccurate claim.',
    futureCarScript: 'We enjoyed meeting you and are glad we could care for you today. Because your current plan requires an assigned dental office, we will not automatically schedule an insurance-based six-month recall here. We can provide your records and explain how to contact your assigned office. Should your coverage change in the future, or should you choose an eligible self-pay pathway, you are welcome to contact us.',
  },
]

export const serviceRecoveryRules = {
  servicesEligible: 'Management confirmation required.',
  maxCourtesyAdjustment: 'Management confirmation required.',
  managerApprovalRequired: true,
  docTemplate: 'Record: office error description, services performed, patient notified, adjustments made (amount and manager approval), OS corrected, claim not submitted for HMO.',
  examHonorable: 'Management confirmation required.',
  cleaningHonorable: 'Management confirmation required.',
  escalationToProvider: 'Required when clinical findings are unresolved or when the patient\'s care timeline may be affected.',
}

// ---------------------------------------------------------------------------
// MODULE 9 — CHECKOUT, RECALL, AND DISPOSITION
// ---------------------------------------------------------------------------
export const checkoutDispositions = [
  { outcome: 'PPO patient accepted into continuing care', recall: 'Schedule 6-month recall', followUpOwner: 'Front Desk', dueDate: 'Before patient leaves', notes: 'Confirm next appointment', records: 'None', balanceStatus: 'Collected or payment plan documented', reviewAppropriate: true, reactivation: false },
  { outcome: 'Out-of-network patient elected continuing care', recall: 'Schedule per clinical recommendation', followUpOwner: 'Treatment Coordinator', dueDate: 'Before patient leaves', notes: 'Document OON acknowledgment on file', records: 'None', balanceStatus: 'Collected or payment plan documented', reviewAppropriate: true, reactivation: false },
  { outcome: 'Patient enrolled in membership after eligibility confirmation', recall: 'Schedule per membership plan', followUpOwner: 'Front Desk', dueDate: 'Before patient leaves', notes: 'Document membership plan and enrollment date', records: 'None', balanceStatus: 'Annual fee collected', reviewAppropriate: true, reactivation: false },
  { outcome: 'Self-pay patient continuing care', recall: 'Schedule per clinical recommendation', followUpOwner: 'Front Desk', dueDate: 'Before patient leaves', notes: 'Confirm pricing acknowledged in writing', records: 'None', balanceStatus: 'Collected or payment plan documented', reviewAppropriate: true, reactivation: true },
  { outcome: 'Emergency-only visit completed', recall: 'Route follow-up to clinical team', followUpOwner: 'Clinical Team', dueDate: 'Before patient leaves', notes: 'Document clinical recommendations for follow-up', records: 'Provide summary if requested', balanceStatus: 'Collected', reviewAppropriate: true, reactivation: true },
  { outcome: 'HMO patient referred to assigned office', recall: 'Do not schedule insurance-based recall', followUpOwner: 'Front Desk', dueDate: 'Before patient leaves', notes: 'Explain assigned-office pathway. Offer records transfer.', records: 'Provide on request', balanceStatus: 'Resolve per service-recovery policy if applicable', reviewAppropriate: false, reactivation: false },
  { outcome: 'Patient requested records transfer', recall: 'None', followUpOwner: 'Front Desk', dueDate: 'Within office policy timeframe', notes: 'Document records request and authorization', records: 'Transfer per authorization', balanceStatus: 'Collect any outstanding balance first', reviewAppropriate: false, reactivation: false },
  { outcome: 'Patient declined treatment', recall: 'None — document clinical recommendations made', followUpOwner: 'Clinical Team', dueDate: 'Before patient leaves', notes: 'Document that treatment was offered and declined', records: 'None unless requested', balanceStatus: 'Collect for services rendered', reviewAppropriate: false, reactivation: true },
  { outcome: 'Verification remains pending', recall: 'Hold scheduling until verified', followUpOwner: 'Insurance Verifier', dueDate: 'Within 24 hours', notes: 'Do not schedule without verified pathway', records: 'None', balanceStatus: 'Self-pay only until verified', reviewAppropriate: false, reactivation: false },
  { outcome: 'Manager follow-up required', recall: 'Hold', followUpOwner: 'Office Manager', dueDate: 'Same day', notes: 'Document reason for escalation', records: 'None', balanceStatus: 'On hold', reviewAppropriate: false, reactivation: false },
  { outcome: 'Office-owned service recovery completed', recall: 'Clinical only — do not set insurance-based recall for HMO patient', followUpOwner: 'Office Manager + Clinical Team', dueDate: 'Before patient leaves', notes: 'Document error, recovery, adjustments, manager approval', records: 'Provide on request', balanceStatus: 'Adjusted per management policy', reviewAppropriate: false, reactivation: false },
]

// ---------------------------------------------------------------------------
// MEMBERSHIP PLAN WORKFLOW
// ---------------------------------------------------------------------------
export const membershipScenarios = [
  {
    id: 'hmo',
    tone: 'red',
    label: 'HMO / DHMO Patient',
    rule: 'Membership preferred — KYT cannot bill HMO and will not get paid.',
    detail: 'KYT is not in-network for HMO or DHMO plans. Billing an HMO when KYT is not the assigned provider results in a denial. The correct resolution is to redirect the patient to the KYT Membership Plan, which covers preventive care in full for one annual fee.',
    eligibleForMembership: true,
    steps: [
      'Identify the plan as HMO/DHMO via OS eligibility or plan indicator.',
      'Do not attempt to bill the HMO — KYT is not the assigned provider.',
      'Explain calmly that the plan type requires care at the assigned office.',
      'Offer the KYT Membership as the preferred alternative — covers exams and cleanings with no co-pay beyond the annual fee.',
      'If the patient enrolls, document "Membership — HMO redirect" in the chart.',
      'Proceed with the exam and cleaning under the membership.',
    ],
    script: 'Your plan is an HMO, which means it assigns you to a specific dental office. Since we are not your assigned provider, we are not able to bill your HMO and have that claim paid. What we do offer is our KYT Membership Plan — for one annual fee, your exam and cleaning today are fully covered, and you get discounted rates on any additional treatment.',
  },
  {
    id: 'ppo-active',
    tone: 'teal',
    label: 'Active PPO — Benefits Not Exhausted',
    rule: 'Use PPO normally. Membership cannot be used to discount an active PPO co-pay.',
    detail: 'When a patient has active PPO benefits with remaining annual maximum, KYT bills the PPO normally. The KYT Membership Plan cannot be layered on top of active PPO coverage to reduce the co-pay or obtain an additional discount.',
    eligibleForMembership: false,
    steps: [
      'Confirm PPO plan type and remaining annual maximum via OS eligibility.',
      'Bill the PPO normally — submit the claim through the practice management system.',
      'Collect the applicable co-pay based on the fee schedule.',
      'Do not offer membership as a supplement to reduce the PPO co-pay.',
      'If the patient asks about membership, explain it is available once PPO benefits are exhausted for the year.',
    ],
    script: 'Your PPO plan is active and we are going to take great care of you using your insurance today. Your estimated co-pay is [amount] based on your plan. If at any point during the year your benefits run out, we do have a membership plan that can keep your preventive care going — but for today, we will go ahead and bill your insurance.',
  },
  {
    id: 'ppo-exhausted',
    tone: 'gold',
    label: 'PPO — Annual Maximum Exhausted',
    rule: 'Membership available and recommended to continue preventive care.',
    detail: 'When a PPO patient has used their full annual maximum, they are responsible for 100% of costs for the remainder of the year. The KYT Membership Plan becomes available and is the recommended option to keep the patient on schedule with preventive care.',
    eligibleForMembership: true,
    steps: [
      'Confirm via OS eligibility that the annual maximum has been fully used.',
      'Inform the patient clearly that their benefits are exhausted for the year.',
      'Offer the KYT Membership as a way to continue care without full out-of-pocket costs.',
      'If the patient enrolls, document "Membership — PPO exhausted" in the chart.',
      'Do not bill the PPO for this visit — the patient is on membership.',
      'Schedule their next preventive visit under the membership timeline.',
    ],
    script: 'It looks like your PPO benefits have been fully used for this year — your annual maximum has been reached. The good news is we have a solution: our KYT Membership Plan. For a flat annual fee, it covers your exam and cleaning today and keeps you on track for the rest of the year.',
  },
]

export const membershipEligibilityMatrix = [
  { scenario: 'HMO / DHMO — not assigned provider', eligible: true, preferred: true, note: 'Redirect from HMO. Membership is the primary option.' },
  { scenario: 'Active PPO — benefits remaining', eligible: false, preferred: false, note: 'Bill PPO normally. Cannot use membership to reduce co-pay.' },
  { scenario: 'PPO — annual maximum exhausted', eligible: true, preferred: true, note: 'Benefits used up. Membership keeps preventive care going.' },
  { scenario: 'No insurance / uninsured', eligible: true, preferred: true, note: 'Membership is the default offering for uninsured patients.' },
  { scenario: 'PPO — out of network only', eligible: true, preferred: false, note: 'Case-by-case. If patient prefers to avoid OON costs, offer membership.' },
]

export const membershipPlans = [
  {
    name: 'Essential Plan',
    price: '$499/year',
    includes: ['2 cleanings', '2 periodic exams', 'Routine X-rays as clinically needed', '1 emergency exam', 'Screenings', '10% off additional treatment'],
  },
  {
    name: 'Advanced Plan',
    price: '$749/year',
    includes: ['3 periodontal maintenance visits', '2 exams', 'Routine X-rays as clinically needed', '1 emergency exam', 'Full periodontal charting', '15% off additional treatment'],
  },
]

export const membershipFacts = [
  'KYT Membership is available to any patient — including those whose active HMO plan cannot be billed at KYT.',
  'Membership is not insurance.',
  'Membership cannot be combined with an active PPO plan to reduce co-pays or obtain additional discounts.',
  'Eligibility must be confirmed before enrollment.',
  'Membership starts the same day after enrollment and is valid 12 months.',
]

export const complianceWording = [
  'Present the KYT Membership as the preferred option when HMO coverage cannot be billed at KYT.',
  'Membership cannot be combined with active PPO benefits.',
  'Do not misrepresent membership as insurance.',
  'Confirm eligibility before enrollment. Document the confirmation.',
]

// ---------------------------------------------------------------------------
// BILLING GUIDE
// ---------------------------------------------------------------------------
export const billingOverview = 'KYT Dental Services bills under three tracks: PPO insurance, KYT Membership, and self-pay. The front office determines which track applies before treatment begins. Mixing tracks — for example, billing PPO and also applying a membership discount — is not permitted.'

export const billingTracks = [
  {
    id: 'ppo',
    label: 'PPO Insurance Track',
    tone: 'teal',
    when: 'Patient has active PPO plan with remaining annual maximum and KYT is in-network or out-of-network with the carrier.',
    steps: [
      'Verify eligibility, annual maximum, deductible met/remaining, and coverage percentages via OS.',
      'Confirm the patient\'s co-pay estimate before treatment — never commit to an exact number until the EOB is received.',
      'Enter the procedure codes into the practice management system.',
      'Submit the claim electronically on the date of service.',
      'Collect the estimated patient portion at time of service.',
      'Post the payment once the EOB is received.',
      'Bill the patient for any remaining balance after insurance pays.',
      'If the claim is denied, review the denial reason and resubmit or appeal within 30 days.',
    ],
    keyTerms: [
      { term: 'Annual Maximum', def: 'The most the PPO will pay in a calendar year. Common amounts: $1,000–$2,000.' },
      { term: 'Deductible', def: 'The amount the patient pays before insurance starts covering treatment.' },
      { term: 'Co-pay / Patient Portion', def: 'The percentage the patient owes after insurance pays its share.' },
      { term: 'EOB', def: 'Explanation of Benefits — the insurer\'s statement of what was paid and what the patient owes.' },
      { term: 'UCR Fee', def: 'Usual, Customary, and Reasonable — the fee the carrier considers standard for a procedure.' },
      { term: 'Write-off', def: 'The difference between KYT\'s fee and the PPO contracted rate — not billed to the patient.' },
    ],
  },
  {
    id: 'membership',
    label: 'KYT Membership Track',
    tone: 'gold',
    when: 'Patient is HMO/DHMO (not assigned), PPO with exhausted benefits, uninsured, or otherwise eligible for membership.',
    steps: [
      'Confirm the patient\'s eligibility for membership.',
      'Collect the annual membership fee at enrollment — $499 (Essential) or $749 (Advanced).',
      'Document enrollment in the chart: "KYT Membership enrolled [date], plan: Essential/Advanced."',
      'Do not submit any insurance claim for visits covered under membership.',
      'Services outside the membership scope are billed at the membership discount rate.',
      'Track membership expiration — 12 months from enrollment date.',
      'Send a renewal reminder 30 days before expiration.',
    ],
    keyTerms: [
      { term: 'Essential Plan', def: '$499/year. Covers 2 cleanings, 2 exams, routine X-rays, 1 emergency exam, 10% off additional treatment.' },
      { term: 'Advanced Plan', def: '$749/year. Covers 3 perio maintenance visits, 2 exams, routine X-rays, 1 emergency exam, 15% off additional treatment.' },
      { term: 'In-scope service', def: 'A service covered by the membership fee — no additional charge to the patient.' },
      { term: 'Out-of-scope service', def: 'Treatment beyond the membership (e.g. fillings, crowns) — billed at the discounted membership rate.' },
    ],
  },
  {
    id: 'selfpay',
    label: 'Self-Pay Track',
    tone: 'neutral',
    when: 'Patient declines membership, has no active insurance, or treatment is outside membership scope with no applicable insurance.',
    steps: [
      'Present the full-fee treatment estimate in writing before any service.',
      'Collect payment in full or arrange a documented payment plan before or at time of service.',
      'Note "Self-pay" in the patient record.',
      'Offer membership as an alternative — it usually results in lower cost for preventive care.',
      'Do not submit a claim to any insurer for self-pay visits.',
    ],
    keyTerms: [
      { term: 'Full fee', def: 'KYT\'s standard fee schedule rate — no insurance or membership discount applied.' },
      { term: 'Payment plan', def: 'A pre-approved installment arrangement. Must be documented and signed before service.' },
    ],
  },
]

export const billingDenialReasons = [
  { code: 'CO-4', reason: 'Service not covered under the patient\'s plan', action: 'Verify plan benefits. If applicable, offer membership or self-pay.' },
  { code: 'CO-22', reason: 'Patient is not eligible on date of service', action: 'Recheck OS eligibility. Collect as self-pay or offer membership.' },
  { code: 'CO-97', reason: 'Benefit for this service is included in another service already billed', action: 'Review procedure codes for bundling conflicts. Resubmit with correction.' },
  { code: 'PR-1', reason: 'Deductible not met', action: 'Bill patient for the deductible portion. Resubmit remaining balance to insurance.' },
  { code: 'PR-2', reason: 'Co-insurance', action: 'Bill patient for their co-insurance percentage per the EOB.' },
  { code: 'OA-23', reason: 'Charge exceeds fee schedule / maximum allowed', action: 'Write off the difference per the PPO contract. Bill patient only for their co-pay.' },
  { code: 'HMO-NP', reason: 'Patient\'s HMO assigned provider is a different office', action: 'Do not resubmit. Redirect patient to KYT Membership or their assigned HMO provider.' },
]

export const billingFAQ = [
  { q: 'Can we bill an HMO claim and also charge the patient the difference?', a: 'No. If KYT is not the assigned HMO provider, the claim will be denied. Do not balance-bill the patient for a denied HMO claim. The correct path is to redirect to membership or self-pay before treatment.' },
  { q: 'A patient has PPO and wants the membership 10% discount on top. Can we do both?', a: 'No. Active PPO benefits and the membership discount cannot be stacked. The patient uses one track — PPO or membership, not both simultaneously.' },
  { q: 'When do we collect the co-pay?', a: 'At time of service, before or immediately after treatment. Never let a patient leave without collecting their estimated patient portion.' },
  { q: 'A patient\'s PPO paid less than expected. Who owes the balance?', a: 'Depends on the contract. If KYT is in-network, the write-off absorbs the difference between the fee and the contracted rate. If KYT is out-of-network, the patient may owe the full balance minus what the PPO paid.' },
  { q: 'How do we handle a patient who refuses to pay their co-pay today?', a: 'Document it, send a statement, and follow the office collections protocol. Do not waive co-pays routinely — waiving co-pays for insured patients can constitute insurance fraud.' },
  { q: 'Can we submit a claim for a membership patient\'s visit?', a: 'No. Membership visits are not billed to insurance. Submitting a claim for a visit already covered under membership is double-billing and must be avoided.' },
]

// ---------------------------------------------------------------------------
// INTERACTIVE SCENARIOS
// ---------------------------------------------------------------------------
export const scenarios = [
  {
    id: 1,
    title: 'Active HMO Selected as PPO',
    patient: 'Jordan Lee',
    disclaimer: 'Fictional training scenario — no real patient information.',
    situation: 'Jordan Lee books through Zocdoc and selects PPO during booking. The OS returns "Active Coverage." When you run a secondary check through the carrier portal, it shows a DHMO plan with an assigned office that is not KYT.',
    options: [
      { key: 'a', text: 'Proceed — the OS returned Active and Zocdoc showed PPO.' },
      { key: 'b', text: 'Contact Jordan before the appointment to explain the finding and present options.' },
      { key: 'c', text: 'Bill the DHMO as a PPO and absorb any denial later.' },
      { key: 'd', text: 'Cancel the appointment without contacting the patient.' },
    ],
    correct: 'b',
    correctAction: 'Contact Jordan before the appointment. Explain that the carrier confirms a DHMO plan, which requires an assigned office. Ask whether another PPO plan exists. Present options: corrected information, reschedule, self-pay, or KYT Membership.',
    whyCorrect: 'The OS returning "Active" is not verification. The carrier portal confirmed a DHMO. Proceeding without informing the patient creates an unexpected financial experience. The goal is to resolve the mismatch before the appointment.',
    document: 'Record the secondary check result, contact attempt date and time, patient response, and option selected.',
    sayToPatient: 'Script 3 — HMO or assigned-office result.',
    doNotSay: 'Do not tell the patient they selected the wrong insurance or imply bad intent. Do not promise PPO coverage or say the OS "confirmed" their plan.',
    escalate: 'If Jordan cannot be reached within 24 hours of booking, escalate to the office manager.',
  },
  {
    id: 2,
    title: 'Missing Member ID',
    patient: 'Taylor Morgan',
    disclaimer: 'Fictional training scenario — no real patient information.',
    situation: 'Taylor Morgan has booked an appointment and provided the carrier name only. No member ID, no card images, and the intake form has not been completed. The appointment is in 48 hours.',
    options: [
      { key: 'a', text: 'Wait for Taylor to arrive and collect the information at the front desk.' },
      { key: 'b', text: 'Contact Taylor now, request the member ID and card images, and resend the intake form.' },
      { key: 'c', text: 'Run eligibility anyway — the carrier name might be enough.' },
      { key: 'd', text: 'Mark the record PPO Confirmed based on the carrier name.' },
    ],
    correct: 'b',
    correctAction: 'Contact Taylor immediately. Explain that member ID and card images are needed to verify the plan before the appointment. Resend the intake form. Set a follow-up task for 24 hours before the appointment.',
    whyCorrect: 'Eligibility cannot begin without a member ID. Running verification on carrier name alone risks a mismatch or an incomplete result. Arriving unverified leads to a difficult financial conversation at the front desk.',
    document: 'Record contact attempt, information requested, and patient response.',
    sayToPatient: 'Script 1 — Missing member ID.',
    doNotSay: 'Do not tell the patient their plan is verified or confirmed. Do not guess at the member ID.',
    escalate: 'If no response by 24 hours before the appointment, escalate to the insurance verifier lead.',
  },
  {
    id: 3,
    title: 'Wrong Subscriber',
    patient: 'Casey Rivera',
    disclaimer: 'Fictional training scenario — no real patient information.',
    situation: 'Casey Rivera completed the intake form and entered their own name and date of birth as the subscriber. When you run eligibility, the OS returns no match. A review of the intake notes suggests the plan may be through a spouse.',
    options: [
      { key: 'a', text: 'Mark unverified and note there is no coverage.' },
      { key: 'b', text: 'Contact Casey to confirm subscriber details — ask if the plan belongs to a spouse.' },
      { key: 'c', text: 'Try variations of the member ID until one returns an Active result.' },
      { key: 'd', text: 'Ask Casey to bring their insurance card to the appointment.' },
    ],
    correct: 'b',
    correctAction: 'Contact Casey to clarify subscriber information. Ask directly whether the plan is through a spouse, parent, employer, or another source. Request the subscriber\'s name, date of birth, and the insurance card.',
    whyCorrect: 'A subscriber mismatch is one of the most common reasons eligibility fails. The plan may still be valid — the wrong subscriber was entered. Marking "no coverage" without investigation is premature.',
    document: 'Record the mismatch, contact date, and corrected subscriber information if provided.',
    sayToPatient: 'Script 7 — Asking about other coverage. Then Script 1 or 4 as applicable.',
    doNotSay: 'Do not tell the patient they have no coverage. Do not imply they made an error intentionally.',
    escalate: 'If the subscriber cannot be identified before the appointment, mark "Verify at Arrival" and brief the front desk.',
  },
  {
    id: 4,
    title: 'PPO Out of Network',
    patient: 'Morgan Chen',
    disclaimer: 'Fictional training scenario — no real patient information.',
    situation: 'Morgan Chen has a confirmed PPO plan. Secondary verification confirms the plan is PPO but KYT is not a participating in-network provider for this carrier.',
    options: [
      { key: 'a', text: 'Proceed as in-network — PPO is PPO.' },
      { key: 'b', text: 'Inform Morgan of out-of-network status, provide a written estimate, and obtain acknowledgment.' },
      { key: 'c', text: 'Decline the appointment — KYT only accepts in-network PPO.' },
      { key: 'd', text: 'Bill the carrier as if KYT is in-network and adjust later.' },
    ],
    correct: 'b',
    correctAction: 'Inform Morgan that the plan is PPO but KYT is not in-network with this carrier. Provide a written out-of-network estimate showing expected patient responsibility. Obtain written acknowledgment before services begin. Allow Morgan to choose to proceed, reschedule, or find an in-network provider.',
    whyCorrect: 'Out-of-network does not mean KYT cannot see the patient — it means the patient\'s financial responsibility may be higher. The patient must be informed and acknowledge before treatment.',
    document: 'Document OON status confirmed, estimate provided, acknowledgment obtained, and patient decision.',
    sayToPatient: 'Path B — PPO, Out-of-Network steps.',
    doNotSay: 'Do not tell the patient they are "covered" at KYT. Do not bill as in-network.',
    escalate: 'If the patient disputes the OON estimate before care, escalate to the treatment coordinator or office manager.',
  },
  {
    id: 5,
    title: 'Inactive Coverage',
    patient: 'Alex Park',
    disclaimer: 'Fictional training scenario — no real patient information.',
    situation: 'Alex Park presents a dental insurance card that appears current. When you run eligibility, the OS returns that coverage terminated last month. The card has no printed termination date.',
    options: [
      { key: 'a', text: 'Accept the card — it looks valid and the patient says they are still employed.' },
      { key: 'b', text: 'Inform Alex that the carrier returned an inactive result, ask about other coverage, and present self-pay or membership options.' },
      { key: 'c', text: 'Run eligibility again — the card must be valid.' },
      { key: 'd', text: 'Bill the carrier anyway and handle the denial later.' },
    ],
    correct: 'b',
    correctAction: 'Inform Alex that the eligibility check returned an inactive result as of last month. Ask whether there is another active plan. If not, present self-pay pricing and KYT Membership eligibility. Do not begin services until the financial pathway is acknowledged.',
    whyCorrect: 'A card does not confirm active coverage. Coverage can lapse due to employment changes, premium non-payment, or plan year transitions. The OS result is the verification source — not the card appearance.',
    document: 'Document inactive result, date checked, patient notification, other coverage inquiry, and financial pathway accepted.',
    sayToPatient: 'Script 5 — Unable to validate insurance. Then Script 8 — No usable coverage found.',
    doNotSay: 'Do not tell the patient their card is "invalid" or imply they are trying to use lapsed coverage. Lapse can happen for many reasons.',
    escalate: 'If Alex disputes the inactive result and insists on using the plan, escalate to the insurance verifier to contact the carrier live.',
  },
  {
    id: 6,
    title: 'Dual Coverage',
    patient: 'Sam Torres',
    disclaimer: 'Fictional training scenario — no real patient information.',
    situation: 'Sam Torres has completed the intake form and listed two insurance plans — one through their own employer and one through a spouse. Both appear active. Coordination of benefits order has not been established.',
    options: [
      { key: 'a', text: 'Use the primary plan only and ignore the secondary.' },
      { key: 'b', text: 'Establish COB order before the appointment. Contact both carriers if needed. Document the result.' },
      { key: 'c', text: 'Bill both carriers at the same time for the full amount.' },
      { key: 'd', text: 'Tell the patient to sort out their COB before coming in.' },
    ],
    correct: 'b',
    correctAction: 'Contact both carriers to establish COB order before the appointment. Document the primary and secondary designation. Present a combined estimate to Sam. Update the OS with both plans and the COB result.',
    whyCorrect: 'Dual coverage requires COB order to be established before billing. Billing both carriers for the full amount is not permitted. COB determines which carrier pays first and how the secondary coordinates.',
    document: 'Document both carriers, COB order established, combined estimate, and patient notification.',
    sayToPatient: 'Explain that you are confirming which plan is primary and which is secondary before the visit.',
    doNotSay: 'Do not tell the patient dual coverage is a problem. It is an administrative step, not an issue.',
    escalate: 'Escalate complex COB situations to the office manager.',
  },
  {
    id: 7,
    title: 'Urgent Pain, Unresolved Eligibility',
    patient: 'Riley Kim',
    disclaimer: 'Fictional training scenario — no real patient information.',
    situation: 'Riley Kim calls with significant tooth pain. They have a Zocdoc booking today. Insurance verification is incomplete — the OS returned Active but plan type is unconfirmed. The appointment is in 2 hours.',
    options: [
      { key: 'a', text: 'Seat the patient and verify insurance after the appointment.' },
      { key: 'b', text: 'Present the financial pathway to Riley before services begin, even if verification is incomplete. Escalate to the office manager.' },
      { key: 'c', text: 'Tell Riley to reschedule until insurance is confirmed.' },
      { key: 'd', text: 'Mark the plan as PPO confirmed and proceed.' },
    ],
    correct: 'b',
    correctAction: 'Escalate to the office manager given the urgency and unresolved status. Present a written self-pay option or unverified pathway to Riley before any services. Do not promise coverage. Attempt to confirm plan type quickly — carrier phone or DentalXChange. Begin urgent care per office policy with the acknowledged financial pathway in place.',
    whyCorrect: 'Urgent clinical need does not eliminate the financial pathway conversation. The patient must acknowledge their options before services begin. Routing clinical urgency through the office manager ensures the appropriate care decision is made while protecting both the patient and the office.',
    document: 'Document urgency, escalation to manager, contact attempts, financial pathway presented, and patient acknowledgment.',
    sayToPatient: 'Script 6 — Patient cannot be reached before arrival. Adapt for urgent in-office situation.',
    doNotSay: 'Do not promise coverage will pay. Do not say "we\'ll figure it out after."',
    escalate: 'Immediately to office manager. Route clinical urgency to the treating provider.',
  },
  {
    id: 8,
    title: 'Office Error — PPO Confirmed Too Early',
    patient: 'Quinn Adams',
    disclaimer: 'Fictional training scenario — no real patient information.',
    situation: 'A staff member told Quinn Adams that their PPO eligibility was confirmed based on an Active response from the OS. No secondary verification was completed. At checkout, it is discovered the plan is a DHMO with an assigned office elsewhere.',
    options: [
      { key: 'a', text: 'Tell Quinn their plan changed and collect full self-pay fees.' },
      { key: 'b', text: 'Acknowledge the office error, notify the manager, apply service-recovery policy, and do not bill falsely.' },
      { key: 'c', text: 'Submit a PPO claim anyway since the patient was told they were covered.' },
      { key: 'd', text: 'Tell Quinn to contact their carrier to resolve it.' },
    ],
    correct: 'b',
    correctAction: 'Acknowledge the office error directly to Quinn. Notify the office manager immediately. Apply the management-approved service-recovery policy. Do not submit a false PPO claim. Do not blame the patient. Correct the OS record. Document the error, recovery action, and manager approval.',
    whyCorrect: 'The office made a representation that was not supported by complete verification. The patient acted on that information in good faith. Submitting a false claim or charging the patient the full amount for the office\'s error is not appropriate.',
    document: 'Document the error (Active accepted without secondary check), manager notification, service-recovery action, any adjustments, and that no false claim was submitted.',
    sayToPatient: 'Path F service-recovery script.',
    doNotSay: 'Do not tell the patient their plan "doesn\'t work here" without acknowledging the office\'s role. Do not say "Active means covered."',
    escalate: 'Office manager immediately. Dentist if clinical findings are unresolved.',
  },
]

// ---------------------------------------------------------------------------
// QUIZ BANK — 30 Questions
// ---------------------------------------------------------------------------
export const quizBank = [
  // Zocdoc intake
  {
    id: 'z1', category: 'Zocdoc Intake',
    prompt: 'When a Zocdoc booking is received, what must staff do before creating a new patient record?',
    options: [{ key: 'a', text: 'Create the record immediately to save time' }, { key: 'b', text: 'Search the OS for an existing record to prevent duplicates' }, { key: 'c', text: 'Call the patient to confirm the booking' }, { key: 'd', text: 'Run eligibility using the name only' }],
    correct: 'b',
    explanation: 'Duplicate patient records create verification, communication, and clinical documentation errors. Always search before creating.',
  },
  {
    id: 'z2', category: 'Zocdoc Intake',
    prompt: 'How should staff enter the carrier and plan name from a Zocdoc booking into the OS?',
    options: [{ key: 'a', text: 'Abbreviate to save space' }, { key: 'b', text: 'Correct common spelling errors before entering' }, { key: 'c', text: 'Enter exactly as displayed in Zocdoc without guessing or correcting' }, { key: 'd', text: 'Enter the most similar plan name in the OS dropdown' }],
    correct: 'c',
    explanation: 'The Zocdoc-displayed carrier and plan must be entered exactly as shown. Guessing or correcting introduces errors that affect verification.',
  },
  {
    id: 'z3', category: 'Zocdoc Intake',
    prompt: 'What referral source should be recorded for a Zocdoc booking?',
    options: [{ key: 'a', text: 'Internet' }, { key: 'b', text: 'Zocdoc' }, { key: 'c', text: 'Online' }, { key: 'd', text: 'Unknown' }],
    correct: 'b',
    explanation: 'The referral source should be recorded as Zocdoc specifically, not a generic term. This supports accurate tracking and recall.',
  },
  // OS record creation
  {
    id: 'o1', category: 'OS Record Creation',
    prompt: 'A staff member finds a record with the same last name and similar DOB. What should they do?',
    options: [{ key: 'a', text: 'Create a new record — better safe than sorry' }, { key: 'b', text: 'Escalate to the office manager before proceeding' }, { key: 'c', text: 'Merge the records immediately' }, { key: 'd', text: 'Ignore it and proceed with the new booking' }],
    correct: 'b',
    explanation: 'A possible duplicate must be escalated to the office manager before any further action. Duplicate records cause serious administrative and clinical errors.',
  },
  {
    id: 'o2', category: 'OS Record Creation',
    prompt: 'Zocdoc bookings are automatically imported into the KYT OS under the current workflow.',
    options: [{ key: 'a', text: 'True — they sync within one hour' }, { key: 'b', text: 'False — staff must manually enter every booking into the OS' }, { key: 'c', text: 'True — if the same carrier is on file' }, { key: 'd', text: 'False — only new patients must be entered manually' }],
    correct: 'b',
    explanation: 'Under the current workflow, Zocdoc bookings are not automatically imported. Staff must manually create or update the OS record for every Zocdoc appointment.',
  },
  // Intake form completeness
  {
    id: 'i1', category: 'Intake Form Completeness',
    prompt: 'The Intake Completeness Meter shows 35%. What does this mean?',
    options: [{ key: 'a', text: 'The patient is ready — minor items remain' }, { key: 'b', text: 'Major intake intervention is required before the appointment can proceed' }, { key: 'c', text: 'Verification is at risk but can proceed with caution' }, { key: 'd', text: 'The system has an error — reset and try again' }],
    correct: 'b',
    explanation: 'Below 40% means major intake intervention is required. Critical required fields are missing. Contact the patient before the appointment.',
  },
  {
    id: 'i2', category: 'Intake Form Completeness',
    prompt: 'A patient\'s medical history section contains a clinical alert. What should front-office staff do?',
    options: [{ key: 'a', text: 'Review and document the clinical concern' }, { key: 'b', text: 'Route to the clinical team without interpreting or acting on the information' }, { key: 'c', text: 'Ask the patient about it at arrival' }, { key: 'd', text: 'Delete the alert to keep the record clean' }],
    correct: 'b',
    explanation: 'Front-office staff must not interpret, diagnose, or act on clinical information. Route clinical alerts directly to the treating provider or clinical team.',
  },
  {
    id: 'i3', category: 'Intake Form Completeness',
    prompt: 'Which intake section carries the highest administrative weight for insurance verification?',
    options: [{ key: 'a', text: 'Section B — Appointment Purpose' }, { key: 'b', text: 'Section E — Dental History' }, { key: 'c', text: 'Section C — Insurance and Subscriber Information' }, { key: 'd', text: 'Section F — Consents and Policies' }],
    correct: 'c',
    explanation: 'Section C (Insurance and Subscriber Information) accounts for 35% of intake weight because it contains the fields needed for eligibility verification.',
  },
  // Member ID and subscriber data
  {
    id: 'm1', category: 'Member ID and Subscriber Data',
    prompt: 'A patient enters their own DOB but the plan is through their spouse. What is the most likely verification outcome?',
    options: [{ key: 'a', text: 'The OS will still return Active — DOB is not required' }, { key: 'b', text: 'The OS will return a subscriber data mismatch or no match' }, { key: 'c', text: 'The plan will verify successfully under the patient\'s DOB' }, { key: 'd', text: 'The system will automatically correct the subscriber' }],
    correct: 'b',
    explanation: 'Subscriber data must match the carrier\'s records. Entering the patient\'s DOB when the subscriber is a spouse will typically result in a mismatch or no match.',
  },
  {
    id: 'm2', category: 'Member ID and Subscriber Data',
    prompt: 'Zocdoc shows "member ID not specified." What status should the record receive?',
    options: [{ key: 'a', text: 'Active PPO Confirmed' }, { key: 'b', text: 'Unverified — Missing Information' }, { key: 'c', text: 'Verification In Progress' }, { key: 'd', text: 'Carrier Contact Required' }],
    correct: 'b',
    explanation: 'Without a member ID, verification cannot begin. The correct status is "Unverified — Missing Information" until the member ID is supplied.',
  },
  {
    id: 'm3', category: 'Member ID and Subscriber Data',
    prompt: 'A patient supplies a carrier name but no member ID, and the appointment is in 24 hours. What is the correct action?',
    options: [{ key: 'a', text: 'Run eligibility on the name and carrier name alone' }, { key: 'b', text: 'Mark verified — the carrier name is sufficient' }, { key: 'c', text: 'Contact the patient immediately for the member ID and card images' }, { key: 'd', text: 'Wait until the patient arrives to collect the ID' }],
    correct: 'c',
    explanation: 'Carrier name alone is not sufficient for verification. With 24 hours remaining, the patient must be contacted immediately for the member ID and card images.',
  },
  // Active vs verified
  {
    id: 'av1', category: 'Active vs Verified',
    prompt: 'The OS returns "Active Coverage." What has been confirmed?',
    options: [{ key: 'a', text: 'The plan is PPO and KYT is in-network' }, { key: 'b', text: 'Some coverage may currently be in force — plan type and KYT participation are not confirmed' }, { key: 'c', text: 'The patient is eligible for in-network benefits at KYT' }, { key: 'd', text: 'The member ID and subscriber data are accurate' }],
    correct: 'b',
    explanation: 'An Active response only confirms that some coverage may be in force. It does not confirm plan type, KYT participation, network status, assigned office, or any benefit details.',
  },
  {
    id: 'av2', category: 'Active vs Verified',
    prompt: 'At what verification level is it appropriate to present a PPO estimate to the patient?',
    options: [{ key: 'a', text: 'Level 0 — after the first Active response' }, { key: 'b', text: 'Level 1 — as soon as an electronic match is found' }, { key: 'c', text: 'Level 3 or 4 — after plan type and network participation are confirmed' }, { key: 'd', text: 'Any level — estimates are always approximate anyway' }],
    correct: 'c',
    explanation: 'PPO estimates should only be presented after plan type and network participation are confirmed (Level 3 or 4). Level 1 Active response is not sufficient.',
  },
  {
    id: 'av3', category: 'Active vs Verified',
    prompt: 'When should staff use DentalXChange or the carrier portal?',
    options: [{ key: 'a', text: 'Only when the OS returns an error' }, { key: 'b', text: 'When the OS returns Active without plan-type detail, or when the plan type or network status is unclear' }, { key: 'c', text: 'Only for HMO patients' }, { key: 'd', text: 'Never — the OS response is always sufficient' }],
    correct: 'b',
    explanation: 'DentalXChange or a carrier portal should be used whenever the OS result is insufficient to confirm plan type, network participation, or assignment.',
  },
  // PPO vs HMO
  {
    id: 'ph1', category: 'PPO vs HMO',
    prompt: 'A carrier portal confirms the plan is DHMO with an assigned office that is not KYT. What is the correct action?',
    options: [{ key: 'a', text: 'Bill the DHMO as PPO and adjust if denied' }, { key: 'b', text: 'Proceed — DHMO and PPO both provide dental coverage' }, { key: 'c', text: 'Explain assigned-office requirements, ask about other coverage, and present self-pay or membership options' }, { key: 'd', text: 'Tell the patient KYT does not accept their insurance and end the call' }],
    correct: 'c',
    explanation: 'A DHMO patient assigned to another office cannot be billed through that plan at KYT. Staff must explain assigned-office requirements, ask about other coverage, and present alternative pathways.',
  },
  {
    id: 'ph2', category: 'PPO vs HMO',
    prompt: 'Why is it important to confirm plan type beyond the Active response?',
    options: [{ key: 'a', text: 'Plan type determines which intake form to send' }, { key: 'b', text: 'Active responses always indicate PPO plans' }, { key: 'c', text: 'Plan type determines whether KYT can bill the plan and whether the patient has assigned-office requirements' }, { key: 'd', text: 'Plan type only matters for specialty referrals' }],
    correct: 'c',
    explanation: 'Plan type determines the entire billing and service pathway. An HMO/DHMO requires the patient to be seen at an assigned office and cannot be billed at KYT as PPO.',
  },
  {
    id: 'ph3', category: 'PPO vs HMO',
    prompt: 'A patient with an HMO plan wants to use KYT Membership instead. What must be confirmed first?',
    options: [{ key: 'a', text: 'The patient must cancel their HMO plan first' }, { key: 'b', text: 'Nothing — any patient can enroll in membership' }, { key: 'c', text: 'Membership is not available to HMO patients' }, { key: 'd', text: 'Confirm the plan is HMO and that KYT is not the assigned provider; then membership is the preferred option' }],
    correct: 'd',
    explanation: 'Membership is the preferred option when KYT cannot bill the patient\'s HMO plan. Confirm the HMO status and non-assignment, then present membership as the pathway forward.',
  },
  // Network participation
  {
    id: 'np1', category: 'Network Participation',
    prompt: 'Zocdoc shows KYT as "in-network" for a patient\'s plan. Is this sufficient to confirm network participation?',
    options: [{ key: 'a', text: 'Yes — Zocdoc network status is always accurate' }, { key: 'b', text: 'No — KYT must confirm participation directly through OS, DentalXChange, or the carrier' }, { key: 'c', text: 'Yes — if Zocdoc says in-network, we can bill as in-network' }, { key: 'd', text: 'Only for preventive services' }],
    correct: 'b',
    explanation: 'Zocdoc network status is not independently verified participation. KYT must confirm in-network status through OS, DentalXChange, or the carrier before billing as in-network.',
  },
  {
    id: 'np2', category: 'Network Participation',
    prompt: 'A patient has a PPO plan but KYT is out-of-network. What must happen before services begin?',
    options: [{ key: 'a', text: 'Nothing additional — PPO is PPO' }, { key: 'b', text: 'The patient must find an in-network provider' }, { key: 'c', text: 'A written out-of-network estimate and patient acknowledgment must be obtained' }, { key: 'd', text: 'The plan must be billed as in-network to avoid confusion' }],
    correct: 'c',
    explanation: 'Out-of-network services require a written estimate and patient acknowledgment before treatment. The patient must understand their potential financial responsibility.',
  },
  // Unreachable patients
  {
    id: 'ur1', category: 'Unreachable Patients',
    prompt: 'A patient cannot be reached before their appointment and insurance is unresolved. What should staff do?',
    options: [{ key: 'a', text: 'Cancel the appointment' }, { key: 'b', text: 'Mark "Verify at Arrival," brief the front desk, and do not begin services until the pathway is explained' }, { key: 'c', text: 'Proceed as if PPO was confirmed' }, { key: 'd', text: 'Leave the chart blank and address it during the appointment' }],
    correct: 'b',
    explanation: 'Being unreachable does not cancel the appointment. The office should mark "Verify at Arrival," brief the front desk, and ensure the financial pathway is explained before any services begin.',
  },
  {
    id: 'ur2', category: 'Unreachable Patients',
    prompt: 'A patient could not be reached before arrival. When should the financial pathway be explained?',
    options: [{ key: 'a', text: 'After the appointment is complete' }, { key: 'b', text: 'While the patient is in the chair' }, { key: 'c', text: 'Before any services begin, at arrival' }, { key: 'd', text: 'It does not need to be explained if verification was attempted' }],
    correct: 'c',
    explanation: 'The financial pathway must be explained and acknowledged before services begin — regardless of prior contact attempts. This protects both the patient and the office.',
  },
  // Patient communication
  {
    id: 'pc1', category: 'Patient Communication',
    prompt: 'Which of the following is an appropriate way to explain an HMO mismatch to a patient?',
    options: [{ key: 'a', text: '"You selected the wrong plan on Zocdoc."' }, { key: 'b', text: '"Your insurance won\'t cover you here."' }, { key: 'c', text: '"Your plan appears active, but it may require you to see a dental office assigned by the carrier."' }, { key: 'd', text: '"We can\'t see you today because of your insurance."' }],
    correct: 'c',
    explanation: 'Patient communication must be factual and non-blaming. Option C explains the finding accurately without implying the patient did something wrong.',
  },
  {
    id: 'pc2', category: 'Patient Communication',
    prompt: 'Which script is correct when a patient cannot be reached and they arrive with an unresolved insurance status?',
    options: [{ key: 'a', text: '"We tried calling but you never answered."' }, { key: 'b', text: '"We reviewed the information before your visit, but we were unable to reach you. Before we begin, we need to explain what we found and review your options."' }, { key: 'c', text: '"Your insurance is probably fine — let\'s get started."' }, { key: 'd', text: '"Since we couldn\'t reach you, we\'ll just bill as PPO and see what happens."' }],
    correct: 'b',
    explanation: 'Script 6 is the correct approach at arrival after an unreachable patient. It is calm, non-blaming, and ensures the pathway conversation happens before care begins.',
  },
  // Membership eligibility
  {
    id: 'me1', category: 'Membership Eligibility',
    prompt: 'A patient has an active PPO plan with benefits remaining. Can they use KYT Membership to get a 10% discount on their co-pay?',
    options: [{ key: 'a', text: 'Yes — membership and PPO can be combined' }, { key: 'b', text: 'No — active PPO benefits and membership cannot be stacked' }, { key: 'c', text: 'Yes — only for cleaning services' }, { key: 'd', text: 'Only with manager approval' }],
    correct: 'b',
    explanation: 'Membership cannot be combined with active PPO benefits. The patient uses one track per visit — PPO or membership, not both.',
  },
  {
    id: 'me2', category: 'Membership Eligibility',
    prompt: 'When is KYT Membership the preferred pathway for a patient with HMO coverage?',
    options: [{ key: 'a', text: 'Never — HMO patients must use their insurance' }, { key: 'b', text: 'When KYT is not the assigned HMO office and cannot bill the HMO plan' }, { key: 'c', text: 'Always — membership is always preferred over insurance' }, { key: 'd', text: 'Only when the HMO plan is expired' }],
    correct: 'b',
    explanation: 'When KYT is not the assigned HMO provider and cannot get paid through the plan, membership is the preferred pathway for the patient to receive preventive care at KYT.',
  },
  // Office error
  {
    id: 'oe1', category: 'Office Error',
    prompt: 'Staff told a patient their PPO was confirmed based on an Active response only. At checkout, the plan is confirmed DHMO. What should staff do?',
    options: [{ key: 'a', text: 'Collect full self-pay fees — the patient\'s plan is the issue' }, { key: 'b', text: 'Submit a PPO claim since the patient was told they were covered' }, { key: 'c', text: 'Acknowledge the office error, notify the manager, apply service-recovery policy, and do not bill falsely' }, { key: 'd', text: 'Tell the patient to dispute with their carrier' }],
    correct: 'c',
    explanation: 'The office made a representation that was incorrect. The correct response is to acknowledge the error, notify the manager, apply service-recovery policy, and never submit a false claim.',
  },
  {
    id: 'oe2', category: 'Office Error',
    prompt: 'What does "treat them as a PPO patient" mean in a service-recovery context?',
    options: [{ key: 'a', text: 'Submit a PPO claim for the visit' }, { key: 'b', text: 'Tell the patient their plan was PPO' }, { key: 'c', text: 'Apply management-approved service recovery to the patient\'s responsibility without misrepresenting the plan or submitting an inaccurate claim' }, { key: 'd', text: 'Write off all charges permanently' }],
    correct: 'c',
    explanation: '"Treat them as a PPO patient" means applying the service-recovery policy — not falsifying insurance or submitting an inaccurate claim. The insurance record must reflect the true plan.',
  },
  // Service recovery
  {
    id: 'sr1', category: 'Service Recovery',
    prompt: 'After a service-recovery adjustment, can staff ask for a 5-star review as a condition of the adjustment?',
    options: [{ key: 'a', text: 'Yes — it is a fair trade' }, { key: 'b', text: 'No — review requests must be made independently and must not be conditioned on any adjustment, discount, or gift' }, { key: 'c', text: 'Yes — as long as it is not in writing' }, { key: 'd', text: 'Only if the patient brings it up first' }],
    correct: 'b',
    explanation: 'Review requests must never be connected to financial adjustments, discounts, gifts, or service recovery. Any review request must be separate, ask only for honest feedback, and carry no conditions.',
  },
  // Review-request ethics
  {
    id: 'rr1', category: 'Review-Request Ethics',
    prompt: 'When is the appropriate time to send a review request?',
    options: [{ key: 'a', text: 'Immediately after any appointment, regardless of outcome' }, { key: 'b', text: 'After confirming the visit went well and the patient was not in a disputed or service-recovery situation' }, { key: 'c', text: 'Only after a 5-star appointment' }, { key: 'd', text: 'In exchange for a waived co-pay' }],
    correct: 'b',
    explanation: 'Review requests are appropriate after a successful visit with no disputes. They must never be connected to service recovery or financial adjustments.',
  },
  // Checkout and recall
  {
    id: 'co1', category: 'Checkout and Recall',
    prompt: 'An HMO patient was seen under office-owned service recovery. Should a standard 6-month insurance recall be scheduled?',
    options: [{ key: 'a', text: 'Yes — set it up as PPO' }, { key: 'b', text: 'No — do not schedule insurance-based recall for an HMO patient whose plan cannot be billed at KYT. Document clinical follow-up recommendations instead.' }, { key: 'c', text: 'Yes — they will fix their insurance by then' }, { key: 'd', text: 'Only if they pay a recall deposit' }],
    correct: 'b',
    explanation: 'A 6-month insurance recall should not be scheduled when the patient\'s HMO plan cannot be billed at KYT. The correct action is to document clinical recommendations, explain the assigned-office pathway, and offer records transfer.',
  },
]

// ---------------------------------------------------------------------------
// MANAGEMENT POLICY
// ---------------------------------------------------------------------------
export const managementPolicy = {
  zocdocResponseTimeTarget: 'Management confirmation required.',
  afterHoursHandling: 'Management confirmation required.',
  selfPayEmergencyFee: 'Management confirmation required.',
  membershipEligibilityRule: 'Patient must have no active dental insurance that can be billed at KYT. Eligibility must be confirmed before enrollment.',
  serviceRecoveryEligibility: 'Management confirmation required.',
  courtesyAdjustmentLimit: 'Management confirmation required.',
  servicesHonoredAfterVerificationError: 'Management confirmation required.',
  managerApprovalRequirements: 'Required for any service-recovery adjustment, write-off, or fee waiver.',
  recallForNonparticipatingInsurance: 'Clinical follow-up documented. Insurance-based recall not scheduled for HMO patients assigned elsewhere.',
  recordTransferWorkflow: 'Management confirmation required.',
  reviewRequestTiming: 'After confirming the visit was satisfactory and no disputes are pending. Never connected to adjustments or gifts.',
  goodieBagPolicy: 'Provided as an unconditional patient-care gesture. Never conditioned on a review.',
}

// ---------------------------------------------------------------------------
// GLOSSARY
// ---------------------------------------------------------------------------
export const glossary = [
  { term: 'Active Response', def: 'A return from an eligibility check indicating that a plan exists and may be currently in force. Does not confirm plan type, network status, or benefits.' },
  { term: 'Annual Maximum', def: 'The most an insurance plan will pay for covered services in a calendar year. Common amounts range from $1,000 to $2,000.' },
  { term: 'Assigned Office', def: 'The dental office designated by an HMO/DHMO carrier as the patient\'s primary provider. The patient must receive routine care at this office.' },
  { term: 'COB (Coordination of Benefits)', def: 'The process of determining which insurance plan pays first (primary) and which pays second (secondary) when a patient has dual coverage.' },
  { term: 'Deductible', def: 'The amount a patient must pay out of pocket before the insurance plan begins paying for covered services.' },
  { term: 'DentalXChange', def: 'An electronic dental claims and eligibility exchange platform used to verify insurance benefits beyond the practice management system\'s OS response.' },
  { term: 'DHMO', def: 'Dental Health Maintenance Organization. A plan type that assigns patients to a specific dental office and typically requires care through that assigned provider.' },
  { term: 'EOB (Explanation of Benefits)', def: 'A statement from the insurance carrier showing what was billed, what was covered, what was adjusted, and what the patient owes.' },
  { term: 'Eligibility', def: 'Confirmation that a specific patient is covered under a specific plan on a specific date of service.' },
  { term: 'HMO', def: 'Health Maintenance Organization. In dental, typically requires care through an assigned office and does not allow out-of-network PPO billing.' },
  { term: 'In-Network', def: 'A provider who has a contracted agreement with a specific insurance carrier to provide services at a negotiated rate.' },
  { term: 'Member ID', def: 'The identification number assigned by the insurance carrier to the subscriber or patient. Required to run eligibility.' },
  { term: 'Network Participation', def: 'Whether KYT has a current contract with the patient\'s insurance carrier that allows KYT to bill as an in-network provider.' },
  { term: 'OS', def: 'Operating System — the dental practice management software (e.g., Dentrix, Eaglesoft) used to manage patient records, scheduling, and billing.' },
  { term: 'Out-of-Network', def: 'A provider who does not have a contracted agreement with the patient\'s insurance carrier. Services may be covered at a lower rate or not at all.' },
  { term: 'PPO', def: 'Preferred Provider Organization. A plan type that allows patients to see participating providers at negotiated rates. Does not require an assigned office.' },
  { term: 'Plan Type', def: 'The category of dental insurance (PPO, HMO/DHMO, discount plan, Medicaid, indemnity) that determines how benefits are structured and how providers must be used.' },
  { term: 'Subscriber', def: 'The primary insured person on a dental plan. May be the patient or another individual (e.g., a spouse or parent).' },
  { term: 'UCR Fee', def: 'Usual, Customary, and Reasonable. The fee a carrier considers standard for a given procedure in a geographic area, used to calculate benefit payments.' },
  { term: 'Verification Level', def: 'The structured ladder of insurance verification: Level 0 (no information) through Level 4 (full benefit details confirmed).' },
  { term: 'Write-off', def: 'The difference between a provider\'s standard fee and the contracted rate with an insurance carrier. This amount is not billed to the patient.' },
  { term: 'Zocdoc', def: 'An online appointment booking platform. Bookings made through Zocdoc are not automatically imported into the KYT OS under the current workflow.' },
]

// ---------------------------------------------------------------------------
// SCORE TIER
// ---------------------------------------------------------------------------
export function scoreTier(score) {
  const pct = Math.round((score / 10) * 100)
  if (pct >= 90) return { title: 'New Patient Intake Guardian', tone: 'gold', detail: 'Excellent command of the full new-patient intake and eligibility workflow.', pct }
  if (pct >= 80) return { title: 'Strong Operator', tone: 'teal', detail: 'Solid performance. Review any missed questions to strengthen your verification approach.', pct }
  if (pct >= 70) return { title: 'Developing — Review Flagged Modules', tone: 'teal', detail: 'Developing foundation. Review the modules related to your missed questions before your next shift.', pct }
  return { title: 'Retraining Required', tone: 'red', detail: 'Several core concepts need reinforcement. Work through the flagged modules and retake the quiz.', pct }
}

// Existing exports preserved for backward compatibility
export const coreRule = '"Active" does not mean eligible for KYT PPO processing. Active is not verified.'

export const angelaCase = {
  name: 'Jordan Lee',
  dob: 'Fictional training scenario — no real patient information.',
  age: null,
  bookedVia: 'Zocdoc',
  daysAgo: 4,
  note: 'Fictional training scenario — no real patient information.',
  zocdocSelection: 'PPO',
  carrier: 'Example Carrier (fictional)',
  planName: 'Example Dental PPO (fictional)',
  memberId: 'Not specified',
  zocdocNetwork: 'In-network (per Zocdoc)',
  osCoverage: 'Active Coverage',
  osPlanIndicator: 'DHMO/HMO',
  intake: 'Not completed before visit',
}

export const requiredFields = [
  'Patient name', 'Date of birth', 'Carrier', 'Plan type', 'PPO vs HMO/DHMO',
  'Assigned dentist requirement', 'Member ID status', 'Effective date',
  'Network status', 'Zocdoc insurance selection', 'New patient intake completed or not',
  'Eligibility source and timestamp',
]

export const riskSignals = [
  { label: 'Insurance mismatch', detail: 'Zocdoc selection does not match the plan type returned by OS eligibility.' },
  { label: 'Verification failure', detail: 'Required fields — member ID, plan type, network status — are missing or unconfirmed.' },
  { label: 'Missing member ID', detail: 'Zocdoc shows "member ID not specified." Treat as Unverified, not Active.' },
  { label: 'Unsubmitted intake', detail: 'New patient intake form was not completed before the visit.' },
  { label: 'Same-day or near-date booking gap', detail: 'Zocdoc bookings are not auto-imported into the OS — a gap window exists for unverified coverage to slip through.' },
]

export const internalNote = 'When a Zocdoc selection does not match the carrier response, this is a verification mismatch — not evidence of intent. A patient may select PPO due to confusion, an outdated card, employer changes, a spouse\'s plan, or misunderstanding PPO versus HMO. Staff should investigate the mismatch without assuming intent. This term is for internal training only and is never used in front of or about a patient.'

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
  mismatch: 'Your plan is active, but it appears to be an HMO or assigned-office dental plan rather than PPO coverage. HMO plans generally require care through the dental office assigned by the carrier. We want to explain this before treatment so you can make an informed decision and avoid an unexpected cost.',
  options: 'Today you have a few options. You can contact your insurance to find or change your assigned HMO office. If you still want to be seen here today, we can present our self-pay options. If you do not have any active dental insurance that can be used here, you may also qualify for the KYT Membership Plan.',
}

export const mistakeRecoveryPolicy = [
  'Acknowledge the office\'s mistake directly. Do not blame the patient.',
  'Notify the office manager immediately.',
  'Correct the OS record to reflect the true insurance status.',
  'Apply the management-approved service-recovery policy.',
  'Do not submit a false PPO claim.',
  'Document any fee adjustment with manager approval.',
  'Provide any goodie bag as an unconditional patient-care gesture.',
  'Make any review request separately — ask only for honest feedback.',
]

// ---------------------------------------------------------------------------
// MODULE 16 — INDIVIDUAL PPO PLANS
// ---------------------------------------------------------------------------
export const ppoLessons = [
  {
    id: 'l1',
    num: '01',
    title: 'What is a PPO dental plan?',
    lede: 'The model behind almost every individual plan a patient will buy — and why it beats the alternatives for someone who wants to keep seeing us.',
    body: [
      'PPO stands for Preferred Provider Organization. It\'s a type of dental insurance built around a network of dentists who have agreed to accept the carrier\'s negotiated fees. The patient still gets to choose any licensed dentist, but they pay the least when they stay in-network — which is exactly why a PPO is the right answer for a patient who wants to keep coming to KYT.',
      'An individual PPO is simply a PPO a person buys for themselves, rather than getting it through an employer. They enroll directly with the carrier, pay a monthly premium, and the plan activates on a set effective date — sometimes the next business day. That speed is the whole pitch: a patient who lost their job, aged off a parent\'s plan, or is stuck in an employer waiting period can be covered before their next visit.',
    ],
    comparison: [
      { feature: 'Pick your dentist?', ppo: 'Any licensed dentist; cheapest in-network', hmo: 'Only an assigned in-network dentist', discount: 'Any dentist who honors the card', ppoBest: true, hmoBad: true },
      { feature: 'Is it insurance?', ppo: 'Yes — the plan pays a share of the bill', hmo: 'Yes — fixed copays per procedure', discount: 'No — just a discounted fee list', discountBad: true },
      { feature: 'How you pay', ppo: 'Coinsurance (a % of the cost)', hmo: 'Set copay per procedure', discount: 'You pay the full discounted fee' },
      { feature: 'Annual cap', ppo: 'Has an annual maximum', hmo: 'Usually no annual max', discount: 'No payout at all', discountBad: true },
      { feature: 'Best for', ppo: 'Keeping your dentist + real coverage on big work', hmo: 'Lowest premium if you\'ll switch dentists', discount: 'The uninsured who just want a lower cash price', ppoBest: true },
    ],
    script: 'A PPO lets you keep seeing us and still get insurance to pay a share of the work — an HMO would make you switch dentists, and a discount card isn\'t insurance at all.',
    markCompletePrompt: 'Got the model down? Mark this lesson complete.',
  },
  {
    id: 'l2',
    num: '02',
    title: 'How the coverage actually works',
    lede: 'Premium, deductible, coinsurance tiers, and the annual maximum — the four numbers that decide a patient\'s real bill.',
    body: [
      'Every PPO sorts dental work into three tiers and pays a different share of each. The pattern almost never changes — only the percentages and the fine print do.',
    ],
    tiers: [
      { pct: '100%', name: 'Preventive', ex: 'Cleanings, exams, x-rays. Usually free, day one.' },
      { pct: '~80%', name: 'Basic', ex: 'Fillings, simple extractions. You pay ~20%.' },
      { pct: '~50%', name: 'Major', ex: 'Crowns, root canals, dentures, implants. You pay ~half.' },
    ],
    analogy: 'Coinsurance is just how the bill gets split. On preventive the plan buys the whole meal; on basic you cover the tip; on major you split it down the middle. The cheaper the plan, the more of the major-work check the patient picks up — which is why premium alone never tells the story.',
    body2: [
      'The deductible is the patient\'s first out-of-pocket dollars on restorative work — usually about $50 — before the plan starts reimbursing. Preventive cleanings are almost always exempt.',
      'The annual maximum is the ceiling: the most the plan will pay in one plan year. Hit it, and everything after is 100% on the patient — even work the plan would normally cover at 80%. It resets each year. Plans range from a $1,000 cap (UHC) to $10,000 (MetLife).',
    ],
    workedExample: 'A patient needs a $1,200 crown on a plan that covers major at 50% with a $50 deductible and a $1,500 annual max. They pay the $50 deductible, then split the remaining $1,150 → the plan pays ~$575, the patient pays ~$575.',
    note: 'Many cheap plans phase major coverage — they pay 20% in Year 1 and step up to 50% in Year 2. Ameritas is the example. Great premium, but a patient who needs a crown immediately should know they\'ll only get 20% back this year.',
    markCompletePrompt: 'Comfortable reading a plan\'s four numbers? Mark complete.',
  },
  {
    id: 'l3',
    num: '03',
    title: 'Waiting periods — the part patients get wrong',
    lede: 'A plan can be active and still not pay for the work a patient needs. This is the single most important thing to explain honestly, up front.',
    body: [
      'A waiting period is the delay between the day coverage starts and the day a tier of treatment becomes usable. Preventive care almost always starts day one. Basic work often waits 0–3 months. Major work — crowns, root canals, implants — commonly waits 6–12 months.',
    ],
    analogy: 'Joining a PPO is like joining a gym. You can use the treadmill the day you sign up (that\'s preventive). The free-weights room opens a few weeks later (basic). But the personal-trainer-and-sauna package — the expensive stuff — doesn\'t unlock for months (major). The membership is real on day one; not every room is.',
    waitTimeline: [
      { label: 'Preventive', sub: 'cleanings, exams, x-rays', width: 8, tone: 'now', text: 'Day 1' },
      { label: 'Basic', sub: 'fillings, extractions', width: 34, tone: 'short', text: '0–3 months (varies)' },
      { label: 'Major', sub: 'crowns, root canals, implants', width: 92, tone: 'long', text: '6–12 months (varies)' },
    ],
    script: '"Your plan is active — but that doesn\'t always mean every service is usable yet. Let\'s confirm which treatments are covered today versus which ones have a waiting period, so there are no surprises when you sit in the chair."',
    body2: [
      'Why do waiting periods exist? They stop people from enrolling, getting a $2,000 crown, and cancelling the next month. The trade-off: no-wait plans charge a higher premium; long-wait plans are cheaper but lock the patient out of major coverage early.',
      'The practical move at the front desk: match the timeline to the treatment. A patient who needs a crown next month and a plan with a 12-month major wait is a mismatch you should catch before they enroll.',
    ],
    markCompletePrompt: 'Can you explain "active vs usable" in one breath? Mark complete.',
  },
  {
    id: 'l4',
    num: '04',
    title: 'The fine print patients deserve to hear',
    lede: 'The missing-tooth clause, frequency limits, and the difference between an effective date and a waiting period. Disclose these honestly — every time.',
    body: [
      'The missing-tooth clause is the one that burns patients most often. Many PPOs will not pay to replace a tooth that was already missing before the policy started. If a patient lost a molar last year and buys a plan today hoping to get an implant covered, the missing-tooth clause can deny it entirely.',
    ],
    script: '"Because that tooth was already missing before this policy starts, the plan likely won\'t cover the implant to replace it — that\'s the missing-tooth clause, and I want you to know it upfront. Let\'s request a pretreatment estimate in writing before you commit."',
    gotchas: [
      { label: 'Frequency limits', detail: 'Plans cap how often they\'ll pay: cleanings/exams ~2×/year, bitewing x-rays ~1×/year, a panoramic x-ray every 3–5 years, a crown once per 5–7 years per tooth. Do it early and the patient pays 100%. Always check the last service date.' },
      { label: 'Effective date ≠ waiting period', detail: 'The effective date is when coverage begins. The waiting period is when a tier becomes usable. A plan can be effective tomorrow yet still make a patient wait 12 months for a crown. Quote both separately.' },
    ],
    body2: [
      'Adult orthodontics is rare on individual PPOs — Delta is the one exception, and even then expect lifetime caps. And the annual maximum can run out mid-treatment: a big case can exhaust a $1,000 cap on a single crown, leaving the rest of the year at full price. Flag it before treatment, not after.',
    ],
    complianceNote: 'We\'re an independent practice, not affiliated with any carrier. We share plan facts and help patients find enrollment links — we never tell a patient which plan to buy as advice, interpret their coverage, or guarantee benefits. When a patient asks "which one should I buy?", hand off to a licensed agent and confirm all benefits with the carrier in writing.',
    markCompletePrompt: 'Know the missing-tooth line by heart? Mark complete.',
  },
  {
    id: 'l5',
    num: '05',
    title: 'The eight plans — which is good for what',
    lede: 'The whole shelf at a glance. Use the filter to match the patient\'s need to the right plan. Numbers are indicative — always confirm against the carrier\'s current Schedule of Benefits.',
    markCompletePrompt: 'Know the shelf well enough to match a walk-in? Mark complete, then take the PPO quiz.',
  },
]

export const ppoPlans = [
  {
    key: 'uhc', carrier: 'UnitedHealthcare', name: 'Primary Dental',
    monthly: 30, annualMax: 1000, score: 74,
    best: 'Cheapest on the shelf, basic care from day one (ages 64 and under).',
    bestSelling: true, vision: false,
    tags: ['cheap'],
    cov: { preventive: { pct: 100, wait: 0 }, basic: { pct: 50, wait: 0 }, major: null, implant: null },
    note: 'No major coverage at all; ages ≤64. Active in 1–3 business days.',
    fit: 'Just cleanings or a tight budget. A fast, cheap bridge after losing work coverage.',
  },
  {
    key: 'ameritas', carrier: 'Ameritas', name: 'PrimeStar Care Complete',
    monthly: 60, annualMax: 2000, score: 80,
    best: 'No waiting periods, and the only plan that covers bone grafts.',
    bestSelling: false, vision: false,
    tags: ['nowait'],
    cov: { preventive: { pct: 100, wait: 0 }, basic: { pct: 80, wait: 0 }, major: { pct: 20, wait: 0, note: '50% Year 2+' }, implant: null },
    note: 'Major pays just 20% in Year 1, then 50%. Active next business day.',
    fit: 'Needs work now. Crown or root canal soon and can\'t wait out a 12-month clock.',
  },
  {
    key: 'guardian', carrier: 'Guardian', name: 'Premier 2.0',
    monthly: 70, annualMax: 3000, score: 85,
    best: '85% basic from day one, plus whitening and kids\' braces.',
    bestSelling: true, vision: false,
    tags: ['ortho', 'implant'],
    cov: { preventive: { pct: 100, wait: 0 }, basic: { pct: 85, wait: 0 }, major: { pct: 50, wait: 12 }, implant: { pct: 50, wait: 12 } },
    note: 'Child ortho (<19) + whitening. Major/implant wait 12 mo. Activates 1st of month.',
    fit: 'Families. A filling today (85% day one) and a kid who may need braces.',
  },
  {
    key: 'delta', carrier: 'Delta Dental', name: 'PPO Individual Premium',
    monthly: 75, annualMax: 2000, score: 84,
    best: 'Orthodontics for braces and aligners — adults too — plus implants.',
    bestSelling: false, vision: false,
    tags: ['ortho', 'implant'],
    cov: { preventive: { pct: 100, wait: 0 }, basic: { pct: 80, wait: 6 }, major: { pct: 50, wait: 12 }, implant: { pct: 50, wait: 12 } },
    note: 'The only plan with adult ortho. Activates 1st or 15th (your choice).',
    fit: 'Adult Invisalign or braces. The one plan that covers orthodontics for grown-ups.',
  },
  {
    key: 'aetna', carrier: 'Aetna', name: 'Dental Direct',
    monthly: 50, annualMax: 1250, score: 77,
    best: 'Balanced coverage for everyday dental needs.',
    bestSelling: false, vision: false,
    tags: ['cheap'],
    cov: { preventive: { pct: 100, wait: 0 }, basic: { pct: 80, wait: 6 }, major: { pct: 50, wait: 12 }, implant: null },
    note: 'Solid mid-tier fallback for a patient who can wait. Activates 1st of month.',
    fit: 'Balanced & can wait. Reliable everyday coverage at a moderate premium.',
  },
  {
    key: 'moo', carrier: 'Mutual of Omaha', name: 'Dental Preferred',
    monthly: 90, annualMax: 5000, score: 83,
    best: 'High $5,000 maximum with implant coverage.',
    bestSelling: false, vision: false,
    tags: ['implant', 'highmax'],
    cov: { preventive: { pct: 100, wait: 0 }, basic: { pct: 80, wait: 0 }, major: { pct: 50, wait: 6 }, implant: { pct: 50, wait: 12 } },
    note: 'Big $5,000 cap. Underwritten by TruAssure. Active in 1–3 business days.',
    fit: 'Big case / implants. Lots of major work where a low annual cap would run out.',
  },
  {
    key: 'humana', carrier: 'Humana', name: 'Extend 5000',
    monthly: 100, annualMax: 5000, score: 86,
    best: 'Dental, vision, and a $200/yr whitening allowance, with faster implants.',
    bestSelling: false, vision: true,
    tags: ['implant', 'highmax'],
    cov: { preventive: { pct: 100, wait: 0 }, basic: { pct: 80, wait: 3 }, major: { pct: 50, wait: 6 }, implant: { pct: 50, wait: 6 } },
    note: 'Fastest implant ramp (6 mo) + vision + whitening allowance. $75 deductible.',
    fit: 'Implants, fast. Shortest major/implant wait, plus vision perks.',
  },
  {
    key: 'metlife', carrier: 'MetLife', name: 'NCD Complete',
    monthly: null, annualMax: 10000, score: null,
    best: 'Highest annual maximum on the shelf ($10,000).',
    bestSelling: false, vision: false, review: true,
    tags: ['highmax'],
    cov: { preventive: { pct: 100, wait: 0 }, basic: null, major: null, implant: null },
    note: 'Priced around $100/mo. Effectiveness still under review.',
    fit: 'Highest max — pending. Biggest ceiling on the board, gathering reviews.',
  },
]

export const ppoFilters = [
  { key: 'all', label: 'All plans' },
  { key: 'cheap', label: 'Tight budget' },
  { key: 'nowait', label: 'Work now / no wait' },
  { key: 'implant', label: 'Implants' },
  { key: 'ortho', label: 'Braces / Invisalign' },
  { key: 'highmax', label: 'High annual max' },
]

export const ppoFilterFns = {
  cheap: p => ['uhc', 'aetna'].includes(p.key),
  nowait: p => ['ameritas', 'guardian', 'moo', 'uhc'].includes(p.key),
  implant: p => !!p.cov.implant,
  ortho: p => ['guardian', 'delta'].includes(p.key),
  highmax: p => p.annualMax >= 5000,
}

export const ppoMatchGuide = [
  { need: 'Just cleanings / tight budget', pick: 'UHC — cheapest, preventive + basic day one.' },
  { need: 'A filling, soon', pick: 'Guardian (85% day one) or Ameritas (no wait).' },
  { need: 'Crown or root canal soon', pick: 'Ameritas (no waiting period) or Humana (major at 6 mo).' },
  { need: 'An implant', pick: 'Humana (fastest, 6 mo + vision) or Mutual of Omaha ($5k max).' },
  { need: 'Kid needs braces', pick: 'Guardian — child ortho under 19.' },
  { need: 'Adult Invisalign / braces', pick: 'Delta — the only adult ortho plan.' },
  { need: 'Just lost work coverage', pick: 'UHC (fast, cheap bridge) or Ameritas (no waits).' },
  { need: 'Lots of big work / high max', pick: 'Mutual of Omaha or Humana ($5k); MetLife $10k (pending).' },
]

// ---------------------------------------------------------------------------
// MODULE 17 — PPO QUIZ (10 questions, separate from the main 30-question bank)
// ---------------------------------------------------------------------------
export const ppoQuizBank = [
  {
    id: 'ppo-01',
    category: 'PPO Fundamentals',
    prompt: 'A patient wants to keep seeing us at KYT and still have insurance pay a share of their crown. Which model fits?',
    options: [
      { key: 'a', text: 'A PPO plan' },
      { key: 'b', text: 'A dental HMO' },
      { key: 'c', text: 'A discount card' },
      { key: 'd', text: 'None — they must pay cash' },
    ],
    correct: 'a',
    explanation: 'A PPO lets the patient choose any licensed dentist (so they can stay with us) while the plan pays a share of covered work. An HMO would assign them a different in-network dentist; a discount card isn\'t insurance.',
  },
  {
    id: 'ppo-02',
    category: 'Coverage Tiers',
    prompt: 'On a typical PPO, what share does the plan usually cover for major work like a crown or root canal?',
    options: [
      { key: 'a', text: '100%' },
      { key: 'b', text: '~80%' },
      { key: 'c', text: '~50%' },
      { key: 'd', text: '0%' },
    ],
    correct: 'c',
    explanation: 'The standard tier pattern is 100% preventive, ~80% basic, ~50% major. The patient generally splits the major-work bill with the plan.',
  },
  {
    id: 'ppo-03',
    category: 'Waiting Periods',
    prompt: 'A patient says "my plan is active, so the crown is covered, right?" What\'s the honest answer?',
    options: [
      { key: 'a', text: 'Yes, active means everything is usable' },
      { key: 'b', text: 'Not necessarily — major work may still have a waiting period' },
      { key: 'c', text: 'Only if they paid the deductible' },
      { key: 'd', text: 'Only in-network' },
    ],
    correct: 'b',
    explanation: 'Active is not the same as usable. A plan can be effective immediately yet still impose a 6–12 month waiting period on major services. Always confirm which tiers are usable today.',
  },
  {
    id: 'ppo-04',
    category: 'Fine Print',
    prompt: 'A patient lost a molar last year and wants an implant covered by a plan they\'d buy today. What must you disclose?',
    options: [
      { key: 'a', text: 'Nothing — implants are always covered' },
      { key: 'b', text: 'The missing-tooth clause may deny it' },
      { key: 'c', text: 'They just need to wait 30 days' },
      { key: 'd', text: 'Implants are preventive care' },
    ],
    correct: 'b',
    explanation: 'The missing-tooth clause excludes replacing teeth lost before the policy\'s effective date. Disclose it upfront and request a pretreatment estimate in writing.',
  },
  {
    id: 'ppo-05',
    category: 'Plan Matching',
    prompt: 'A patient needs a crown next month and has a tight timeline. Which plan best avoids a long major-work wait?',
    options: [
      { key: 'a', text: 'UHC Primary Dental' },
      { key: 'b', text: 'Aetna Dental Direct' },
      { key: 'c', text: 'Ameritas PrimeStar Care Complete' },
      { key: 'd', text: 'MetLife NCD Complete' },
    ],
    correct: 'c',
    explanation: 'Ameritas has no waiting periods (though major pays 20% in Year 1). UHC doesn\'t cover major at all; Aetna waits 12 months on major; MetLife is still under review.',
  },
  {
    id: 'ppo-06',
    category: 'Plan Matching',
    prompt: 'Which plan is the right pointer for an adult who wants Invisalign?',
    options: [
      { key: 'a', text: 'Delta Dental PPO Individual Premium' },
      { key: 'b', text: 'Guardian Premier 2.0' },
      { key: 'c', text: 'UHC Primary Dental' },
      { key: 'd', text: 'Humana Extend 5000' },
    ],
    correct: 'a',
    explanation: 'Delta is the only plan that covers orthodontics for adults. Guardian covers child ortho (under 19) only.',
  },
  {
    id: 'ppo-07',
    category: 'Plan Matching',
    prompt: 'A patient wants an implant as fast as possible and likes the idea of vision perks. Best pointer?',
    options: [
      { key: 'a', text: 'UHC Primary Dental' },
      { key: 'b', text: 'Humana Extend 5000' },
      { key: 'c', text: 'Aetna Dental Direct' },
      { key: 'd', text: 'Guardian Premier 2.0' },
    ],
    correct: 'b',
    explanation: 'Humana Extend 5000 has the fastest implant ramp (6-month wait), a $5,000 max, plus bundled vision and a whitening allowance.',
  },
  {
    id: 'ppo-08',
    category: 'Coverage Tiers',
    prompt: 'What does the annual maximum do once a patient hits it mid-year?',
    options: [
      { key: 'a', text: 'It doubles for the rest of the year' },
      { key: 'b', text: 'Nothing changes' },
      { key: 'c', text: 'Further covered work is 100% out of pocket until it resets' },
      { key: 'd', text: 'The plan cancels' },
    ],
    correct: 'c',
    explanation: 'The annual maximum is the ceiling on what the plan pays per plan year. After it\'s reached, the patient pays 100% until it resets the next plan year.',
  },
  {
    id: 'ppo-09',
    category: 'Plan Matching',
    prompt: 'A patient just lost their job and wants something cheap and fast as a bridge to new coverage. Best pointer?',
    options: [
      { key: 'a', text: 'MetLife NCD Complete' },
      { key: 'b', text: 'Delta Dental' },
      { key: 'c', text: 'UHC Primary Dental' },
      { key: 'd', text: 'Mutual of Omaha' },
    ],
    correct: 'c',
    explanation: 'UHC is the cheapest on the shelf and active in 1–3 business days with preventive and basic from day one — a clean short-term bridge. Ameritas is the no-wait alternative.',
  },
  {
    id: 'ppo-10',
    category: 'Compliance',
    prompt: 'A patient asks you point-blank, "Which plan should I buy?" What\'s the compliant move?',
    options: [
      { key: 'a', text: 'Recommend the highest-rated plan' },
      { key: 'b', text: 'Tell them to buy the cheapest' },
      { key: 'c', text: 'Share the facts, then hand off to a licensed agent' },
      { key: 'd', text: 'Guarantee the benefits of one plan' },
    ],
    correct: 'c',
    explanation: 'We educate and compare, but we don\'t sell or advise. Hand off to a licensed agent for the actual "which to buy" decision and confirm benefits with the carrier — that\'s the compliant path.',
  },
]
