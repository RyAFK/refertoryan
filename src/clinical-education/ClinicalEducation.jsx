import { useState } from 'react';
import { MODULES, buildGuideText } from './config';
import { DiscussCaseModal, BookRyanModal } from './shared';
import ClinicalEducationDashboard from './ClinicalEducationDashboard';
import ModulePlayer from './ModulePlayer';

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ClinicalEducation({ onReferPatient, onStartReferralAssistant }) {
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [savedModules, setSavedModules] = useState(new Set());
  const [notes, setNotes] = useState([]);
  const [discussOpen, setDiscussOpen] = useState(false);
  const [discussContext, setDiscussContext] = useState('');
  const [bookRyanOpen, setBookRyanOpen] = useState(false);

  const activeModule = MODULES.find((m) => m.id === activeModuleId) || null;

  function openModule(id) {
    setProgressMap((p) => ({
      ...p,
      [id]: { status: p[id]?.status === 'completed' ? 'completed' : 'in-progress', percent: p[id]?.percent || 0, quizScore: p[id]?.quizScore ?? null },
    }));
    setActiveModuleId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function exitModule() {
    setActiveModuleId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleStepChange(moduleId, stepIndex, totalSteps) {
    const percent = Math.round((stepIndex / totalSteps) * 100);
    setProgressMap((p) => ({
      ...p,
      [moduleId]: { ...p[moduleId], status: p[moduleId]?.status === 'completed' ? 'completed' : 'in-progress', percent },
    }));
  }

  function completeModule(moduleId, quizScore) {
    setProgressMap((p) => ({ ...p, [moduleId]: { status: 'completed', percent: 100, quizScore } }));
  }

  function toggleSaveModule(moduleId) {
    setSavedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId); else next.add(moduleId);
      return next;
    });
  }

  function addNote(moduleId, moduleTitle, text) {
    setNotes((prev) => [
      { id: crypto.randomUUID(), moduleId, moduleTitle: moduleId ? moduleTitle : 'General note', text, forDiscussion: false, converted: false },
      ...prev,
    ]);
  }

  function toggleDiscussNote(id) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, forDiscussion: !n.forDiscussion } : n)));
  }

  function deleteNote(id) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  function convertNote(note) {
    setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, converted: true } : n)));
    onReferPatient();
  }

  function openDiscuss(contextLabel) {
    setDiscussContext(contextLabel || '');
    setDiscussOpen(true);
  }

  function downloadGuide(module) {
    downloadTextFile(`${module.referralGuide.title.replace(/\s+/g, '-')}.txt`, buildGuideText(module));
  }

  return (
    <>
      <DiscussCaseModal
        open={discussOpen}
        onClose={() => setDiscussOpen(false)}
        contextLabel={discussContext}
        onBookConversation={() => setBookRyanOpen(true)}
      />
      <BookRyanModal open={bookRyanOpen} onClose={() => setBookRyanOpen(false)} />

      {activeModule ? (
        <ModulePlayer
          module={activeModule}
          onExit={exitModule}
          onReferPatient={onReferPatient}
          onOpenDiscuss={openDiscuss}
          onOpenBookRyan={() => setBookRyanOpen(true)}
          saved={savedModules.has(activeModule.id)}
          onToggleSave={toggleSaveModule}
          onCompleteModule={completeModule}
          onStepChange={handleStepChange}
          onSaveNote={(moduleId, moduleTitle, text) => addNote(moduleId, moduleTitle, text)}
          onDownloadGuide={downloadGuide}
        />
      ) : (
        <ClinicalEducationDashboard
          progressMap={progressMap}
          savedModules={savedModules}
          notes={notes}
          onOpenModule={openModule}
          onToggleSaveModule={toggleSaveModule}
          onExplore={onStartReferralAssistant}
          onDiscuss={() => openDiscuss('')}
          onRefer={onReferPatient}
          onAddNote={addNote}
          onToggleDiscussNote={toggleDiscussNote}
          onDeleteNote={deleteNote}
          onConvertNote={convertNote}
        />
      )}
    </>
  );
}
