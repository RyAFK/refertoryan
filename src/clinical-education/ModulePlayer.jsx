import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, ArrowLeft, ArrowRight, PlayCircle, CheckCircle2, XCircle, MessageCircle, UserPlus,
  Download, Bookmark, BookmarkCheck, Quote, HelpCircle, Award, ClipboardList, Circle, Phone,
} from 'lucide-react';
import { useColors, FONT_DISPLAY } from '../theme';
import { ModuleIcon, ProgressBar, ClinicalDisclaimer } from './shared';

const STEPS = ['opening', 'video', 'indicators', 'conversation', 'case-study', 'would-you-refer', 'quiz', 'complete'];
const STEP_LABELS = {
  opening: 'Opening question',
  video: 'Clinical overview',
  indicators: 'Key indicators',
  conversation: 'Conversation guidance',
  'case-study': 'Case study',
  'would-you-refer': 'Would you refer?',
  quiz: 'Knowledge check',
  complete: 'Complete',
};

function ConversionRow({ onDiscuss, onRefer, onBookRyan, discussLabel = 'Discuss This Case', referLabel = 'Refer This Patient', tone }) {
  const COLOR = useColors();
  const onDark = tone === 'dark';
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onDiscuss}
          className="ecl-btn ecl-press flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium"
          style={onDark ? { background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.35)', color: '#fff' } : { background: COLOR.primaryTint, color: COLOR.primary }}
        >
          <MessageCircle size={15} /> {discussLabel}
        </button>
        <button
          onClick={onRefer}
          className="ecl-btn ecl-press flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium"
          style={onDark ? { background: COLOR.accent, color: COLOR.primary } : { background: COLOR.primary, color: '#fff' }}
        >
          <UserPlus size={15} /> {referLabel}
        </button>
      </div>
      {onBookRyan && (
        <button
          onClick={onBookRyan}
          className="ecl-underline mt-3 flex items-center gap-1.5 text-xs font-medium"
          style={{ color: onDark ? 'rgba(255,255,255,0.75)' : COLOR.secondary }}
        >
          <Phone size={11} /> Prefer to talk it through? Book a conversation with Ryan
        </button>
      )}
    </div>
  );
}

function QuickNote({ onSave, tone }) {
  const COLOR = useColors();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const onDark = tone === 'dark';

  if (saved) {
    return (
      <p className="ecl-fade-in mt-3 flex items-center gap-1.5 text-xs font-medium" style={{ color: onDark ? '#fff' : COLOR.complete }}>
        <CheckCircle2 size={13} /> Saved to your Clinical Education library.
      </p>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="ecl-underline mt-3 text-xs font-medium" style={{ color: onDark ? 'rgba(255,255,255,0.85)' : COLOR.secondary }}>
        + Save a note about this patient
      </button>
    );
  }

  return (
    <div className="ecl-fade-in mt-3 flex flex-col gap-2 sm:flex-row">
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Broad, non-identifiable note — e.g. patient in their 60s with glare and night driving difficulty."
        className="flex-1"
        style={{ minHeight: 44, resize: 'vertical', borderRadius: '0.5rem', border: `1px solid ${COLOR.border}`, background: COLOR.bg, padding: '0.5rem 0.75rem', fontSize: '13px', color: COLOR.text, outline: 'none' }}
      />
      <button
        onClick={() => { if (!text.trim()) return; onSave(text.trim()); setSaved(true); }}
        className="ecl-btn ecl-press shrink-0 rounded-lg px-4 py-2 text-xs font-medium text-white"
        style={{ background: COLOR.primary }}
      >
        Save
      </button>
    </div>
  );
}

// ---------- step bodies ----------

function OpeningStep({ module }) {
  const COLOR = useColors();
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 text-center sm:py-14">
      <span className="ecl-pop flex h-16 w-16 items-center justify-center rounded-full" style={{ background: COLOR.primaryTint }}>
        <ModuleIcon name={module.icon} size={28} style={{ color: COLOR.primary }} strokeWidth={1.75} />
      </span>
      <h1 className="ecl-fade-up mt-5 text-2xl sm:text-3xl" style={{ ...FONT_DISPLAY, color: COLOR.text, animationDelay: '80ms' }}>
        {module.opening.question}
      </h1>
      <p className="ecl-fade-up mt-4 text-sm leading-relaxed" style={{ color: COLOR.textMuted, animationDelay: '140ms' }}>
        {module.opening.support}
      </p>
    </div>
  );
}

