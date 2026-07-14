import { useEffect, useMemo, useState } from 'react';
import {
  X, ArrowLeft, ArrowRight, ShieldCheck, AlertTriangle, CircleHelp, CheckCircle2,
  Eye, Glasses, BookOpen, Droplets, ScanEye, Contact, MessageCircle, Send, Compass,
  Sparkles, Zap, Stethoscope, User, Phone, Mail, RotateCcw, Shuffle, UserPlus,
} from 'lucide-react';
import { useColors, FONT_DISPLAY } from '../theme';
import { QUESTIONS, ASSISTANT_DISCLAIMER, URGENT_MESSAGE } from './config';
import { getBranchQuestionIds, isUrgentAnswer, getTerminalAction, computeResult } from './logic';

const ICONS = {
  Eye, Glasses, BookOpen, Droplets, ScanEye, CircleHelp, AlertTriangle, CheckCircle2,
  X, User, Contact, MessageCircle, Send, Compass, Sparkles, Zap, Stethoscope,
};

function Icon({ name, ...props }) {
  const Cmp = ICONS[name] || CircleHelp;
  return <Cmp {...props} />;
}

function trackEvent(name, payload) {
  // Demo-only local analytics hook — no external service involved.
  console.log('[ECL Referral Assistant]', name, payload || {});
}

const CONTACT = {
  name: 'Ryan',
  role: 'Business Development Manager',
  email: 'ryan@eyecliniclondon.com',
  phoneDisplay: '07340 890 623',
  phoneHref: 'tel:+447340890623',
};

// ---------- shared bits ----------

function ProgressBar({ step, total }) {
  const COLOR = useColors();
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.textMuted }}>
          Question {step} of {total}
        </span>
      </div>
      <div className="mt-2 flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 999,
              background: i < step ? COLOR.accent : COLOR.border,
              transition: 'background 350ms ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Disclaimer({ style }) {
  const COLOR = useColors();
  return (
    <p className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: COLOR.textMuted, ...style }}>
      <ShieldCheck size={14} className="mt-0.5 shrink-0" />
      <span>{ASSISTANT_DISCLAIMER}</span>
    </p>
  );
}

