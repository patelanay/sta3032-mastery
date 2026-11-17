import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Dec 8 2026, 10:00 AM EST (UTC-5) = 15:00 UTC */
const EXAM_DATE = new Date('2026-12-08T15:00:00Z');

export function daysUntilExam(): number {
  const now = new Date();
  const diff = EXAM_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function hoursUntilExam(): number {
  const now = new Date();
  const diff = EXAM_DATE.getTime() - now.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

/** Exact ms until exam (for countdown) */
export function msUntilExam(): number {
  return Math.max(0, EXAM_DATE.getTime() - Date.now());
}
