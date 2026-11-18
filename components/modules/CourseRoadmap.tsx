'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROADMAP_STEPS, type RoadmapStep } from '@/data/roadmapSteps';
import { getAppState, saveAppState } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface CourseRoadmapProps {
  isProgressive: boolean;
}

const KIND_BADGES: Record<RoadmapStep['kind'], { label: string; icon: string; color: string }> = {
  'module-topics': { label: 'Lesson & Concepts', icon: '📖', color: 'bg-blue-950 text-blue-300 border-blue-800' },
  'scenario-drill': { label: 'Scenario Drill', icon: '🎯', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
  'walkthrough': { label: '5-Stage Walkthrough', icon: '🔍', color: 'bg-amber-950 text-amber-300 border-amber-800' },
  'checkpoint-gate': { label: 'Active Recall Capstone', icon: '🧠', color: 'bg-purple-950 text-purple-300 border-purple-800' },
  'exam-milestone': { label: 'Timed Exam Milestone', icon: '⏱️', color: 'bg-rose-950 text-rose-300 border-rose-800' },
};

export function CourseRoadmap({ isProgressive }: CourseRoadmapProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const checkProgress = () => {
    const state = getAppState();
    const completed = new Set<string>();

    ROADMAP_STEPS.forEach((step) => {
      // Step-specific completion logic
      if (step.kind === 'module-topics') {
        const key = `mod${step.module}`;
        const doneCount = state.moduleProgress?.[key] ?? 0;
        if (doneCount >= 1) completed.add(step.id);
      } else if (step.kind === 'checkpoint-gate') {
        const done = ((state as unknown as Record<string, unknown>)[`mod${step.module}CheckpointDone`]) as boolean;
        if (done) completed.add(step.id);
      } else if (step.kind === 'scenario-drill') {
        const mastered = state.scenariosProgress?.masteredIds?.length ?? 0;
        if (mastered >= 1) completed.add(step.id);
      } else if (step.kind === 'walkthrough') {
        const wtDone = Object.values(state.walkthroughProgress ?? {}).some(v => v >= 3);
        if (wtDone) completed.add(step.id);
      } else if (step.kind === 'exam-milestone') {
        const examNum = step.module === 3 ? 1 : step.module === 5 ? 2 : 3;
        const examDone = state.examSessions?.some(s => s.practiceExamNum === examNum && s.submitted);
        if (examDone) completed.add(step.id);
      }
    });

    // Also check manual overrides
    const manualDone = ((state as unknown as Record<string, unknown>).manualRoadmapSteps as string[]) ?? [];
    manualDone.forEach(id => completed.add(id));

    setCompletedSteps(completed);
  };

  useEffect(() => {
    checkProgress();
  }, []);

  const toggleManualStep = (stepId: string) => {
    const state = getAppState();
    const manual = new Set(((state as unknown as Record<string, unknown>).manualRoadmapSteps as string[]) ?? []);
    if (manual.has(stepId)) {
      manual.delete(stepId);
    } else {
      manual.add(stepId);
    }
    ((state as unknown as Record<string, unknown>).manualRoadmapSteps) = Array.from(manual);
    saveAppState(state);
    checkProgress();
  };

  // Determine current active unlocked step in progressive mode
  let firstIncompleteIndex = ROADMAP_STEPS.findIndex(s => !completedSteps.has(s.id));
  if (firstIncompleteIndex === -1) firstIncompleteIndex = ROADMAP_STEPS.length - 1;

  const totalMinutes = ROADMAP_STEPS.reduce((acc, s) => acc + s.estimatedMinutes, 0);
  const completedMinutes = ROADMAP_STEPS.filter(s => completedSteps.has(s.id)).reduce((acc, s) => acc + s.estimatedMinutes, 0);
  const progressPercent = Math.round((completedSteps.size / ROADMAP_STEPS.length) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Summary Header */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/90 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
            {isProgressive ? '🔒 Progressive Step-by-Step Curriculum' : '🔓 Freestyle Mode: All Nodes Open'}
          </span>
          <h2 className="text-xl font-bold text-white">
            Course Roadmap: Step {Math.min(firstIncompleteIndex + 1, ROADMAP_STEPS.length)} of {ROADMAP_STEPS.length}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {completedSteps.size} of {ROADMAP_STEPS.length} milestones complete ({completedMinutes} of {totalMinutes} est. study minutes logged)
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-32 bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-700">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-sm font-bold font-mono text-emerald-400">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Step by Step Timeline Flow */}
      <div className="relative pl-6 md:pl-8 border-l-2 border-gray-800 space-y-6">
        {ROADMAP_STEPS.map((step, idx) => {
          const isDone = completedSteps.has(step.id);
          const isLocked = isProgressive && idx > firstIncompleteIndex;
          const isCurrent = isProgressive && idx === firstIncompleteIndex;
          const meta = KIND_BADGES[step.kind];

          return (
            <div key={step.id} className="relative group">
              {/* Timeline Node Icon Indicator */}
              <div 
                className={cn(
                  'absolute -left-[35px] md:-left-[43px] top-4 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md',
                  isDone 
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-4 ring-gray-950' 
                    : isCurrent 
                      ? 'bg-indigo-600 text-white shadow-indigo-600/40 ring-4 ring-indigo-950 animate-pulse'
                      : isLocked 
                        ? 'bg-gray-800 text-gray-500 border border-gray-700 ring-4 ring-gray-950'
                        : 'bg-gray-800 text-gray-300 border border-gray-600 ring-4 ring-gray-950'
                )}
              >
                {isDone ? '✓' : isLocked ? '🔒' : step.stepNum}
              </div>

              {/* Step Card */}
              <div
                className={cn(
                  'rounded-2xl border p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4',
                  isDone
                    ? 'bg-emerald-950/15 border-emerald-900/60 hover:border-emerald-700'
                    : isCurrent
                      ? 'bg-indigo-950/30 border-indigo-500/80 shadow-lg shadow-indigo-500/10'
                      : isLocked
                        ? 'bg-gray-900/40 border-gray-800/60 opacity-60'
                        : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                )}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full border', meta.color)}>
                      {meta.icon} {meta.label}
                    </span>
                    <span className="text-xs text-gray-500">Module {step.module}</span>
                    <span className="text-xs text-gray-500">• {step.estimatedMinutes} min</span>
                    {isCurrent && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-900 text-indigo-200 border border-indigo-700 animate-pulse">
                        ⭐ Current Target
                      </span>
                    )}
                  </div>

                  <h3 className={cn(
                    'text-base font-bold',
                    isLocked ? 'text-gray-400' : 'text-white'
                  )}>
                    {step.stepNum}. {step.title}
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
                    {step.shortDesc}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleManualStep(step.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                      isDone
                        ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                        : 'bg-gray-850 border-gray-700 text-gray-400 hover:text-white'
                    )}
                    title="Toggle completed state"
                  >
                    {isDone ? '✓ Completed' : 'Mark Done'}
                  </button>

                  {isLocked ? (
                    <div className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-500 text-xs font-semibold rounded-xl cursor-not-allowed flex items-center gap-1.5">
                      <span>🔒 Locked</span>
                    </div>
                  ) : (
                    <Link
                      href={step.href}
                      className={cn(
                        'px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5',
                        isCurrent
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                          : isDone
                            ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700'
                            : 'bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-700'
                      )}
                    >
                      <span>{isDone ? 'Review Node →' : 'Launch Step →'}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