function AnswerOption({ label, iconName, selected, onClick, delay = 0 }) {
  const COLOR = useColors();
  return (
    <button
      onClick={onClick}
      className="ecl-fade-up ecl-lift ecl-press flex w-full items-center gap-3.5 rounded-2xl p-4 text-left transition-all sm:p-4.5"
      style={{
        border: `1px solid ${selected ? COLOR.primary : COLOR.border}`,
        background: selected ? COLOR.primaryTint : COLOR.bg,
        minHeight: 64,
        animationDelay: `${delay}ms`,
      }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200"
        style={{ background: selected ? COLOR.primary : COLOR.recessed, color: selected ? '#fff' : COLOR.secondary }}
      >
        <Icon name={iconName} size={19} strokeWidth={1.75} />
      </span>
      <span className="text-[15px] font-medium leading-snug" style={{ color: COLOR.text }}>{label}</span>
      {selected && <CheckCircle2 size={18} className="ml-auto shrink-0" style={{ color: COLOR.primary }} />}
    </button>
  );
}

function DiscussCaseContent() {
  const COLOR = useColors();
  return (
    <div className="text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-white" style={{ background: COLOR.primary }}>
        R
      </span>
      <h3 className="mt-3 text-xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>Discuss this case with Ryan</h3>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: COLOR.textMuted }}>
        Not quite ready to refer? Get in touch to discuss the case and explore the most appropriate ECL pathway.
      </p>
      <p className="mt-4 text-sm font-medium" style={{ color: COLOR.text }}>{CONTACT.name}</p>
      <p className="text-xs" style={{ color: COLOR.textMuted }}>{CONTACT.role}</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <a
          href={CONTACT.phoneHref}
          onClick={() => trackEvent('discuss_this_case_call_clicked')}
          className="ecl-btn ecl-press flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium"
          style={{ background: COLOR.bg, border: `1px solid ${COLOR.border}`, color: COLOR.text }}
        >
          <Phone size={15} /> Call Ryan
        </a>
        <a
          href={`mailto:${CONTACT.email}`}
          onClick={() => trackEvent('discuss_this_case_email_clicked')}
          className="ecl-btn ecl-press flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white"
          style={{ background: COLOR.primary }}
        >
          <Mail size={15} /> Email Ryan
        </a>
      </div>
    </div>
  );
}

function DiscussCaseModal({ open, onClose }) {
  const COLOR = useColors();
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return (
    <div className="ecl-fade-in fixed inset-0 z-[70] overflow-y-auto bg-black/40 p-4 sm:p-8" onClick={onClose}>
      <div
        className="ecl-scale-in relative mx-auto my-10 w-full max-w-sm rounded-2xl p-6 sm:my-16 sm:p-8"
        style={{ background: COLOR.bg, boxShadow: '0 30px 70px -20px rgba(0,0,0,0.35)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="ecl-btn absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full"
          style={{ color: COLOR.textMuted, background: COLOR.recessed }}
        >
          <X size={16} />
        </button>
        <DiscussCaseContent />
      </div>
    </div>
  );
}

// ---------- start screen ----------

function StartScreen({ onStart, onReferNow }) {
  const COLOR = useColors();
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-10 text-center sm:py-14">
      <span className="ecl-pop flex h-16 w-16 items-center justify-center rounded-full" style={{ background: COLOR.primaryTint }}>
        <Compass size={28} style={{ color: COLOR.primary }} strokeWidth={1.75} />
      </span>
      <h1 className="ecl-fade-up mt-5 text-3xl sm:text-4xl" style={{ ...FONT_DISPLAY, color: COLOR.text, animationDelay: '80ms' }}>
        ECL Referral Assistant
      </h1>
      <p className="ecl-fade-up mt-3 text-lg" style={{ color: COLOR.text, animationDelay: '130ms' }}>
        Let's explore which ECL pathway may be relevant for your patient.
      </p>
      <p className="ecl-fade-up mt-3 text-sm leading-relaxed" style={{ color: COLOR.textMuted, animationDelay: '180ms' }}>
        You'll be asked a few broad questions about the patient's visual concerns, age and goals. No diagnosis will be
        made and no patient-identifiable information is required.
      </p>

      <button
        onClick={onStart}
        className="ecl-fade-up ecl-btn ecl-press mt-8 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-medium text-white sm:w-auto sm:px-10"
        style={{ background: COLOR.primary, animationDelay: '230ms' }}
      >
        Start <ArrowRight size={16} />
      </button>
      <button
        onClick={onReferNow}
        className="ecl-fade-up ecl-underline mt-4 text-sm font-medium"
        style={{ color: COLOR.secondary, animationDelay: '280ms' }}
      >
        Refer a patient now
      </button>

      <Disclaimer style={{ marginTop: '2.5rem', textAlign: 'left' }} />
    </div>
  );
}

// ---------- urgent screen ----------

function UrgentScreen({ onDiscuss, onExit, onGoBack }) {
  const COLOR = useColors();
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-10 text-center sm:py-14">
      <span className="ecl-pop flex h-16 w-16 items-center justify-center rounded-full" style={{ background: '#B3261E1A' }}>
        <AlertTriangle size={28} style={{ color: COLOR.problem }} strokeWidth={1.75} />
      </span>
      <h1 className="ecl-fade-up mt-5 text-2xl sm:text-3xl" style={{ ...FONT_DISPLAY, color: COLOR.text, animationDelay: '80ms' }}>
        Urgent clinical concern
      </h1>
      <p className="ecl-fade-up mt-3 text-sm leading-relaxed" style={{ color: COLOR.text, animationDelay: '130ms' }}>
        {URGENT_MESSAGE}
      </p>

      <div className="ecl-fade-up mt-8 flex w-full flex-col gap-3" style={{ animationDelay: '180ms' }}>
        <button
          onClick={onDiscuss}
          className="ecl-btn ecl-press flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-medium text-white"
          style={{ background: COLOR.primary }}
        >
          <MessageCircle size={16} /> Discuss this case
        </button>
        <button
          onClick={onExit}
          className="ecl-btn ecl-press flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-medium"
          style={{ background: COLOR.bg, border: `1px solid ${COLOR.border}`, color: COLOR.text }}
        >
          Exit assistant
        </button>
      </div>

      <button onClick={onGoBack} className="ecl-underline mt-5 text-sm font-medium" style={{ color: COLOR.textMuted }}>
        Go back and change my answer
      </button>
    </div>
  );
}

// ---------- question screen ----------

function QuestionScreen({ question, value, onAnswer }) {
  const COLOR = useColors();
  const isMultiple = question.type === 'multiple';
  const [draft, setDraft] = useState(() => (Array.isArray(value) ? value : value ? [value] : []));

  useEffect(() => {
    setDraft(Array.isArray(value) ? value : value ? [value] : []);
  }, [question.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(optionId) {
    if (!isMultiple) {
      onAnswer(optionId);
      return;
    }
    const option = question.options.find((o) => o.id === optionId);
    setDraft((d) => {
      // Exclusive options (e.g. "None of the above", "Unsure") can't be
      // combined with other selections in either direction.
      if (option?.exclusive) return d.includes(optionId) ? [] : [optionId];
      const withoutExclusives = d.filter((id) => !question.options.find((o) => o.id === id)?.exclusive);
      return withoutExclusives.includes(optionId)
        ? withoutExclusives.filter((id) => id !== optionId)
        : [...withoutExclusives, optionId];
    });
  }

  return (
    <div>
      <h2 className="text-2xl sm:text-[1.7rem]" style={{ ...FONT_DISPLAY, color: COLOR.text }}>{question.title}</h2>
      {question.description && (
        <p className="mt-2 text-sm" style={{ color: COLOR.textMuted }}>{question.description}</p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((opt, i) => (
          <AnswerOption
            key={opt.id}
            label={opt.label}
            iconName={opt.icon}
            selected={draft.includes(opt.id)}
            onClick={() => toggle(opt.id)}
            delay={i * 40}
          />
        ))}
      </div>

      {isMultiple && (
        <button
          onClick={() => onAnswer(draft)}
          disabled={draft.length === 0}
          className="ecl-btn ecl-press mt-6 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-medium text-white sm:w-auto sm:px-10"
          style={{ background: COLOR.primary, opacity: draft.length === 0 ? 0.45 : 1 }}
        >
          Continue <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}

// ---------- results screen ----------

function PathwayCard({ pathway, kind }) {
  const COLOR = useColors();
  const isPrimary = kind === 'primary';
  return (
    <div
      className="ecl-fade-up rounded-2xl p-5 sm:p-6"
      style={{ background: isPrimary ? COLOR.bg : COLOR.recessed, border: `1px solid ${COLOR.border}` }}
    >
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.accent }}>
        {isPrimary ? 'Suggested pathway to discuss' : 'Also worth considering'}
      </p>
      <div className="mt-2 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: COLOR.primaryTint, color: COLOR.primary }}>
          <Icon name={pathway.icon} size={20} strokeWidth={1.75} />
        </span>
        <h2 className={isPrimary ? 'text-2xl sm:text-3xl' : 'text-xl'} style={{ ...FONT_DISPLAY, color: COLOR.text }}>
          {pathway.title}
        </h2>
      </div>
      <p className="mt-4 text-sm leading-relaxed" style={{ color: COLOR.textMuted }}>{pathway.summary}</p>

      {pathway.reasons.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.textMuted }}>Why this pathway may be relevant</p>
          <ul className="mt-2.5 space-y-2">
            {pathway.reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: COLOR.text }}>
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: COLOR.accent }} />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ResultScreen({ result, onRefer, onDiscuss, onStartAgain, onExplorePathway }) {
  const COLOR = useColors();
  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:py-10">
      <PathwayCard pathway={result.primary} kind="primary" />
      {result.secondary && (
        <div className="mt-4">
          <PathwayCard pathway={result.secondary} kind="secondary" />
        </div>
      )}

      <div className="ecl-fade-up mt-8 rounded-2xl p-5 text-center sm:p-6" style={{ animationDelay: '80ms', background: COLOR.primary }}>
        <h3 className="text-xl text-white" style={FONT_DISPLAY}>Ready for the next step?</h3>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onRefer}
            className="ecl-btn ecl-press flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium"
            style={{ background: COLOR.accent, color: COLOR.primary }}
          >
            <UserPlus size={16} /> Refer this patient
          </button>
          <button
            onClick={onDiscuss}
            className="ecl-btn ecl-press flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white"
            style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.35)' }}
          >
            <MessageCircle size={16} /> Discuss this case
          </button>
        </div>
      </div>

      <div className="ecl-fade-up mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm" style={{ animationDelay: '120ms' }}>
        <button onClick={onStartAgain} className="ecl-underline flex items-center gap-1.5 font-medium" style={{ color: COLOR.textMuted }}>
          <RotateCcw size={13} /> Start again
        </button>
        <button onClick={onExplorePathway} className="ecl-underline flex items-center gap-1.5 font-medium" style={{ color: COLOR.textMuted }}>
          <Shuffle size={13} /> Explore another pathway
        </button>
      </div>

      <Disclaimer style={{ marginTop: '2.5rem' }} />
    </div>
  );
}

