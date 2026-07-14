// ---------------------------------------------------------------------------
// ECL Referral Assistant — pathway configuration.
//
// Everything about the questions, options and pathway wording lives here so
// the flow can be edited or extended without touching component code.
//
// Shape (documented via JSDoc since the project is plain JS, not TS):
//
// ReferralPathway =
//   'cataract' | 'rle' | 'laser' | 'icl' | 'dry-eye' | 'corneal' | 'general'
//
// ReferralOption = {
//   id: string,
//   label: string,
//   icon: string,               // lucide-react icon name
//   urgent?: boolean,           // flags an urgent-symptom option
//   terminal?: 'discuss' | 'refer', // short-circuits straight to an action
//   pathwaySignals?: Partial<Record<ReferralPathway, number>>,
//   reasons?: Partial<Record<ReferralPathway, string>>, // "why this pathway" bullet copy
// }
//
// ReferralQuestion = {
//   id: string,
//   type: 'single' | 'multiple',
//   title: string,
//   description?: string,
//   options: ReferralOption[],
// }
// ---------------------------------------------------------------------------

export const QUESTIONS = {
  urgency: {
    id: 'urgency',
    type: 'multiple',
    title: 'Before we begin, are there any sudden or severe symptoms?',
    description: 'Select any that apply to this patient right now.',
    options: [
      { id: 'sudden-vision-loss', label: 'Sudden significant loss of vision', icon: 'AlertTriangle', urgent: true },
      { id: 'severe-pain', label: 'Severe eye pain', icon: 'AlertTriangle', urgent: true },
      { id: 'trauma', label: 'Recent significant eye trauma', icon: 'AlertTriangle', urgent: true },
      { id: 'none', label: 'None of the above', icon: 'CheckCircle2', exclusive: true },
      { id: 'unsure', label: 'Unsure', icon: 'CircleHelp', exclusive: true },
    ],
  },

  concern: {
    id: 'concern',
    type: 'single',
    title: "What best describes the patient's main concern?",
    options: [
      { id: 'cloudy', label: 'Cloudy, blurry or reduced vision', icon: 'Eye', reasons: { cataract: 'The primary concern relates to cloudy or reduced vision.' } },
      {
        id: 'freedom',
        label: 'Would like greater freedom from glasses or contact lenses',
        icon: 'Glasses',
        reasons: {
          laser: 'The primary concern relates to wanting greater freedom from glasses or contact lenses.',
          icl: 'The primary concern relates to wanting greater freedom from glasses or contact lenses.',
          rle: 'The primary concern relates to wanting greater freedom from glasses or contact lenses.',
        },
      },
      { id: 'near', label: 'Struggling with reading or near vision', icon: 'BookOpen', reasons: { rle: 'The primary concern relates to reading or near vision.' } },
      { id: 'dry', label: 'Dry, uncomfortable, irritated or watery eyes', icon: 'Droplets', pathwaySignals: { 'dry-eye': 3 }, reasons: { 'dry-eye': 'The primary concern relates to dry, uncomfortable or watery eyes.' } },
      { id: 'corneal', label: 'Concern about the cornea or front surface of the eye', icon: 'ScanEye', pathwaySignals: { corneal: 3 }, reasons: { corneal: 'The primary concern relates to the cornea or front surface of the eye.' } },
      { id: 'unsure', label: "Something else or I'm unsure", icon: 'CircleHelp' },
    ],
  },

  // ---- Pathway 1: cloudy / blurry / reduced vision ----
  cataract_told: {
    id: 'cataract_told',
    type: 'single',
    title: 'Has the patient been told they may have cataracts?',
    options: [
      { id: 'yes', label: 'Yes', icon: 'CheckCircle2', pathwaySignals: { cataract: 3 }, reasons: { cataract: 'Cataract has previously been mentioned or suspected.' } },
      { id: 'no', label: 'No', icon: 'X', pathwaySignals: { general: 1 } },
      { id: 'unsure', label: 'Unsure', icon: 'CircleHelp', pathwaySignals: { cataract: 1, general: 1 } },
    ],
  },
  cataract_age: {
    id: 'cataract_age',
    type: 'single',
    title: "Which age range best describes the patient?",
    options: [
      { id: 'under-40', label: 'Under 40', icon: 'User', pathwaySignals: { general: 1 } },
      { id: '40-49', label: '40–49', icon: 'User', pathwaySignals: { rle: 1 } },
      { id: '50-59', label: '50–59', icon: 'User', pathwaySignals: { cataract: 1, rle: 1 } },
      { id: '60-plus', label: '60+', icon: 'User', pathwaySignals: { cataract: 2 } },
      { id: 'prefer-not-to-say', label: 'Prefer not to say', icon: 'CircleHelp' },
    ],
  },
  cataract_goal: {
    id: 'cataract_goal',
    type: 'single',
    title: "What is the patient's main goal?",
    options: [
      { id: 'improve-vision', label: 'Improve vision affected by suspected cataracts', icon: 'Eye', pathwaySignals: { cataract: 3 }, reasons: { cataract: 'The patient is interested in exploring options to improve their vision.' } },
      { id: 'reduce-dependence', label: 'Reduce dependence on glasses as well as improve vision', icon: 'Glasses', pathwaySignals: { rle: 3, cataract: 1 }, reasons: { rle: 'The patient would also like to reduce their dependence on glasses.' } },
      { id: 'specialist-opinion', label: 'Obtain a specialist opinion', icon: 'Stethoscope', pathwaySignals: { general: 3 }, reasons: { general: 'The patient is looking to obtain a specialist opinion.' } },
      { id: 'unsure', label: 'Unsure', icon: 'CircleHelp', pathwaySignals: { general: 1 } },
    ],
  },

  // ---- Pathway 2: freedom from glasses / contact lenses ----
  freedom_age: {
    id: 'freedom_age',
    type: 'single',
    title: 'Which age range best describes the patient?',
    options: [
      { id: '18-39', label: '18–39', icon: 'User', pathwaySignals: { laser: 2, icl: 2 } },
      { id: '40-49', label: '40–49', icon: 'User', pathwaySignals: { laser: 1, icl: 1, rle: 1 } },
      { id: '50-59', label: '50–59', icon: 'User', pathwaySignals: { rle: 2, laser: 1 } },
      { id: '60-plus', label: '60+', icon: 'User', pathwaySignals: { rle: 3 }, reasons: { rle: "The patient's age range means Refractive Lens Exchange may be worth exploring." } },
      { id: 'prefer-not-to-say', label: 'Prefer not to say', icon: 'CircleHelp' },
    ],
  },
  freedom_correction: {
    id: 'freedom_correction',
    type: 'single',
    title: "What type of visual correction do they currently use?",
    options: [
      { id: 'glasses', label: 'Glasses', icon: 'Glasses', pathwaySignals: { laser: 1, rle: 1 } },
      { id: 'contacts', label: 'Contact lenses', icon: 'Contact', pathwaySignals: { laser: 1, icl: 1 } },
      { id: 'both', label: 'Both glasses and contact lenses', icon: 'Glasses', pathwaySignals: { laser: 1, icl: 1, rle: 1 } },
      { id: 'neither', label: 'Neither', icon: 'X', pathwaySignals: { general: 1 } },
      { id: 'unsure', label: 'Unsure', icon: 'CircleHelp' },
    ],
  },
  freedom_unsuitable: {
    id: 'freedom_unsuitable',
    type: 'single',
    title: 'Have they previously been told they are unsuitable for laser eye surgery?',
    options: [
      {
        id: 'yes',
        label: 'Yes',
        icon: 'CheckCircle2',
        pathwaySignals: { icl: 3, laser: -3 },
        reasons: { icl: 'The patient has previously been told laser eye surgery may not be suitable, so an implantable contact lens may be worth discussing as an alternative.' },
      },
      { id: 'no', label: 'No', icon: 'X', pathwaySignals: { laser: 1 } },
      { id: 'unsure', label: 'Unsure', icon: 'CircleHelp' },
    ],
  },
  freedom_priority: {
    id: 'freedom_priority',
    type: 'single',
    title: "What appears to be their main priority?",
    options: [
      { id: 'distance-freedom', label: 'Freedom from glasses for distance vision', icon: 'Eye', pathwaySignals: { laser: 3 }, reasons: { laser: 'The main priority is freedom from glasses for distance vision.' } },
      { id: 'range-independence', label: 'Greater independence from glasses across a range of distances', icon: 'Sparkles', pathwaySignals: { rle: 2, icl: 1 }, reasons: { rle: 'The patient is looking for independence from glasses across a range of distances.' } },
      { id: 'alternatives-to-cl', label: 'Explore alternatives to contact lenses', icon: 'Contact', pathwaySignals: { icl: 3 }, reasons: { icl: 'The patient is keen to explore alternatives to contact lenses.' } },
      { id: 'understand-options', label: 'Simply understand their options', icon: 'CircleHelp', pathwaySignals: { general: 2, laser: 1 } },
    ],
  },

  // ---- Pathway 3: reading / near vision ----
  near_age: {
    id: 'near_age',
    type: 'single',
    title: 'Which age range best describes the patient?',
    options: [
      { id: 'under-40', label: 'Under 40', icon: 'User', pathwaySignals: { general: 1 } },
      { id: '40-49', label: '40–49', icon: 'User', pathwaySignals: { rle: 1 } },
      { id: '50-59', label: '50–59', icon: 'User', pathwaySignals: { rle: 2 } },
      { id: '60-plus', label: '60+', icon: 'User', pathwaySignals: { rle: 2, cataract: 1 } },
      { id: 'prefer-not-to-say', label: 'Prefer not to say', icon: 'CircleHelp' },
    ],
  },
  near_reduce: {
    id: 'near_reduce',
    type: 'single',
    title: 'Does the patient also want to reduce their dependence on glasses?',
    options: [
      { id: 'yes', label: 'Yes', icon: 'CheckCircle2', pathwaySignals: { rle: 3 }, reasons: { rle: 'The patient would like to reduce their dependence on glasses as well as improve near vision.' } },
      { id: 'no', label: 'No', icon: 'X', pathwaySignals: { general: 2 } },
      { id: 'maybe', label: 'Maybe / would like to explore options', icon: 'CircleHelp', pathwaySignals: { rle: 1, general: 1 } },
    ],
  },
  near_cataract: {
    id: 'near_cataract',
    type: 'single',
    title: 'Have they been diagnosed with cataracts?',
    options: [
      { id: 'yes', label: 'Yes', icon: 'CheckCircle2', pathwaySignals: { cataract: 3 }, reasons: { cataract: 'The patient has previously been diagnosed with cataracts.' } },
      { id: 'no', label: 'No', icon: 'X', pathwaySignals: { rle: 1 } },
      { id: 'unsure', label: 'Unsure', icon: 'CircleHelp', pathwaySignals: { cataract: 1, rle: 1 } },
    ],
  },

  // ---- Pathway 4: dry / uncomfortable eyes ----
  dry_symptoms: {
    id: 'dry_symptoms',
    type: 'multiple',
    title: 'Which symptoms are most relevant?',
    description: 'Select all that apply.',
    options: [
      { id: 'dryness', label: 'Dryness', icon: 'Droplets', pathwaySignals: { 'dry-eye': 1 }, reasons: { 'dry-eye': 'Dryness was noted as a relevant symptom.' } },
      { id: 'burning', label: 'Burning or stinging', icon: 'Droplets', pathwaySignals: { 'dry-eye': 1 }, reasons: { 'dry-eye': 'Burning or stinging was noted as a relevant symptom.' } },
      { id: 'redness', label: 'Redness', icon: 'Droplets', pathwaySignals: { 'dry-eye': 1 } },
      { id: 'watery', label: 'Watery eyes', icon: 'Droplets', pathwaySignals: { 'dry-eye': 1 } },
      { id: 'grittiness', label: 'Grittiness or foreign body sensation', icon: 'Droplets', pathwaySignals: { 'dry-eye': 1 } },
      { id: 'fluctuating-vision', label: 'Fluctuating vision', icon: 'Eye', pathwaySignals: { 'dry-eye': 1 } },
      { id: 'cl-discomfort', label: 'Contact lens discomfort', icon: 'Contact', pathwaySignals: { 'dry-eye': 1 } },
      { id: 'unsure', label: 'Unsure', icon: 'CircleHelp', pathwaySignals: { 'dry-eye': 1 }, exclusive: true },
    ],
  },
  dry_tried: {
    id: 'dry_tried',
    type: 'single',
    title: 'Has the patient already tried treatments such as artificial tears, warm compresses or lid hygiene?',
    options: [
      { id: 'yes', label: 'Yes', icon: 'CheckCircle2', pathwaySignals: { 'dry-eye': 2 }, reasons: { 'dry-eye': 'The patient has already tried standard measures such as artificial tears or lid hygiene.' } },
      { id: 'no', label: 'No', icon: 'X', pathwaySignals: { 'dry-eye': 1 } },
      { id: 'unsure', label: 'Unsure', icon: 'CircleHelp', pathwaySignals: { 'dry-eye': 1 } },
    ],
  },
  dry_persistent: {
    id: 'dry_persistent',
    type: 'single',
    title: 'Are the symptoms persistent or affecting everyday activities?',
    options: [
      { id: 'yes', label: 'Yes', icon: 'CheckCircle2', pathwaySignals: { 'dry-eye': 3 }, reasons: { 'dry-eye': 'The symptoms are described as persistent or affecting everyday activities.' } },
      { id: 'no', label: 'No', icon: 'X', pathwaySignals: { 'dry-eye': 1 } },
      { id: 'unsure', label: 'Unsure', icon: 'CircleHelp', pathwaySignals: { 'dry-eye': 1 } },
    ],
  },

  // ---- Pathway 5: corneal concerns ----
  corneal_reason: {
    id: 'corneal_reason',
    type: 'single',
    title: 'What best describes the reason for referral?',
    options: [
      { id: 'known-suspected', label: 'Known or suspected corneal condition', icon: 'ScanEye', pathwaySignals: { corneal: 3 }, reasons: { corneal: 'There is a known or suspected corneal condition.' } },
      { id: 'irregular-cornea', label: 'Irregular cornea', icon: 'ScanEye', pathwaySignals: { corneal: 3 }, reasons: { corneal: 'The cornea has been described as irregular.' } },
      { id: 'previous-surgery', label: 'Previous corneal surgery', icon: 'ScanEye', pathwaySignals: { corneal: 3 }, reasons: { corneal: 'The patient has a history of previous corneal surgery.' } },
      { id: 'scarring', label: 'Corneal scarring or reduced vision', icon: 'ScanEye', pathwaySignals: { corneal: 3 }, reasons: { corneal: 'Corneal scarring or reduced vision has been noted.' } },
      { id: 'recurrent-discomfort', label: 'Recurrent discomfort or surface problems', icon: 'Droplets', pathwaySignals: { corneal: 2, 'dry-eye': 1 }, reasons: { corneal: 'The patient has recurrent discomfort or surface problems.' } },
      { id: 'second-opinion', label: 'Second opinion', icon: 'MessageCircle', pathwaySignals: { corneal: 1, general: 2 } },
      { id: 'unsure', label: 'Unsure', icon: 'CircleHelp', pathwaySignals: { corneal: 1, general: 1 } },
    ],
  },
  corneal_severity: {
    id: 'corneal_severity',
    type: 'single',
    title: 'Is the patient experiencing sudden or severe symptoms?',
    options: [
      { id: 'yes', label: 'Yes', icon: 'AlertTriangle', urgent: true },
      { id: 'no', label: 'No', icon: 'X', pathwaySignals: { corneal: 1 } },
      { id: 'unsure', label: 'Unsure', icon: 'CircleHelp' },
    ],
  },

  // ---- Pathway 6: something else / unsure ----
  unsure_help: {
    id: 'unsure_help',
    type: 'single',
    title: 'What would be most helpful?',
    options: [
      { id: 'specialist-opinion', label: 'A specialist opinion', icon: 'Stethoscope', pathwaySignals: { general: 3 }, reasons: { general: 'A specialist opinion was identified as the most helpful next step.' } },
      { id: 'identify-service', label: 'Help identifying the most appropriate ECL service', icon: 'Compass', pathwaySignals: { general: 3 }, reasons: { general: 'Help identifying the most appropriate ECL service was requested.' } },
      { id: 'discuss-case', label: 'Discussing the case before making a referral', icon: 'MessageCircle', terminal: 'discuss' },
      { id: 'refer-directly', label: 'Referring the patient directly', icon: 'Send', terminal: 'refer' },
    ],
  },
};

