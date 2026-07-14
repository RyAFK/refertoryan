import { useState, useEffect, useRef } from 'react';
import {
  Home, ListChecks, GraduationCap, Megaphone, Bell, User, ChevronDown, Building2,
  ArrowLeft, ArrowRight, CheckCircle2, Upload, FileText, X, Eye, Sparkles, ScanEye,
  Zap, Droplets, CircleDot, Stethoscope, MoreHorizontal, Mail, Loader2, Clock3,
  Calendar, Newspaper, MapPin, Phone, ArrowUpRight, Award, ShieldCheck, Users2,
  TrendingUp, PoundSterling, Percent, PieChart as PieChartIcon,
  Star, ChevronLeft, ChevronRight, Quote, BadgeCheck, Play, Instagram, Lightbulb, Hourglass,
  UserPlus, Search, ClipboardList, Crown, LogOut, Sun, Moon, Filter, UserX, Activity, Sparkle,
  Compass,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell,
} from 'recharts';
import { DAY_COLORS, NIGHT_COLORS, ColorContext, useColors, FONT_DISPLAY, FONT_BODY, FONT_MONO } from './theme';
import ReferralAssistant from './referral-assistant/ReferralAssistant';
import ClinicalEducation from './clinical-education/ClinicalEducation';

const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Parisienne&display=swap');

@keyframes eclFadeInUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes eclFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes eclScaleIn { from { opacity: 0; transform: scale(0.95) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes eclBreathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.035); } }
@keyframes eclPop { 0% { opacity: 0; transform: scale(0.6); } 60% { opacity: 1; transform: scale(1.08); } 100% { transform: scale(1); } }
@keyframes eclGlow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
@keyframes eclFloatY { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
@keyframes eclFloatY2 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(8px); } }
@keyframes eclBorderGlow {
  0%, 100% { box-shadow: 0 0 0 2px rgba(176,138,78,0.3), 0 0 16px rgba(176,138,78,0.28); }
  50% { box-shadow: 0 0 0 4px rgba(176,138,78,0.5), 0 0 32px rgba(176,138,78,0.45); }
}
@keyframes eclConfettiFall {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  85% { opacity: 1; }
  100% { transform: translateY(105vh) rotate(560deg); opacity: 0; }
}

.ecl-fade-up { animation: eclFadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) both; }
.ecl-fade-in { animation: eclFadeIn 0.4s ease-out both; }
.ecl-scale-in { animation: eclScaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both; }
.ecl-breathe { animation: eclBreathe 5s ease-in-out infinite; }
.ecl-pop { animation: eclPop 0.5s cubic-bezier(0.16,1,0.3,1) both; }
.ecl-glow-dot { animation: eclGlow 2.4s ease-in-out infinite; }
.ecl-float { animation: eclFloatY 16s ease-in-out infinite; }
.ecl-float-2 { animation: eclFloatY2 19s ease-in-out infinite; }
.ecl-tip-glow { animation: eclBorderGlow 2.8s ease-in-out infinite; }

