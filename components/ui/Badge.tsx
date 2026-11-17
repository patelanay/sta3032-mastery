import React from 'react';
import { cn } from '@/lib/utils';

interface FormulaSheetBadgeProps {
  onExam3Sheet: boolean;
}

export function FormulaSheetBadge({ onExam3Sheet }: FormulaSheetBadgeProps) {
  if (onExam3Sheet) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-accent-900/60 text-accent-300 border border-accent-700">
        📋 On Exam 3 Sheet
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
      Not on Sheet
    </span>
  );
}

const MODULE_COLORS: Record<
  number,
  { bg: string; text: string; border: string; label: string }
> = {
  1: {
    bg: 'bg-primary-900/60',
    text: 'text-primary-300',
    border: 'border-primary-700',
    label: 'M1: Probability',
  },
  2: {
    bg: 'bg-purple-900/60',
    text: 'text-purple-300',
    border: 'border-purple-700',
    label: 'M2: Distributions',
  },
  3: {
    bg: 'bg-cyan-900/60',
    text: 'text-cyan-300',
    border: 'border-cyan-700',
    label: 'M3: Estimation',
  },
  4: {
    bg: 'bg-warn-900/60',
    text: 'text-warn-300',
    border: 'border-warn-700',
    label: 'M4: Hypothesis Testing',
  },
  5: {
    bg: 'bg-danger-900/60',
    text: 'text-danger-300',
    border: 'border-danger-700',
    label: 'M5: Regression',
  },
  6: {
    bg: 'bg-accent-900/60',
    text: 'text-accent-300',
    border: 'border-accent-700',
    label: 'M6: ANOVA',
  },
};

interface ModuleBadgeProps {
  module: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function ModuleBadge({ module, className }: ModuleBadgeProps) {
  const style = MODULE_COLORS[module] ?? MODULE_COLORS[1];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        style.bg,
        style.text,
        style.border,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
