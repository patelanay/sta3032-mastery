'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAppState, setLearningMode } from '@/lib/storage';
import { moduleDefinitions } from '@/data/modules';
import { ModuleBadge } from '@/components/ui/Badge';
import { CourseRoadmap } from '@/components/modules/CourseRoadmap';
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

type ViewMode = 'progressive-roadmap' | 'freestyle-grid';

export default function ModuleExplorerPage() {
  const [moduleProgress, setModuleProgress] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<ViewMode>('progressive-roadmap');

  useEffect(() => {
    const state = getAppState();
    setModuleProgress(state.moduleProgress ?? {});
    if (state.learningMode === 'freestyle') {
      setViewMode('freestyle-grid');
    } else {
      setViewMode('progressive-roadmap');
    }
  }, []);

  const handleModeSwitch = (mode: ViewMode) => {
    setViewMode(mode);
    setLearningMode(mode === 'progressive-roadmap' ? 'progressive' : 'freestyle');
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 max-w-6xl mx-auto space-y-8">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700">
              STA3032 Course Pathway
            </span>
            <span className="text-xs text-gray-400">Final Exam: Dec 8, 2026</span>
          </div>
          <h1 className="text-3xl font-black text-white">
            Curriculum &amp; Roadmap
          </h1>
          <p className="text-gray-400 text-xs md:text-sm mt-1 max-w-2xl">
            Choose your learning style: follow the structured <strong>Progressive Roadmap</strong> step-by-step, or switch to <strong>Freestyle Mode</strong> to open all modules and tools immediately.
          </p>
        </div>

        {/* View Toggle Controls */}
        <div className="flex items-center gap-2 p-1.5 bg-gray-900 border border-gray-800 rounded-2xl self-start md:self-auto shrink-0 shadow-lg">
          <button
            type="button"
            onClick={() => handleModeSwitch('progressive-roadmap')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
              viewMode === 'progressive-roadmap'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-gray-400 hover:text-gray-200'
            )}
          >
            <span>🗺️ Progressive Roadmap</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('freestyle-grid')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
              viewMode === 'freestyle-grid'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-gray-400 hover:text-gray-200'
            )}
          >
            <span>🔓 Freestyle All Access</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: PROGRESSIVE ROADMAP */}
      {viewMode === 'progressive-roadmap' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-4 bg-indigo-950/30 border border-indigo-800/60 rounded-2xl flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-sm font-bold text-white">Guided Sequential Progression Active</p>
                <p className="text-xs text-indigo-300">
                  Each step guides you from concept intuition → drill practice → active recall capstone → timed exam milestone.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleModeSwitch('freestyle-grid')}
              className="text-xs text-gray-400 hover:text-indigo-300 underline"
            >
              Switch to Freestyle (Unlock everything)
            </button>
          </div>

          <CourseRoadmap isProgressive={true} />
        </div>
      )}

      {/* VIEW 2: FREESTYLE ALL ACCESS (THE WAY IT WAS) */}
      {viewMode === 'freestyle-grid' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-2xl flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔓</span>
              <div>
                <p className="text-sm font-bold text-white">Freestyle All Access Active</p>
                <p className="text-xs text-emerald-300">
                  No locks or restrictions. Browse and jump into any of the 6 modules, walkthroughs, or exams whenever you want.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleModeSwitch('progressive-roadmap')}
              className="text-xs text-gray-400 hover:text-emerald-300 underline"
            >
              Switch to Progressive Roadmap
            </button>
          </div>

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
                        <p className="text-xs text-gray-400 mt-1">Lectures {mod.lectures}</p>
                      </div>

                      {/* Key Tools Integrated */}
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          Key Decision Focus:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {toolInfo?.tools.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700/60 font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Milestone badge */}
                      {toolInfo?.milestone && (
                        <div className="text-xs font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-800/40 rounded-lg px-2.5 py-1.5">
                          🎯 {toolInfo.milestone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Footer */}
                  <div className="px-5 py-3.5 border-t border-gray-800 bg-gray-950/60 flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {done} / {topicsTotal} topics mastered
                    </span>
                    <span className="font-mono font-semibold text-indigo-400">{pct}%</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
