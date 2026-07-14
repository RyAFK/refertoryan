// ---------- Clinical Education content ----------
// Frontend-only mock content. No PII is collected or stored anywhere in this module.

export const CONTACT = {
  name: 'Ryan',
  role: 'Business Development Manager',
  email: 'ryan@eyecliniclondon.com',
  phoneDisplay: '07340 890 623',
  phoneHref: 'tel:+447340890623',
};

export const TREATMENT_AREAS = [
  'Cataract assessment',
  'Refractive Lens Exchange (RLE)',
  'ICL',
  'Laser Vision Correction',
  'Premium IOL query',
  'Post-operative care',
  'Dry eye',
  'Not sure / general enquiry',
];

export const AGE_RANGES = ['Under 40', '40s', '50s', '60s', '70s', '80 and over'];

const GUIDE_CONTENTS = [
  'Common patient symptoms to look out for',
  'Clinical indicators worth noting',
  'Lifestyle impact questions to consider',
  'Useful information to include in your referral',
  'Questions worth asking the patient',
  'What happens after the referral is received',
  'How to discuss the referral with your patient',
];

export const MODULES = [
  {
    id: 'cataract-referral',
    title: 'When should I refer for cataract surgery?',
    cardDescription: 'Recognise when symptoms, visual function and lifestyle impact may justify further ophthalmic assessment.',
    estimatedMinutes: 8,
    icon: 'Eye',
    opening: {
      question: 'Have you seen a patient recently whose vision is technically acceptable on the chart, but who is increasingly struggling with glare, driving, reading or daily activities?',
      support: 'This may be the type of patient worth considering for further ophthalmic assessment. Let’s explore why.',
    },
    video: {
      label: '5-minute clinical overview',
      description: 'A quick practical overview of the key clinical considerations, patient conversations and referral opportunities relating to cataract.',
    },
    indicators: {
      heading: 'What should I look out for?',
      items: [
        'Increasing glare or haloes, particularly when driving at night.',
        'Declining quality of vision despite updated spectacle correction.',
        'Difficulty reading, recognising faces or performing everyday activities.',
        'Reduced contrast or increased dependence on brighter lighting.',
        'Lifestyle or occupational limitations caused by declining vision.',
        'A patient actively expressing frustration with their current vision.',
      ],
    },
    conversation: {
      heading: 'How could I introduce this conversation to my patient?',
      examples: [
        'You’ve mentioned that glare and night driving are becoming increasingly difficult. Although your glasses are helping as much as possible, it may be worth arranging a specialist assessment to explore whether your cataracts are beginning to affect your quality of vision.',
        'Your prescription hasn’t changed much, but you’re telling me daily tasks feel harder than they used to. That mismatch is sometimes worth having assessed by an ophthalmologist.',
        'Many patients don’t realise that cataracts can affect quality of vision before it shows up as a big change on the chart. A specialist assessment could help clarify what’s contributing to what you’re noticing.',
      ],
    },
    caseStudy: {
      scenario: 'A 67-year-old patient reports increasing glare when driving at night and difficulty reading despite a recent spectacle update. Their vision has gradually declined and early cataracts have previously been documented.',
      question: 'What would you consider doing next?',
      options: [
        { label: 'Continue routine monitoring only.', tone: 'poor', feedback: 'Given the lifestyle impact already being reported, monitoring alone may delay a conversation the patient could benefit from having sooner. Consider whether a specialist assessment would give them more clarity.' },
        { label: 'Discuss whether a specialist ophthalmology assessment may be appropriate.', tone: 'good', feedback: 'This is a balanced option — it opens the door to further assessment without making any promises about treatment, and lets the patient make an informed decision.' },
        { label: 'Recommend a specific surgical treatment immediately.', tone: 'poor', feedback: 'Recommending a specific treatment isn’t within scope for a referring optometrist and risks setting expectations before a full ophthalmic assessment has taken place.' },
      ],
    },
    wouldYouRefer: [
      {
        text: 'A 59-year-old patient has excellent corrected distance vision but reports significant glare, reduced contrast and increasing difficulty driving after dark.',
        feedback: {
          refer: 'Good corrected acuity doesn’t rule out visually significant cataract — glare and contrast complaints are often the more telling signs, particularly for night driving.',
          monitor: 'Monitoring may feel natural given the good chart result, but the functional symptoms described are exactly the kind that patients raise when they’re ready for a referral conversation.',
          unsure: 'There’s actually a fairly clear symptom pattern here — glare, contrast loss and night driving difficulty are classic prompts for a referral conversation, even with good acuity.',
        },
      },
      {
        text: 'A 72-year-old patient has mild lens changes noted on exam but reports no visual complaints and is entirely happy with their current vision.',
        feedback: {
          refer: 'Referral is always a reasonable option if the patient wishes, but with no functional complaints, routine monitoring is often just as appropriate.',
          monitor: 'This fits well — visually insignificant lens changes with a happy, asymptomatic patient are usually appropriate for continued routine monitoring.',
          unsure: 'There’s actually enough here to form a view — mild lens changes without functional symptoms typically support continued monitoring rather than referral.',
        },
      },
      {
        text: 'A 55-year-old patient mentions their vision ‘feels a bit different lately’ but you haven’t yet had the chance to explore this further or complete a full assessment.',
        feedback: {
          refer: 'It may be worth completing a fuller assessment first — referral is always an option, but gathering a bit more detail first can help ensure it’s the right next step.',
          monitor: 'Monitoring might be premature here — a vague comment like this is worth exploring further before deciding on a course of action.',
          unsure: 'This is a good instinct — a vague symptom description is worth exploring further with the patient before deciding whether monitoring or referral is more appropriate.',
        },
      },
    ],
    quiz: [
      {
        question: 'Which of the following is most likely to prompt a conversation about cataract referral?',
        options: [
          'A patient with a stable prescription and no complaints.',
          'A patient reporting increasing glare and difficulty driving at night despite an updated prescription.',
          'A patient due for their routine annual eye test.',
        ],
        correctIndex: 1,
        feedbackCorrect: 'Exactly — functional complaints like glare and night driving difficulty, especially when they persist despite an updated prescription, are a strong prompt for a referral conversation.',
        feedbackIncorrect: 'Not quite — the strongest prompt here is a patient reporting glare and night driving difficulty despite an updated prescription, since this points to a functional impact beyond what the chart shows.',
      },
      {
        question: 'True or false: a patient can have visually significant cataracts even with reasonably good corrected visual acuity on the chart.',
        options: ['True', 'False', 'Only in patients over 80'],
        correctIndex: 0,
        feedbackCorrect: 'Correct — chart acuity doesn’t always capture the full picture. Glare, contrast sensitivity and functional difficulty can be significant even when acuity looks reasonable.',
        feedbackIncorrect: 'Actually, this is true — chart acuity alone doesn’t always reflect the functional impact of cataracts, which is why symptoms and lifestyle impact matter just as much.',
      },
      {
        question: 'When introducing the possibility of referral to a patient, what’s the most appropriate approach?',
        options: [
          'Tell the patient they definitely need surgery.',
          'Explain that a specialist assessment could help explore what’s affecting their vision, without promising a specific outcome.',
          'Avoid mentioning it until the patient brings it up themselves.',
        ],
        correctIndex: 1,
        feedbackCorrect: 'Right — framing referral as an opportunity for further assessment respects the patient’s autonomy and keeps the conversation appropriately open, without diagnosing or promising outcomes.',
        feedbackIncorrect: 'The better approach is to frame referral as an opportunity for further assessment, without diagnosing the patient or promising a specific treatment outcome.',
      },
    ],
    completionMessage: 'You now have a practical framework to help identify patients who may benefit from further ophthalmic assessment for cataracts.',
    referralGuide: {
      title: 'Cataract Referral Guide',
      description: 'A practical one-page guide designed to support patient identification and appropriate referrals.',
      contents: GUIDE_CONTENTS,
    },
  },

  {
    id: 'rle-candidates',
    title: 'Identifying suitable RLE candidates',
    cardDescription: 'Understand the broad patient characteristics that may prompt a conversation about refractive lens exchange.',
    estimatedMinutes: 7,
    icon: 'Sparkles',
    opening: {
      question: 'Have you seen a presbyopic or highly hyperopic patient who is tired of glasses or contact lenses, but isn’t quite describing cataract-type symptoms?',
      support: 'This may be the type of patient worth considering for a refractive lens exchange conversation. Let’s explore why.',
    },
    video: {
      label: '5-minute clinical overview',
      description: 'A quick practical overview of the key clinical considerations, patient conversations and referral opportunities relating to refractive lens exchange.',
    },
    indicators: {
      heading: 'What should I look out for?',
      items: [
        'Presbyopia with significant dependence on reading glasses or varifocals.',
        'High hyperopia or high myopia where laser correction may be less suitable.',
        'Reduced tolerance for contact lenses, particularly multifocal designs.',
        'A strong desire for spectacle independence across distances.',
        'Early lens changes noted alongside a refractive correction goal.',
        'A patient asking directly about ‘permanent’ alternatives to glasses.',
      ],
    },
    conversation: {
      heading: 'How could I introduce this conversation to my patient?',
      examples: [
        'You’ve mentioned you’re finding your reading glasses more and more frustrating. There’s a lens-based procedure that some patients in your situation explore — would it be helpful to have that explained by a specialist?',
        'Because your prescription is quite high, laser treatment isn’t always the most suitable option. A specialist assessment could help explain the alternatives, including lens-based procedures.',
        'A lot of patients your age start looking for a longer-term alternative to glasses. It might be worth a specialist conversation to see whether that’s something suitable for you.',
      ],
    },
    caseStudy: {
      scenario: 'A 54-year-old hyperopic patient relies heavily on varifocals, finds contact lenses uncomfortable, and has asked whether there is a permanent alternative to glasses. No visually significant cataract has been noted.',
      question: 'What would you consider doing next?',
      options: [
        { label: 'Tell the patient laser eye surgery is their only option.', tone: 'poor', feedback: 'High hyperopia is often less suitable for laser correction — a specialist assessment can explore the full range of options, including lens-based procedures like RLE.' },
        { label: 'Discuss whether a specialist refractive assessment may be appropriate to explore their options.', tone: 'good', feedback: 'This keeps the conversation open and lets a specialist assess suitability across the full range of refractive pathways, rather than assuming one treatment fits.' },
        { label: 'Recommend refractive lens exchange directly.', tone: 'poor', feedback: 'Recommending a specific procedure isn’t appropriate before a full specialist assessment — but flagging the referral opportunity is a great first step.' },
      ],
    },
    wouldYouRefer: [
      {
        text: 'A 58-year-old highly hyperopic patient is frustrated with varifocals and has asked about long-term alternatives to glasses.',
        feedback: {
          refer: 'This is a strong prompt — high hyperopia plus strong spectacle frustration is a common profile for an RLE conversation.',
          monitor: 'There’s a clear, patient-driven reason to explore options here rather than simply continuing to monitor.',
          unsure: 'There’s actually a fairly clear pattern here worth exploring further with a specialist referral.',
        },
      },
      {
        text: 'A 45-year-old patient with a mild, stable prescription mentions they’re ‘just curious’ about laser eye surgery one day.',
        feedback: {
          refer: 'Referral is always an option if the patient would like more information, though at this stage gentle signposting may be just as appropriate as a formal referral.',
          monitor: 'This fits reasonably well — with no urgency or strong frustration expressed, continuing routine care while answering their general question may be enough for now.',
          unsure: 'It’s reasonable to want more detail here — understanding how motivated the patient is can help decide whether a referral conversation is timely.',
        },
      },
      {
        text: 'A 68-year-old patient has early cataract changes noted and also expresses interest in reducing their spectacle dependence.',
        feedback: {
          refer: 'This is worth a referral — a specialist assessment can consider both the early lens changes and the patient’s refractive goals together.',
          monitor: 'Given the combination of lens changes and a refractive goal, monitoring alone may miss an opportunity for a more complete specialist conversation.',
          unsure: 'There’s enough here already — early lens changes plus a refractive goal is a good combination to flag for specialist assessment.',
        },
      },
    ],
    quiz: [
      {
        question: 'Which patient profile is most typically associated with RLE conversations?',
        options: ['A myopic teenager with a stable prescription', 'A presbyopic or highly hyperopic adult seeking long-term spectacle independence', 'A patient with acute red eye'],
        correctIndex: 1,
        feedbackCorrect: 'Correct — RLE conversations are most often relevant for presbyopic or highly hyperopic adults looking for a longer-term alternative to glasses or contact lenses.',
        feedbackIncorrect: 'The more typical profile is a presbyopic or highly hyperopic adult seeking spectacle independence — the other examples don’t fit this pathway.',
      },
      {
        question: 'Why might laser vision correction be less suitable for some patients considering RLE?',
        options: ['It’s more suitable for very high prescriptions', 'High hyperopia or high myopia can fall outside typical laser correction ranges', 'Laser correction is only for patients under 20'],
        correctIndex: 1,
        feedbackCorrect: 'Right — very high prescriptions can fall outside the range laser correction is designed for, which is where lens-based options like RLE may be discussed.',
        feedbackIncorrect: 'Actually, it’s the opposite — very high prescriptions can fall outside typical laser correction ranges, which is why lens-based alternatives may be explored.',
      },
      {
        question: 'What is the most appropriate way to respond to a patient asking about ‘permanent’ alternatives to glasses?',
        options: ['Promise a specific outcome', 'Explain that a specialist assessment can explore whether a lens-based or laser-based option may be suitable', 'Tell them nothing can be done'],
        correctIndex: 1,
        feedbackCorrect: 'Exactly — signposting to a specialist assessment keeps the conversation open and appropriately non-diagnostic.',
        feedbackIncorrect: 'The best approach is to explain that a specialist assessment can explore suitable options — without promising any specific outcome.',
      },
    ],
    completionMessage: 'You now have a clearer sense of the broad patient profile that may prompt a refractive lens exchange conversation.',
    referralGuide: {
      title: 'Refractive Lens Exchange Referral Guide',
      description: 'A practical one-page guide to help identify and refer patients who may be suitable candidates for RLE.',
      contents: GUIDE_CONTENTS,
    },
  },

  {
    id: 'icl-vs-lvc',
    title: 'ICL versus laser vision correction',
    cardDescription: 'Explore the key differences between implantable contact lenses and laser vision correction pathways.',
    estimatedMinutes: 6,
    icon: 'GitCompare',
    opening: {
      question: 'Have you seen a patient with a high prescription or thin corneas ask about laser eye surgery, only for you to wonder whether they’d actually be a better fit for something else?',
      support: 'This may be a good opportunity to introduce the idea of a specialist refractive assessment. Let’s explore why.',
    },
    video: {
      label: '5-minute clinical overview',
      description: 'A quick practical overview of the key clinical considerations, patient conversations and referral opportunities relating to ICL and laser vision correction.',
    },
    indicators: {
      heading: 'What should I look out for?',
      items: [
        'High myopia or astigmatism outside typical laser treatment ranges.',
        'Thinner-than-average corneas noted on previous assessment.',
        'Patients asking specifically about ‘laser eye surgery’ without knowing alternatives exist.',
        'A preference for a reversible or removable refractive procedure.',
        'Dry eye tendencies that may affect laser recovery.',
        'Active, sport-involved patients wanting a stable, durable correction.',
      ],
    },
    conversation: {
      heading: 'How could I introduce this conversation to my patient?',
      examples: [
        'You’ve asked about laser eye surgery, which is one option — but there’s also a lens-based alternative called ICL that can suit some prescriptions particularly well. A specialist assessment can help work out which pathway fits you best.',
        'Because your prescription is quite high, it’s worth having a specialist compare laser correction with lens-based options like ICL, rather than assuming one is automatically right for you.',
        'Not everyone realises there’s more than one route to reducing dependence on glasses. A specialist refractive assessment can talk you through the options side by side.',
      ],
    },
    caseStudy: {
      scenario: 'A 32-year-old patient with high myopia and relatively thin corneas has asked you about laser eye surgery. They are otherwise healthy with no significant eye history.',
      question: 'What would you consider doing next?',
      options: [
        { label: 'Confirm that laser eye surgery is suitable without further assessment.', tone: 'poor', feedback: 'Thin corneas and high myopia are exactly the kind of factors that need specialist assessment before any pathway is confirmed — it’s best not to assume suitability.' },
        { label: 'Suggest a specialist refractive assessment to compare laser correction and lens-based options like ICL.', tone: 'good', feedback: 'This is a balanced next step — it opens up the full range of options for a specialist to properly assess, rather than assuming one pathway is right.' },
        { label: 'Tell the patient laser eye surgery definitely won’t work for them.', tone: 'poor', feedback: 'It’s not appropriate to rule a pathway out without a full specialist assessment — better to keep the conversation open and refer for further exploration.' },
      ],
    },
    wouldYouRefer: [
      {
        text: 'A 29-year-old patient with a very high prescription has been told by a laser clinic they may not be suitable, and asks you what else is available.',
        feedback: {
          refer: 'This is a good referral opportunity — a specialist assessment can properly explore lens-based alternatives like ICL for higher prescriptions.',
          monitor: 'There’s a clear, patient-driven question here that monitoring alone won’t answer — referral for a specialist opinion may be more appropriate.',
          unsure: 'There’s actually a fairly clear opportunity here to refer for a specialist comparison of pathways.',
        },
      },
      {
        text: 'A 41-year-old patient asks a general question about laser eye surgery out of curiosity, with no particular urgency or strong prescription.',
        feedback: {
          refer: 'Referral is always an option, though for a general query like this, providing some initial information may be just as appropriate before a formal referral.',
          monitor: 'This fits reasonably well for now — general curiosity without a specific driver may not need immediate referral.',
          unsure: 'It’s fair to want more detail — understanding what’s prompting the question can help decide on next steps.',
        },
      },
      {
        text: 'A 36-year-old patient has dry eye symptoms and is specifically asking about laser eye surgery.',
        feedback: {
          refer: 'Worth referring — dry eye can influence which refractive pathway is more suitable, and a specialist assessment can factor this in.',
          monitor: 'Given the specific question and the dry eye factor, referral for a specialist opinion may be more useful than continued monitoring alone.',
          unsure: 'There’s enough context here to flag for a specialist assessment, given the interplay between dry eye and refractive surgery suitability.',
        },
      },
    ],
    quiz: [
      {
        question: 'Which factor might make a patient less suitable for laser vision correction, but potentially suitable for ICL?',
        options: ['A very low, stable prescription', 'Thin corneas or a very high prescription', 'Being under 18'],
        correctIndex: 1,
        feedbackCorrect: 'Correct — thinner corneas and higher prescriptions are common reasons a specialist may explore lens-based options like ICL instead of laser correction.',
        feedbackIncorrect: 'The better answer is thin corneas or a very high prescription — these are common reasons a specialist may consider ICL over laser correction.',
      },
      {
        question: 'What is a key difference often discussed between ICL and laser vision correction?',
        options: ['ICL involves an implanted lens, while laser correction reshapes the cornea', 'They are exactly the same procedure', 'ICL is only available for reading glasses'],
        correctIndex: 0,
        feedbackCorrect: 'Right — ICL involves implanting a lens in front of or behind the iris, while laser correction works by reshaping the corneal surface.',
        feedbackIncorrect: 'The key difference is that ICL involves an implanted lens, while laser correction reshapes the cornea — they’re quite different approaches.',
      },
      {
        question: 'What’s the most appropriate response to a patient who assumes laser eye surgery is their only option?',
        options: ['Agree with them to keep things simple', 'Explain that a specialist assessment can compare laser and lens-based options to find what suits them', 'Suggest they research it online instead'],
        correctIndex: 1,
        feedbackCorrect: 'Exactly — helping patients understand there’s more than one pathway, and referring for a proper comparison, is genuinely useful.',
        feedbackIncorrect: 'It’s more helpful to explain that a specialist assessment can compare both laser and lens-based options for their situation.',
      },
    ],
    completionMessage: 'You now have a clearer framework for helping patients understand there is more than one refractive pathway worth exploring.',
    referralGuide: {
      title: 'ICL vs Laser Vision Correction Referral Guide',
      description: 'A practical one-page guide comparing pathways to support patient conversations and referrals.',
      contents: GUIDE_CONTENTS,
    },
  },

  {
    id: 'premium-iols',
    title: 'Understanding premium IOLs',
    cardDescription: 'Build confidence discussing monofocal, toric, EDOF and multifocal lens technologies with patients.',
    estimatedMinutes: 9,
    icon: 'Layers',
    opening: {
      question: 'Have you had a cataract patient ask ‘will I still need glasses afterwards?’ and felt unsure how much detail to go into about lens options?',
      support: 'This is a great opportunity to introduce the idea of a specialist lens consultation. Let’s explore why.',
    },
    video: {
      label: '5-minute clinical overview',
      description: 'A quick practical overview of the key clinical considerations, patient conversations and referral opportunities relating to premium IOLs.',
    },
    indicators: {
      heading: 'What should I look out for?',
      items: [
        'A patient asking specifically about reducing spectacle dependence after cataract surgery.',
        'Significant corneal astigmatism that may benefit from a toric lens discussion.',
        'An active lifestyle with strong interest in distance and intermediate vision (driving, screens).',
        'A patient keen to also read without glasses, suggesting interest in multifocal or EDOF options.',
        'Realistic expectations that may need gentle, specialist-led exploration before surgery.',
        'A patient who has done their own research and has specific questions about lens technology.',
      ],
    },
    conversation: {
      heading: 'How could I introduce this conversation to my patient?',
      examples: [
        'There are actually a few different types of lens used in cataract surgery these days, some designed to reduce your need for glasses afterwards. A specialist consultation can talk you through which might suit your lifestyle.',
        'Because you have some astigmatism, there’s a specific type of lens that’s sometimes used to help with that. It’s worth discussing with a specialist as part of your assessment.',
        'It sounds like being able to read without glasses afterwards matters to you. That’s exactly the kind of thing worth raising directly with the surgical team during a specialist consultation.',
      ],
    },
    caseStudy: {
      scenario: 'A 70-year-old patient due to be referred for cataract surgery mentions they would love to be as spectacle-free as possible afterwards, particularly for reading and using their phone. They have mild corneal astigmatism.',
      question: 'What would you consider doing next?',
      options: [
        { label: 'Tell the patient they will definitely be glasses-free after surgery.', tone: 'poor', feedback: 'It’s important not to promise a specific outcome — lens suitability depends on a full specialist assessment, and expectations should be set carefully.' },
        { label: 'Mention that different lens options exist and suggest this is discussed at their specialist consultation.', tone: 'good', feedback: 'This is a great approach — it flags the patient’s goals for the surgical team without overstepping into recommending a specific lens.' },
        { label: 'Advise the patient that only a standard monofocal lens is available.', tone: 'poor', feedback: 'This may close down options unnecessarily — a specialist consultation is the right place to explore whether premium lens options could suit this patient.' },
      ],
    },
    wouldYouRefer: [
      {
        text: 'A 66-year-old patient with astigmatism asks whether there’s anything that can be done about it during their cataract surgery.',
        feedback: {
          refer: 'Good instinct — flagging this ensures the surgical team considers toric lens options as part of the specialist consultation.',
          monitor: 'This is a direct question worth passing on to the surgical team rather than leaving unaddressed.',
          unsure: 'There’s a clear question here worth flagging for discussion at the specialist consultation.',
        },
      },
      {
        text: 'A 74-year-old patient says they’re happy to wear glasses after surgery and just want clear vision again.',
        feedback: {
          refer: 'Referral for surgery is appropriate regardless, though there’s no strong indication here that a premium lens conversation is a priority for this patient.',
          monitor: 'This fits well — the patient’s own goals suggest a standard approach may be entirely appropriate, though referral for surgery itself remains relevant.',
          unsure: 'The patient has actually been fairly clear about their preferences, which can guide the conversation with the surgical team.',
        },
      },
      {
        text: 'A 61-year-old very active patient asks about seeing clearly at multiple distances without needing glasses at all.',
        feedback: {
          refer: 'Worth flagging clearly — this is exactly the kind of goal that benefits from a detailed specialist lens consultation.',
          monitor: 'Given how specific the patient’s goals are, it’s worth ensuring this is discussed properly at their specialist consultation.',
          unsure: 'There’s enough detail here already to flag this patient’s goals clearly for the specialist team.',
        },
      },
    ],
    quiz: [
      {
        question: 'What is a toric IOL primarily designed to help with?',
        options: ['Correcting astigmatism', 'Improving night vision only', 'Treating dry eye'],
        correctIndex: 0,
        feedbackCorrect: 'Correct — toric IOLs are designed to help correct corneal astigmatism at the time of cataract surgery.',
        feedbackIncorrect: 'Toric IOLs are primarily designed to help correct astigmatism — the other options aren’t their main purpose.',
      },
      {
        question: 'What does EDOF stand for in the context of premium IOLs?',
        options: ['Extended Depth of Focus', 'Enhanced Distance Optical Filter', 'Eye Drop Ocular Formula'],
        correctIndex: 0,
        feedbackCorrect: 'Correct — EDOF stands for Extended Depth of Focus, a lens category designed to provide a continuous range of vision.',
        feedbackIncorrect: 'EDOF actually stands for Extended Depth of Focus — a lens technology designed to extend the range of clear vision.',
      },
      {
        question: 'What’s the most appropriate way to respond when a patient asks if they’ll need glasses after cataract surgery?',
        options: ['Explain that lens options vary and this is best discussed at their specialist consultation', 'Guarantee they won’t need glasses', 'Say it’s impossible to know and change the subject'],
        correctIndex: 0,
        feedbackCorrect: 'Exactly — this keeps expectations realistic while flagging the patient’s goals for a proper specialist discussion.',
        feedbackIncorrect: 'It’s best to explain that lens options vary and encourage this to be discussed at the specialist consultation, rather than guaranteeing an outcome.',
      },
    ],
    completionMessage: 'You now feel more confident introducing the topic of lens options ahead of a specialist cataract consultation.',
    referralGuide: {
      title: 'Premium IOL Conversation Guide',
      description: 'A practical one-page guide to help you introduce lens technology conversations with cataract patients.',
      contents: GUIDE_CONTENTS,
    },
  },

  {
    id: 'post-op-expectations',
    title: 'Managing post-operative expectations',
    cardDescription: 'Help patients understand recovery, adaptation and realistic visual expectations following treatment.',
    estimatedMinutes: 6,
    icon: 'Activity',
    opening: {
      question: 'Have you seen a patient shortly after eye surgery who seems worried that their vision isn’t ‘perfect’ yet, even though they’re still early in their recovery?',
      support: 'This is a common and completely understandable concern. Let’s explore how to support these patients confidently.',
    },
    video: {
      label: '5-minute clinical overview',
      description: 'A quick practical overview of the key clinical considerations, patient conversations and referral opportunities relating to post-operative recovery.',
    },
    indicators: {
      heading: 'What should I look out for?',
      items: [
        'Vision that fluctuates or feels ‘not quite right’ in the early weeks after surgery.',
        'Mild dryness, glare or haloes that are common during the adaptation period.',
        'Anxiety or disappointment despite a technically successful procedure.',
        'Questions about when to expect their ‘final’ visual outcome.',
        'Uncertainty about who to contact with post-operative concerns.',
        'A patient comparing their experience unfavourably to a friend’s experience.',
      ],
    },
    conversation: {
      heading: 'How could I introduce this conversation to my patient?',
      examples: [
        'It’s really common to still be settling in at this stage — vision often continues to improve and stabilise over the following weeks. If anything feels concerning though, it’s always worth checking in with the surgical team.',
        'Everyone’s recovery timeline is a little different, so try not to compare too closely with someone else’s experience. Let’s make sure the surgical team knows how you’re getting on.',
        'Some glare or dryness in the early weeks is a normal part of adjusting after surgery. I’d encourage you to mention this at your follow-up, just so it’s on record and can be monitored properly.',
      ],
    },
    caseStudy: {
      scenario: 'A 69-year-old patient is three weeks post cataract surgery and reports mild glare at night and slightly fluctuating vision. They are otherwise well but seem anxious about whether something has gone wrong.',
      question: 'What would you consider doing next?',
      options: [
        { label: 'Reassure the patient that nothing could possibly be wrong and no follow-up is needed.', tone: 'poor', feedback: 'While early fluctuation is common, it’s still best practice to ensure any concerns are communicated to the surgical team rather than dismissed outright.' },
        { label: 'Acknowledge this is common in early recovery and encourage them to raise it with the surgical team at follow-up.', tone: 'good', feedback: 'This strikes the right balance — validating the patient’s experience while making sure it’s properly followed up with the surgical team.' },
        { label: 'Tell the patient their surgery has likely failed.', tone: 'poor', feedback: 'This would likely cause unnecessary alarm — mild fluctuation and glare in early recovery are common and don’t necessarily indicate a problem.' },
      ],
    },
    wouldYouRefer: [
      {
        text: 'A patient two weeks post-surgery reports vision that is ‘a bit blurry some days and clearer others’.',
        feedback: {
          refer: 'Worth flagging — while often normal, letting the surgical team know ensures it’s properly tracked against their expected recovery course.',
          monitor: 'This is a reasonable instinct at this early stage, though it’s still worth mentioning to the surgical team at the next check-in.',
          unsure: 'It’s understandable to be unsure — the safest approach is usually to flag it to the surgical team so they can assess it against the expected recovery timeline.',
        },
      },
      {
        text: 'A patient six weeks post-surgery still reports significant glare and says it hasn’t improved at all since surgery.',
        feedback: {
          refer: 'This is worth flagging more actively — persistence beyond the typical early recovery window is worth the surgical team reviewing directly.',
          monitor: 'Given how long this has persisted, it may be more helpful to flag it proactively rather than continuing to simply monitor.',
          unsure: 'The duration here is a useful clue — persistent symptoms well beyond early recovery are generally worth flagging to the surgical team.',
        },
      },
      {
        text: 'A patient one week post-surgery says their vision feels ‘amazing’ and has no concerns at all.',
        feedback: {
          refer: 'Referral or flagging isn’t necessary here, though routine follow-up with the surgical team remains a normal part of their recovery pathway.',
          monitor: 'This fits well — a positive, symptom-free early recovery is reassuring, and routine follow-up can continue as planned.',
          unsure: 'The patient has actually given a clear, positive picture here, which is reassuring at this stage of recovery.',
        },
      },
    ],
    quiz: [
      {
        question: 'Which of these is a common experience during early recovery after cataract or refractive surgery?',
        options: ['Vision that fluctuates slightly before stabilising', 'Permanent loss of vision in all cases', 'Immediate and permanent perfect vision for everyone'],
        correctIndex: 0,
        feedbackCorrect: 'Correct — some fluctuation and gradual stabilisation is a normal part of the early recovery process for many patients.',
        feedbackIncorrect: 'The most accurate answer is that some fluctuation is common before vision stabilises — outcomes vary and ‘perfect vision instantly’ isn’t a realistic expectation to set.',
      },
      {
        question: 'What is generally the most helpful response to a mildly anxious post-operative patient?',
        options: ['Dismiss their concerns entirely', 'Validate their experience and encourage them to raise it with the surgical team', 'Tell them to wait several months before mentioning anything'],
        correctIndex: 1,
        feedbackCorrect: 'Right — validating the patient’s experience while ensuring proper follow-up strikes the right balance.',
        feedbackIncorrect: 'It’s more helpful to validate their experience and encourage them to raise it with the surgical team promptly, rather than dismissing it or asking them to wait.',
      },
      {
        question: 'Why is it important not to speculate about surgical outcomes as a referring optometrist?',
        options: ['Because only the surgical team has the full clinical picture and follow-up context', 'Because optometrists are not allowed to speak to patients', 'Because it doesn’t matter what is said'],
        correctIndex: 0,
        feedbackCorrect: 'Exactly — the surgical team has the full picture and is best placed to assess post-operative progress accurately.',
        feedbackIncorrect: 'The key reason is that the surgical team holds the full clinical picture and follow-up context, so speculation could unintentionally mislead the patient.',
      },
    ],
    completionMessage: 'You now have practical language to support patients confidently through the post-operative adaptation period.',
    referralGuide: {
      title: 'Post-Operative Expectations Guide',
      description: 'A practical one-page guide to help you support patients through recovery and know when to flag concerns.',
      contents: GUIDE_CONTENTS,
    },
  },

  {
    id: 'red-flags',
    title: 'Red flags requiring ophthalmology referral',
    cardDescription: 'Recognise symptoms and clinical presentations that may require timely specialist ophthalmological assessment.',
    estimatedMinutes: 5,
    icon: 'AlertTriangle',
    opening: {
      question: 'Have you ever seen a patient with sudden vision changes, flashes, floaters or eye pain and had to quickly judge how urgently they need to be seen?',
      support: 'Recognising red flag presentations quickly can make a real difference to patient outcomes. Let’s explore the key signs.',
    },
    video: {
      label: '5-minute clinical overview',
      description: 'A quick practical overview of the key clinical considerations, patient conversations and referral urgency relating to red flag presentations.',
    },
    indicators: {
      heading: 'What should I look out for?',
      items: [
        'Sudden, painless loss of vision in one or both eyes.',
        'New onset flashes and floaters, particularly with a curtain or shadow in the visual field.',
        'Significant eye pain, especially with redness and reduced vision.',
        'Sudden double vision, particularly with other neurological symptoms.',
        'A red eye with severe pain, photophobia or reduced vision.',
        'Any presentation that feels clinically ‘off’ even if it doesn’t fit a textbook pattern.',
      ],
    },
    conversation: {
      heading: 'How could I introduce this conversation to my patient?',
      examples: [
        'This is something I’d like a specialist to look at more urgently, given what you’ve described. I’m going to arrange for you to be seen as soon as possible.',
        'Because of the sudden nature of these symptoms, I think it’s important this is assessed quickly by an ophthalmologist, rather than waiting for a routine appointment.',
        'I want to make sure this gets looked at promptly — I’ll help arrange an urgent referral so a specialist can assess you as soon as possible.',
      ],
    },
    caseStudy: {
      scenario: 'A 61-year-old patient presents with sudden onset floaters, a flash of light in their peripheral vision, and describes a ‘curtain’ coming down over part of their vision in one eye.',
      question: 'What would you consider doing next?',
      options: [
        { label: 'Book a routine referral for the next available appointment.', tone: 'poor', feedback: 'This presentation has features suggestive of a possible retinal detachment, which typically requires same-day or urgent assessment rather than a routine referral.' },
        { label: 'Arrange urgent same-day ophthalmology assessment.', tone: 'good', feedback: 'This is the appropriate response — sudden flashes, floaters and a visual field curtain are classic red flag symptoms that warrant urgent same-day assessment.' },
        { label: 'Reassure the patient this is likely nothing and review again in a few weeks.', tone: 'poor', feedback: 'This presentation shouldn’t be reassured away without urgent assessment — the combination of symptoms described needs same-day specialist review.' },
      ],
    },
    wouldYouRefer: [
      {
        text: 'A 45-year-old patient reports sudden, painless loss of vision in one eye that started this morning.',
        feedback: {
          refer: 'Correct — sudden painless vision loss is a red flag requiring urgent same-day ophthalmology assessment.',
          monitor: 'This isn’t a presentation to monitor — sudden painless vision loss needs urgent same-day assessment.',
          unsure: 'This one is fairly clear-cut — sudden painless vision loss is a recognised red flag requiring urgent referral.',
        },
      },
      {
        text: 'A 30-year-old patient has mild, gradual blurring of vision over several months with no pain or other symptoms.',
        feedback: {
          refer: 'Urgent referral isn’t necessary here, though a routine referral or continued assessment may still be appropriate depending on findings.',
          monitor: 'This fits reasonably well — a gradual, painless change over months doesn’t typically represent a red flag requiring urgent same-day referral.',
          unsure: 'This presentation is actually fairly clear — gradual, painless change over months is not a typical red flag pattern.',
        },
      },
      {
        text: 'A 55-year-old patient has a red, painful eye with photophobia and noticeably reduced vision.',
        feedback: {
          refer: 'Correct — a painful red eye with photophobia and reduced vision needs urgent same-day ophthalmology assessment.',
          monitor: 'This combination of symptoms is a red flag and shouldn’t be left for monitoring alone.',
          unsure: 'This is a fairly recognisable red flag combination — pain, photophobia and reduced vision together warrant urgent assessment.',
        },
      },
    ],
    quiz: [
      {
        question: 'Which combination of symptoms is most suggestive of a possible retinal detachment?',
        options: ['Sudden flashes, floaters and a curtain-like shadow in the vision', 'Mild, gradual blurring over several months', 'Occasional dryness at the end of the day'],
        correctIndex: 0,
        feedbackCorrect: 'Correct — this combination is a classic red flag pattern that warrants urgent same-day ophthalmology assessment.',
        feedbackIncorrect: 'The classic red flag pattern is sudden flashes, floaters and a curtain-like shadow — the other options don’t typically represent an urgent presentation.',
      },
      {
        question: 'What is the appropriate timeframe for referring a patient with sudden, painless vision loss?',
        options: ['Same-day urgent assessment', 'Next routine appointment slot', 'Only if it hasn’t improved after a month'],
        correctIndex: 0,
        feedbackCorrect: 'Right — sudden painless vision loss is a recognised ophthalmic emergency requiring same-day assessment.',
        feedbackIncorrect: 'Sudden, painless vision loss requires same-day urgent assessment — it shouldn’t wait for a routine slot or a follow-up period.',
      },
      {
        question: 'A red, painful eye with photophobia and reduced vision most likely requires:',
        options: ['Reassurance and a routine review in a few weeks', 'Urgent same-day ophthalmology assessment', 'No referral is necessary'],
        correctIndex: 1,
        feedbackCorrect: 'Correct — this combination of symptoms is a recognised red flag requiring urgent same-day specialist assessment.',
        feedbackIncorrect: 'This combination needs urgent same-day ophthalmology assessment rather than reassurance or delay.',
      },
    ],
    completionMessage: 'You now have a clearer, quick-reference framework for recognising red flag presentations that require urgent referral.',
    referralGuide: {
      title: 'Red Flags Quick-Reference Guide',
      description: 'A practical one-page guide summarising red flag symptoms and appropriate urgent referral pathways.',
      contents: GUIDE_CONTENTS,
    },
  },
];

export function buildGuideText(module) {
  const lines = [
    `${module.referralGuide.title} — Eye Clinic London`,
    '',
    module.referralGuide.description,
    '',
    ...module.referralGuide.contents.map((c, i) => `${i + 1}. ${c}`),
    '',
    'This guide is for general educational purposes and does not replace clinical judgement.',
    'Eye Clinic London · 7 Devonshire Street, Marylebone, London W1W 5DY · 0203 974 4454',
  ];
  return lines.join('\n');
}