.ecl-lift { transition: transform 220ms cubic-bezier(0.16,1,0.3,1), box-shadow 220ms ease, border-color 220ms ease; }
.ecl-lift:hover { transform: translateY(-2px); box-shadow: 0 10px 24px -12px rgba(11,37,69,0.25); }
.ecl-press:active { transform: scale(0.97); }
.ecl-btn { transition: transform 180ms cubic-bezier(0.16,1,0.3,1), box-shadow 180ms ease, filter 180ms ease, background 180ms ease, opacity 180ms ease; }
.ecl-btn:hover { transform: translateY(-1px); filter: brightness(1.04); }
.ecl-btn:active { transform: translateY(0) scale(0.98); }
.ecl-underline { position: relative; }
.ecl-underline::after { content: ''; position: absolute; left: 0; right: 100%; bottom: -2px; height: 1.5px; background: currentColor; transition: right 220ms ease; }
.ecl-underline:hover::after { right: 0; }
* { transition: background-color 240ms ease, border-color 240ms ease, color 240ms ease; }
`;

function ThemeToggle({ theme, onToggle, inline = false }) {
  const COLOR = useColors();
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle day / night view"
      className={`ecl-btn ecl-press flex h-9 w-9 items-center justify-center rounded-full shadow-sm ${inline ? '' : 'fixed right-4 top-4 z-[70] shadow-md'}`}
      style={{ background: COLOR.bg, border: `1px solid ${COLOR.border}`, color: theme === 'day' ? COLOR.secondary : COLOR.accent }}
    >
      {theme === 'day' ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}

function CountUp({ value, duration = 900, locale = false }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => raf.current && cancelAnimationFrame(raf.current);
  }, [value, duration]);
  return <>{locale ? display.toLocaleString('en-GB') : display}</>;
}

function EclWordmark({ tone = 'dark', size = 'md', className = '' }) {
  const COLOR = useColors();
  const textColor = tone === 'white' ? '#FFFFFF' : COLOR.primary;
  const sizes = { sm: { icon: 22, font: '15px' }, md: { icon: 26, font: '17px' }, lg: { icon: 34, font: '22px' } };
  const s = sizes[size];
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width={s.icon} height={s.icon} viewBox="0 0 40 40" fill="none" className="shrink-0">
        <circle cx="20" cy="20" r="19" stroke={tone === 'white' ? '#FFFFFF' : COLOR.primary} strokeOpacity={tone === 'white' ? 0.5 : 0.25} />
        <path d="M4 20c5.5-8 12-12 16-12s10.5 4 16 12c-5.5 8-12 12-16 12S9.5 28 4 20Z" fill="none" stroke={tone === 'white' ? '#FFFFFF' : COLOR.primary} strokeWidth="1.6" />
        <circle cx="20" cy="20" r="6.2" fill={COLOR.accent} />
        <circle cx="20" cy="20" r="2.6" fill={tone === 'white' ? COLOR.primary : '#FFFFFF'} />
      </svg>
      <span style={{ ...FONT_DISPLAY, color: textColor, fontSize: s.font, lineHeight: 1 }}>
        Eye Clinic <span style={{ color: COLOR.accent }}>London</span>
      </span>
    </span>
  );
}

const TREATMENT_TYPES = [
  { id: 'cataract', name: 'Cataract', description: 'Lens replacement for cataracts', Icon: Eye },
  { id: 'rle', name: 'Refractive Lens Exchange', description: 'Lens exchange for refractive correction', Icon: Sparkles },
  { id: 'icl', name: 'Implantable Contact Lens / ICL', description: 'Phakic lens implantation', Icon: ScanEye },
  { id: 'lvc', name: 'Laser Vision Correction', description: 'LASIK / PRK / SMILE', Icon: Zap },
  { id: 'cornea', name: 'Cornea', description: 'Corneal conditions and transplant', Icon: CircleDot },
  { id: 'dry_eye', name: 'Dry Eye', description: 'Dry eye assessment and management', Icon: Droplets },
  { id: 'general', name: 'General Ophthalmology', description: 'General ophthalmic assessment', Icon: Stethoscope },
  { id: 'other', name: 'Other', description: 'Any other treatment enquiry', Icon: MoreHorizontal },
];

const TREATMENT_FEE_MAP = { cataract: 150, rle: 180, icl: 200, lvc: 200, cornea: 120, dry_eye: 80, general: 90, other: 100 };

const STEPS = ['Patient details', 'Referral type', 'Clinical information', 'Documents', 'Review & submit'];

const CONSENT_TEXT =
  'I confirm that the patient is aware of this referral and that I am authorised to securely provide the information contained in this referral to Eye Clinic London.';

const TRUSTPILOT_URL = 'https://uk.trustpilot.com/review/eyecliniclondon.com';
const TRUSTPILOT_SUMMARY = { score: 5.0, count: 304, fiveStarPct: 98 };

const TRUSTPILOT_REVIEWS = [
  { name: 'Betty', text: 'The whole team went beyond medical treatment — professional, emotionally supportive, clear and quick to respond at every step.', treatment: 'Verified patient' },
  { name: 'A patient of Mr Hamada', text: 'Reassured throughout cataract removal and YAG laser treatment — a calming manner that put nerves completely at ease.', treatment: 'Cataract surgery' },
  { name: 'A long-term patient', text: 'Years of care from Mr Hamada, described as endlessly patient with clear, honest and genuinely supportive communication.', treatment: 'Ongoing care' },
  { name: 'A dry eye patient', text: 'Years of gritty, uncomfortable eyes finally eased after a short course of IPL treatment recommended by Mr Hamada.', treatment: 'IPL / Dry eye' },
  { name: 'Newman', text: 'Worsening cataracts had stopped night driving and reading — surgery with Mr Hamada brought colour and clarity back.', treatment: 'Cataract surgery' },
  { name: 'Catherine Hogan', text: 'A pain-free PRK experience with Joanna guiding every step — felt safe, informed and well looked after throughout.', treatment: 'PRK laser surgery' },
];

const CPD_EVENTS = [
  {
    title: 'Understanding the Evolution & Clinical Impact of Modern Dry Eye Guidelines',
    points: '4 CPD points',
    date: 'Tue 21 July 2026',
    time: '6:30–9:00pm · 7 Devonshire St',
    speakers: 'Mr Samer Hamada · Louise Veenhuis',
    url: 'https://www.eventbrite.com/e/understanding-the-evolution-clinical-impact-of-modern-dry-eye-guidelines-tickets-1993458759813?aff=oddtdtcreator',
  },
];

const CLINIC_NEWS = [
  { title: 'Mr Samer Hamada attended CroOphthaCon 2026 in Solin, Croatia, connecting with the Croatian ophthalmology community', date: 'via LinkedIn', url: 'https://www.linkedin.com/in/samer-hamada-b980621b' },
  { title: 'Back from the 5th International Dry Eye Congress in Naples, continuing his work on ocular surface disease', date: 'via LinkedIn', url: 'https://www.linkedin.com/in/samer-hamada-b980621b' },
  { title: 'Launched the Ocular Surface Academy (OSA), a new platform for international ophthalmology education', date: 'via LinkedIn', url: 'https://www.linkedin.com/in/samer-hamada-b980621b' },
];

// ---------- shared bits ----------

function Pill({ children, tone = 'default' }) {
  const COLOR = useColors();
  const tones = {
    default: { bg: COLOR.recessed, color: COLOR.textMuted },
    complete: { bg: '#2F7D5A1A', color: COLOR.complete },
    action: { bg: '#B4780E1A', color: COLOR.action },
    accent: { bg: COLOR.accentTint, color: COLOR.accent },
    info: { bg: '#1D4E751A', color: '#1D4E75' },
    purple: { bg: '#6D4AA31A', color: '#6D4AA3' },
    teal: { bg: '#0F766E1A', color: '#0F766E' },
    closed: { bg: '#78716C1A', color: '#78716C' },
  };
  const t = tones[tone] || tones.default;
  return (
    <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: t.bg, color: t.color }}>
      {children}
    </span>
  );
}

function Field({ label, children, hint }) {
  const COLOR = useColors();
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium" style={{ color: COLOR.text }}>
        {label}
        {hint && <span className="ml-1 font-normal" style={{ color: COLOR.textMuted }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function makeInputStyle(C) {
  return {
    width: '100%',
    borderRadius: '0.625rem',
    border: `1px solid ${C.border}`,
    background: C.bg,
    padding: '0.625rem 0.875rem',
    fontSize: '15px',
    color: C.text,
    outline: 'none',
    transition: 'border-color 180ms ease, box-shadow 180ms ease',
  };
}

function TextInput(props) {
  const COLOR = useColors();
  const base = makeInputStyle(COLOR);
  return <input {...props} style={{ ...base, ...(props.style || {}) }} className={`focus:ring-2 ${props.className || ''}`} />;
}
function TextArea(props) {
  const COLOR = useColors();
  const base = makeInputStyle(COLOR);
  return <textarea {...props} style={{ ...base, minHeight: 80, resize: 'vertical', ...(props.style || {}) }} />;
}

function statToneColor(tone, C) {
  if (tone === 'complete') return C.complete;
  if (tone === 'action') return C.action;
  if (tone === 'info') return '#1D4E75';
  if (tone === 'purple') return '#6D4AA3';
  if (tone === 'teal') return '#0F766E';
  if (tone === 'closed') return '#78716C';
  return C.text;
}
function statToneBg(tone, C) {
  if (tone === 'complete') return '#2F7D5A1A';
  if (tone === 'action') return '#B4780E1A';
  if (tone === 'info') return '#1D4E751A';
  if (tone === 'purple') return '#6D4AA31A';
  if (tone === 'teal') return '#0F766E1A';
  if (tone === 'closed') return '#78716C1A';
  return C.primaryTint;
}

// ---------- decorative motifs ----------

function EyeMotif({ size = 220, tone }) {
  const COLOR = useColors();
  const strokeTone = tone || COLOR.accent;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="98" fill={COLOR.primaryTint} />
      <path d="M20 100c26-42 60-62 80-62s54 20 80 62c-26 42-60 62-80 62s-54-20-80-62Z" fill={COLOR.bg} stroke={COLOR.primary} strokeOpacity="0.15" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="38" fill={COLOR.primary} />
      <circle cx="100" cy="100" r="38" fill="url(#irisGrad)" opacity="0.9" />
      <circle cx="100" cy="100" r="17" fill="#0A1420" />
      <circle cx="90" cy="90" r="6" fill="#FFFFFF" opacity="0.85" />
      <path d="M20 100c26-42 60-62 80-62s54 20 80 62" stroke={strokeTone} strokeWidth="2.5" strokeLinecap="round" opacity="0.55" fill="none" />
      <defs>
        <radialGradient id="irisGrad" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0%" stopColor={COLOR.secondary} />
          <stop offset="100%" stopColor={COLOR.primary} />
        </radialGradient>
      </defs>
    </svg>
  );
}

function LensRings({ className = '', size = 160 }) {
  const COLOR = useColors();
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={className}>
      <circle cx="80" cy="80" r="78" stroke={COLOR.accent} strokeOpacity="0.25" strokeWidth="1.5" />
      <circle cx="80" cy="80" r="58" stroke={COLOR.accent} strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="80" cy="80" r="38" stroke={COLOR.accent} strokeOpacity="0.5" strokeWidth="1.5" />
    </svg>
  );
}

// ---------- Trustpilot carousel (swipeable, guaranteed-visible transitions) ----------

function TrustpilotCarousel() {
  const COLOR = useColors();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [entered, setEntered] = useState(true);
  const review = TRUSTPILOT_REVIEWS[index];
  const dragX = useRef(null);
  const dragging = useRef(false);

  function go(delta) {
    setDir(delta);
    setEntered(false);
    setIndex((i) => (i + delta + TRUSTPILOT_REVIEWS.length) % TRUSTPILOT_REVIEWS.length);
  }

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [index]);

  function onPointerDown(e) {
    dragX.current = e.clientX;
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onPointerUp(e) {
    if (!dragging.current || dragX.current === null) return;
    const diff = e.clientX - dragX.current;
    if (Math.abs(diff) > 40) go(diff < 0 ? 1 : -1);
    dragging.current = false;
    dragX.current = null;
  }

  return (
    <div className="ecl-fade-up ecl-lift mt-6 rounded-2xl p-3 sm:w-1/2" style={{ animationDelay: '80ms', background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="ecl-breathe flex h-7 w-7 items-center justify-center rounded-full" style={{ background: '#00B67A1A' }}>
            <Star size={14} fill="#00B67A" style={{ color: '#00B67A' }} />
          </span>
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium" style={{ color: COLOR.text }}>
              Trustpilot <span style={{ color: '#00B67A' }}>{TRUSTPILOT_SUMMARY.score.toFixed(1)}</span>
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={10} fill="#00B67A" style={{ color: '#00B67A' }} />)}
              </span>
            </p>
            <p className="text-[11px]" style={{ color: COLOR.textMuted }}>
              {TRUSTPILOT_SUMMARY.count}+ reviews · {TRUSTPILOT_SUMMARY.fiveStarPct}% rated 5 stars
            </p>
          </div>
        </div>
        <button
          onClick={() => window.open(TRUSTPILOT_URL, '_blank', 'noopener,noreferrer')}
          className="ecl-underline flex items-center gap-1 text-[11px] font-medium"
          style={{ color: COLOR.secondary }}
        >
          Read all reviews <ArrowUpRight size={11} />
        </button>
      </div>

      <div
        className="relative mt-3 touch-pan-y select-none overflow-hidden rounded-xl p-3"
        style={{ background: COLOR.recessed, minHeight: 108, cursor: 'grab' }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={() => { dragging.current = false; dragX.current = null; }}
      >
        <div
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateX(0)' : `translateX(${dir >= 0 ? 22 : -22}px)`,
            transition: 'opacity 380ms cubic-bezier(0.16,1,0.3,1), transform 380ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <Quote size={18} style={{ color: COLOR.accent, opacity: 0.35 }} />
          <p className="mt-1.5 text-xs leading-relaxed" style={{ color: COLOR.text }}>{review.text}</p>
          <div className="mt-2.5 flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium" style={{ color: COLOR.text }}>
                {review.name} <BadgeCheck size={12} style={{ color: '#00B67A' }} />
              </p>
              <p className="text-[11px]" style={{ color: COLOR.textMuted }}>{review.treatment}</p>
            </div>
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={11} fill="#00B67A" style={{ color: '#00B67A' }} />)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex gap-1.5">
          {TRUSTPILOT_REVIEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDir(i > index ? 1 : -1); setEntered(false); setIndex(i); }}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: i === index ? 18 : 6, background: i === index ? COLOR.primary : COLOR.border }}
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => go(-1)} className="ecl-btn ecl-press flex h-7 w-7 items-center justify-center rounded-full" style={{ border: `1px solid ${COLOR.border}`, color: COLOR.textMuted }}>
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => go(1)} className="ecl-btn ecl-press flex h-7 w-7 items-center justify-center rounded-full" style={{ border: `1px solid ${COLOR.border}`, color: COLOR.textMuted }}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- CPD & News ----------

function CpdNewsSection() {
  const COLOR = useColors();
  return (
    <div className="ecl-fade-up mt-10 rounded-2xl p-6 sm:p-8" style={{ animationDelay: '160ms', background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
      <div className="relative">
        <div className="relative flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.accent }}>For our referring partners</p>
            <h2 className="mt-1 text-2xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>CPD Events &amp; Clinic News</h2>
          </div>
          <Award size={28} style={{ color: COLOR.accent }} className="hidden shrink-0 sm:block" />
        </div>

        <div className="relative mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium" style={{ color: COLOR.textMuted }}>
              <Calendar size={15} /> Upcoming CPD events
            </p>
            <div className="space-y-3">
              {CPD_EVENTS.map((e) => (
                <button
                  key={e.title}
                  onClick={() => window.open(e.url, '_blank', 'noopener,noreferrer')}
                  className="ecl-btn flex w-full items-center justify-between gap-4 rounded-xl p-4 text-left"
                  style={{ background: COLOR.recessed, border: `1px solid ${COLOR.border}` }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: COLOR.text }}>{e.title}</p>
                    <p className="mt-1 text-xs" style={{ color: COLOR.textMuted }}>{e.date} · {e.time}</p>
                    <p className="mt-0.5 text-xs" style={{ color: COLOR.textMuted }}>{e.speakers}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Pill tone="accent">{e.points}</Pill>
                    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: COLOR.secondary }}>
                      Get tickets <ArrowUpRight size={12} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium" style={{ color: COLOR.textMuted }}>
              <Newspaper size={15} /> Latest from Mr Samer Hamada
            </p>
            <div className="space-y-3">
              {CLINIC_NEWS.map((n) => (
                <button
                  key={n.title}
                  onClick={() => window.open(n.url, '_blank', 'noopener,noreferrer')}
                  className="ecl-btn block w-full rounded-xl p-4 text-left"
                  style={{ background: COLOR.recessed, border: `1px solid ${COLOR.border}` }}
                >
                  <p className="text-sm font-medium" style={{ color: COLOR.text }}>{n.title}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: COLOR.textMuted }}>{n.date} <ArrowUpRight size={11} /></p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Success stories / patient stories ----------

function SuccessStories() {
  const COLOR = useColors();
  const [imgError, setImgError] = useState(false);
  const videoUrl = 'https://youtu.be/_i11QIhGnG4';
  return (
    <div className="ecl-fade-up mt-10 rounded-2xl p-6 sm:p-8" style={{ animationDelay: '160ms', background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.accent }}>Success stories</p>
      <h2 className="mt-1 text-2xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>A referring partner's own experience</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: COLOR.textMuted }}>
        Khansa M. is an optometrist and a long-standing referring partner of ECL. Over the years, she has trusted Mr Samer Hamada with her own ICL surgery and, more recently, referred her mother to us for cataract surgery.
      </p>
      <button
        onClick={() => window.open(videoUrl, '_blank', 'noopener,noreferrer')}
        className="ecl-lift ecl-press mt-5 block w-full text-left"
        style={{
          borderRadius: '1.25rem',
          padding: 3,
          overflow: 'hidden',
          backgroundImage: `linear-gradient(45deg, ${COLOR.primary} 0%, ${COLOR.secondary} 45%, ${COLOR.accent} 100%)`,
        }}
      >
        <div
          className="flex items-center justify-center gap-3 px-6 py-5"
          style={{ background: COLOR.bg, borderRadius: 'calc(1.25rem - 3px)', overflow: 'hidden' }}
        >
          <span className="ecl-breathe flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: COLOR.primary }}>
            <Play size={18} fill="#fff" style={{ color: '#fff', marginLeft: 2 }} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: COLOR.text }}>Watch on YouTube</p>
            <p className="flex items-center gap-1 text-xs" style={{ color: COLOR.textMuted }}>
              <Eye size={11} /> Optometrist verified · video link
            </p>
          </div>
          <ArrowUpRight size={16} className="ml-auto shrink-0" style={{ color: COLOR.accent }} />
        </div>
      </button>
    </div>
  );
}

function JimRosenthalStory() {
  const COLOR = useColors();
  const url = 'https://www.instagram.com/reel/DZkLzd0KGy6/?igsh=MnZ0aTZnOHN2a3c=';
  return (
    <div className="ecl-fade-up mt-10 rounded-2xl p-6 sm:p-8" style={{ animationDelay: '200ms', background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.accent }}>Patient story</p>
      <h2 className="mt-1 text-2xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>Caring for Jim Rosenthal</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: COLOR.textMuted }}>
        It was a real privilege to care for legendary sports broadcaster Jim Rosenthal, who recently underwent bilateral cataract surgery with Mr Samer Hamada.
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: COLOR.textMuted }}>
        We're incredibly grateful to Jim for sharing such kind words about his experience with us.
      </p>

      <button
        onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
        className="ecl-lift ecl-press mt-5 block w-full text-left"
        style={{
          borderRadius: '1.25rem',
          padding: 3,
          backgroundImage: 'linear-gradient(45deg, #f9ce34 0%, #ee2a7b 45%, #6228d7 100%)',
        }}
      >
        <div className="flex items-center justify-center gap-3 rounded-[1.05rem] px-6 py-5" style={{ background: COLOR.bg }}>
          <span className="ecl-breathe flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ backgroundImage: 'linear-gradient(45deg, #f9ce34 0%, #ee2a7b 45%, #6228d7 100%)' }}>
            <Play size={18} fill="#fff" style={{ color: '#fff', marginLeft: 2 }} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: COLOR.text }}>Watch the reel</p>
            <p className="flex items-center gap-1 text-xs" style={{ color: COLOR.textMuted }}>
              <Instagram size={11} /> Follow us · video link
            </p>
          </div>
          <ArrowUpRight size={16} className="ml-auto shrink-0" style={{ color: COLOR.accent }} />
        </div>
      </button>
    </div>
  );
}

function HereToHelp() {
  const COLOR = useColors();
  return (
    <div className="ecl-fade-up mt-10 rounded-2xl p-6 sm:p-8" style={{ animationDelay: '240ms', background: COLOR.accentTint, border: `1px solid ${COLOR.border}` }}>
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: COLOR.bg, color: COLOR.accent }}>
          <Users2 size={22} />
        </span>
        <div>
          <h2 className="text-2xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>We're here to help</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: COLOR.textMuted }}>
            Have a question about our treatments? Need patient leaflets for your practice or access to priority appointments?
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: COLOR.textMuted }}>
            Our Business Development Manager, Ryan, is here to help.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="mailto:ryan@eyecliniclondon.com"
              onClick={() => { window.location.href = 'mailto:ryan@eyecliniclondon.com'; }}
              className="ecl-btn ecl-press flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white"
              style={{ background: COLOR.primary }}
            >
              <Mail size={15} /> ryan@eyecliniclondon.com
            </a>
            <a
              href="tel:+447340890623"
              className="ecl-btn ecl-press flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium"
              style={{ background: COLOR.bg, border: `1px solid ${COLOR.border}`, color: COLOR.text }}
            >
              <Phone size={15} /> 07340 890 623
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- August Offer modal ----------

function AugustOfferModal({ open, onClose }) {
  const COLOR = useColors();
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return (
    <div className="ecl-fade-in fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4 sm:p-8" onClick={onClose}>
      <div
        className="ecl-scale-in relative mx-auto my-6 w-full max-w-md overflow-hidden rounded-2xl sm:my-10"
        style={{ background: COLOR.primary, boxShadow: '0 30px 70px -20px rgba(0,0,0,0.4)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <LensRings className="ecl-float pointer-events-none absolute -right-10 -top-12 z-0 opacity-30" size={200} />

        <button
          type="button"
          onClick={onClose}
          className="ecl-btn absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full"
          style={{ color: '#fff', background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          <X size={17} />
        </button>

        <div className="relative z-10 px-6 py-8 sm:px-8">
          <span
            className="ecl-glow-dot inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide"
            style={{ background: 'rgba(176,138,78,0.18)', color: COLOR.accent }}
          >
            <Clock3 size={12} /> Limited time · August offer
          </span>

          <h2 className="mt-3 pr-10 text-2xl text-white sm:text-3xl" style={FONT_DISPLAY}>
            Dry eye relief, at a special price
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            This August, encourage patients with persistent dry eye symptoms to book an IPL treatment course — reduced course pricing is available for a limited time only.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">IPL Treatment · 4 sessions</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-medium text-white">£1,000</span>
                <span className="text-sm text-white/50 line-through">£1,200</span>
              </div>
              <p className="mt-1 text-xs text-white/50">Save £200 on the full course</p>
            </div>
            <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">Eyes + Face IPL</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-medium text-white">£1,333</span>
                <span className="text-sm text-white/50 line-through">£1,600</span>
              </div>
              <p className="mt-1 text-xs text-white/50">Save £267 on the full course</p>
            </div>
          </div>

          <p className="mt-5 text-xs text-white/50">Offer available throughout August 2026 · speak to our team for full terms.</p>
        </div>
      </div>
    </div>
  );
}

// ---------- one-shot confetti burst ----------

function ConfettiBurst({ active }) {
  const COLOR = useColors();
  const CONFETTI_COLORS = [COLOR.accent, COLOR.complete, COLOR.secondary, COLOR.primary, '#D98BA0'];
  const pieces = useRef(
    Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 250,
      duration: 1700 + Math.random() * 1300,
      rotate: Math.random() * 360,
      width: 5 + Math.random() * 5,
      height: 8 + Math.random() * 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      round: Math.random() > 0.5,
    }))
  ).current;

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: -24,
            left: `${p.left}%`,
            width: p.width,
            height: p.height,
            background: p.color,
            borderRadius: p.round ? '50%' : '2px',
            transform: `rotate(${p.rotate}deg)`,
            animation: `eclConfettiFall ${p.duration}ms ease-in ${p.delay}ms forwards`,
          }}
        />
      ))}
    </div>
  );
}

// ---------- Refer a Patient wizard ----------

function ReferWizard({ onExit, onSubmitReferral }) {
  const COLOR = useColors();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [files, setFiles] = useState([]);
  const [patient, setPatient] = useState({ firstName: '', lastName: '', dob: '', email: '', phone: '', contactMethod: 'either', consent: false });
  const [treatmentId, setTreatmentId] = useState('');
  const [clinical, setClinical] = useState({ reason: '', symptoms: '', uva: '', bcva: '' });
  const [error, setError] = useState('');
  const [confetti, setConfetti] = useState(false);

  const treatment = TREATMENT_TYPES.find((t) => t.id === treatmentId);

  useEffect(() => {
    if (result) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [result]);

  useEffect(() => {
    if (!confetti) return;
    const t = setTimeout(() => setConfetti(false), 2600);
    return () => clearTimeout(t);
  }, [confetti]);

  function validateStep() {
    if (step === 0) {
      if (!patient.firstName || !patient.lastName || !patient.dob || !patient.phone) {
        setError('Please fill in the required patient details.');
        return false;
      }
      if (!patient.consent) {
        setError('Patient consent must be confirmed before continuing.');
        return false;
      }
    }
    if (step === 1 && !treatmentId) {
      setError('Select a treatment category to continue.');
      return false;
    }
    setError('');
    return true;
  }

  function goNext() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function submit() {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const reference = `ECL-2026-${String(Math.floor(Math.random() * 900000) + 100000).slice(0, 6)}`;
      setResult({
        reference,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      });
      setConfetti(true);
      onSubmitReferral?.({
        id: crypto.randomUUID(),
        patient: `${patient.firstName} ${patient.lastName}`.trim() || 'New patient',
        practice: 'Keith Holland Opticians',
        treatment: treatment?.name || 'General enquiry',
        status: 'Referral Received',
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        fee: TREATMENT_FEE_MAP[treatmentId] || 100,
        reference,
      });
    }, 900);
  }

  if (result) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 text-center">
        <ConfettiBurst active={confetti} />
        <div className="ecl-pop mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: '#2F7D5A1A' }}>
          <CheckCircle2 size={32} style={{ color: COLOR.complete }} />
        </div>
        <h1 className="ecl-fade-up text-3xl" style={{ ...FONT_DISPLAY, color: COLOR.text, animationDelay: '100ms' }}>Referral submitted successfully</h1>
        <p className="ecl-fade-up mt-2" style={{ color: COLOR.textMuted, animationDelay: '160ms' }}>Eye Clinic London has received this referral and will be in touch.</p>

        <dl className="ecl-fade-up mt-8 grid grid-cols-2 gap-4 rounded-2xl p-6 text-left" style={{ animationDelay: '220ms', background: COLOR.recessed, border: `1px solid ${COLOR.border}` }}>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.textMuted }}>Reference</dt>
            <dd className="mt-1 text-lg" style={FONT_MONO}>{result.reference}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.textMuted }}>Submitted</dt>
            <dd className="mt-1 text-lg" style={{ color: COLOR.text }}>{result.date}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.textMuted }}>Patient</dt>
            <dd className="mt-1 text-lg" style={{ color: COLOR.text }}>{patient.firstName} {patient.lastName.charAt(0)}.</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.textMuted }}>Treatment</dt>
            <dd className="mt-1 text-lg" style={{ color: COLOR.text }}>{treatment?.name}</dd>
          </div>
        </dl>

        <div className="ecl-fade-up mt-8 flex flex-col justify-center gap-3 sm:flex-row" style={{ animationDelay: '280ms' }}>
          <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); onExit(); }} className="ecl-btn ecl-press rounded-lg px-5 py-2.5 text-sm font-medium text-white" style={{ background: COLOR.primary }}>
            Return to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', background: COLOR.bg }}>
      <div style={{ borderBottom: `1px solid ${COLOR.border}`, background: COLOR.bg }}>
        <div className="mx-auto max-w-3xl px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <h2 style={{ ...FONT_DISPLAY, fontSize: '1.15rem', color: COLOR.text }}>
              Refer a patient · step {step + 1} of {STEPS.length}
            </h2>
            <button
              onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); onExit(); }}
              className="ecl-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ color: COLOR.textMuted, background: COLOR.recessed }}
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-3 flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 999,
                  background: i <= step ? COLOR.accent : COLOR.border,
                  transition: 'background 350ms ease',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="mx-auto max-w-3xl px-5 py-6 sm:px-6">
        <div key={step} className="ecl-fade-in">
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>Patient details</h2>
              <p className="mt-1" style={{ color: COLOR.textMuted }}>Who are you referring to Eye Clinic London?</p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="First name">
                <TextInput value={patient.firstName} onChange={(e) => setPatient({ ...patient, firstName: e.target.value })} />
              </Field>
              <Field label="Last name">
                <TextInput value={patient.lastName} onChange={(e) => setPatient({ ...patient, lastName: e.target.value })} />
              </Field>
              <Field label="Date of birth">
                <TextInput type="date" value={patient.dob} onChange={(e) => setPatient({ ...patient, dob: e.target.value })} />
              </Field>
              <Field label="Telephone">
                <TextInput type="tel" value={patient.phone} onChange={(e) => setPatient({ ...patient, phone: e.target.value })} />
              </Field>
              <Field label="Email address" hint="(optional)">
                <TextInput type="email" value={patient.email} onChange={(e) => setPatient({ ...patient, email: e.target.value })} />
              </Field>
              <Field label="Preferred contact method">
                <select style={makeInputStyle(COLOR)} value={patient.contactMethod} onChange={(e) => setPatient({ ...patient, contactMethod: e.target.value })}>
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="either">Either</option>
                </select>
              </Field>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg p-4 transition-colors duration-200" style={{ background: COLOR.recessed, border: `1px solid ${COLOR.border}` }}>
              <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" checked={patient.consent} onChange={(e) => setPatient({ ...patient, consent: e.target.checked })} />
              <span className="text-sm" style={{ color: COLOR.text }}>{CONSENT_TEXT}</span>
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>Referral type</h2>
              <p className="mt-1" style={{ color: COLOR.textMuted }}>Choose the treatment category this referral relates to.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {TREATMENT_TYPES.map(({ id, name, description, Icon }, i) => {
                const selected = treatmentId === id;
                return (
                  <button
                    key={id}
                    onClick={() => setTreatmentId(id)}
                    className="ecl-fade-up ecl-lift ecl-press flex items-start gap-3.5 rounded-2xl p-4 text-left transition-all"
                    style={{
                      animationDelay: `${i * 40}ms`,
                      border: `1px solid ${selected ? COLOR.primary : COLOR.border}`,
                      background: selected ? COLOR.primaryTint : COLOR.bg,
                    }}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200"
                      style={{ background: selected ? COLOR.primary : COLOR.recessed, color: selected ? '#fff' : COLOR.secondary }}
                    >
                      <Icon size={20} strokeWidth={1.75} />
                    </span>
                    <span>
                      <span className="block font-medium" style={{ color: COLOR.text }}>{name}</span>
                      <span className="mt-0.5 block text-sm" style={{ color: COLOR.textMuted }}>{description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>Clinical information</h2>
              <p className="mt-1" style={{ color: COLOR.textMuted }}>Optional — add whatever you have to hand.</p>
            </div>
            <Field label="Reason for referral">
              <TextArea value={clinical.reason} onChange={(e) => setClinical({ ...clinical, reason: e.target.value })} />
            </Field>
            <Field label="Presenting symptoms">
              <TextArea value={clinical.symptoms} onChange={(e) => setClinical({ ...clinical, symptoms: e.target.value })} />
            </Field>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 rounded-2xl p-5" style={{ background: COLOR.recessed }}>
              <Field label="Unaided visual acuity">
                <TextInput style={{ ...FONT_MONO }} value={clinical.uva} onChange={(e) => setClinical({ ...clinical, uva: e.target.value })} />
              </Field>
              <Field label="Best corrected visual acuity">
                <TextInput style={{ ...FONT_MONO }} value={clinical.bcva} onChange={(e) => setClinical({ ...clinical, bcva: e.target.value })} />
              </Field>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>Documents</h2>
              <p className="mt-1" style={{ color: COLOR.textMuted }}>Attach any relevant clinical documents — optional.</p>
            </div>
            <label
              className="ecl-lift flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl p-10 text-center"
              style={{ border: `2px dashed ${COLOR.border}` }}
            >
              <Upload size={28} strokeWidth={1.5} style={{ color: COLOR.secondary }} />
              <span className="font-medium" style={{ color: COLOR.text }}>Click to add files (preview only)</span>
              <span className="text-sm" style={{ color: COLOR.textMuted }}>PDF, JPG, PNG · up to 25MB each</span>
              <input
                type="file"
                multiple
                className="sr-only"
                onChange={(e) => setFiles([...files, ...Array.from(e.target.files || [])])}
              />
            </label>
            {files.length > 0 && (
              <ul className="space-y-2">
                {files.map((f, i) => (
                  <li key={i} className="ecl-fade-up flex items-center justify-between gap-3 rounded-lg p-3.5" style={{ border: `1px solid ${COLOR.border}` }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText size={20} style={{ color: COLOR.secondary }} />
                      <span className="truncate text-sm font-medium" style={{ color: COLOR.text }}>{f.name}</span>
                    </div>
                    <button onClick={() => setFiles(files.filter((_, j) => j !== i))} style={{ color: COLOR.textMuted }}>
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>Review &amp; submit</h2>
              <p className="mt-1" style={{ color: COLOR.textMuted }}>Check everything looks right before sending.</p>
            </div>
            <section className="ecl-fade-up rounded-2xl p-5" style={{ border: `1px solid ${COLOR.border}` }}>
              <h3 className="mb-3 font-medium" style={{ color: COLOR.text }}>Patient</h3>
              <p className="text-sm" style={{ color: COLOR.text }}>{patient.firstName} {patient.lastName} · {patient.dob} · {patient.phone}</p>
            </section>
            <section className="ecl-fade-up rounded-2xl p-5" style={{ animationDelay: '60ms', border: `1px solid ${COLOR.border}` }}>
              <h3 className="mb-3 font-medium" style={{ color: COLOR.text }}>Referral type</h3>
              <p className="text-sm" style={{ color: COLOR.text }}>{treatment?.name || '—'}</p>
            </section>
            <section className="ecl-fade-up rounded-2xl p-5" style={{ animationDelay: '120ms', border: `1px solid ${COLOR.border}` }}>
              <h3 className="mb-3 font-medium" style={{ color: COLOR.text }}>Documents</h3>
              <p className="text-sm" style={{ color: COLOR.textMuted }}>{files.length === 0 ? 'No documents attached.' : `${files.length} file(s) attached.`}</p>
            </section>
          </div>
        )}
        </div>

        {error && (
          <p className="ecl-fade-in mt-6 rounded-lg p-3 text-sm" style={{ background: '#B3261E0D', border: `1px solid #B3261E4D`, color: COLOR.problem }}>
            {error}
          </p>
        )}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${COLOR.border}`, background: COLOR.bg }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-6">
          <button
            onClick={() => {
              if (step === 0) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                onExit();
              } else {
                setStep((s) => s - 1);
              }
            }}
            className="ecl-btn flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium"
            style={{ color: COLOR.textMuted }}
          >
            <ArrowLeft size={16} /> {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={goNext} className="ecl-btn ecl-press flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium text-white" style={{ background: COLOR.primary }}>
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={submit} disabled={submitting} className="ecl-btn ecl-press flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white" style={{ background: COLOR.primary, opacity: submitting ? 0.7 : 1 }}>
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Submitting referral…' : 'Submit referral'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- dashboard stat cards + drilldown modal ----------

const STAT_CARDS = [
  { id: 'active', label: 'Active Referrals', value: 18, tone: 'default', Icon: ListChecks },
  { id: 'awaiting', label: 'Awaiting Consultation', value: 4, tone: 'action', Icon: Clock3 },
  { id: 'booked', label: 'Consultation Booked', value: 6, tone: 'default', Icon: Calendar },
  { id: 'treatment_booked', label: 'Treatment Booked', value: 3, tone: 'default', Icon: Stethoscope },
  { id: 'completed', label: 'Treatment Completed', value: 21, tone: 'complete', Icon: CheckCircle2 },
  { id: 'closed', label: 'Closed Referrals', value: 32, tone: 'default', Icon: FileText },
];

const STAT_EXAMPLES = {
  active: { description: 'All referrals currently open and being progressed through the clinic.', moreCount: 10, rows: [
    { patient: 'Sarah J.', treatment: 'Cataract', detail: 'Consultation booked for 15 July' },
    { patient: 'Priya K.', treatment: 'Dry Eye', detail: 'Referral received, awaiting triage' },
    { patient: 'Michael T.', treatment: 'ICL', detail: 'Treatment recommended after consultation' },
    { patient: 'Aisha R.', treatment: 'General Ophthalmology', detail: 'Referred 6 July · booking in progress' },
    { patient: 'Tom W.', treatment: 'Cornea', detail: 'Referred 7 July · awaiting patient availability' },
    { patient: 'Grace L.', treatment: 'LVC', detail: 'Consultation on 17 July · Devonshire St' },
    { patient: 'Omar F.', treatment: 'RLE', detail: 'Consultation on 22 July with Mr Hamada' },
    { patient: 'Helen S.', treatment: 'Cataract', detail: 'Treatment booked for 2 August' },
  ]},
  awaiting: { description: 'Referrals received and triaged, waiting to be scheduled for a first consultation.', moreCount: 0, rows: [
    { patient: 'Priya K.', treatment: 'Dry Eye', detail: 'Referred 2 July · patient contacted' },
    { patient: 'Aisha R.', treatment: 'General Ophthalmology', detail: 'Referred 6 July · booking in progress' },
    { patient: 'Tom W.', treatment: 'Cornea', detail: 'Referred 7 July · awaiting patient availability' },
    { patient: 'Nadia F.', treatment: 'Dry Eye', detail: 'Referred 9 July · awaiting patient availability' },
  ]},
  booked: { description: 'Patients with a confirmed consultation date on the calendar.', moreCount: 0, rows: [
    { patient: 'Sarah J.', treatment: 'Cataract', detail: 'Consultation on 15 July with Mr Hamada' },
    { patient: 'Grace L.', treatment: 'LVC', detail: 'Consultation on 17 July · Devonshire St' },
    { patient: 'Omar F.', treatment: 'RLE', detail: 'Consultation on 22 July with Mr Hamada' },
    { patient: 'Ben C.', treatment: 'General Ophthalmology', detail: 'Consultation on 24 July · Devonshire St' },
    { patient: 'Ruth A.', treatment: 'Cataract', detail: 'Consultation on 28 July with Mr Hamada' },
    { patient: 'James K.', treatment: 'Dry Eye', detail: 'Consultation on 30 July · Devonshire St' },
  ]},
  treatment_booked: { description: 'Patients who have had a consultation and booked in for treatment.', moreCount: 0, rows: [
    { patient: 'Michael T.', treatment: 'ICL', detail: 'Treatment booked for 29 July' },
    { patient: 'Helen S.', treatment: 'Cataract', detail: 'Treatment booked for 2 August' },
    { patient: 'Daniel P.', treatment: 'LVC', detail: 'Treatment booked for 6 August' },
  ]},
  completed: { description: 'Patients who have completed treatment and are in recovery or follow-up.', moreCount: 13, rows: [
    { patient: 'David O.', treatment: 'Laser Vision', detail: 'Completed 28 June · follow-up in 4 weeks' },
    { patient: 'Linda M.', treatment: 'Cataract', detail: 'Completed 24 June · vision 6/6 both eyes' },
    { patient: 'James K.', treatment: 'Dry Eye · IPL', detail: 'Completed course of 4 sessions on 20 June' },
    { patient: 'Ruth A.', treatment: 'Cataract', detail: 'Completed 18 June · vision 6/6 both eyes' },
    { patient: 'Ben C.', treatment: 'ICL', detail: 'Completed 12 June · follow-up scheduled' },
    { patient: 'Grace L.', treatment: 'LVC', detail: 'Completed 8 June · vision 6/5 both eyes' },
    { patient: 'Omar F.', treatment: 'RLE', detail: 'Completed 2 June · follow-up in 6 weeks' },
    { patient: 'Priya K.', treatment: 'Dry Eye · IPL', detail: 'Completed course of 4 sessions on 28 May' },
  ]},
  closed: { description: 'Referrals closed — treatment completed and discharged, or patient did not proceed.', moreCount: 24, rows: [
    { patient: 'Ruth A.', treatment: 'Cataract', detail: 'Discharged after successful outcome' },
    { patient: 'Ben C.', treatment: 'General Ophthalmology', detail: 'Patient chose to proceed elsewhere' },
    { patient: 'Nadia H.', treatment: 'Dry Eye', detail: 'Discharged, symptoms resolved' },
    { patient: 'Tom W.', treatment: 'Cornea', detail: 'Discharged after successful outcome' },
    { patient: 'Sarah J.', treatment: 'ICL', detail: 'Discharged, vision stable' },
    { patient: 'Michael T.', treatment: 'LVC', detail: 'Discharged after successful outcome' },
    { patient: 'Helen S.', treatment: 'Cataract', detail: 'Patient chose to proceed elsewhere' },
    { patient: 'Daniel P.', treatment: 'General Ophthalmology', detail: 'Discharged, no further action needed' },
  ]},
};

function StatDetailModal({ stat, onClose }) {
  const COLOR = useColors();
  useEffect(() => {
    if (!stat) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [stat]);
  if (!stat) return null;
  const data = STAT_EXAMPLES[stat.id];
  return (
    <div className="ecl-fade-in fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4 sm:p-8" onClick={onClose}>
      <div className="ecl-scale-in mx-auto my-6 w-full max-w-md rounded-2xl p-6 sm:my-10" style={{ background: COLOR.bg }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: statToneBg(stat.tone, COLOR), color: statToneColor(stat.tone, COLOR) }}>
              <stat.Icon size={18} />
            </span>
            <div>
              <h3 style={{ ...FONT_DISPLAY, fontSize: '1.1rem', color: COLOR.text }}>{stat.label}</h3>
              <p className="text-xs" style={{ color: COLOR.textMuted }}>{stat.value} referrals total</p>
            </div>
          </div>
          <button onClick={onClose} className="ecl-btn flex h-8 w-8 items-center justify-center rounded-full" style={{ color: COLOR.textMuted, background: COLOR.recessed }}>
            <X size={16} />
          </button>
        </div>

        <p className="mt-4 text-sm" style={{ color: COLOR.textMuted }}>{data.description}</p>

        <ul className="mt-4 space-y-2.5">
          {data.rows.map((r, i) => (
            <li key={r.patient} className="ecl-fade-up rounded-xl p-3.5" style={{ animationDelay: `${i * 60}ms`, background: COLOR.recessed }}>
              <p className="text-sm font-medium" style={{ color: COLOR.text }}>{r.patient} · {r.treatment}</p>
              <p className="mt-0.5 text-xs" style={{ color: COLOR.textMuted }}>{r.detail}</p>
            </li>
          ))}
        </ul>

        {data.moreCount > 0 && (
          <p className="mt-3 text-center text-xs font-medium" style={{ color: COLOR.textMuted }}>
            + {data.moreCount} more referral{data.moreCount !== 1 ? 's' : ''} not shown
          </p>
        )}

        <p className="mt-4 text-xs" style={{ color: COLOR.textMuted }}>Example records shown for illustration only.</p>
      </div>
    </div>
  );
}

// ---------- Practice Insights page ----------

const MONTHLY_ACTIVITY = [
  { month: 'Feb', referrals: 9, revenue: 1350 },
  { month: 'Mar', referrals: 12, revenue: 2100 },
  { month: 'Apr', referrals: 11, revenue: 1890 },
  { month: 'May', referrals: 15, revenue: 2760 },
  { month: 'Jun', referrals: 14, revenue: 2520 },
  { month: 'Jul', referrals: 18, revenue: 3240 },
];

const TREATMENT_MIX = [
  { name: 'Cataract', value: 8 },
  { name: 'Dry Eye', value: 6 },
  { name: 'ICL', value: 4 },
  { name: 'LVC', value: 3 },
  { name: 'Other', value: 2 },
];

const INSIGHT_STATS = [
  { label: 'Referral fees YTD', value: 13860, prefix: '£', delta: '+18% vs last year', Icon: PoundSterling },
  { label: 'Consultation conversion', value: 86, suffix: '%', delta: '+4pts vs last quarter', Icon: Percent },
];

function ChartTooltip({ active, payload, label, prefix = '', suffix = '' }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="ecl-fade-in rounded-lg px-3 py-2 text-xs shadow-sm" style={{ background: '#0B2545', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: '#B08A4E' }}>{prefix}{p.value.toLocaleString()}{suffix}</p>
      ))}
    </div>
  );
}

function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { setVisible(true); obs.unobserve(entry.target); }
      });
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, className = '' }) {
  const [ref, visible] = useInView(0.15);
  const content = typeof children === 'function' ? children(visible) : children;
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(26px) scale(0.98)',
        transition: `opacity 700ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 700ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {content}
    </div>
  );
}

