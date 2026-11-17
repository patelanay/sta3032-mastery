/**
 * SM-2 spaced-repetition algorithm.
 * grade: 1 (again) | 2 (hard) | 3 (good) | 4 (easy)
 */

import type { Flashcard, FlashcardProgress } from '@/types';

export interface SM2State {
  interval: number; // days until next review
  repetition: number; // how many times reviewed successfully in a row
  efactor: number; // ease factor (min 1.3)
  dueDate: string; // ISO date string
}

const MAX_INTERVAL = 22; // cap so nothing slips too far before the Dec 8 exam
const MIN_EFACTOR = 1.3;

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + Math.round(days));
  return d.toISOString().split('T')[0];
}

export function sm2(state: SM2State, grade: 1 | 2 | 3 | 4): SM2State {
  let { interval, repetition, efactor } = state;

  if (grade === 1) {
    interval = 1;
    repetition = 0;
    efactor = Math.max(MIN_EFACTOR, efactor);
  } else {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 3;
    } else {
      interval = Math.min(MAX_INTERVAL, Math.round(interval * efactor));
    }

    const quality = grade + 1; // map 2→3, 3→4, 4→5
    efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    efactor = Math.max(MIN_EFACTOR, efactor);

    repetition += 1;
    interval = Math.min(MAX_INTERVAL, interval);
  }

  return {
    interval,
    repetition,
    efactor,
    dueDate: addDays(interval),
  };
}

export function calculateSM2(
  card: Flashcard,
  grade: 1 | 2 | 3 | 4,
  existing?: FlashcardProgress,
): FlashcardProgress {
  const currentInterval = existing?.interval ?? card.interval ?? 1;
  const currentRepetition = existing?.repetition ?? card.repetition ?? 0;
  const currentEfactor = existing?.efactor ?? card.efactor ?? 2.5;

  const current: SM2State = {
    interval: currentInterval,
    repetition: currentRepetition,
    efactor: currentEfactor,
    dueDate: existing?.nextReviewDate ?? card.dueDate ?? new Date().toISOString().split('T')[0],
  };

  const updated = sm2(current, grade);

  return {
    interval: updated.interval,
    repetition: updated.repetition,
    efactor: updated.efactor,
    nextReviewDate: updated.dueDate,
    lastReviewed: new Date().toISOString().split('T')[0],
  };
}
