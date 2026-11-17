'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAppState, saveAppState, addMistake } from '@/lib/storage';
import { walkthroughs } from '@/data/walkthroughs';
import { KatexRenderer } from '@/components/ui/KatexRenderer';
import { FlagButton } from '@/components/ui/FlagButton';
import { ModuleBadge } from '@/components/ui/Badge';
import { generateId, cn } from '@/lib/utils';
import type { WalkthroughProblem, WalkthroughStage } from '@/types';

const STAGE_LABELS = [
  'Identify the Test',
  'State H₀ & Hₐ, Check Assumptions',
  'Set Up the Test Statistic',
  'Find p-value / Critical Region',
  'Conclusion & Interpretation',
];

const STAGE_ERROR_TYPES: Record<number, 'wrong-test-selected' | 'assumption-missed' | 'wrong-hypotheses' | 'misread-output' | 'other'> = {
  1: 'wrong-test-selected',
  2: 'assumption-missed',
  3: 'wrong-hypotheses',
  4: 'misread-output',
  5: 'other',
};

type StageStatus = 'unanswered' | 'correct' | 'wrong' | 'revealed';

function fuzzyMatch(input: string, answer: string): boolean {
  const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9.\s]/g, '').trim();
  const a = normalise(input);
  const b = normalise(answer);
  if (a === b) return true;
  const keywords = b.split(/\s+/).filter((w) => w.length > 3);
  if (keywords.length === 0) return a.includes(b);
  const matchCount = keywords.filter((kw) => a.includes(kw)).length;
  return matchCount >= Math.ceil(keywords.length * 0.4);
}

