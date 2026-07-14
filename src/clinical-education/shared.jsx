import { useEffect, useState } from 'react';
import {
  X, Mail, Phone, Send, PhoneOutgoing, CheckCircle2, ShieldCheck, User,
  Eye, Sparkles, GitCompare, Layers, Activity, AlertTriangle,
} from 'lucide-react';
import { useColors, FONT_DISPLAY } from '../theme';
import { CONTACT, TREATMENT_AREAS, AGE_RANGES } from './config';

export const MODULE_ICONS = { Eye, Sparkles, GitCompare, Layers, Activity, AlertTriangle };

export function ModuleIcon({ name, ...props }) {
  const Cmp = MODULE_ICONS[name] || Eye;
  return <Cmp {...props} />;
}

export function ProgressBar({ step, total }) {
  const COLOR = useColors();
  return (
    <div className="mt-3 flex gap-1.5">
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
  );
}

export function ClinicalDisclaimer({ style }) {
  const COLOR = useColors();
  return (
    <p className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: COLOR.textMuted, ...style }}>
      <ShieldCheck size={14} className="mt-0.5 shrink-0" />
      <span>This content is for general education only and does not constitute clinical advice or a diagnosis. Always use your own professional clinical judgement when assessing patients.</span>
    </p>
  );
}

// ---------- shared modal chrome ----------

function ModalShell({ open, onClose, maxWidth = 'max-w-md', zIndex = 'z-[70]', children }) {
  const COLOR = useColors();
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return (
    <div className={`ecl-fade-in fixed inset-0 ${zIndex} overflow-y-auto bg-black/40 p-4 sm:p-8`} onClick={onClose}>
      <div
        className={`ecl-scale-in relative mx-auto my-6 w-full ${maxWidth} rounded-2xl p-6 sm:my-10 sm:p-7`}
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
        {children}
      </div>
    </div>
  );
}

function modalInputStyle(C) {
  return {
    width: '100%',
    borderRadius: '0.625rem',
    border: `1px solid ${C.border}`,
    background: C.bg,
    padding: '0.625rem 0.875rem',
    fontSize: '14px',
    color: C.text,
    outline: 'none',
  };
}

// ---------- Discuss a Case modal ----------

export function DiscussCaseModal({ open, onClose, contextLabel, onBookConversation }) {
  const COLOR = useColors();
  const [treatmentArea, setTreatmentArea] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) setSent(false);
  }, [open]);

  function handleSend() {
    setSent(true);
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setTreatmentArea('');
      setAgeRange('');
      setSymptoms('');
      setNotes('');
      setSent(false);
    }, 300);
  }

  return (
    <ModalShell open={open} onClose={handleClose} maxWidth="max-w-lg">
      {sent ? (
        <div className="ecl-fade-in py-4 text-center">
          <div className="ecl-pop mx-auto flex h-14 w-14 items-center justify-center rounded-full" style={{ background: '#2F7D5A1A' }}>
            <CheckCircle2 size={26} style={{ color: COLOR.complete }} />
          </div>
          <h3 className="mt-4 text-xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>Case enquiry sent</h3>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: COLOR.textMuted }}>
            Thanks — Ryan has received your case outline and will be in touch to discuss the most appropriate next step.
          </p>
          <button
            onClick={handleClose}
            className="ecl-btn ecl-press mt-6 rounded-lg px-5 py-2.5 text-sm font-medium text-white"
            style={{ background: COLOR.primary }}
          >
            Done
          </button>
        </div>
      ) : (
        <div>
          <h3 className="text-xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>Discuss this case</h3>
          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: COLOR.textMuted }}>
            {contextLabel || 'Describe a broad, non-identifiable clinical scenario and Ryan will get back to you.'} No patient names or identifiable details are needed.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: COLOR.text }}>Treatment area or concern</label>
              <select style={modalInputStyle(COLOR)} value={treatmentArea} onChange={(e) => setTreatmentArea(e.target.value)}>
                <option value="">Select an area…</option>
                {TREATMENT_AREAS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: COLOR.text }}>Broad patient age range</label>
              <select style={modalInputStyle(COLOR)} value={ageRange} onChange={(e) => setAgeRange(e.target.value)}>
                <option value="">Select an age range…</option>
                {AGE_RANGES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: COLOR.text }}>Main symptoms or presenting concerns</label>
              <textarea
                style={{ ...modalInputStyle(COLOR), minHeight: 70, resize: 'vertical' }}
                placeholder="e.g. Increasing glare and difficulty driving at night"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: COLOR.text }}>
                Additional notes <span className="font-normal" style={{ color: COLOR.textMuted }}>(optional)</span>
              </label>
              <textarea
                style={{ ...modalInputStyle(COLOR), minHeight: 60, resize: 'vertical' }}
                placeholder="Anything else worth mentioning — no patient-identifiable details please"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleSend}
              className="ecl-btn ecl-press flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white"
              style={{ background: COLOR.primary }}
            >
              <Send size={15} /> Send Case Enquiry
            </button>
            <button
              onClick={() => { handleClose(); onBookConversation?.(); }}
              className="ecl-btn ecl-press flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium"
              style={{ background: COLOR.bg, border: `1px solid ${COLOR.border}`, color: COLOR.text }}
            >
              <Phone size={15} /> Book a Conversation With Ryan
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