function ReferralVolumeChart({ visible, gridStroke, tickStyle, color }) {
  const [count, setCount] = useState(0);
  const maxVal = Math.max(...MONTHLY_ACTIVITY.map((d) => d.referrals));

  useEffect(() => {
    if (!visible) return;
    setCount(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= MONTHLY_ACTIVITY.length) clearInterval(id);
    }, 160);
    return () => clearInterval(id);
  }, [visible]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={MONTHLY_ACTIVITY.slice(0, count)} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={gridStroke} vertical={false} />
        <XAxis dataKey="month" tick={tickStyle} axisLine={{ stroke: gridStroke }} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} domain={[0, maxVal + 2]} />
        <Tooltip content={<ChartTooltip suffix=" referrals" />} />
        <Bar dataKey="referrals" fill={color} radius={[6, 6, 0, 0]} isAnimationActive animationDuration={450} animationEasing="ease-out" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function TreatmentPieChart({ visible, donutColors }) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setRevealed(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setRevealed(i);
      if (i >= TREATMENT_MIX.length) clearInterval(id);
    }, 220);
    return () => clearInterval(id);
  }, [visible]);

  if (!visible) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={TREATMENT_MIX} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={3} isAnimationActive={false}>
          {TREATMENT_MIX.map((t, i) => (
            <Cell key={t.name} fill={donutColors[i % donutColors.length]} stroke="none" style={{ opacity: i < revealed ? 1 : 0, transition: 'opacity 380ms ease' }} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip suffix=" cases" />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function InsightsPage() {
  const COLOR = useColors();
  const donutColors = [COLOR.accent, COLOR.secondary, COLOR.complete, '#7C9CB8', COLOR.future];
  const gridStroke = COLOR.border;
  const tickStyle = { fontSize: 12, fill: COLOR.textMuted };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="ecl-fade-up relative overflow-hidden rounded-2xl" style={{ background: COLOR.primary }}>
        <LensRings className="ecl-breathe pointer-events-none absolute -right-8 -top-10 opacity-40" size={200} />
        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.accent }}>
            <TrendingUp size={14} /> For Keith Holland Opticians
          </p>
          <h1 className="mt-2 text-2xl text-white sm:text-3xl" style={FONT_DISPLAY}>Practice insights</h1>
          <p className="mt-2 max-w-xl text-sm text-white/70">A look at how your referrals to Eye Clinic London have grown over the last six months.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {INSIGHT_STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 130}>
            <div className="rounded-2xl p-4" style={{ background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: COLOR.accentTint, color: COLOR.accent }}>
                  <s.Icon size={15} />
                </span>
                <span className="text-xs font-medium" style={{ color: COLOR.complete }}>{s.delta}</span>
              </div>
              <p className="mt-3 text-2xl font-medium" style={{ color: COLOR.text }}>
                {s.prefix || ''}<CountUp value={s.value} locale={!!s.prefix} />{s.suffix || ''}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: COLOR.textMuted }}>{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Reveal delay={90}>
            {(visible) => (
              <>
                <p className="mb-2 text-sm font-medium" style={{ color: COLOR.text }}>Referral fee revenue</p>
                <div className="rounded-2xl p-3" style={{ background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
                  <div style={{ height: 190 }}>
                    {visible && (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={MONTHLY_ACTIVITY} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                          <CartesianGrid stroke={gridStroke} vertical={false} />
                          <XAxis dataKey="month" tick={tickStyle} axisLine={{ stroke: gridStroke }} tickLine={false} />
                          <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v / 1000}k`} />
                          <Tooltip content={<ChartTooltip prefix="£" />} />
                          <Line type="monotone" dataKey="revenue" stroke={COLOR.accent} strokeWidth={2.5} dot={{ r: 3, fill: COLOR.accent }} activeDot={{ r: 5 }} isAnimationActive animationDuration={1400} animationEasing="ease-out" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </>
            )}
          </Reveal>

          <Reveal delay={170} className="mt-4 block">
            {(visible) => (
              <>
                <p className="mb-2 text-sm font-medium" style={{ color: COLOR.text }}>Referral volume</p>
                <div className="rounded-2xl p-3" style={{ background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
                  <div style={{ height: 150 }}>
                    {visible && <ReferralVolumeChart visible={visible} gridStroke={gridStroke} tickStyle={tickStyle} color={COLOR.secondary} />}
                  </div>
                </div>
              </>
            )}
          </Reveal>
        </div>

        <div className="lg:col-span-2">
          <Reveal delay={230}>
            {(visible) => (
              <>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-medium" style={{ color: COLOR.text }}>
                  <PieChartIcon size={14} /> Referrals by treatment type
                </p>
                <div className="rounded-2xl p-3" style={{ background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
                  <div style={{ height: 190 }}>
                    {visible && <TreatmentPieChart visible={visible} donutColors={donutColors} />}
                  </div>
                  <ul className="mt-1 space-y-1.5 px-1 pb-1">
                    {TREATMENT_MIX.map((t, i) => (
                      <li key={t.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2" style={{ color: COLOR.textMuted }}>
                          <span className="h-2 w-2 rounded-full" style={{ background: donutColors[i % donutColors.length] }} /> {t.name}
                        </span>
                        <span className="font-medium" style={{ color: COLOR.text }}>{t.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </Reveal>
        </div>
      </div>

      <Reveal delay={100} className="block">
        <p className="mt-6 border-t pt-4 text-xs leading-relaxed" style={{ color: COLOR.textMuted, borderColor: COLOR.border }}>
          Figures reflect referrals sent from Keith Holland Opticians and associated referral fees earned to date.
        </p>
      </Reveal>
    </div>
  );
}

// ---------- dashboard ----------

function ReferralAssistantCard({ onStart }) {
  const COLOR = useColors();
  return (
    <div
      className="ecl-fade-up ecl-lift mt-6 rounded-2xl p-6 sm:p-7"
      style={{ animationDelay: '40ms', background: COLOR.bg, border: `1px solid ${COLOR.border}` }}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: COLOR.primaryTint, color: COLOR.primary }}>
            <Compass size={22} strokeWidth={1.75} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>ECL Referral Assistant</h2>
              <Pill tone="accent">New</Pill>
            </div>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed" style={{ color: COLOR.textMuted }}>
              Not sure which treatment may be suitable for your patient? Answer a few simple questions to explore which ECL pathway could be
              relevant to discuss.
            </p>
          </div>
        </div>
        <button
          onClick={onStart}
          className="ecl-btn ecl-press flex shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white sm:w-auto"
          style={{ background: COLOR.primary }}
        >
          Start Referral Assistant <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function Dashboard({ onRefer, onStartReferralAssistant, referrals }) {
  const COLOR = useColors();
  const [showOffer, setShowOffer] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <AugustOfferModal open={showOffer} onClose={() => setShowOffer(false)} />

      <div className="ecl-fade-up relative overflow-hidden rounded-2xl" style={{ background: COLOR.primary }}>
        <LensRings className="ecl-breathe pointer-events-none absolute -right-8 -top-10 opacity-40" size={200} />
        <div className="relative grid grid-cols-1 items-center gap-6 px-6 py-8 sm:px-10 sm:py-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.accent }}>
              <ShieldCheck size={14} /> Referring Partner Portal
            </p>
            <h1 className="mt-2 text-3xl text-white sm:text-4xl" style={FONT_DISPLAY}>Good morning, Jane</h1>
            <p className="mt-2 text-sm text-white/70">Keith Holland Opticians</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                onClick={onRefer}
                className="ecl-btn ecl-press inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium"
                style={{ background: COLOR.accent, color: COLOR.primary }}
              >
                <UserPlus size={16} /> Refer a Patient <ArrowRight size={16} />
              </button>
              <button
                onClick={() => setShowOffer(true)}
                className="ecl-btn ecl-press inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium"
                style={{ background: COLOR.accentTint, color: COLOR.accent }}
              >
                <Hourglass size={16} /> Limited Offers
              </button>
            </div>
          </div>
          <div className="ecl-breathe hidden justify-self-center md:flex">
            <EyeMotif size={170} />
          </div>
        </div>
      </div>

      <ReferralAssistantCard onStart={onStartReferralAssistant} />

      <CpdNewsSection />
      <TrustpilotCarousel />
      <SuccessStories />
      <JimRosenthalStory />
      <HereToHelp />
    </div>
  );
}

// ---------- referrals page (partner side) ----------

function ReferralsPage({ referrals }) {
  const COLOR = useColors();
  const [activeStat, setActiveStat] = useState(null);
  const mine = (referrals || []).filter((r) => r.practice === 'Keith Holland Opticians');
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <StatDetailModal stat={activeStat} onClose={() => setActiveStat(null)} />

      <div className="ecl-fade-up relative overflow-hidden rounded-2xl" style={{ background: COLOR.primary }}>
        <LensRings className="ecl-breathe pointer-events-none absolute -right-8 -top-10 opacity-40" size={200} />
        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.accent }}>
            <ListChecks size={14} /> Keith Holland Opticians
          </p>
          <h1 className="mt-2 text-2xl text-white sm:text-3xl" style={FONT_DISPLAY}>My referrals</h1>
          <p className="mt-2 text-sm text-white/70">
            {mine.length} referral{mine.length !== 1 ? 's' : ''} sent to Eye Clinic London.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STAT_CARDS.map((c, i) => (
          <button
            key={c.label}
            onClick={() => setActiveStat(c)}
            className="ecl-fade-up ecl-lift ecl-press rounded-2xl p-4 text-left"
            style={{ animationDelay: `${i * 60}ms`, background: COLOR.bg, border: `1px solid ${COLOR.border}` }}
          >
            <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-full" style={{ background: statToneBg(c.tone, COLOR), color: statToneColor(c.tone, COLOR) }}>
              <c.Icon size={16} />
            </span>
            <p className="text-2xl font-medium" style={{ color: COLOR.text }}><CountUp value={c.value} /></p>
            <p className="mt-1 text-xs" style={{ color: COLOR.textMuted }}>{c.label}</p>
          </button>
        ))}
      </div>

      <div className="ecl-fade-up mt-6 rounded-2xl p-5" style={{ animationDelay: '80ms', background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
        <h2 className="mb-4 flex items-center gap-2 font-medium" style={{ color: COLOR.text }}>
          <ListChecks size={16} style={{ color: COLOR.secondary }} /> Recent referrals
        </h2>
        <ul className="space-y-2.5">
          {mine.length === 0 && (
            <li className="rounded-xl p-6 text-center text-sm" style={{ background: COLOR.recessed, color: COLOR.textMuted }}>
              No referrals yet — submit one via "Refer a Patient".
            </li>
          )}
          {mine.map((r, i) => (
            <li key={r.id || i} className="ecl-fade-up flex items-center justify-between gap-3 rounded-xl p-3.5" style={{ animationDelay: `${i * 50}ms`, background: COLOR.recessed }}>
              <div className="min-w-0">
                <p className="text-sm font-medium" style={{ color: COLOR.text }}>{r.patient} · {r.treatment}</p>
                <p className="mt-0.5 text-xs" style={{ color: COLOR.textMuted }}>{r.date} · £{r.fee}</p>
              </div>
              <Pill tone={STATUS_TONE[r.status] || 'default'}>{r.status}</Pill>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---------- login ----------

function BrandMark({ size = 44 }) {
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="mb-3">
        <circle cx="20" cy="20" r="19" stroke="#FFFFFF" strokeOpacity="0.5" />
        <path d="M4 20c5.5-8 12-12 16-12s10.5 4 16 12c-5.5 8-12 12-16 12S9.5 28 4 20Z" fill="none" stroke="#FFFFFF" strokeWidth="1.6" />
        <circle cx="20" cy="20" r="6.2" fill="#B08A4E" />
        <circle cx="20" cy="20" r="2.6" fill="#0B2545" />
      </svg>
      <p className="text-center text-white" style={{ fontWeight: 600, fontSize: '13px', letterSpacing: '0.14em', lineHeight: 1.55 }}>
        EYE<br />CLINIC<br />LONDON
      </p>
    </div>
  );
}

function LoginScreen({ onSignIn, onStaffSignIn }) {
  const COLOR = useColors();
  const [mode, setMode] = useState('role'); // role | signin | sent | staffcode
  const [email, setEmail] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [codeError, setCodeError] = useState('');

  function submitTeamCode() {
    if (teamCode.trim().toLowerCase() === 'ecl1234') {
      setCodeError('');
      onStaffSignIn();
    } else {
      setCodeError('Incorrect team code. Please try again.');
    }
  }

  if (mode === 'role') {
    return (
      <div className="ecl-fade-in flex min-h-screen flex-col items-center justify-center px-6 py-14" style={{ background: COLOR.primary }}>
        <BrandMark size={54} />
        <p className="mt-5 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>Referral management</p>

        <div className="mt-8 w-full max-w-sm space-y-4">
          <button
            onClick={() => setMode('signin')}
            className="ecl-btn ecl-press ecl-lift flex w-full items-center justify-between gap-4 rounded-2xl p-5 text-left"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}
          >
            <div>
              <p className="text-base font-semibold text-white">Referring partner</p>
              <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Sign in with a one-time email code</p>
            </div>
            <Users2 size={26} style={{ color: COLOR.accent }} className="shrink-0" />
          </button>

          <button
            onClick={() => setMode('staffcode')}
            className="ecl-btn ecl-press ecl-lift flex w-full items-center justify-between gap-4 rounded-2xl p-5 text-left"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}
          >
            <div>
              <p className="text-base font-semibold text-white">Clinic team</p>
              <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>BD dashboard · funnel · partners · fees</p>
            </div>
            <ClipboardList size={24} style={{ color: COLOR.accent }} className="shrink-0" />
          </button>
        </div>

        <p className="mt-8 max-w-xs text-center text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Referrals submitted by partners appear instantly on the clinic dashboard.
        </p>
      </div>
    );
  }

  if (mode === 'staffcode') {
    return (
      <div className="ecl-fade-in flex min-h-screen flex-col items-center justify-center px-6 py-14 text-center" style={{ background: COLOR.primary }}>
        <BrandMark size={44} />
        <h1 className="mt-6 text-2xl text-white" style={FONT_DISPLAY}>Clinic team access</h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
          This area is for Eye Clinic London staff. Enter the team code.
        </p>

        <div className="mt-6 w-full max-w-sm space-y-3">
          <input
            type="text"
            autoCapitalize="sentences"
            autoCorrect="off"
            spellCheck="false"
            value={teamCode}
            onChange={(e) => { setTeamCode(e.target.value); setCodeError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && submitTeamCode()}
            placeholder="Team code"
            style={{
              width: '100%', borderRadius: '0.75rem', padding: '0.9rem 1rem', fontSize: '15px', textAlign: 'center', letterSpacing: '0.08em',
              background: 'rgba(255,255,255,0.08)', border: `1px solid ${codeError ? '#E88' : 'rgba(255,255,255,0.16)'}`, color: '#fff', outline: 'none',
            }}
          />
          {codeError && <p className="text-xs" style={{ color: '#F3A5A5' }}>{codeError}</p>}
          <button
            onClick={submitTeamCode}
            className="ecl-btn ecl-press w-full rounded-xl py-3.5 text-sm font-semibold"
            style={{ background: COLOR.accent, color: COLOR.primary }}
          >
            Enter
          </button>
        </div>

        <button onClick={() => { setMode('role'); setTeamCode(''); setCodeError(''); }} className="ecl-underline mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          ← Back
        </button>
      </div>
    );
  }

  if (mode === 'signin') {
    return (
      <div className="ecl-fade-in flex min-h-screen flex-col items-center justify-center px-6 py-14" style={{ background: COLOR.primary }}>
        <BrandMark size={44} />
        <h1 className="mt-6 text-2xl text-white" style={FONT_DISPLAY}>Partner sign-in</h1>
        <p className="mt-2 max-w-xs text-center text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
          We'll email a one-time code to your practice address — no passwords.
        </p>

        <div className="mt-6 w-full max-w-sm space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            style={{
              width: '100%', borderRadius: '0.75rem', padding: '0.9rem 1rem', fontSize: '15px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', color: '#fff', outline: 'none',
            }}
          />
          <button
            onClick={() => setMode('sent')}
            className="ecl-btn ecl-press w-full rounded-xl py-3.5 text-sm font-semibold"
            style={{ background: COLOR.accent, color: COLOR.primary }}
          >
            Email me a sign-in code
          </button>
        </div>

        <button
          onClick={onSignIn}
          className="ecl-btn ecl-press mt-4 w-full max-w-sm rounded-xl py-3 text-sm font-semibold text-white"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.4)' }}
        >
          Bypass sign-in (preview)
        </button>

        <button onClick={() => setMode('role')} className="ecl-underline mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="ecl-fade-in flex min-h-screen flex-col items-center justify-center px-6 py-14 text-center" style={{ background: COLOR.primary }}>
      <BrandMark size={44} />
      <div className="ecl-pop mt-6 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(176,138,78,0.18)' }}>
        <Mail size={24} style={{ color: COLOR.accent }} />
      </div>
      <h1 className="mt-4 text-xl text-white" style={FONT_DISPLAY}>Check your email</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
        We've sent a one-time code to {email || 'your practice email'}. (Preview only — continue below.)
      </p>
      <button onClick={onSignIn} className="ecl-btn ecl-press mt-6 w-full max-w-sm rounded-xl py-3.5 text-sm font-semibold" style={{ background: COLOR.accent, color: COLOR.primary }}>
        Continue to dashboard
      </button>
      <button onClick={() => setMode('role')} className="ecl-underline mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
        ← Back
      </button>
    </div>
  );
}

// ---------- admin console (Business Development) ----------

const STATUS_OPTIONS = [
  'Referral Received',
  'Awaiting Consultation',
  'Consultation Booked',
  'Treatment Recommended',
  'Treatment Booked',
  'Treatment Completed',
  'Closed',
];

const STATUS_TONE = {
  'Referral Received': 'info',
  'Awaiting Consultation': 'action',
  'Consultation Booked': 'purple',
  'Treatment Recommended': 'action',
  'Treatment Booked': 'teal',
  'Treatment Completed': 'complete',
  'Closed': 'closed',
};

const STATUS_RANK = {
  'Referral Received': 0,
  'Awaiting Consultation': 0,
  'Consultation Booked': 1,
  'Treatment Recommended': 1,
  'Treatment Booked': 2,
  'Treatment Completed': 3,
  'Closed': 3,
};

const ADMIN_REFERRALS_SEED = [
  { id: 1, patient: 'Sarah J.', practice: 'Keith Holland Opticians', treatment: 'Cataract', status: 'Consultation Booked', date: '8 Jul 2026', fee: 150 },
  { id: 2, patient: 'Michael T.', practice: 'Keith Holland Opticians', treatment: 'ICL', status: 'Treatment Recommended', date: '5 Jul 2026', fee: 200 },
  { id: 3, patient: 'Priya K.', practice: 'Keith Holland Opticians', treatment: 'Dry Eye', status: 'Referral Received', date: '2 Jul 2026', fee: 80 },
  { id: 4, patient: 'David O.', practice: 'Keith Holland Opticians', treatment: 'Laser Vision', status: 'Treatment Completed', date: '28 Jun 2026', fee: 220 },
  { id: 5, patient: 'Aisha R.', practice: 'Vision Plus Opticians', treatment: 'General Ophthalmology', status: 'Awaiting Consultation', date: '6 Jul 2026', fee: 90 },
  { id: 6, patient: 'Tom W.', practice: 'Marylebone Eyecare', treatment: 'Cornea', status: 'Awaiting Consultation', date: '7 Jul 2026', fee: 110 },
  { id: 7, patient: 'Grace L.', practice: 'City Optical', treatment: 'LVC', status: 'Consultation Booked', date: '17 Jul 2026', fee: 200 },
  { id: 8, patient: 'Omar F.', practice: 'Vision Plus Opticians', treatment: 'RLE', status: 'Consultation Booked', date: '22 Jul 2026', fee: 200 },
  { id: 9, patient: 'Helen S.', practice: 'Marylebone Eyecare', treatment: 'Cataract', status: 'Treatment Booked', date: '2 Aug 2026', fee: 150 },
  { id: 10, patient: 'Ruth A.', practice: 'City Optical', treatment: 'Cataract', status: 'Closed', date: '20 Jun 2026', fee: 150 },
  { id: 11, patient: 'Daniel P.', practice: 'Marylebone Eyecare', treatment: 'LVC', status: 'Treatment Booked', date: '6 Aug 2026', fee: 200 },
  { id: 12, patient: 'Nadia H.', practice: 'Vision Plus Opticians', treatment: 'Dry Eye', status: 'Closed', date: '19 Jun 2026', fee: 80 },
];

function AdminOverview({ referrals }) {
  const COLOR = useColors();
  const total = referrals.length;
  const feesTotal = referrals.reduce((sum, r) => sum + r.fee, 0);
  const completed = referrals.filter((r) => r.status === 'Treatment Completed').length;
  const conversion = total ? Math.round((completed / total) * 100) : 0;
  const awaiting = referrals.filter((r) => r.status === 'Awaiting Consultation' || r.status === 'Referral Received').length;

  const stats = [
    { label: 'Total referrals', value: total, prefix: '', Icon: ClipboardList, tone: 'default' },
    { label: 'Fees payable', value: feesTotal, prefix: '£', Icon: PoundSterling, tone: 'default' },
    { label: 'Needs action', value: awaiting, prefix: '', Icon: Clock3, tone: 'action' },
    { label: 'Conversion rate', value: conversion, prefix: '', suffix: '%', Icon: TrendingUp, tone: 'complete' },
  ];

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="ecl-fade-up rounded-2xl p-4" style={{ background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
          <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-full" style={{ background: statToneBg(s.tone, COLOR), color: statToneColor(s.tone, COLOR) }}>
            <s.Icon size={16} />
          </span>
          <p className="text-2xl font-medium" style={{ color: COLOR.text }}>
            {s.prefix || ''}<CountUp value={s.value} locale={!!s.prefix} />{s.suffix || ''}
          </p>
          <p className="mt-1 text-xs" style={{ color: COLOR.textMuted }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function ReferralsTable({ referrals, onStatusChange }) {
  const COLOR = useColors();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState(false);

  const filtered = referrals.filter((r) => {
    const matchesQuery = `${r.patient} ${r.practice} ${r.treatment}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  useEffect(() => {
    setExpanded(false);
  }, [query, statusFilter]);

  const visible = expanded ? filtered : filtered.slice(0, 5);

  return (
    <div className="ecl-fade-up rounded-2xl p-5" style={{ background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 font-medium" style={{ color: COLOR.text }}>
          <ClipboardList size={16} style={{ color: COLOR.secondary }} /> All referrals
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLOR.textMuted }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patient or practice" style={{ ...makeInputStyle(COLOR), paddingLeft: '2rem', fontSize: '13px' }} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...makeInputStyle(COLOR), fontSize: '13px' }}>
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <ul className="mt-4 divide-y" style={{ borderColor: COLOR.border }}>
        {filtered.length === 0 && (
          <li className="py-6 text-center text-sm" style={{ color: COLOR.textMuted }}>No referrals match your search.</li>
        )}
        {visible.map((r) => (
          <li key={r.id} className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: COLOR.border }}>
            <div className="min-w-0">
              <p className="text-sm font-medium" style={{ color: COLOR.text }}>{r.patient} · {r.treatment}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs" style={{ color: COLOR.textMuted }}>
                <Building2 size={12} /> {r.practice} · {r.date} · £{r.fee}
              </p>
            </div>
            <select
              value={r.status}
              onChange={(e) => onStatusChange(r.id, e.target.value)}
              className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
              style={{ background: statToneBg(STATUS_TONE[r.status], COLOR), color: statToneColor(STATUS_TONE[r.status], COLOR), border: 'none', outline: 'none' }}
            >
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </li>
        ))}
      </ul>

      {!expanded && filtered.length > 5 && (
        <button
          onClick={() => setExpanded(true)}
          className="ecl-btn ecl-press mt-4 w-full rounded-lg py-2.5 text-sm font-medium"
          style={{ background: COLOR.recessed, color: COLOR.text, border: `1px solid ${COLOR.border}` }}
        >
          Show all {filtered.length} referrals
        </button>
      )}
      {expanded && filtered.length > 5 && (
        <button
          onClick={() => setExpanded(false)}
          className="ecl-underline mt-4 block text-center text-sm font-medium"
          style={{ color: COLOR.textMuted }}
        >
          Show less
        </button>
      )}
    </div>
  );
}

function practiceBreakdown(referrals) {
  const byPractice = {};
  referrals.forEach((r) => {
    if (!byPractice[r.practice]) byPractice[r.practice] = { count: 0, fees: 0, treated: 0 };
    byPractice[r.practice].count += 1;
    byPractice[r.practice].fees += r.fee;
    if (r.status === 'Treatment Completed') byPractice[r.practice].treated += 1;
  });
  const total = referrals.length || 1;
  return Object.entries(byPractice)
    .map(([practice, v]) => ({ practice, ...v, share: Math.round((v.count / total) * 100) }))
    .sort((a, b) => b.fees - a.fees);
}

function PartnersLeaderboard({ referrals }) {
  const COLOR = useColors();
  const ranked = practiceBreakdown(referrals);

  return (
    <div className="ecl-fade-up rounded-2xl p-5" style={{ animationDelay: '80ms', background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
      <h2 className="mb-4 flex items-center gap-2 font-medium" style={{ color: COLOR.text }}>
        <Crown size={16} style={{ color: COLOR.accent }} /> Referring partners
      </h2>
      <ul className="space-y-2.5">
        {ranked.map((p, i) => (
          <li key={p.practice} className="flex items-center justify-between gap-3 rounded-xl p-3" style={{ background: i === 0 ? COLOR.accentTint : COLOR.recessed }}>
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                style={{ background: i === 0 ? COLOR.accent : COLOR.bg, color: i === 0 ? '#fff' : COLOR.textMuted, border: i === 0 ? 'none' : `1px solid ${COLOR.border}` }}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium" style={{ color: COLOR.text }}>{p.practice}</p>
                <p className="text-xs" style={{ color: COLOR.textMuted }}>{p.count} referral{p.count !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <p className="shrink-0 text-sm font-medium" style={{ color: COLOR.text }}>£{p.fees}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---- new Business Development home view, replicating the reference screenshots ----

function PrioritiesSection({ referrals }) {
  const COLOR = useColors();
  const [showAll, setShowAll] = useState(false);
  const feesOutstanding = referrals.filter((r) => r.status !== 'Treatment Completed' && r.status !== 'Closed').reduce((s, r) => s + r.fee, 0);
  const bookedNotAttended = referrals.filter((r) => r.status === 'Consultation Booked').length;
  const awaiting = referrals.filter((r) => r.status === 'Awaiting Consultation' || r.status === 'Referral Received').length;

  const priorities = [
    { level: 'High priority', tone: 'problem', text: `£${feesOutstanding.toLocaleString()} referral fees outstanding. Review unpaid partner fees.` },
    { level: 'Medium', tone: 'action', text: `${bookedNotAttended} patient${bookedNotAttended !== 1 ? 's' : ''} booked but not yet attended. Follow up to reduce drop-off.` },
    { level: 'Medium', tone: 'action', text: 'Referral → treatment conversion down slightly this month vs last — worth reviewing the funnel.' },
    { level: 'Low', tone: 'default', text: `${awaiting} referral${awaiting !== 1 ? 's' : ''} awaiting first consultation booking.` },
    { level: 'Low', tone: 'default', text: 'Two partner practices have not referred in over 30 days — consider a check-in call.' },
  ];
  const visible = showAll ? priorities : priorities.slice(0, 3);
  const borderColor = { problem: COLOR.problem, action: COLOR.accent, default: COLOR.border };

  return (
    <div className="ecl-fade-up mt-6">
      <h2 className="mb-3 flex items-center gap-2 font-medium" style={{ color: COLOR.text }}>
        <span style={{ fontSize: 16 }}>◎</span> Today's priorities
      </h2>
      <div className="space-y-3">
        {visible.map((p, i) => (
          <div
            key={i}
            className="rounded-xl p-4"
            style={{ background: COLOR.bg, borderLeft: `4px solid ${borderColor[p.tone]}`, border: `1px solid ${COLOR.border}`, borderLeftWidth: 4, borderLeftColor: borderColor[p.tone] }}
          >
            <Pill tone={p.tone === 'problem' ? 'action' : p.tone === 'action' ? 'accent' : 'default'}>{p.level}</Pill>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: COLOR.text }}>{p.text}</p>
          </div>
        ))}
      </div>
      {!showAll && priorities.length > 3 && (
        <button
          onClick={() => setShowAll(true)}
          className="ecl-btn mt-3 w-full rounded-xl py-2.5 text-sm font-medium"
          style={{ border: `1px dashed ${COLOR.accent}`, color: COLOR.accent, background: 'transparent' }}
        >
          Show all {priorities.length} priorities
        </button>
      )}
    </div>
  );
}

function BDSummaryCard({ referrals, topPractice }) {
  const COLOR = useColors();
  const [open, setOpen] = useState(true);
  const awaiting = referrals.filter((r) => r.status === 'Awaiting Consultation' || r.status === 'Referral Received').length;

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="ecl-btn ecl-press flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4"
        style={{ background: COLOR.primary }}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <Sparkle size={16} style={{ color: COLOR.accent }} /> Business development summary
        </span>
        <ChevronDown size={18} style={{ color: '#fff', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 250ms ease' }} />
      </button>

      {open && (
        <div className="ecl-fade-in mt-3 rounded-2xl p-5" style={{ background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: COLOR.text }}>
            <Lightbulb size={16} style={{ color: COLOR.accent }} /> Growth opportunities
          </p>
          <ul className="divide-y" style={{ borderColor: COLOR.border }}>
            <li className="flex items-start gap-3 py-3 first:pt-0">
              <Phone size={16} className="mt-0.5 shrink-0" style={{ color: COLOR.accent }} />
              <p className="text-sm leading-relaxed" style={{ color: COLOR.text }}>
                {awaiting} patient{awaiting !== 1 ? 's have' : ' has'} waited without a consultation booking. Contact them this week.
              </p>
            </li>
            <li className="flex items-start gap-3 py-3">
              <TrendingUp size={16} className="mt-0.5 shrink-0" style={{ color: COLOR.accent }} />
              <p className="text-sm leading-relaxed" style={{ color: COLOR.text }}>
                Dry Eye referrals have grown fastest recently — worth featuring in partner communications.
              </p>
            </li>
            <li className="flex items-start gap-3 py-3 last:pb-0">
              <Star size={16} className="mt-0.5 shrink-0" style={{ color: COLOR.accent }} />
              <p className="text-sm leading-relaxed" style={{ color: COLOR.text }}>
                {topPractice || 'Keith Holland Opticians'} is actively referring — a good moment to introduce a new treatment pathway.
              </p>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

function BDStatSquares({ referrals }) {
  const COLOR = useColors();
  const total = referrals.length;
  const completed = referrals.filter((r) => r.status === 'Treatment Completed').length;
  const booked = referrals.filter((r) => STATUS_RANK[r.status] >= 1).length;
  const lost = referrals.filter((r) => r.status === 'Closed').length;

  const squares = [
    { label: 'Referrals received', value: total, Icon: Users2, tone: 'default' },
    { label: 'Treatments completed', value: completed, Icon: CheckCircle2, tone: 'complete' },
    { label: 'Consultations booked', value: booked, Icon: Calendar, tone: 'teal' },
    { label: 'Lost (DNA / declined)', value: lost, Icon: UserX, tone: 'action' },
  ];

  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      {squares.map((s, i) => (
        <div key={s.label} className="ecl-fade-up rounded-2xl p-4" style={{ animationDelay: `${i * 50}ms`, background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
          <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-full" style={{ background: statToneBg(s.tone, COLOR), color: statToneColor(s.tone, COLOR) }}>
            <s.Icon size={16} />
          </span>
          <p className="text-2xl font-medium" style={{ color: COLOR.text }}><CountUp value={s.value} /></p>
          <p className="mt-1 text-xs" style={{ color: COLOR.textMuted }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function ConversionBanner({ referrals }) {
  const COLOR = useColors();
  const total = referrals.length || 1;
  const booked = referrals.filter((r) => STATUS_RANK[r.status] >= 1).length;
  const treated = referrals.filter((r) => r.status === 'Treatment Completed').length;
  const referralToConsult = Math.round((booked / total) * 100);
  const consultToTreatment = booked ? Math.round((treated / booked) * 100) : 0;
  const referralToTreatment = Math.round((treated / total) * 100);

  const items = [
    { value: referralToConsult, label: 'Referral → Consult' },
    { value: consultToTreatment, label: 'Consult → Treatment' },
    { value: referralToTreatment, label: 'Referral → Treatment' },
  ];

  return (
    <div className="ecl-fade-up mt-6 flex items-stretch overflow-hidden rounded-2xl" style={{ background: COLOR.primary }}>
      {items.map((it, i) => (
        <div
          key={it.label}
          className="flex flex-1 flex-col items-center justify-center px-2 py-4 text-center"
          style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}
        >
          <p className="text-xl sm:text-2xl" style={FONT_DISPLAY}>
            <span className="text-white">{it.value}%</span>
          </p>
          <p className="mt-0.5 text-[10px] leading-tight text-white/70 sm:text-xs">{it.label}</p>
        </div>
      ))}
    </div>
  );
}

function PatientJourneyFunnel({ referrals }) {
  const COLOR = useColors();
  const stages = [
    { label: 'Referrals received', count: referrals.length },
    { label: 'Consultations booked', count: referrals.filter((r) => STATUS_RANK[r.status] >= 1).length },
    { label: 'Treatments booked', count: referrals.filter((r) => STATUS_RANK[r.status] >= 2).length },
    { label: 'Treatments completed', count: referrals.filter((r) => STATUS_RANK[r.status] >= 3).length },
  ];
  const maxCount = stages[0].count || 1;

  return (
    <div className="ecl-fade-up mt-6 overflow-hidden rounded-2xl p-5" style={{ background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
      <h2 className="mb-4 font-medium" style={{ color: COLOR.text }}>Patient journey funnel</h2>
      <div className="space-y-3">
        {stages.map((s, i) => {
          const prev = i > 0 ? stages[i - 1].count : null;
          const lost = prev !== null ? prev - s.count : 0;
          const lostPct = prev ? Math.round((lost / prev) * 100) : 0;
          const widthPct = Math.max((s.count / maxCount) * 100, 14);
          return (
            <div key={s.label}>
              {i > 0 && lost > 0 && (
                <p className="mb-1 flex items-center gap-1 text-xs font-medium" style={{ color: COLOR.problem }}>
                  ↓ {lost} lost ({lostPct}%)
                </p>
              )}
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: COLOR.textMuted }}>{s.label}</span>
                <span className="font-semibold" style={{ color: COLOR.text }}>{s.count}</span>
              </div>
              <div className="mt-1 h-3 w-full overflow-hidden rounded-full" style={{ background: COLOR.recessed }}>
                <div
                  style={{
                    width: `${widthPct}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${COLOR.primary} 0%, ${COLOR.accent} 100%)`,
                    transition: 'width 500ms ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TreatmentDonut({ referrals }) {
  const COLOR = useColors();
  const buckets = { Cataract: 0, 'Dry Eye': 0, ICL: 0, LVC: 0, Other: 0 };
  referrals.forEach((r) => {
    if (r.treatment.includes('Cataract')) buckets.Cataract += 1;
    else if (r.treatment.includes('Dry Eye')) buckets['Dry Eye'] += 1;
    else if (r.treatment.includes('ICL')) buckets.ICL += 1;
    else if (r.treatment.includes('LVC') || r.treatment.includes('Laser')) buckets.LVC += 1;
    else buckets.Other += 1;
  });
  const data = Object.entries(buckets).map(([name, value]) => ({ name, value })).filter((d) => d.value > 0);
  const colors = { Cataract: COLOR.primary, 'Dry Eye': COLOR.secondary, ICL: COLOR.accent, LVC: '#7C9CB8', Other: COLOR.future };

  return (
    <div className="ecl-fade-up mt-6 rounded-2xl p-5" style={{ background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
      <h2 className="mb-4 font-medium" style={{ color: COLOR.text }}>Referrals by treatment type</h2>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
              {data.map((d) => <Cell key={d.name} fill={colors[d.name]} stroke="none" />)}
            </Pie>
            <Tooltip content={<ChartTooltip suffix=" referrals" />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {data.map((d) => (
          <span key={d.name} className="flex items-center gap-1.5 text-xs" style={{ color: COLOR.textMuted }}>
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: colors[d.name] }} /> {d.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function TopPartnersCard({ referrals, onViewAll }) {
  const COLOR = useColors();
  const ranked = practiceBreakdown(referrals).slice(0, 3);

  return (
    <div className="ecl-fade-up mt-6 rounded-2xl p-5" style={{ background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-medium" style={{ color: COLOR.text }}>Top referral partners</h2>
        <button onClick={onViewAll} className="ecl-underline flex items-center gap-1 text-sm font-medium" style={{ color: COLOR.accent }}>
          View all <ArrowRight size={13} />
        </button>
      </div>
      <ul className="divide-y" style={{ borderColor: COLOR.border }}>
        {ranked.map((p) => (
          <li key={p.practice} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium" style={{ color: COLOR.text }}>{p.practice}</p>
              <p className="text-xs" style={{ color: COLOR.textMuted }}>{p.count} referrals · {p.treated} treated</p>
            </div>
            <p className="shrink-0 text-sm font-semibold" style={{ color: COLOR.complete }}>{p.share}%</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FollowUpsCard() {
  const COLOR = useColors();
  return (
    <div className="ecl-fade-up mt-6 rounded-2xl p-5" style={{ background: COLOR.accentTint, border: `1px solid ${COLOR.border}` }}>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold" style={{ color: COLOR.text }}>
        <Clock3 size={16} style={{ color: COLOR.accent }} /> Follow-ups due this week
      </p>
      <p className="text-sm leading-relaxed" style={{ color: COLOR.textMuted }}>
        <span style={{ ...FONT_MONO, color: COLOR.text }}>10/07</span> · ClearSight Chelsea — chased two stalled cataract referrals.
      </p>
    </div>
  );
}

function AdminBottomNav({ tab, onTab }) {
  const COLOR = useColors();
  const items = [
    { id: 'home', label: 'Home', Icon: ClipboardList },
    { id: 'analytics', label: 'Analytics', Icon: TrendingUp },
    { id: 'referrals', label: 'Referrals', Icon: FileText },
    { id: 'partners', label: 'Partners', Icon: Users2 },
    { id: 'activity', label: 'Activity', Icon: Activity },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40" style={{ background: `${COLOR.bg}F5`, backdropFilter: 'blur(10px)', borderTop: `1px solid ${COLOR.border}`, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="mx-auto flex max-w-5xl items-center justify-around px-2 py-2">
        {items.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onTab(id)}
            className="ecl-btn flex flex-col items-center gap-1 rounded-lg px-3 py-1.5"
            style={{ color: tab === id ? COLOR.accent : COLOR.textMuted }}
          >
            <Icon size={20} strokeWidth={tab === id ? 2.4 : 1.8} />
            <span className="text-[11px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function AdminConsole({ onExit, referrals, onStatusChange, theme, onToggleTheme }) {
  const COLOR = useColors();
  const safeReferrals = referrals || [];
  const [tab, setTab] = useState('home');
  const topPractice = practiceBreakdown(safeReferrals)[0]?.practice;

  return (
    <div style={{ minHeight: '100vh', background: COLOR.recessed }}>
      <header className="sticky top-0 z-40" style={{ background: `${COLOR.bg}F2`, borderBottom: `1px solid ${COLOR.border}`, backdropFilter: 'blur(6px)' }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <EclWordmark tone={theme === 'night' ? 'white' : 'dark'} size="sm" />
            <span style={{ width: 1, height: 24, background: COLOR.border }} />
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLOR.textMuted }}>Business<br />Development</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} inline />
            <button onClick={onExit} className="ecl-btn flex h-9 w-9 items-center justify-center rounded-full" style={{ background: COLOR.recessed, color: COLOR.textMuted }}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pb-28 pt-6">
        {tab === 'home' && (
          <>
            <PrioritiesSection referrals={safeReferrals} />
            <BDSummaryCard referrals={safeReferrals} topPractice={topPractice} />
            <BDStatSquares referrals={safeReferrals} />
            <ConversionBanner referrals={safeReferrals} />
            <PatientJourneyFunnel referrals={safeReferrals} />
            <TreatmentDonut referrals={safeReferrals} />
            <TopPartnersCard referrals={safeReferrals} onViewAll={() => setTab('partners')} />
            <FollowUpsCard />
          </>
        )}

        {tab === 'analytics' && (
          <>
            <h1 className="ecl-fade-up mt-2 text-xl font-medium" style={{ ...FONT_DISPLAY, color: COLOR.text }}>Analytics</h1>
            <ConversionBanner referrals={safeReferrals} />
            <PatientJourneyFunnel referrals={safeReferrals} />
            <TreatmentDonut referrals={safeReferrals} />
          </>
        )}

        {tab === 'referrals' && (
          <>
            <h1 className="ecl-fade-up mt-2 text-xl font-medium" style={{ ...FONT_DISPLAY, color: COLOR.text }}>Referrals</h1>
            <AdminOverview referrals={safeReferrals} />
            <div className="mt-6">
              <ReferralsTable referrals={safeReferrals} onStatusChange={onStatusChange} />
            </div>
          </>
        )}

        {tab === 'partners' && (
          <>
            <h1 className="ecl-fade-up mt-2 text-xl font-medium" style={{ ...FONT_DISPLAY, color: COLOR.text }}>Partners</h1>
            <div className="mt-6">
              <PartnersLeaderboard referrals={safeReferrals} />
            </div>
          </>
        )}

        {tab === 'activity' && (
          <>
            <h1 className="ecl-fade-up mt-2 text-xl font-medium" style={{ ...FONT_DISPLAY, color: COLOR.text }}>Activity</h1>
            <div className="ecl-fade-up mt-6 rounded-2xl p-5" style={{ background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
              <ul className="divide-y" style={{ borderColor: COLOR.border }}>
                {safeReferrals.slice(0, 8).map((r, i) => (
                  <li key={r.id || i} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium" style={{ color: COLOR.text }}>{r.patient} · {r.treatment}</p>
                      <p className="text-xs" style={{ color: COLOR.textMuted }}>{r.practice} · {r.date}</p>
                    </div>
                    <Pill tone={STATUS_TONE[r.status] || 'default'}>{r.status}</Pill>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <p className="mt-8 text-center text-xs" style={{ color: COLOR.textMuted }}>Standalone visual preview — no backend, nothing is saved.</p>
      </div>

      <AdminBottomNav tab={tab} onTab={setTab} />
    </div>
  );
}

// ---------- bottom navigation bar (partner side) ----------

function BottomNav({ screen, onHome, onInsights, onReferrals, onEducation, onRefer }) {
  const COLOR = useColors();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40"
      style={{ background: `${COLOR.bg}F5`, backdropFilter: 'blur(10px)', borderTop: `1px solid ${COLOR.border}`, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex max-w-5xl items-end px-4 pb-2 pt-2">
        <button
          onClick={onHome}
          className="ecl-btn flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5"
          style={{ color: screen === 'dashboard' ? COLOR.text : COLOR.textMuted }}
        >
          <Home size={20} strokeWidth={screen === 'dashboard' ? 2.4 : 1.8} />
          <span className="text-[11px] font-medium">Home</span>
        </button>

        <button
          onClick={onInsights}
          className="ecl-btn flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5"
          style={{ color: screen === 'insights' ? COLOR.text : COLOR.textMuted }}
        >
          <TrendingUp size={20} strokeWidth={screen === 'insights' ? 2.4 : 1.8} />
          <span className="text-[11px] font-medium">Insights</span>
        </button>

        <button
          onClick={onRefer}
          className="ecl-btn ecl-press relative flex flex-1 flex-col items-center gap-1 py-1.5"
        >
          <span aria-hidden className="block h-5 w-5" />
          <span
            className="absolute -top-6 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full shadow-lg"
            style={{ background: COLOR.accent, color: COLOR.primary, border: `4px solid ${COLOR.bg}` }}
          >
            <UserPlus size={22} />
          </span>
          <span className="whitespace-nowrap text-[11px] font-medium" style={{ color: screen === 'refer' ? COLOR.text : COLOR.textMuted }}>Refer a Patient</span>
        </button>

        <button
          onClick={onReferrals}
          className="ecl-btn flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5"
          style={{ color: screen === 'referrals' ? COLOR.text : COLOR.textMuted }}
        >
          <ListChecks size={20} strokeWidth={screen === 'referrals' ? 2.4 : 1.8} />
          <span className="text-[11px] font-medium">Referrals</span>
        </button>

        <button
          onClick={onEducation}
          className="ecl-btn flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5"
          style={{ color: screen === 'clinical-education' ? COLOR.text : COLOR.textMuted }}
        >
          <GraduationCap size={20} strokeWidth={screen === 'clinical-education' ? 2.4 : 1.8} />
          <span className="text-[11px] font-medium">Education</span>
        </button>
      </div>
    </nav>
  );
}

// ---------- shell ----------

const NAV_ITEMS = [
  { label: 'Home', icon: Home },
  { label: 'Referrals', icon: ListChecks },
  { label: 'Education', icon: GraduationCap },
  { label: 'Updates', icon: Megaphone },
  { label: 'Notifications', icon: Bell },
];

const NAV_SCREEN_MAP = { Home: 'dashboard', Education: 'clinical-education' };

function AppShell({ theme, onToggleTheme }) {
  const COLOR = useColors();
  const [screen, setScreen] = useState('login'); // login | dashboard | refer | insights | referrals | admin | referral-assistant | clinical-education
  const [menuOpen, setMenuOpen] = useState(false);
  const [referrals, setReferrals] = useState(ADMIN_REFERRALS_SEED);

  useEffect(() => {
    setMenuOpen(false);
  }, [screen]);

  function addReferral(newReferral) {
    setReferrals((rs) => [newReferral, ...rs]);
  }
  function updateReferralStatus(id, status) {
    setReferrals((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  return (
    <div style={{ ...FONT_BODY, minHeight: '100vh', position: 'relative', background: COLOR.recessed }}>
      <div className="relative z-10">
        {screen === 'login' && <LoginScreen onSignIn={() => setScreen('dashboard')} onStaffSignIn={() => setScreen('admin')} />}

        {screen === 'admin' && (
          <AdminConsole
            onExit={() => setScreen('login')}
            referrals={referrals}
            onStatusChange={updateReferralStatus}
            theme={theme}
            onToggleTheme={onToggleTheme}
          />
        )}

        {screen !== 'login' && screen !== 'admin' && (
          <div>
            <header className="sticky top-0 z-40" style={{ background: `${COLOR.bg}F2`, borderBottom: `1px solid ${COLOR.border}`, backdropFilter: 'blur(6px)' }}>
              <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-6">
                  <EclWordmark tone={theme === 'night' ? 'white' : 'dark'} size="sm" />
                  <nav className="hidden items-center gap-1 lg:flex">
                    {NAV_ITEMS.map(({ label, icon: Icon }) => {
                      const target = NAV_SCREEN_MAP[label];
                      const active = target && screen === target;
                      return (
                        <button
                          key={label}
                          onClick={() => target && setScreen(target)}
                          className="ecl-btn flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200"
                          style={active ? { background: COLOR.primaryTint, color: COLOR.text } : { color: COLOR.textMuted }}
                        >
                          <Icon size={16} /> {label}
                        </button>
                      );
                    })}
                  </nav>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden items-center gap-2 text-sm sm:flex" style={{ color: COLOR.textMuted }}>
                    <Building2 size={16} />
                    Keith Holland Opticians
                    <ChevronDown size={14} />
                  </div>
                  <button onClick={() => setScreen('refer')} className="ecl-btn ecl-press hidden rounded-lg px-4 py-2 text-sm font-medium text-white sm:flex" style={{ background: COLOR.primary }}>
                    Refer a Patient
                  </button>
                  <ThemeToggle theme={theme} onToggle={onToggleTheme} inline />
                  <div className="relative">
                    <button onClick={() => setMenuOpen((o) => !o)} className="ecl-btn flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: COLOR.primary }}>
                      JS
                    </button>
                    {menuOpen && (
                      <div className="ecl-scale-in absolute right-0 z-20 mt-1.5 w-40 overflow-hidden rounded-lg" style={{ background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
                        <button onClick={() => { setMenuOpen(false); setScreen('login'); }} className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm transition-colors duration-150 hover:bg-black/5" style={{ color: COLOR.text }}>
                          <User size={15} /> Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </header>

            <div key={screen === 'refer' || screen === 'referral-assistant' ? 'other' : screen} className="ecl-fade-in">
              {screen === 'dashboard' && (
                <Dashboard
                  onRefer={() => setScreen('refer')}
                  onStartReferralAssistant={() => setScreen('referral-assistant')}
                  referrals={referrals}
                />
              )}
              {screen === 'insights' && <InsightsPage />}
              {screen === 'referrals' && <ReferralsPage referrals={referrals} />}
              {screen === 'clinical-education' && (
                <ClinicalEducation
                  onReferPatient={() => setScreen('refer')}
                  onStartReferralAssistant={() => setScreen('referral-assistant')}
                />
              )}
            </div>
            {screen === 'refer' && <ReferWizard onExit={() => setScreen('dashboard')} onSubmitReferral={addReferral} />}
            {screen === 'referral-assistant' && (
              <ReferralAssistant onExit={() => setScreen('dashboard')} onReferPatient={() => setScreen('refer')} />
            )}

            <footer className="mx-auto max-w-5xl px-4 pb-4 pt-8" style={{ paddingBottom: '6rem' }}>
              <div className="flex flex-col items-center gap-2 border-t pt-6 text-center" style={{ borderColor: COLOR.border }}>
                <EclWordmark tone={theme === 'night' ? 'white' : 'dark'} size="sm" className="opacity-70" />
                <p className="text-xs" style={{ color: COLOR.textMuted }}>
                  7 Devonshire Street, Marylebone, London W1W 5DY · 0203 974 4454 · info@eyecliniclondon.com
                </p>
                <p className="flex items-center gap-1 text-xs" style={{ color: COLOR.textMuted }}>
                  <Clock3 size={12} /> Standalone visual preview — no backend, nothing is saved.
                </p>
              </div>
            </footer>

            <BottomNav
              screen={screen}
              onHome={() => { setScreen('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onInsights={() => { setScreen('insights'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onReferrals={() => { setScreen('referrals'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onEducation={() => { setScreen('clinical-education'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onRefer={() => setScreen('refer')}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function EclPreview() {
  const [theme, setTheme] = useState('day');
  const colors = theme === 'day' ? DAY_COLORS : NIGHT_COLORS;

  return (
    <ColorContext.Provider value={colors}>
      <style>{GLOBAL_STYLES}</style>
      <AppShell theme={theme} onToggleTheme={() => setTheme((t) => (t === 'day' ? 'night' : 'day'))} />
    </ColorContext.Provider>
  );
}