function VideoStep({ module, onDiscuss, onRefer, onBookRyan, onContinue }) {
  const COLOR = useColors();
  const [playing, setPlaying] = useState(false);
  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:py-10">
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.accent }}>{module.video.label}</p>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: COLOR.textMuted }}>{module.video.description}</p>

      <button
        onClick={() => setPlaying((p) => !p)}
        className="ecl-lift ecl-press relative mt-5 block w-full overflow-hidden rounded-2xl"
        style={{ aspectRatio: '16 / 9', background: `linear-gradient(135deg, ${COLOR.primary}, ${COLOR.secondary})` }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
          <span className="ecl-breathe flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.35)' }}>
            <PlayCircle size={34} strokeWidth={1.5} />
          </span>
          <span className="text-sm font-medium">{playing ? 'Playing preview…' : 'Play clinical overview'}</span>
        </div>
        <ModuleIcon name={module.icon} size={140} className="pointer-events-none absolute -right-6 -top-6 opacity-10" style={{ color: '#fff' }} />
      </button>
      {playing && (
        <p className="ecl-fade-in mt-2 flex items-center gap-1.5 text-xs" style={{ color: COLOR.textMuted }}>
          <CheckCircle2 size={13} style={{ color: COLOR.complete }} /> Preview only in this demo — no video is streamed.
        </p>
      )}

      <div className="mt-8 rounded-2xl p-5" style={{ background: COLOR.recessed }}>
        <p className="text-sm font-medium" style={{ color: COLOR.text }}>Does this remind you of a patient you have recently seen?</p>
        <div className="mt-4 flex flex-col gap-3">
          <ConversionRow discussLabel="Yes — Discuss This Case" referLabel="Yes — Refer a Patient" onDiscuss={onDiscuss} onRefer={onRefer} onBookRyan={onBookRyan} />
          <button onClick={onContinue} className="ecl-underline text-sm font-medium" style={{ color: COLOR.textMuted }}>
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
}

