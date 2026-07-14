// ---------------------------------------------------------------------------
// ECL Referral Assistant — decision logic utility.
//
// A small, transparent, rules-based scoring system: every selected option can
// carry positive (or occasionally negative) weight toward one or more
// pathways. Scores are summed and the highest scorer(s) are surfaced — never
// a numerical confidence, just a primary suggestion and, where genuinely
// close, a secondary one worth considering too.
// ---------------------------------------------------------------------------

import { QUESTIONS, CONCERN_BRANCHES, PATHWAYS } from './config';

// Returns the full ordered list of question ids for the branch the patient's
// stated concern leads down (excluding the leading urgency + concern steps).
export function getBranchQuestionIds(concernId) {
  return CONCERN_BRANCHES[concernId] || [];
}

// answers: { [questionId]: string | string[] }
function selectedOptionIds(answers, questionId) {
  const value = answers[questionId];
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function findOption(questionId, optionId) {
  const question = QUESTIONS[questionId];
  return question?.options.find((o) => o.id === optionId);
}

// True if any option selected *for this specific question* is flagged urgent.
export function isUrgentAnswer(questionId, answers) {
  return selectedOptionIds(answers, questionId).some((id) => findOption(questionId, id)?.urgent);
}

// If the selected option for a question short-circuits straight to an
// action ('discuss' | 'refer'), return that; otherwise null.
export function getTerminalAction(questionId, answers) {
  const ids = selectedOptionIds(answers, questionId);
  for (const id of ids) {
    const option = findOption(questionId, id);
    if (option?.terminal) return option.terminal;
  }
  return null;
}

const SECONDARY_MARGIN = 2;

export function computeResult(answers, concernId) {
  const scores = {};
  const reasonsByPathway = {};

  for (const [questionId, value] of Object.entries(answers)) {
    const ids = Array.isArray(value) ? value : [value];
    for (const optionId of ids) {
      const option = findOption(questionId, optionId);
      if (!option) continue;
      for (const [pathwayId, weight] of Object.entries(option.pathwaySignals || {})) {
        scores[pathwayId] = (scores[pathwayId] || 0) + weight;
      }
      for (const [pathwayId, reason] of Object.entries(option.reasons || {})) {
        if (!reasonsByPathway[pathwayId]) reasonsByPathway[pathwayId] = [];
        if (!reasonsByPathway[pathwayId].includes(reason)) reasonsByPathway[pathwayId].push(reason);
      }
    }
  }

  const ranked = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  const primaryId = ranked[0]?.[0] || 'general';
  const primaryScore = ranked[0]?.[1] || 0;
  const secondaryEntry = ranked.find(
    ([id, score]) => id !== primaryId && primaryScore - score <= SECONDARY_MARGIN
  );

  function buildPathwayResult(pathwayId, maxReasons) {
    const pathway = PATHWAYS[pathwayId];
    const title = pathway.contextualTitles?.[concernId] || pathway.title;
    const reasons = (reasonsByPathway[pathwayId] || []).slice(0, maxReasons);
    return { ...pathway, title, reasons };
  }

  return {
    primary: buildPathwayResult(primaryId, 3),
    secondary: secondaryEntry ? buildPathwayResult(secondaryEntry[0], 2) : null,
  };
}
