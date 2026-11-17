'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAppState } from '@/lib/storage';
import { moduleDefinitions } from '@/data/modules';
import { ModuleBadge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const WEIGHT_STYLES: Record<string, { label: string; className: string }> = {
  Critical: { label: 'Critical', className: 'bg-red-600 text-white' },
  High:     { label: 'High',     className: 'bg-orange-500 text-white' },
  Medium:   { label: 'Medium',   className: 'bg-yellow-500 text-black' },
  Low:      { label: 'Low',      className: 'bg-gray-500 text-white' },
};

const MODULE_TOOLS_SUMMARY: Record<number, { tools: string[]; milestone?: string }> = {
  1: { tools: ['Outlier Rule Decision', 'IQR & Interpolation Drills', 'Foundational Flashcards'] },
  2: { tools: ['Bayes Rule Inversion', 'Discrete/Continuous CDFs', 'Pattern 7 Proof Dojo'] },
  3: { tools: ['One-Sample t vs z Decision', 'Proportion & Variance CIs'], milestone: 'Practice Final 1 Milestone' },
  4: { tools: ['Welch vs Pooled Decision', 'Contingency Table χ² Drills', 'Pattern 8 Proof Dojo'] },
  5: { tools: ['LINE Diagnostics Lab', 'Partial F Nested Comparisons', 'Patterns 1–6 Proof Dojo'], milestone: 'Practice Final 2 Milestone' },
  6: { tools: ['ANOVA Table Completion', 'Tukey Post-Hoc Pairwise', 'RCBD Blocking Drills'], milestone: 'Practice Final 3 Milestone' },
};

export default function ModuleExplorerPage() {
  const [moduleProgress, setModuleProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const state = getAppState();
    setModuleProgress(state.moduleProgress ?? {});
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">📚 Guided Learning Pathway</h1>
          <p className="text-gray-400 text-sm max-w-2xl">
            You don't need to guess which tool to use. Every module integrates its specific{' '}
            <span className="text-indigo-400 font-semibold">decision rules</span>,{' '}
            <span className="text-emerald-400 font-semibold">scenario drills</span>,{' '}
            <span className="text-amber-400 font-semibold">step-by-step walkthroughs</span>, and{' '}
            <span className="text-purple-400 font-semibold">timed exam milestones</span> right where they belong.
          </p>
        </div>
        <Link
          href="/weak-spot?warmup=true"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm self-start md:self-auto flex items-center gap-1.5 whitespace-nowrap"
        >
          <span>🔥 Start Daily Warmup</span>
        </Link>
      </div>

      {/* Modules Roadmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {moduleDefinitions.map((mod) => {
          const weight = WEIGHT_STYLES[mod.examWeight] ?? WEIGHT_STYLES.Low;
          const topicsTotal = mod.topics?.length ?? 0;
          const doneKey = `mod${mod.number}`;
          const done = moduleProgress[doneKey] ?? 0;
          const pct = topicsTotal > 0 ? Math.round((done / topicsTotal) * 100) : 0;
          const toolInfo = MODULE_TOOLS_SUMMARY[mod.number];

          return (
            <Link
              key={mod.number}
              href={`/module-explorer/${mod.number}`}
              className="group block rounded-2xl border border-gray-800 bg-gray-900 hover:border-indigo-500 hover:bg-gray-800/80 transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-lg"
            >
              <div>
                {/* Accent Top Border */}
                <div
                  className="h-2"
                  style={{ background: mod.color ?? '#6366f1' }}
                />

                <div className="p-5 space-y-4">
                  {/* Badges row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <ModuleBadge module={mod.number} />
                    <span
                      className={cn(
                        'text-xs font-bold px-2 py-0.5 rounded-full',
                        weight.className,
                      )}
                    >
                      {weight.label}
                    </span>
                    {toolInfo?.milestone && (
                      <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-700 px-2 py-0.5 rounded-full font-medium">
                        ⏱️ Exam Milestone
                      </span>
                    )}
                  </div>

                  {/* Title & Lectures */}
                  <div>
                    <h2 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                      Module {mod.number}: {mod.title}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Lectures {mod.lectures}</p>
                  </div>

                  {/* Integrated Tools in this module */}
                  <div className="bg-gray-950/70 border border-gray-800/80 rounded-xl p-3 space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Integrated Drills</p>
                    <ul className="space-y-1">
                      {toolInfo?.tools.map((t, i) => (
                        <li key={i} className="text-xs text-gray-300 flex items-center gap-1.5 truncate">
                          <span className="text-indigo-400 text-xs">→</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Progress Footer */}
              <div className="p-5 pt-0">
                <div className="space-y-1.5 border-t border-gray-800/80 pt-3">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{done}/{topicsTotal} topics mastered</span>
                    <span className="font-semibold text-white">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: mod.color ?? '#6366f1',
                      }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
