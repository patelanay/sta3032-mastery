'use client';

import { useState, useCallback } from 'react';
import { addMistake } from '@/lib/storage';
import { clozeExercises } from '@/data/cloze';
import { KatexRenderer } from '@/components/ui/KatexRenderer';
import { FlagButton } from '@/components/ui/FlagButton';
import { ModuleBadge } from '@/components/ui/Badge';
import { generateId, cn } from '@/lib/utils';
import type { ClozeExercise } from '@/types';

type ClozeFilter = 'All' | 'Decision Tree' | 'ANOVA Table' | 'Assumption Check';
const CLOZE_FILTERS: ClozeFilter[] = ['All', 'Decision Tree', 'ANOVA Table', 'Assumption Check'];

const TYPE_LABELS: Record<string, string> = {
  'decision-tree': 'Decision Tree',
  'anova-table': 'ANOVA Table',
  'assumption-check': 'Assumption Check',
};

const TYPE_BADGES: Record<string, string> = {
  'decision-tree': 'bg-purple-900 text-purple-300 border-purple-700',
  'anova-table': 'bg-blue-900 text-blue-300 border-blue-700',
  'assumption-check': 'bg-amber-900 text-amber-300 border-amber-700',
};

export default function ClozePage() {
  const [activeFilter, setActiveFilter] = useState<ClozeFilter>('All');

  const filtered = activeFilter === 'All'
    ? clozeExercises
    : clozeExercises.filter((ex: ClozeExercise) => {
        if (activeFilter === 'Decision Tree') return ex.type === 'decision-tree';
        if (activeFilter === 'ANOVA Table') return ex.type === 'anova-table';
        if (activeFilter === 'Assumption Check') return ex.type === 'assumption-check';
        return true;
      });

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">✏️ Fill-in-the-Blank Builders</h1>
        <p className="text-gray-400 text-lg">
          Train active retrieval: complete decision trees, ANOVA tables, and assumption checklists.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {CLOZE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap',
              activeFilter === f
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-gray-800',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Exercise Cards */}
      <div className="space-y-6">
        {filtered.map((ex: ClozeExercise) => (
          <ExerciseCard key={ex.id} exercise={ex} />
        ))}
      </div>
    </main>
  );
}

