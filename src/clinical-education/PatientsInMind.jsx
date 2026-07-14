import { useState } from 'react';
import { NotebookPen, Trash2, MessageCircle, UserPlus, CheckCircle2, Flag } from 'lucide-react';
import { useColors, FONT_DISPLAY } from '../theme';

export default function PatientsInMind({ notes, onAdd, onToggleDiscuss, onDelete, onConvert }) {
  const COLOR = useColors();
  const [draft, setDraft] = useState('');

  function submit() {
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft('');
  }

  return (
    <div className="ecl-fade-up ecl-lift mt-8 rounded-2xl p-6 sm:p-7" style={{ background: COLOR.bg, border: `1px solid ${COLOR.border}` }}>
      <div className="flex items-start gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: COLOR.accentTint, color: COLOR.accent }}>
          <NotebookPen size={20} strokeWidth={1.75} />
        </span>
        <div>
          <h2 className="text-xl" style={{ ...FONT_DISPLAY, color: COLOR.text }}>Patients I Have in Mind</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed" style={{ color: COLOR.textMuted }}>
            Jot a quick, broad note about a patient while a module is fresh in your mind. No names, dates of birth or contact details — just enough to jog your memory later.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. Patient in their late 60s struggling with glare and night driving. Discuss cataract assessment at next review."
          className="flex-1"
          style={{
            minHeight: 56,
            resize: 'vertical',
            borderRadius: '0.625rem',
            border: `1px solid ${COLOR.border}`,
            background: COLOR.recessed,
            padding: '0.625rem 0.875rem',
            fontSize: '14px',
            color: COLOR.text,
            outline: 'none',
          }}
        />
        <button
          onClick={submit}
          disabled={!draft.trim()}
          className="ecl-btn ecl-press shrink-0 rounded-lg px-5 py-2.5 text-sm font-medium text-white sm:self-start"
          style={{ background: COLOR.primary, opacity: draft.trim() ? 1 : 0.45 }}
        >
          Add Note
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="mt-5 rounded-xl p-4 text-center text-sm" style={{ background: COLOR.recessed, color: COLOR.textMuted }}>
          No notes yet — add one above while a patient is on your mind.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {notes.map((note, i) => (
            <li
              key={note.id}
              className="ecl-fade-up rounded-xl p-4"
              style={{ animationDelay: `${i * 40}ms`, background: COLOR.recessed, border: `1px solid ${COLOR.border}` }}
            >
              <p className="text-sm leading-relaxed" style={{ color: COLOR.text }}>{note.text}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {note.forDiscussion && (
                  <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: '#B4780E1A', color: COLOR.action }}>
                    <Flag size={11} /> Marked for discussion
                  </span>
                )}
                <span className="text-xs" style={{ color: COLOR.textMuted }}>{note.moduleTitle}</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    onClick={() => onToggleDiscuss(note.id)}
                    className="ecl-btn flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
                    style={{ color: note.forDiscussion ? COLOR.action : COLOR.textMuted, background: COLOR.bg, border: `1px solid ${COLOR.border}` }}
                  >
                    <MessageCircle size={13} /> {note.forDiscussion ? 'Marked' : 'Mark for discussion'}
                  </button>
                  <button
                    onClick={() => onConvert(note)}
                    className="ecl-btn flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                    style={{ background: COLOR.primary }}
                  >
                    <UserPlus size={13} /> Convert to Referral
                  </button>
                  <button
                    onClick={() => onDelete(note.id)}
                    className="ecl-btn flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ color: COLOR.textMuted, background: COLOR.bg, border: `1px solid ${COLOR.border}` }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {note.converted && (
                <p className="ecl-fade-in mt-2 flex items-center gap-1.5 text-xs font-medium" style={{ color: COLOR.complete }}>
                  <CheckCircle2 size={12} /> Sent to the referral form
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