// Ordered list of question ids that follow the initial concern selection,
// keyed by the concern option chosen at the `concern` question.
export const CONCERN_BRANCHES = {
  cloudy: ['cataract_told', 'cataract_age', 'cataract_goal'],
  freedom: ['freedom_age', 'freedom_correction', 'freedom_unsuitable', 'freedom_priority'],
  near: ['near_age', 'near_reduce', 'near_cataract'],
  dry: ['dry_symptoms', 'dry_tried', 'dry_persistent'],
  corneal: ['corneal_reason', 'corneal_severity'],
  unsure: ['unsure_help'],
};

export const PATHWAYS = {
  cataract: {
    id: 'cataract',
    title: 'Cataract Pathway',
    icon: 'Eye',
    summary:
      "Based on the broad information provided, the ECL Cataract Pathway may be relevant to discuss with this patient. A specialist assessment would be required to understand the patient's individual circumstances and determine appropriate options.",
  },
  rle: {
    id: 'rle',
    title: 'Refractive Lens Exchange Pathway',
    icon: 'Sparkles',
    summary:
      'Based on the broad information provided, Refractive Lens Exchange may be worth exploring as a pathway to discuss. A specialist assessment can help determine whether this could be an appropriate option.',
  },
  laser: {
    id: 'laser',
    title: 'Laser Vision Correction Pathway',
    icon: 'Zap',
    summary:
      'Based on the broad information provided, Laser Vision Correction may be a relevant pathway to discuss. A specialist assessment would help determine which options, if any, could be appropriate.',
  },
  icl: {
    id: 'icl',
    title: 'Implantable Contact Lens Pathway',
    icon: 'ScanEye',
    summary:
      'Based on the broad information provided, an Implantable Contact Lens pathway may be one option worth discussing. This does not indicate clinical suitability — a specialist assessment would be needed to explore this further.',
  },
  'dry-eye': {
    id: 'dry-eye',
    title: 'Dry Eye Assessment Pathway',
    icon: 'Droplets',
    summary:
      "Based on the information provided, an ECL Dry Eye Assessment may be a relevant pathway to discuss. The assessment can help investigate contributing factors and explore appropriate management options based on the individual's findings.",
  },
  corneal: {
    id: 'corneal',
    title: 'Corneal Specialist Assessment',
    icon: 'ScanEye',
    summary:
      'Based on the broad information provided, a specialist corneal assessment at Eye Clinic London may be relevant to discuss.',
  },
  general: {
    id: 'general',
    title: 'General Specialist Ophthalmology Assessment',
    icon: 'Stethoscope',
    summary:
      'The information provided does not point clearly towards one specific pathway. A general discussion or specialist assessment may help determine the most appropriate next step.',
    // Alternate wording used for the same underlying "general" pathway when
    // reached via a specific branch, so the copy still reads naturally.
    contextualTitles: {
      freedom: 'Refractive Surgery Assessment',
      near: 'General Refractive Assessment',
    },
  },
};

export const URGENT_MESSAGE =
  'This referral assistant is not intended for urgent or emergency eye conditions. Please follow the appropriate local urgent or emergency ophthalmology pathway where clinically indicated.';

export const ASSISTANT_DISCLAIMER =
  'The ECL Referral Assistant provides general pathway guidance based on the information selected. It does not provide a diagnosis, assess clinical suitability, replace professional clinical judgement or provide emergency medical advice.';