export default function WalkthroughDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const walkthrough: WalkthroughProblem | undefined = walkthroughs.find((w: WalkthroughProblem) => w.id === id);

  const [currentStageNum, setCurrentStageNum] = useState<number>(1);
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [statuses, setStatuses] = useState<Record<number, StageStatus>>({});
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [completedMax, setCompletedMax] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    const state = getAppState();
    const done = state.walkthroughProgress?.[id] ?? 0;
    setCompletedMax(done);
    if (done >= 5) {
      setCurrentStageNum(5);
    } else {
      setCurrentStageNum(done + 1);
    }
  }, [id]);

  const saveProgress = useCallback((stage: number) => {
    const state = getAppState();
    const currentDone = state.walkthroughProgress?.[id] ?? 0;
    if (stage > currentDone) {
      state.walkthroughProgress = {
        ...state.walkthroughProgress,
        [id]: stage,
      };
      saveAppState(state);
      setCompletedMax(stage);
    }
  }, [id]);

  if (!walkthrough) {
    return (
      <main className="min-h-screen bg-gray-950 text-gray-100 p-8 text-center">
        <p className="text-gray-400">Problem not found.</p>
        <button
          onClick={() => router.push('/walkthroughs')}
          className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg text-sm text-white"
        >
          ← Back to Walkthroughs
        </button>
      </main>
    );
  }

  const stages = walkthrough.stages;
  const stage = stages.find((s) => s.stageNum === currentStageNum) ?? stages[0];
  const stageNum = stage.stageNum;
  const status = statuses[stageNum] ?? 'unanswered';
  const input = inputs[stageNum] ?? '';

  const handleCheck = () => {
    if (!input.trim()) return;
    const ok = fuzzyMatch(input, stage.answer);
    if (ok) {
      setStatuses((prev) => ({ ...prev, [stageNum]: 'correct' }));
      saveProgress(stageNum);
    } else {
      setStatuses((prev) => ({ ...prev, [stageNum]: 'wrong' }));
      addMistake({
        id: generateId(),
        source: 'walkthrough',
        errorType: STAGE_ERROR_TYPES[stageNum] ?? 'other',
        itemId: `${walkthrough.id}-s${stageNum}`,
        itemTitle: `${walkthrough.title} (Stage ${stageNum})`,
        module: walkthrough.module,
        details: `Stage ${stageNum} wrong: student typed "${input.substring(0, 80)}"`,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleReveal = () => {
    setStatuses((prev) => ({ ...prev, [stageNum]: 'revealed' }));
    saveProgress(stageNum);
  };

  const handleNext = () => {
    if (stageNum < 5) {
      setCurrentStageNum(stageNum + 1);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 max-w-4xl mx-auto space-y-6">
      {/* Top navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/walkthroughs')}
          className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
        >
          ← All Walkthroughs
        </button>
        <div className="flex items-center gap-2">
          <ModuleBadge module={walkthrough.module} />
          <span className="text-xs bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded-full font-mono">
            {walkthrough.source}
          </span>
        </div>
      </div>

      {/* Problem title */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">{walkthrough.title}</h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
          Stage-Locked Mastery Problem
        </p>
      </div>

      {/* Stage progress tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-3 overflow-x-auto">
        {stages.map((s) => {
          const sNum = s.stageNum;
          const isCurrent = sNum === currentStageNum;
          const isDone = completedMax >= sNum;
          const isLocked = sNum > completedMax + 1;

          return (
            <button
              key={sNum}
              onClick={() => {
                if (!isLocked) setCurrentStageNum(sNum);
              }}
              disabled={isLocked}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200',
                isCurrent && 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25',
                !isCurrent && isDone && 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900/60',
                !isCurrent && !isDone && !isLocked && 'bg-gray-800 text-gray-300 hover:bg-gray-700',
                isLocked && 'bg-gray-900 text-gray-600 border border-gray-800/60 cursor-not-allowed opacity-50',
              )}
            >
              <span>
                {isDone ? '✓' : isLocked ? '🔒' : sNum}
              </span>
              <span>{STAGE_LABELS[sNum - 1]}</span>
            </button>
          );
        })}
      </div>

      {/* Problem context */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-2">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
          Problem Context & Given Information
        </p>
        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
          {walkthrough.context}
        </p>
        {walkthrough.contextLatex && (
          <div className="mt-2 pt-2 border-t border-gray-800">
            <KatexRenderer latex={walkthrough.contextLatex} display={true} />
          </div>
        )}
      </div>

      {/* Active stage workspace */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Stage {stageNum} of 5
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">{stage.label}</h2>
          </div>
          <FlagButton
            itemId={`${walkthrough.id}-s${stageNum}`}
            title={`${walkthrough.title} (Stage ${stageNum})`}
            content={stage.answer}
            side="B"
            priority="example"
          />
        </div>

        {/* Prompt */}
        <p className="text-sm text-gray-200 leading-relaxed font-medium">{stage.prompt}</p>

        {/* Input area */}
        {status !== 'correct' && status !== 'revealed' && (
          <div className="space-y-3">
            <textarea
              value={input}
              onChange={(e) => setInputs((prev) => ({ ...prev, [stageNum]: e.target.value }))}
              placeholder="Type your response here..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none font-mono"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={handleCheck}
                disabled={!input.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                Check Answer
              </button>
              <button
                onClick={() => setShowHint((prev) => ({ ...prev, [stageNum]: !prev[stageNum] }))}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-amber-300 text-xs rounded-xl transition-colors border border-amber-900/60"
              >
                {showHint[stageNum] ? 'Hide Hint' : '💡 Show Hint'}
              </button>
              <button
                onClick={handleReveal}
                className="ml-auto text-xs text-gray-500 hover:text-gray-300 underline"
              >
                Show Solution
              </button>
            </div>
          </div>
        )}

        {/* Hint text */}
        {showHint[stageNum] && (
          <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-xl text-xs text-amber-300 leading-relaxed">
            <strong className="block mb-1">Hint:</strong>
            {stage.hint}
          </div>
        )}

        {/* Wrong answer feedback */}
        {status === 'wrong' && (
          <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-xs text-rose-300">
            Not quite right yet. Re-read the hint or check your model setup.
          </div>
        )}

        {/* Correct or revealed solution */}
        {(status === 'correct' || status === 'revealed') && (
          <div className="space-y-4 pt-2">
            <div
              className={cn(
                'p-4 rounded-xl border text-sm leading-relaxed space-y-2',
                status === 'correct'
                  ? 'bg-emerald-950/40 border-emerald-700 text-emerald-200'
                  : 'bg-indigo-950/40 border-indigo-700 text-indigo-200',
              )}
            >
              <p className="font-bold text-xs uppercase tracking-wide">
                {status === 'correct' ? '✓ Correct Answer' : 'Official Solution'}
              </p>
              <p>{stage.answer}</p>
              {stage.answerLatex && (
                <div className="mt-2 text-center overflow-x-auto">
                  <KatexRenderer latex={stage.answerLatex} display={true} />
                </div>
              )}
              {stage.explanation && (
                <p className="text-xs opacity-90 pt-1 border-t border-current/20">
                  {stage.explanation}
                </p>
              )}
            </div>

            {stageNum < 5 ? (
              <button
                onClick={handleNext}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                Proceed to Stage {stageNum + 1} →
              </button>
            ) : (
              <div className="p-4 bg-emerald-900/40 border border-emerald-600 rounded-xl text-center space-y-2">
                <p className="text-lg font-bold text-emerald-300">🎉 Problem Complete!</p>
                <p className="text-xs text-emerald-400">
                  You have successfully navigated all 5 decision stages for this problem.
                </p>
                <button
                  onClick={() => router.push('/walkthroughs')}
                  className="mt-2 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg"
                >
                  Back to All Walkthroughs
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
