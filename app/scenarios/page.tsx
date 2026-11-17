'use client';

import { useState, useEffect, useMemo } from 'react';
import { scenarios } from '@/data/scenarios';
import { getAppState, addMistake } from '@/lib/storage';
import { generateId, cn } from '@/lib/utils';
import { KatexRenderer } from '@/components/ui/KatexRenderer';
import { FlagButton } from '@/components/ui/FlagButton';
import type { ScenarioCard } from '@/types';

type ModuleFilter = 'all' | 2 | 3 | 4 | 5 | 6;

const MODULE_LABELS: Record<string | number, string> = {
  all: 'All Modules',
  2: 'Module 2 (Prob)',
  3: 'Module 3 (1-Sample)',
  4: 'Module 4 (2-Sample)',
  5: 'Module 5 (Regression)',
  6: 'Module 6 (ANOVA)',
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildOptions(scenario: ScenarioCard): string[] {
  return shuffleArray([scenario.correctTest, ...scenario.wrongOptions]);
}

export default function ScenariosPage() {
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [sessionStats, setSessionStats] = useState<Record<number, { correct: number; total: number }>>({});
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  const filtered = useMemo(
    () => (moduleFilter === 'all' ? scenarios : scenarios.filter((s: ScenarioCard) => s.module === moduleFilter)),
    [moduleFilter],
  );

  const scenario: ScenarioCard | null = filtered[currentIndex] ?? null;

  useEffect(() => {
    if (scenario) setShuffledOptions(buildOptions(scenario));
    setSelected(null);
    setSubmitted(false);
  }, [currentIndex, scenario?.id]);

  useEffect(() => {
    setCurrentIndex(0);
    setSelected(null);
    setSubmitted(false);
  }, [moduleFilter]);

  const handleSubmit = () => {
    if (!selected || !scenario) return;
    setSubmitted(true);
    const isCorrect = selected === scenario.correctTest;

    setSessionStats((prev) => {
      const mod = scenario.module;
      const cur = prev[mod] ?? { correct: 0, total: 0 };
      return {
        ...prev,
        [mod]: {
          correct: cur.correct + (isCorrect ? 1 : 0),
          total: cur.total + 1,
        },
      };
    });

    if (isCorrect) {
      setMasteredIds((prev) => new Set([...Array.from(prev), scenario.id]));
    } else {
      addMistake({
        id: generateId(),
        source: 'scenario',
        errorType: 'wrong-test-selected',
        itemId: scenario.id,
        itemTitle: scenario.scenario.substring(0, 50),
        module: scenario.module,
        details: `Selected: "${selected}" | Correct: "${scenario.correctTest}"`,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < filtered.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const isCorrect = submitted && selected === scenario?.correctTest;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">🎯 Scenario Recognition Trainer</h1>
        <p className="text-gray-400 text-lg">
          You will have formula sheets in hand. This trainer builds the #1 skill you need on the exam:{' '}
          <span className="text-indigo-400 font-semibold">read the scenario → pick the right test</span>.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 2, 3, 4, 5, 6] as ModuleFilter[]).map((m) => (
          <button
            key={String(m)}
            onClick={() => setModuleFilter(m)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200',
              moduleFilter === m
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-gray-800',
            )}
          >
            {MODULE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Progress & Counter */}
      <div className="flex items-center justify-between text-sm text-gray-400 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5">
        <div>
          Scenario <strong className="text-white">{filtered.length > 0 ? currentIndex + 1 : 0}</strong> of{' '}
          <strong className="text-white">{filtered.length}</strong>
        </div>
        <div>
          Mastered:{' '}
          <strong className="text-emerald-400">
            {filtered.filter((s: ScenarioCard) => masteredIds.has(s.id)).length}
          </strong>{' '}
          / {filtered.length}
        </div>
      </div>

      {/* Scenario Card */}
      {scenario ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6 shadow-xl">
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-full">
              {MODULE_LABELS[scenario.module]}
            </span>
            <FlagButton
              itemId={scenario.id}
              title={`Scenario: ${scenario.correctTest}`}
              content={scenario.scenario}
              side="A"
              priority="trap"
            />
          </div>

          {/* Prompt Paragraph */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Problem Statement</p>
            <p className="text-base text-gray-100 leading-relaxed font-sans">{scenario.scenario}</p>
          </div>

          {/* Question */}
          <p className="text-sm font-semibold text-white">Which statistical procedure is appropriate?</p>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {shuffledOptions.map((opt, i) => {
              let optStyle = 'bg-gray-800/80 border-gray-700 hover:border-gray-500 text-gray-200';
              if (submitted) {
                if (opt === scenario.correctTest) {
                  optStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200 font-semibold';
                } else if (opt === selected && !isCorrect) {
                  optStyle = 'bg-rose-950 border-rose-500 text-rose-200 font-semibold';
                } else {
                  optStyle = 'bg-gray-900/40 border-gray-800 text-gray-500 opacity-50';
                }
              } else if (selected === opt) {
                optStyle = 'bg-indigo-950/80 border-indigo-500 text-white font-semibold ring-1 ring-indigo-500';
              }

              return (
                <button
                  key={i}
                  disabled={submitted}
                  onClick={() => setSelected(opt)}
                  className={cn(
                    'p-4 rounded-xl border text-left text-sm transition-all duration-150 flex items-center justify-between',
                    optStyle,
                  )}
                >
                  <span>{opt}</span>
                  {submitted && opt === scenario.correctTest && (
                    <span className="text-emerald-400 font-bold ml-2">✓ Correct</span>
                  )}
                  {submitted && opt === selected && !isCorrect && (
                    <span className="text-rose-400 font-bold ml-2">✗ Selected</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Button */}
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selected}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
            >
              Confirm Selection
            </button>
          ) : (
            <div className="space-y-4 pt-2">
              <div
                className={cn(
                  'p-4 rounded-xl border text-sm font-semibold',
                  isCorrect
                    ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-700 text-rose-300',
                )}
              >
                {isCorrect ? '✓ Spot on! You picked the right test.' : `✗ Incorrect. Correct test: ${scenario.correctTest}`}
              </div>

              {/* Explanation breakdown */}
              <div className="p-5 bg-gray-950 border border-gray-800 rounded-xl space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Why This Test Applies</p>
                <p className="text-sm text-gray-200 leading-relaxed">{scenario.whyCorrect}</p>

                {/* Key Signals */}
                <div>
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5">🔑 Key Signals in Problem</p>
                  <ul className="space-y-1">
                    {scenario.keySignals.map((sig: string, i: number) => (
                      <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="text-amber-400">•</span>
                        <span>{sig}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Assumptions */}
                <div>
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1.5">📋 Assumptions to Check</p>
                  <ul className="space-y-1">
                    {scenario.assumptions.map((asm: string, i: number) => (
                      <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="text-blue-400">□</span>
                        <span>{asm}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
              >
                {currentIndex < filtered.length - 1 ? 'Next Scenario →' : 'Restart Deck ↺'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 bg-gray-900 border border-gray-800 rounded-2xl text-center text-gray-500">
          No scenarios available for this module filter.
        </div>
      )}
    </main>
  );
}