function ExerciseCard({ exercise }: { exercise: ClozeExercise }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden shadow-sm">
      {/* Card Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gray-900/60">
        <div className="flex items-center gap-3 flex-wrap">
          <ModuleBadge module={exercise.module} />
          <span
            className={cn(
              'text-xs font-semibold px-2.5 py-0.5 rounded-full border',
              TYPE_BADGES[exercise.type] ?? 'bg-gray-800 text-gray-300 border-gray-700',
            )}
          >
            {TYPE_LABELS[exercise.type] ?? exercise.type}
          </span>
          <span className="text-base font-bold text-white">{exercise.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <FlagButton
            itemId={exercise.id}
            title={exercise.title}
            content={exercise.template}
            side="A"
            priority="must-have"
          />
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-indigo-400 hover:underline"
          >
            {expanded ? 'Collapse ↑' : 'Expand ↓'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-5">
          <FillBlankExercise exercise={exercise} />
        </div>
      )}
    </div>
  );
}

// ─── Fill-in-the-blank Exercise ──────────────────────────────────────────────

function FillBlankExercise({ exercise }: { exercise: ClozeExercise }) {
  const parts = exercise.template.split(/(\[BLANK(?:_\d+)?\])/g);
  const blanks = parts.filter((p) => p.startsWith('[BLANK'));
  const totalBlanks = blanks.length;

  const [values, setValues] = useState<string[]>(Array(totalBlanks).fill(''));
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const getCorrectAnswer = (idx: number): string => {
    if (exercise.blanks && exercise.blanks[idx]) {
      return exercise.blanks[idx].answer;
    }
    if (exercise.answers && exercise.answers[idx]) {
      return exercise.answers[idx];
    }
    return '';
  };

  const getTolerance = (idx: number): number | undefined => {
    return exercise.blanks && exercise.blanks[idx] ? exercise.blanks[idx].tolerance : 0.01;
  };

  const handleCheck = useCallback(() => {
    const res = values.map((v, i) => {
      const correct = getCorrectAnswer(i);
      const tolerance = getTolerance(i) ?? 0.01;
      const numV = parseFloat(v);
      const numC = parseFloat(correct);
      if (!isNaN(numV) && !isNaN(numC)) {
        return Math.abs(numV - numC) <= tolerance;
      }
      return v.trim().toLowerCase() === correct.trim().toLowerCase();
    });

    setResults(res);
    setSubmitted(true);
    const allCorrect = res.every(Boolean);

    if (!allCorrect) {
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);
      addMistake({
        id: generateId(),
        source: 'cloze',
        errorType: 'other',
        itemId: exercise.id,
        itemTitle: exercise.title,
        module: exercise.module,
        details: `Cloze exercise wrong: ${res.map((r, i) => (r ? '✓' : `✗[${i}]`)).join(' ')}`,
        timestamp: new Date().toISOString(),
      });
      if (newAttempts >= 2) setRevealed(true);
    }
  }, [values, exercise, wrongAttempts]);

  const handleReset = () => {
    setValues(Array(totalBlanks).fill(''));
    setSubmitted(false);
    setResults([]);
  };

  let blankIdx = -1;

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
        {parts.map((part, pIdx) => {
          if (part.startsWith('[BLANK')) {
            blankIdx++;
            const idx = blankIdx;
            const isCorrect = submitted && results[idx] === true;
            const isWrong = submitted && results[idx] === false;
            const revealedAnswer = getCorrectAnswer(idx);
            return (
              <span key={pIdx} className="inline-block mx-1 align-middle">
                {revealed && isWrong ? (
                  <span className="inline-block min-w-[80px] border-b-2 border-emerald-500 px-2 py-0.5 text-emerald-400 text-sm font-mono">
                    {revealedAnswer}
                  </span>
                ) : (
                  <input
                    type="text"
                    value={values[idx] ?? ''}
                    onChange={(e) => {
                      const next = [...values];
                      next[idx] = e.target.value;
                      setValues(next);
                      if (submitted) {
                        setSubmitted(false);
                        setResults([]);
                      }
                    }}
                    placeholder={`[${idx + 1}]`}
                    className={cn(
                      'px-2 py-1 text-sm rounded border font-mono text-center transition-colors min-w-[90px]',
                      !submitted && 'bg-gray-800 border-gray-600 text-white focus:border-indigo-500 focus:outline-none',
                      submitted && isCorrect && 'bg-emerald-950 border-emerald-500 text-emerald-200',
                      submitted && isWrong && 'bg-rose-950 border-rose-500 text-rose-200',
                    )}
                  />
                )}
              </span>
            );
          }
          return <span key={pIdx}>{part}</span>;
        })}
      </div>

      {exercise.templateLatex && (
        <div className="my-2 p-3 bg-gray-800/50 rounded-lg">
          <KatexRenderer latex={exercise.templateLatex} display={true} />
        </div>
      )}

      {/* Buttons and Feedback */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleCheck}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          Check Answers
        </button>
        {submitted && (
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl transition-colors"
          >
            Reset
          </button>
        )}
        {submitted && (
          <span
            className={cn(
              'text-sm font-semibold',
              results.every(Boolean) ? 'text-emerald-400' : 'text-rose-400',
            )}
          >
            {results.every(Boolean)
              ? '✓ All correct! Great job.'
              : `✗ ${results.filter(Boolean).length}/${totalBlanks} correct. ${
                  wrongAttempts < 2 ? 'Try again!' : 'Answers revealed.'
                }`}
          </span>
        )}
      </div>

      {/* Hints */}
      {exercise.blanks && exercise.blanks.some((b) => b.hint) && (
        <div className="mt-4 p-3 bg-gray-800/40 rounded-xl border border-gray-700 space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Hints:</p>
          {exercise.blanks.map((b, i) => (
            <p key={i} className="text-xs text-gray-400">
              <span className="text-indigo-400 font-mono">[{i + 1}]</span> {b.hint}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