// ---------- root component ----------

const BASE_PATH = ['urgency', 'concern'];

export default function ReferralAssistant({ onExit, onReferPatient }) {
  const COLOR = useColors();
  const [phase, setPhase] = useState('start'); // start | questions | urgent | result
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [concernId, setConcernId] = useState(null);
  const [urgentQuestionId, setUrgentQuestionId] = useState('urgency');
  const [showDiscussModal, setShowDiscussModal] = useState(false);

  const path = useMemo(
    () => (concernId ? [...BASE_PATH, ...getBranchQuestionIds(concernId)] : BASE_PATH),
    [concernId]
  );
  const currentQuestion = QUESTIONS[path[currentIndex]];

  useEffect(() => {
    if (phase === 'result') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [phase]);

  function resetAll() {
    setAnswers({});
    setCurrentIndex(0);
    setConcernId(null);
    setUrgentQuestionId('urgency');
  }

  function handleExit() {
    if (phase !== 'result') trackEvent('assistant_abandoned', { phase });
    onExit();
  }

  function handleStart() {
    trackEvent('assistant_started');
    resetAll();
    setPhase('questions');
  }

  function handleBack() {
    if (currentIndex === 0) {
      setPhase('start');
      return;
    }
    setCurrentIndex((i) => i - 1);
  }

  function handleGoBackFromUrgent() {
    setPhase('questions');
    setCurrentIndex(path.indexOf(urgentQuestionId));
  }

  function handleAnswer(questionId, value) {
    const nextAnswers = { ...answers, [questionId]: value };

    if (isUrgentAnswer(questionId, nextAnswers)) {
      setAnswers(nextAnswers);
      setUrgentQuestionId(questionId);
      setPhase('urgent');
      return;
    }

    if (questionId === 'concern') {
      const branch = getBranchQuestionIds(value);
      const keep = new Set([...BASE_PATH, ...branch]);
      const pruned = {};
      for (const key of Object.keys(nextAnswers)) {
        if (keep.has(key)) pruned[key] = nextAnswers[key];
      }
      setAnswers(pruned);
      setConcernId(value);
      setCurrentIndex(2);
      return;
    }

    const terminal = getTerminalAction(questionId, nextAnswers);
    if (terminal === 'discuss') {
      setAnswers(nextAnswers);
      trackEvent('discuss_this_case_clicked', { source: 'assistant_shortcut' });
      setShowDiscussModal(true);
      return;
    }
    if (terminal === 'refer') {
      setAnswers(nextAnswers);
      trackEvent('refer_this_patient_clicked', { source: 'assistant_shortcut' });
      onReferPatient();
      return;
    }

    setAnswers(nextAnswers);
    const nextIndex = currentIndex + 1;
    if (nextIndex >= path.length) {
      trackEvent('assistant_completed');
      setPhase('result');
    } else {
      setCurrentIndex(nextIndex);
    }
  }

  const result = useMemo(() => {
    if (phase !== 'result') return null;
    const computed = computeResult(answers, concernId);
    trackEvent('suggested_pathway', { primary: computed.primary.id, secondary: computed.secondary?.id || null });
    return computed;
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleReferPatient() {
    trackEvent('refer_this_patient_clicked', { source: 'results' });
    onReferPatient();
  }
  function handleDiscussCase() {
    trackEvent('discuss_this_case_clicked', { source: 'results' });
    setShowDiscussModal(true);
  }
  function handleStartAgain() {
    resetAll();
    setPhase('start');
  }
  function handleExplorePathway() {
    setAnswers((a) => {
      const kept = { urgency: a.urgency };
      return kept;
    });
    setConcernId(null);
    setCurrentIndex(1);
    setPhase('questions');
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', background: COLOR.bg }}>
      <DiscussCaseModal open={showDiscussModal} onClose={() => setShowDiscussModal(false)} />

      <div style={{ borderBottom: `1px solid ${COLOR.border}`, background: COLOR.bg }}>
        <div className="mx-auto max-w-3xl px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2" style={{ ...FONT_DISPLAY, fontSize: '1.15rem', color: COLOR.text }}>
              <Compass size={18} style={{ color: COLOR.accent }} /> ECL Referral Assistant
            </h2>
            <button
              onClick={handleExit}
              className="ecl-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ color: COLOR.textMuted, background: COLOR.recessed }}
            >
              <X size={16} />
            </button>
          </div>
          {phase === 'questions' && (
            <div className="mt-3">
              <ProgressBar step={currentIndex + 1} total={path.length} />
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div key={`${phase}-${currentQuestion?.id || ''}`} className="ecl-fade-in">
          {phase === 'start' && <StartScreen onStart={handleStart} onReferNow={onReferPatient} />}
          {phase === 'urgent' && (
            <UrgentScreen onDiscuss={() => setShowDiscussModal(true)} onExit={handleExit} onGoBack={handleGoBackFromUrgent} />
          )}
          {phase === 'questions' && currentQuestion && (
            <div className="mx-auto max-w-3xl px-5 py-6 sm:px-6">
              <QuestionScreen
                question={currentQuestion}
                value={answers[currentQuestion.id]}
                onAnswer={(value) => handleAnswer(currentQuestion.id, value)}
              />
            </div>
          )}
          {phase === 'result' && result && (
            <ResultScreen
              result={result}
              onRefer={handleReferPatient}
              onDiscuss={handleDiscussCase}
              onStartAgain={handleStartAgain}
              onExplorePathway={handleExplorePathway}
            />
          )}
        </div>
      </div>

      {phase === 'questions' && (
        <div style={{ borderTop: `1px solid ${COLOR.border}`, background: COLOR.bg }}>
          <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-6">
            <button
              onClick={handleBack}
              className="ecl-btn flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium"
              style={{ color: COLOR.textMuted }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
