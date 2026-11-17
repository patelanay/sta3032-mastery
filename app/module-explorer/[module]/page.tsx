'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAppState, saveAppState } from '@/lib/storage';
import { moduleDefinitions } from '@/data/modules';
import { formulas } from '@/data/formulas';
import { scenarios } from '@/data/scenarios';
import { walkthroughs } from '@/data/walkthroughs';
import { clozeExercises } from '@/data/cloze';
import { derivations } from '@/data/derivations';
import { KatexRenderer } from '@/components/ui/KatexRenderer';
import { FlagButton } from '@/components/ui/FlagButton';
import { FormulaSheetBadge, ModuleBadge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { FormulaItem, ScenarioCard, WalkthroughProblem, ClozeExercise, DerivationProof } from '@/types';

// Practice Exam milestone mapping per module progression
const MODULE_EXAM_MILESTONES: Record<number, { examNum: 1 | 2 | 3; title: string; desc: string }> = {
  3: {
    examNum: 1,
    title: 'Milestone Practice Exam 1 (Modules 1–3 Complete)',
    desc: 'Test your foundation in Probability, Bayes, Distributions, and One-Sample Inference.',
  },
  5: {
    examNum: 2,
    title: 'Milestone Practice Exam 2 (Linear Regression Mastery)',
    desc: 'Crucial checkpoint: MLR ANOVA, Partial F-tests, and Two-Sample / Chi-Square inference.',
  },
  6: {
    examNum: 3,
    title: 'Comprehensive Final Practice Exam 3 (Full Curriculum)',
    desc: 'The complete simulated exam including RCBD, CRD/Tukey, LINE diagnostics, and all Q4–Q7 proof options.',
  },
};

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const moduleNum = Number(params.module) as 1 | 2 | 3 | 4 | 5 | 6;

  const mod = moduleDefinitions.find((m) => m.number === moduleNum);
  const moduleFormulas: FormulaItem[] = formulas.filter((f) => f.module === moduleNum);
  const moduleScenarios: ScenarioCard[] = scenarios.filter((s) => s.module === moduleNum);
  const moduleWalkthroughs: WalkthroughProblem[] = walkthroughs.filter((w) => w.module === moduleNum);
  const moduleCloze: ClozeExercise[] = clozeExercises.filter((c) => c.module === moduleNum);
  const moduleProofs: DerivationProof[] = derivations.filter((d) => {
    if (moduleNum === 5) return [1, 2, 3, 4, 5, 6].includes(d.pattern);
    if (moduleNum === 2) return [7].includes(d.pattern);
    if (moduleNum === 4) return [8].includes(d.pattern);
    return false;
  });

  const [checkedTopics, setCheckedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!mod) return;
    const state = getAppState();
    const key = `mod${moduleNum}Topics`;
    const saved: string[] = ((state as unknown as Record<string, unknown>)[key] as string[]) ?? [];
    setCheckedTopics(new Set(saved));
  }, [mod, moduleNum]);

  const toggleTopic = useCallback(
    (topic: string) => {
      setCheckedTopics((prev) => {
        const next = new Set(prev);
        if (next.has(topic)) next.delete(topic);
        else next.add(topic);

        const state = getAppState();
        const key = `mod${moduleNum}Topics`;
        const topicsArr = Array.from(next);
        ((state as unknown as Record<string, unknown>)[key]) = topicsArr;

        if (!state.moduleProgress) state.moduleProgress = {};
        state.moduleProgress[`mod${moduleNum}`] = topicsArr.length;
        saveAppState(state);

        return next;
      });
    },
    [moduleNum],
  );

  if (!mod) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">Module {moduleNum} not found.</p>
          <button onClick={() => router.push('/module-explorer')} className="text-indigo-400 hover:underline">
            ← Back to Module Explorer
          </button>
        </div>
      </div>
    );
  }

  const WEIGHT_BADGE: Record<string, string> = {
    Critical: 'bg-red-600 text-white',
    High: 'bg-orange-500 text-white',
    Medium: 'bg-yellow-500 text-black',
    Low: 'bg-gray-500 text-white',
  };

  const examMilestone = MODULE_EXAM_MILESTONES[moduleNum];

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 max-w-5xl mx-auto space-y-10">
      {/* Top Breadcrumb & Next/Prev Module Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/module-explorer')}
          className="text-indigo-400 hover:underline inline-flex items-center gap-1 text-sm"
        >
          ← All Modules
        </button>
        <div className="flex items-center gap-2">
          {moduleNum > 1 && (
            <Link
              href={`/module-explorer/${moduleNum - 1}`}
              className="px-3 py-1 bg-gray-900 border border-gray-800 text-xs text-gray-300 hover:text-white rounded-lg transition-colors"
            >
              ← Prev: Module {moduleNum - 1}
            </Link>
          )}
          {moduleNum < 6 && (
            <Link
              href={`/module-explorer/${moduleNum + 1}`}
              className="px-3 py-1 bg-gray-900 border border-gray-800 text-xs text-indigo-400 hover:text-indigo-300 rounded-lg transition-colors"
            >
              Next: Module {moduleNum + 1} →
            </Link>
          )}
        </div>
      </div>

      {/* Module Banner */}
      <div
        className="rounded-2xl p-6 border border-gray-700 shadow-xl"
        style={{ background: `${mod.color}22` }}
      >
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <ModuleBadge module={mod.number} />
          <span
            className={cn(
              'text-xs font-bold px-2 py-0.5 rounded-full',
              WEIGHT_BADGE[mod.examWeight] ?? 'bg-gray-500 text-white',
            )}
          >
            {mod.examWeight} Priority
          </span>
          {mod.onExam3Sheet && (
            <span className="text-xs bg-emerald-900 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full">
              📋 On Exam 3 Sheet
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">
          Module {mod.number}: {mod.title}
        </h1>
        <p className="text-gray-300 text-sm">
          Lectures {mod.lectures} • UF STA3032 Course Pathway
        </p>
      </div>

      {/* STEP 1: Study & Master Concepts Checklist */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Step 1</span>
            <h2 className="text-xl font-bold text-white">Lecture Topics Checklist</h2>
          </div>
          <span className="text-xs text-gray-400">
            {checkedTopics.size} / {mod.topics?.length ?? 0} mastered
          </span>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 divide-y divide-gray-800 shadow-sm">
          {(mod.topics ?? []).map((topic, i) => {
            const done = checkedTopics.has(topic);
            return (
              <label
                key={i}
                className={cn(
                  'flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors',
                  done ? 'bg-emerald-950/30' : 'hover:bg-gray-800/60',
                )}
              >
                <input
                  type="checkbox"
                  checked={done}
                  onChange={() => toggleTopic(topic)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <span className={cn('text-sm', done ? 'line-through text-gray-500' : 'text-gray-200')}>
                  {topic}
                </span>
                {done && <span className="ml-auto text-emerald-400 text-xs font-medium">✓ Done</span>}
              </label>
            );
          })}
        </div>
      </section>

      {/* STEP 2: When-to-Apply Formula Guides */}
      <section className="space-y-4">
        <div className="border-b border-gray-800 pb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Step 2</span>
          <h2 className="text-xl font-bold text-white">Decision Rules & Formula Application Guides</h2>
          <p className="text-gray-400 text-xs mt-1">
            Formulas are on your sheet — these cards train you on <span className="text-amber-400 font-semibold">WHEN to apply</span> them and traps to avoid.
          </p>
        </div>

        {moduleFormulas.length === 0 ? (
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 text-center text-gray-500 text-sm">
            Basic foundational concepts in this module are covered in the flashcard deck.
          </div>
        ) : (
          <div className="space-y-4">
            {moduleFormulas.map((formula) => (
              <FormulaCard key={formula.id} formula={formula} />
            ))}
          </div>
        )}
      </section>

      {/* STEP 3: Integrated Interactive Tools (Scenario, Walkthrough, Cloze, Proofs) */}
      <section className="space-y-4">
        <div className="border-b border-gray-800 pb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Step 3</span>
          <h2 className="text-xl font-bold text-white">Module {mod.number} Practice & Active Recall</h2>
          <p className="text-gray-400 text-xs mt-1">
            Directly execute drills for this module without guessing what to study next.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Flashcards */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:border-gray-700 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Active Recall</span>
                <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full">
                  Module {mod.number}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Module {mod.number} SM-2 Flashcards</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Review scenario recognition, test selection, and LINE assumption cards specific to Module {mod.number}.
              </p>
            </div>
            <Link
              href={`/flashcards`}
              className="mt-4 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              <span>⚡ Open Module {mod.number} Flashcards</span>
            </Link>
          </div>

          {/* Scenario Recognition */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:border-gray-700 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Recognition</span>
                <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full">
                  {moduleScenarios.length} Scenarios
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Scenario Recognition Drills</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {moduleScenarios.length > 0
                  ? `Practice identifying the exact statistical procedure from real problem setups.`
                  : `Master core scenarios across cumulative modules.`}
              </p>
            </div>
            <Link
              href={`/scenarios`}
              className="mt-4 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              <span>🎯 Drill Scenarios</span>
            </Link>
          </div>

          {/* Guided Walkthroughs */}
          {moduleWalkthroughs.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:border-gray-700 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">5-Stage Solver</span>
                  <span className="text-xs bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full">
                    {moduleWalkthroughs.length} Problem{moduleWalkthroughs.length > 1 ? 's' : ''}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Guided Problem Walkthroughs</h3>
                <ul className="mt-2 space-y-1">
                  {moduleWalkthroughs.map((w) => (
                    <li key={w.id} className="text-xs text-gray-300 truncate">
                      • {w.title}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={`/walkthroughs/${moduleWalkthroughs[0].id}`}
                className="mt-4 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                <span>🔍 Solve Step-by-Step Problem</span>
              </Link>
            </div>
          )}

          {/* Cloze / ANOVA Table Drills */}
          {moduleCloze.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:border-gray-700 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Retrieval</span>
                  <span className="text-xs bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full">
                    {moduleCloze.length} Cloze Exercise{moduleCloze.length > 1 ? 's' : ''}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Fill-in-the-Blank & ANOVA Tables</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Fill in missing table cells (SS, df, MS, F) with exact tolerances.
                </p>
              </div>
              <Link
                href={`/cloze`}
                className="mt-4 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                <span>✏️ Practice Cloze Drills</span>
              </Link>
            </div>
          )}

          {/* Derivation Dojo */}
          {moduleProofs.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:border-gray-700 transition-colors md:col-span-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Q4–Q7 Proofs</span>
                  <span className="text-xs bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full">
                    {moduleProofs.length} Recurring Patterns
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Module {mod.number} Proof Skeletons</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {moduleProofs.map((p) => (
                    <div key={p.id} className="text-xs text-gray-300 bg-gray-950 p-2 rounded-lg border border-gray-800">
                      <strong className="text-rose-400">Pattern {p.pattern}:</strong> {p.title}
                    </div>
                  ))}
                </div>
              </div>
              <Link
                href={`/derivation-dojo`}
                className="mt-4 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                <span>📐 Drill Derivation Proofs</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* STEP 4: Timed Exam Simulator Milestone Checkpoint */}
      {examMilestone && (
        <section className="bg-gradient-to-r from-indigo-950/80 via-purple-950/50 to-indigo-950/80 border-2 border-indigo-500/80 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="px-3 py-1 bg-indigo-600 text-white font-bold text-xs rounded-full uppercase tracking-widest">
              Exam Checkpoint Milestone
            </span>
            <span className="text-xs text-indigo-300 font-mono">120 Minutes • Free Response Format</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{examMilestone.title}</h2>
            <p className="text-sm text-gray-300">{examMilestone.desc}</p>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <Link
              href={`/exam-simulator?exam=${examMilestone.examNum}`}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <span>⏱️ Start Timed Practice Final {examMilestone.examNum}</span>
            </Link>
            <span className="text-xs text-gray-400">
              Mandatory Q1–Q3 + Choose 2 of Q4–Q7 • Includes point rubrics
            </span>
          </div>
        </section>
      )}
    </main>
  );
}

function FormulaCard({ formula }: { formula: FormulaItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden shadow-sm">
      {/* Title bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/60">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-base font-bold text-white">{formula.title}</span>
          <FormulaSheetBadge onExam3Sheet={formula.onExam3Sheet} />
        </div>
        <div className="flex items-center gap-2">
          <FlagButton
            itemId={formula.id}
            title={formula.title}
            content={formula.whenToUse}
            side={formula.module >= 5 ? 'B' : 'A'}
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

      <div className="p-4 space-y-4">
        {/* WHEN TO USE — primary, prominent */}
        <div className="rounded-xl bg-indigo-950/60 border border-indigo-700/60 p-3.5">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1.5">
            🎯 When To Use
          </p>
          <p className="text-gray-100 text-sm leading-relaxed">{formula.whenToUse}</p>
        </div>

        {/* Conditions */}
        {formula.conditions && formula.conditions.length > 0 && (
          <div>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5">
              ✓ Conditions / Assumptions
            </p>
            <ul className="space-y-1">
              {formula.conditions.map((cond, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-200">
                  <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                  {cond}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* vs Alternative */}
        {formula.vsAlternative && (
          <div className="rounded-lg bg-blue-950/40 border border-blue-800/60 px-3.5 py-2.5">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">
              ↔ vs Alternative
            </p>
            <p className="text-xs text-blue-200">{formula.vsAlternative}</p>
          </div>
        )}

        {/* Common Trap */}
        <div className="rounded-lg bg-amber-950/40 border border-amber-700/60 px-3.5 py-2.5">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
            ⚠️ Common Trap
          </p>
          <p className="text-xs text-amber-200">{formula.commonTrap}</p>
        </div>

        {/* Collapsible formula */}
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-gray-500 hover:text-gray-300 underline"
          >
            {expanded ? '▲ Hide formula' : '▼ Show formula (already on your sheet)'}
          </button>
          {expanded && (
            <div className="mt-2.5 rounded-lg bg-gray-950 border border-gray-800 p-3 overflow-x-auto text-center">
              <KatexRenderer latex={formula.latex} display={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
