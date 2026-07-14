import {
  Compass, MessageCircle, UserPlus, GraduationCap, Clock3, CheckCircle2, ArrowRight,
  Bookmark, BookmarkCheck, Sparkle, TrendingUp,
} from 'lucide-react';
import { useColors, FONT_DISPLAY } from '../theme';
import { MODULES } from './config';
import { ModuleIcon } from './shared';
import PatientsInMind from './PatientsInMind';

const STATUS_META = {
  'not-started': { label: 'Not started' },
  'in-progress': { label: 'In progress' },
  completed: { label: 'Completed' },
};

function statusStyle(status, COLOR) {
  if (status === 'completed') return { bg: '#2F7D5A1A', color: COLOR.complete };
  if (status === 'in-progress') return { bg: '#B4780E1A', color: COLOR.action };
  return { bg: COLOR.recessed, color: COLOR.textMuted };
}

function StatusPill({ status }) {
  const COLOR = useColors();
  const s = statusStyle(status, COLOR);
  return (
    <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: s.bg, color: s.color }}>
      {status === 'completed' && <CheckCircle2 size={11} />}
      {STATUS_META[status].label}
    </span>
  );
}

function FeatureCard({ onExplore, onDiscuss, onRefer }) {
  const COLOR = useColors();
  return (
    <div className="ecl-fade-up relative mt-6 overflow-hidden rounded-2xl" style={{ animationDelay: '40ms', background: COLOR.primary }}>
      <GraduationCap size={200} className="ecl-float pointer-events-none absolute -right-8 -top-10 opacity-10" style={{ color: '#fff' }} />
      <div className="relative px-6 py-8 sm:px-8 sm:py-9">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.accent }}>
          <Sparkle size={13} /> Have a patient in mind?
        </p>
        <h2 className="mt-2 text-2xl text-white sm:text-3xl" style={FONT_DISPLAY}>Have a patient in mind?</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
          Not sure which treatment pathway may be relevant? Explore our interactive referral assistant or discuss the case directly with Ryan.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            onClick={onExplore}
            className="ecl-btn ecl-press flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium"
            style={{ background: COLOR.accent, color: COLOR.primary }}
          >
            <Compass size={16} /> Explore a Patient Scenario
          </button>
          <button
            onClick={onDiscuss}
            className="ecl-btn ecl-press flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white"
            style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.35)' }}
          >
            <MessageCircle size={16} /> Discuss a Case
          </button>
          <button
            onClick={onRefer}
            className="ecl-btn ecl-press flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white"
            style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.35)' }}
          >
            <UserPlus size={16} /> Refer a Patient
          </button>
        </div>
      </div>
    </div>
  );
}