// ---------- Book a Conversation with Ryan modal ----------

export function BookRyanModal({ open, onClose }) {
  const COLOR = useColors();
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackTime, setCallbackTime] = useState('');
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (open) {
      setShowCallbackForm(false);
      setRequested(false);
      setCallbackPhone('');
      setCallbackTime('');
    }
  }, [open]);

  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-sm">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-white" style={{ background: COLOR.primary }}>
          R
        </span>
        <h3 className="mt-3 text-xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>Not sure whether a patient is suitable for referral?</h3>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: COLOR.textMuted }}>
          Book a quick conversation with Ryan to discuss the case, possible treatment pathways or the most appropriate next step.
        </p>
        <p className="mt-4 text-sm font-medium" style={{ color: COLOR.text }}>{CONTACT.name}</p>
        <p className="text-xs" style={{ color: COLOR.textMuted }}>{CONTACT.role}</p>

        {requested ? (
          <div className="ecl-fade-in mt-5 rounded-xl p-4" style={{ background: '#2F7D5A1A' }}>
            <p className="flex items-center justify-center gap-2 text-sm font-medium" style={{ color: COLOR.complete }}>
              <CheckCircle2 size={16} /> Callback requested
            </p>
            <p className="mt-1.5 text-xs" style={{ color: COLOR.textMuted }}>Ryan will call you back as soon as possible.</p>
          </div>
        ) : showCallbackForm ? (
          <div className="ecl-fade-in mt-5 space-y-3 text-left">
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: COLOR.text }}>Best number to reach you</label>
              <input style={modalInputStyle(COLOR)} type="tel" value={callbackPhone} onChange={(e) => setCallbackPhone(e.target.value)} placeholder="07…" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: COLOR.text }}>Preferred time <span className="font-normal" style={{ color: COLOR.textMuted }}>(optional)</span></label>
              <input style={modalInputStyle(COLOR)} value={callbackTime} onChange={(e) => setCallbackTime(e.target.value)} placeholder="e.g. Thursday afternoon" />
            </div>
            <button
              onClick={() => setRequested(true)}
              className="ecl-btn ecl-press flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white"
              style={{ background: COLOR.primary }}
            >
              <PhoneOutgoing size={15} /> Request callback
            </button>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={CONTACT.phoneHref}
                className="ecl-btn ecl-press flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium"
                style={{ background: COLOR.bg, border: `1px solid ${COLOR.border}`, color: COLOR.text }}
              >
                <Phone size={15} /> Call Ryan
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="ecl-btn ecl-press flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white"
                style={{ background: COLOR.primary }}
              >
                <Mail size={15} /> Email Ryan
              </a>
            </div>
            <button
              onClick={() => setShowCallbackForm(true)}
              className="ecl-underline text-sm font-medium"
              style={{ color: COLOR.secondary }}
            >
              Or request a callback
            </button>
          </div>
        )}
      </div>
    </ModalShell>
  );
}