function IndicatorsStep({ module, onDiscuss, onRefer, onBookRyan, onSaveNote }) {
  const COLOR = useColors();
  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:py-10">
      <h2 className="text-2xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>{module.indicators.heading}</h2>
      <ul className="mt-5 space-y-3">
        {module.indicators.items.map((item, i) => (
          <li key={i} className="ecl-fade-up flex items-start gap-3 rounded-xl p-3.5" style={{ animationDelay: `${i * 50}ms`, background: COLOR.recessed }}>
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold" style={{ background: COLOR.accentTint, color: COLOR.accent }}>
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed" style={{ color: COLOR.text }}>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-2xl p-5" style={{ background: COLOR.primaryTint }}>
        <p className="text-sm font-medium" style={{ color: COLOR.text }}>Recognise any of these signs in one of your patients?</p>
        <div className="mt-4">
          <ConversionRow discussLabel="Discuss With Ryan" referLabel="Refer This Patient" onDiscuss={onDiscuss} onRefer={onRefer} onBookRyan={onBookRyan} />
        </div>
        <QuickNote onSave={onSaveNote} />
      </div>
    </div>
  );
}

function ConversationStep({ module }) {
  const COLOR = useColors();
  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:py-10">
      <h2 className="text-2xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>{module.conversation.heading}</h2>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: COLOR.textMuted }}>
        Some natural ways to open the conversation — adapt the wording to fit your own style and the patient in front of you.
      </p>
      <div className="mt-5 space-y-3">
        {module.conversation.examples.map((ex, i) => (
          <div key={i} className="ecl-fade-up rounded-2xl p-4" style={{ animationDelay: `${i * 60}ms`, background: COLOR.recessed, border: `1px solid ${COLOR.border}` }}>
            <Quote size={16} style={{ color: COLOR.accent, opacity: 0.5 }} />
            <p className="mt-1.5 text-sm italic leading-relaxed" style={{ color: COLOR.text }}>“{ex}”</p>
          </div>
        ))}
      </div>
      <ClinicalDisclaimer style={{ marginTop: '1.5rem' }} />
    </div>
  );
}

function CaseStudyStep({ module, onDiscuss, onRefer, onBookRyan, onSaveNote }) {
  const COLOR = useColors();
  const [choice, setChoice] = useState(null);
  const selectedOption = choice !== null ? module.caseStudy.options[choice] : null;
  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:py-10">
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.accent }}>Patient scenario</p>
      <p className="mt-2 rounded-2xl p-5 text-sm leading-relaxed" style={{ background: COLOR.recessed, color: COLOR.text }}>{module.caseStudy.scenario}</p>

      <h3 className="mt-6 text-lg font-medium" style={{ color: COLOR.text }}>{module.caseStudy.question}</h3>
      <div className="mt-4 space-y-2.5">
        {module.caseStudy.options.map((opt, i) => {
          const isSelected = choice === i;
          return (
            <button
              key={i}
              onClick={() => setChoice(i)}
              className="ecl-lift ecl-press flex w-full items-start gap-3 rounded-xl p-4 text-left"
              style={{
                border: `1px solid ${isSelected ? COLOR.primary : COLOR.border}`,
                background: isSelected ? COLOR.primaryTint : COLOR.bg,
              }}
            >
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                style={{ borderColor: isSelected ? COLOR.primary : COLOR.border, background: isSelected ? COLOR.primary : 'transparent' }}
              >
                {isSelected && <CheckCircle2 size={14} style={{ color: '#fff' }} />}
              </span>
              <span className="text-sm font-medium leading-snug" style={{ color: COLOR.text }}>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {selectedOption && (
        <div
          className="ecl-fade-in mt-4 rounded-xl p-4 text-sm leading-relaxed"
          style={{
            background: selectedOption.tone === 'good' ? '#2F7D5A1A' : '#B4780E1A',
            color: COLOR.text,
            border: `1px solid ${selectedOption.tone === 'good' ? COLOR.complete : COLOR.action}`,
          }}
        >
          <p className="flex items-center gap-1.5 font-medium" style={{ color: selectedOption.tone === 'good' ? COLOR.complete : COLOR.action }}>
            {selectedOption.tone === 'good' ? <CheckCircle2 size={15} /> : <HelpCircle size={15} />}
            {selectedOption.tone === 'good' ? 'Worth considering' : 'Worth reflecting on'}
          </p>
          <p className="mt-1.5">{selectedOption.feedback}</p>
        </div>
      )}

      {selectedOption && (
        <div className="ecl-fade-in mt-6 rounded-2xl p-5" style={{ background: COLOR.primary }}>
          <h4 className="text-lg text-white" style={FONT_DISPLAY}>Does this patient sound familiar?</h4>
          <p className="mt-1.5 text-sm text-white/70">You may already have a patient in your practice with a similar presentation.</p>
          <div className="mt-4">
            <ConversionRow
              tone="dark"
              discussLabel="Discuss My Patient With Ryan"
              referLabel="Refer My Patient"
              onDiscuss={onDiscuss}
              onRefer={onRefer}
              onBookRyan={onBookRyan}
            />
          </div>
          <QuickNote onSave={onSaveNote} tone="dark" />
        </div>
      )}
    </div>
  );
}

function WouldYouReferStep({ module, onAdvance }) {
  const COLOR = useColors();
  const scenarios = module.wouldYouRefer;
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState(null);
  const scenario = scenarios[index];

  const CHOICES = [
    { key: 'refer', label: 'Refer' },
    { key: 'monitor', label: 'Monitor' },
    { key: 'unsure', label: 'Not enough information' },
  ];

  function next() {
    if (index + 1 >= scenarios.length) {
      onAdvance();
    } else {
      setIndex((i) => i + 1);
      setChoice(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:py-10">
      <h2 className="text-2xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>Would you consider referral?</h2>
      <p className="mt-2 text-sm" style={{ color: COLOR.textMuted }}>Scenario {index + 1} of {scenarios.length}</p>

      <div key={index} className="ecl-fade-in mt-4 rounded-2xl p-5" style={{ background: COLOR.recessed }}>
        <p className="text-sm font-medium leading-relaxed" style={{ color: COLOR.text }}>{scenario.text}</p>
      </div>

      <p className="mt-5 text-sm font-medium" style={{ color: COLOR.text }}>Would you consider ophthalmology referral?</p>
      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {CHOICES.map((c) => {
          const selected = choice === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setChoice(c.key)}
              className="ecl-lift ecl-press rounded-xl px-4 py-3 text-sm font-medium"
              style={{
                border: `1px solid ${selected ? COLOR.primary : COLOR.border}`,
                background: selected ? COLOR.primaryTint : COLOR.bg,
                color: COLOR.text,
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {choice && (
        <div className="ecl-fade-in mt-4 rounded-xl p-4 text-sm leading-relaxed" style={{ background: '#1D4E751A', border: `1px solid #1D4E75`, color: COLOR.text }}>
          {scenario.feedback[choice]}
        </div>
      )}

      {choice && (
        <button onClick={next} className="ecl-btn ecl-press mt-6 flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white" style={{ background: COLOR.primary }}>
          {index + 1 >= scenarios.length ? 'Continue to knowledge check' : 'Next scenario'} <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}

function QuizStep({ module, onFinish }) {
  const COLOR = useColors();
  const questions = module.quiz;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [scoreSoFar, setScoreSoFar] = useState(0);
  const q = questions[index];
  const isCorrect = selected === q.correctIndex;

  function next() {
    const nextScore = scoreSoFar + (isCorrect ? 1 : 0);
    if (index + 1 >= questions.length) {
      onFinish(nextScore);
    } else {
      setScoreSoFar(nextScore);
      setIndex((i) => i + 1);
      setSelected(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:py-10">
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.accent }}>Knowledge check · Question {index + 1} of {questions.length}</p>
      <h2 key={index} className="ecl-fade-in mt-2 text-xl leading-snug sm:text-2xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>{q.question}</h2>

      <div className="mt-5 space-y-2.5">
        {q.options.map((opt, i) => {
          const isSelected = selected === i;
          const showState = selected !== null;
          const isRight = i === q.correctIndex;
          let borderColor = COLOR.border;
          let bg = COLOR.bg;
          if (showState && isRight) { borderColor = COLOR.complete; bg = '#2F7D5A1A'; }
          else if (showState && isSelected && !isRight) { borderColor = COLOR.problem; bg = '#B3261E0D'; }
          else if (isSelected) { borderColor = COLOR.primary; bg = COLOR.primaryTint; }
          return (
            <button
              key={i}
              onClick={() => selected === null && setSelected(i)}
              disabled={selected !== null}
              className="ecl-lift flex w-full items-center gap-3 rounded-xl p-4 text-left"
              style={{ border: `1px solid ${borderColor}`, background: bg }}
            >
              <span className="text-sm font-medium leading-snug flex-1" style={{ color: COLOR.text }}>{opt}</span>
              {showState && isRight && <CheckCircle2 size={17} style={{ color: COLOR.complete }} />}
              {showState && isSelected && !isRight && <XCircle size={17} style={{ color: COLOR.problem }} />}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div
          className="ecl-fade-in mt-4 rounded-xl p-4 text-sm leading-relaxed"
          style={{ background: isCorrect ? '#2F7D5A1A' : '#B4780E1A', color: COLOR.text, border: `1px solid ${isCorrect ? COLOR.complete : COLOR.action}` }}
        >
          {isCorrect ? q.feedbackCorrect : q.feedbackIncorrect}
        </div>
      )}

      {selected !== null && (
        <button onClick={next} className="ecl-btn ecl-press mt-6 flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white" style={{ background: COLOR.primary }}>
          {index + 1 >= questions.length ? 'See my score' : 'Next question'} <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}

function CompleteStep({ module, quizScore, saved, onToggleSave, onRefer, onDiscuss, onBookRyan, onDownloadGuide, onStartAnother }) {
  const COLOR = useColors();
  const [guideDownloaded, setGuideDownloaded] = useState(false);

  function handleDownload() {
    onDownloadGuide(module);
    setGuideDownloaded(true);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 text-center sm:py-10">
      <div className="ecl-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: '#2F7D5A1A' }}>
        <Award size={30} style={{ color: COLOR.complete }} />
      </div>
      <h1 className="ecl-fade-up mt-5 text-2xl sm:text-3xl" style={{ ...FONT_DISPLAY, color: COLOR.text, animationDelay: '80ms' }}>Module Complete</h1>
      <p className="ecl-fade-up mt-2 text-lg font-medium" style={{ color: COLOR.accent, animationDelay: '120ms' }}>You scored {quizScore}/3</p>
      <p className="ecl-fade-up mt-3 text-sm leading-relaxed" style={{ color: COLOR.textMuted, animationDelay: '160ms' }}>{module.completionMessage}</p>

      <div className="ecl-fade-up mt-8 rounded-2xl p-5 text-left sm:p-6" style={{ animationDelay: '200ms', background: COLOR.recessed, border: `1px solid ${COLOR.border}` }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: COLOR.accentTint, color: COLOR.accent }}>
              <ClipboardList size={18} />
            </span>
            <div>
              <h3 className="font-medium" style={{ ...FONT_DISPLAY, fontSize: '1.05rem', color: COLOR.text }}>{module.referralGuide.title}</h3>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: COLOR.textMuted }}>{module.referralGuide.description}</p>
            </div>
          </div>
          <button
            onClick={onToggleSave}
            className="ecl-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ color: saved ? COLOR.accent : COLOR.textMuted, background: COLOR.bg, border: `1px solid ${COLOR.border}` }}
            aria-label="Save for later"
          >
            {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        </div>
        <ul className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {module.referralGuide.contents.map((c, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: COLOR.textMuted }}>
              <Circle size={5} className="mt-1.5 shrink-0" fill={COLOR.accent} style={{ color: COLOR.accent }} /> {c}
            </li>
          ))}
        </ul>
        <button
          onClick={handleDownload}
          className="ecl-btn ecl-press mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white sm:w-auto"
          style={{ background: COLOR.primary }}
        >
          <Download size={15} /> {guideDownloaded ? 'Downloaded ✓' : 'Download Referral Guide'}
        </button>
        {saved && (
          <p className="ecl-fade-in mt-2 text-xs font-medium" style={{ color: COLOR.complete }}>Saved to your Clinical Education library.</p>
        )}
      </div>

      <div className="ecl-fade-up mt-8 rounded-2xl p-6 sm:p-7" style={{ animationDelay: '240ms', background: COLOR.primary }}>
        <h3 className="text-xl text-white" style={FONT_DISPLAY}>The most important question: do you have a patient in mind?</h3>
        <p className="mt-1.5 text-sm text-white/70">What would you like to do next?</p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={onRefer}
            className="ecl-btn ecl-press flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium"
            style={{ background: COLOR.accent, color: COLOR.primary }}
          >
            <UserPlus size={15} /> Yes — Refer a Patient
          </button>
          <button
            onClick={onDiscuss}
            className="ecl-btn ecl-press flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white"
            style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.35)' }}
          >
            <MessageCircle size={15} /> Yes — Discuss With Ryan
          </button>
          <button
            onClick={handleDownload}
            className="ecl-btn ecl-press flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white"
            style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.35)' }}
          >
            <Download size={15} /> Download Referral Guide
          </button>
          <button
            onClick={onStartAnother}
            className="ecl-btn ecl-press flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white"
            style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.35)' }}
          >
            Start Another Module
          </button>
        </div>
        <button onClick={onBookRyan} className="ecl-underline mt-4 flex items-center gap-1.5 text-xs font-medium text-white/70">
          <Phone size={11} /> Not right now — book a conversation with Ryan instead
        </button>
      </div>
    </div>
  );
}

// ---------- root ----------

export default function ModulePlayer({
  module, onExit, onReferPatient, onOpenDiscuss, onOpenBookRyan, saved, onToggleSave,
  onCompleteModule, onSaveNote, onDownloadGuide, onStepChange,
}) {
  const COLOR = useColors();
  const [stepIndex, setStepIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(null);
  const [justSaved, setJustSaved] = useState(false);
  const step = STEPS[stepIndex];

  useEffect(() => {
    onStepChange?.(module.id, stepIndex, STEPS.length - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  function goNext() { setStepIndex((i) => Math.min(i + 1, STEPS.length - 1)); }
  function goBack() {
    if (stepIndex === 0) { onExit(); return; }
    setStepIndex((i) => i - 1);
  }

  function handleFinishQuiz(score) {
    setQuizScore(score);
    onCompleteModule(module.id, score);
    setStepIndex(STEPS.indexOf('complete'));
  }

  function handleSaveNote(text) {
    onSaveNote(module.id, module.title, text);
  }

  function handleToggleSave() {
    onToggleSave(module.id);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2200);
  }

  const discussContext = `Regarding: ${module.title}`;

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', background: COLOR.bg }}>
      <div style={{ borderBottom: `1px solid ${COLOR.border}`, background: COLOR.bg }}>
        <div className="mx-auto max-w-3xl px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex min-w-0 items-center gap-2" style={{ ...FONT_DISPLAY, fontSize: '1.05rem', color: COLOR.text }}>
              <ModuleIcon name={module.icon} size={17} style={{ color: COLOR.accent }} className="shrink-0" />
              <span className="truncate">{module.title}</span>
            </h2>
            <div className="flex shrink-0 items-center gap-2">
              {step !== 'complete' && (
                <button
                  onClick={handleToggleSave}
                  className="ecl-btn flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ color: saved ? COLOR.accent : COLOR.textMuted, background: COLOR.recessed }}
                  aria-label="Save for later"
                >
                  {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                </button>
              )}
              <button
                onClick={onExit}
                className="ecl-btn flex h-8 w-8 items-center justify-center rounded-full"
                style={{ color: COLOR.textMuted, background: COLOR.recessed }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
          {justSaved && (
            <p className="ecl-fade-in mt-1.5 text-xs font-medium" style={{ color: COLOR.complete }}>Saved to your Clinical Education library.</p>
          )}
          {step !== 'complete' && (
            <>
              <p className="mt-2.5 text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.textMuted }}>{STEP_LABELS[step]}</p>
              <ProgressBar step={stepIndex + 1} total={STEPS.length - 1} />
            </>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div key={step} className="ecl-fade-in">
          {step === 'opening' && <OpeningStep module={module} />}
          {step === 'video' && (
            <VideoStep
              module={module}
              onDiscuss={() => onOpenDiscuss(discussContext)}
              onRefer={onReferPatient}
              onBookRyan={onOpenBookRyan}
              onContinue={goNext}
            />
          )}
          {step === 'indicators' && (
            <IndicatorsStep module={module} onDiscuss={() => onOpenDiscuss(discussContext)} onRefer={onReferPatient} onBookRyan={onOpenBookRyan} onSaveNote={handleSaveNote} />
          )}
          {step === 'conversation' && <ConversationStep module={module} />}
          {step === 'case-study' && (
            <CaseStudyStep module={module} onDiscuss={() => onOpenDiscuss(discussContext)} onRefer={onReferPatient} onBookRyan={onOpenBookRyan} onSaveNote={handleSaveNote} />
          )}
          {step === 'would-you-refer' && <WouldYouReferStep module={module} onAdvance={goNext} />}
          {step === 'quiz' && <QuizStep module={module} onFinish={handleFinishQuiz} />}
          {step === 'complete' && (
            <CompleteStep
              module={module}
              quizScore={quizScore}
              saved={saved}
              onToggleSave={handleToggleSave}
              onRefer={onReferPatient}
              onDiscuss={() => onOpenDiscuss(discussContext)}
              onBookRyan={onOpenBookRyan}
              onDownloadGuide={onDownloadGuide}
              onStartAnother={onExit}
            />
          )}
        </div>
      </div>

      {['opening', 'indicators', 'conversation', 'case-study'].includes(step) && (
        <div style={{ borderTop: `1px solid ${COLOR.border}`, background: COLOR.bg }}>
          <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-6">
            <button onClick={goBack} className="ecl-btn flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium" style={{ color: COLOR.textMuted }}>
              <ArrowLeft size={16} /> {stepIndex === 0 ? 'Exit' : 'Back'}
            </button>
            <button onClick={goNext} className="ecl-btn ecl-press flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium text-white" style={{ background: COLOR.primary }}>
              Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
      {['video', 'would-you-refer', 'quiz'].includes(step) && (
        <div style={{ borderTop: `1px solid ${COLOR.border}`, background: COLOR.bg }}>
          <div className="mx-auto flex max-w-3xl items-center px-5 py-4 sm:px-6">
            <button onClick={goBack} className="ecl-btn flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium" style={{ color: COLOR.textMuted }}>
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