function LearningProgressCard({ completedCount, percent }) {
  const COLOR = useColors();
  return (
    <div className="ecl-fade-up ecl-lift mt-6 rounded-2xl p-6 sm:p-7" style={{ animationDelay: '80ms', background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>Your Learning Progress</h2>
          <p className="mt-1 text-sm" style={{ color: COLOR.textMuted }}>
            {MODULES.length} modules available · {completedCount} completed · {percent}%
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed" style={{ color: COLOR.textMuted }}>
            Complete each short module to strengthen your confidence in identifying suitable patients for referral.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-2 sm:items-end">
          <span className="text-3xl font-medium" style={{ ...FONT_DISPLAY, color: COLOR.ink }}>{percent}%</span>
          <div className="h-2 w-40 overflow-hidden rounded-full" style={{ background: COLOR.recessed }}>
            <div style={{ width: `${percent}%`, height: '100%', background: COLOR.accent, borderRadius: 999, transition: 'width 500ms cubic-bezier(0.16,1,0.3,1)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendedForYou({ progressMap, onOpenModule }) {
  const COLOR = useColors();
  const inProgress = MODULES
    .filter((m) => progressMap[m.id]?.status === 'in-progress')
    .sort((a, b) => (progressMap[b.id]?.percent || 0) - (progressMap[a.id]?.percent || 0))[0];

  const fallback = MODULES.find((m) => progressMap[m.id]?.status !== 'completed') || MODULES[0];
  const module = inProgress || fallback;
  const isContinue = Boolean(inProgress);
  const percent = inProgress ? (progressMap[inProgress.id]?.percent || 0) : null;

  return (
    <div className="ecl-fade-up ecl-lift ecl-press mt-6 cursor-pointer rounded-2xl p-5 sm:p-6" onClick={() => onOpenModule(module.id)} style={{ animationDelay: '110ms', background: COLOR.accentTint, border: `1px solid ${COLOR.border}` }}>
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.accent }}>
        <TrendingUp size={13} /> Recommended for you
      </p>
      <div className="mt-2 flex items-center gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: COLOR.bg, color: COLOR.ink }}>
          <ModuleIcon name={module.icon} size={20} strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium" style={{ color: COLOR.text }}>
            {isContinue ? `Continue learning` : 'Popular with referring optometrists'}
          </p>
          <p className="truncate text-sm" style={{ color: COLOR.textMuted }}>
            {isContinue ? `You are ${percent}% through ${module.title}.` : module.title}
          </p>
        </div>
        <ArrowRight size={16} className="ml-auto shrink-0" style={{ color: COLOR.accent }} />
      </div>
    </div>
  );
}

function ModuleCard({ module, progress, saved, onOpen, onToggleSave, delay }) {
  const COLOR = useColors();
  const status = progress?.status || 'not-started';
  const buttonLabel = status === 'completed' ? 'Review Module' : status === 'in-progress' ? 'Continue Module' : 'Start Module';

  return (
    <div
      className="ecl-fade-up ecl-lift flex flex-col rounded-2xl p-5 sm:p-6"
      style={{ animationDelay: `${delay}ms`, background: COLOR.bg, border: `1px solid ${COLOR.border}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: COLOR.primaryTint, color: COLOR.ink }}>
          <ModuleIcon name={module.icon} size={20} strokeWidth={1.75} />
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSave(module.id); }}
          className="ecl-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ color: saved ? COLOR.accent : COLOR.textMuted, background: COLOR.recessed }}
          aria-label="Save for later"
        >
          {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
        </button>
      </div>

      <h3 className="mt-3.5 text-lg leading-snug" style={{ ...FONT_DISPLAY, color: COLOR.text }}>{module.title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed" style={{ color: COLOR.textMuted }}>{module.cardDescription}</p>

      <div className="mt-4 flex items-center gap-2">
        <span className="flex items-center gap-1 text-xs" style={{ color: COLOR.textMuted }}>
          <Clock3 size={12} /> {module.estimatedMinutes} min
        </span>
        <StatusPill status={status} />
      </div>

      {status === 'in-progress' && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ background: COLOR.recessed }}>
          <div style={{ width: `${progress?.percent || 0}%`, height: '100%', background: COLOR.action, borderRadius: 999 }} />
        </div>
      )}

      <button
        onClick={() => onOpen(module.id)}
        className="ecl-btn ecl-press mt-5 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white"
        style={{ background: COLOR.primary }}
      >
        {buttonLabel} <ArrowRight size={15} />
      </button>
    </div>
  );
}

export default function ClinicalEducationDashboard({
  progressMap, savedModules, notes, onOpenModule, onToggleSaveModule, onExplore, onDiscuss, onRefer,
  onAddNote, onToggleDiscussNote, onDeleteNote, onConvertNote,
}) {
  const COLOR = useColors();
  const completedCount = MODULES.filter((m) => progressMap[m.id]?.status === 'completed').length;
  const percent = Math.round((completedCount / MODULES.length) * 100);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="ecl-fade-up flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: COLOR.primaryTint, color: COLOR.ink }}>
          <GraduationCap size={22} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="text-3xl sm:text-4xl" style={FONT_DISPLAY}>Clinical Education</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed sm:text-[15px]" style={{ color: COLOR.textMuted }}>
            Practical, bite-sized clinical education to help you identify suitable patients, understand treatment pathways and make confident referrals.
          </p>
        </div>
      </div>

      <FeatureCard onExplore={onExplore} onDiscuss={() => onDiscuss()} onRefer={onRefer} />
      <LearningProgressCard completedCount={completedCount} percent={percent} />
      <RecommendedForYou progressMap={progressMap} onOpenModule={onOpenModule} />

      <div className="mt-10">
        <h2 className="ecl-fade-up text-2xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>Learning modules</h2>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module, i) => (
            <ModuleCard
              key={module.id}
              module={module}
              progress={progressMap[module.id]}
              saved={savedModules.has(module.id)}
              onOpen={onOpenModule}
              onToggleSave={onToggleSaveModule}
              delay={i * 50}
            />
          ))}
        </div>
      </div>

      <PatientsInMind
        notes={notes}
        onAdd={(text) => onAddNote(null, 'General note', text)}
        onToggleDiscuss={onToggleDiscussNote}
        onDelete={onDeleteNote}
        onConvert={onConvertNote}
      />
    </div>
  );
}
