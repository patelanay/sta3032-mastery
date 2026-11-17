'use client';

import { useState, useEffect } from 'react';
import { moduleCheckpoints, type CheckpointQuestion } from '@/data/moduleCheckpoints';
import { getAppState, saveAppState } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface ModuleActiveRecallCheckpointProps {
  moduleNum: 1 | 2 | 3 | 4 | 5 | 6;
}

export function ModuleActiveRecallCheckpoint({ moduleNum }: ModuleActiveRecallCheckpointProps) {
  const checkpoint = moduleCheckpoints[moduleNum];
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSavedDone, setIsSavedDone] = useState(false);

  useEffect(() => {
    const state = getAppState();
    const done = ((state as unknown as Record<string, unknown>)[`mod${moduleNum}CheckpointDone`]) as boolean;
    if (done) {
      setIsSavedDone(true);
    }
  }, [moduleNum]);

  if (!checkpoint) return null;

  const handleSelect = (qId: string, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const allAnswered = checkpoint.questions.every(q => selectedAnswers[q.id] !== undefined);

  const score = checkpoint.questions.reduce((acc, q) => {
    return acc + (selectedAnswers[q.id] === q.correctIndex ? 1 : 0);
  }, 0);

  const handleSubmit = () => {
    setSubmitted(true);
    if (score >= Math.ceil(checkpoint.questions.length * 0.67)) {
      const state = getAppState();
      ((state as unknown as Record<string, unknown>)[`mod${moduleNum}CheckpointDone`]) = true;
      saveAppState(state);
      setIsSavedDone(true);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  return (
    <section className="rounded-2xl border border-purple-800/60 bg-gradient-to-b from-purple-950/30 via-gray-900 to-gray-950 p-6 md:p-8 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
              Module {moduleNum} End-of-Module Mastery Gate
            </span>
            {isSavedDone && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                ✓ Checkpoint Mastered
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">
            {checkpoint.title}
          </h2>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            {checkpoint.subtitle}
          </p>
        </div>

        {submitted && (
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-xs text-gray-400 block">Score</span>
              <span className={cn(
                'text-lg font-bold font-mono',
                score === checkpoint.questions.length ? 'text-emerald-400' : 'text-amber-400'
              )}>
                {score} / {checkpoint.questions.length}
              </span>
            </div>
            <button
              onClick={handleRetake}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 rounded-lg border border-gray-700 transition-colors"
            >
              Retake
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {checkpoint.questions.map((q: CheckpointQuestion, qIdx: number) => {
          const userChoice = selectedAnswers[q.id];
          const isCorrect = userChoice === q.correctIndex;

          return (
            <div
              key={q.id}
              className={cn(
                'rounded-xl border p-5 transition-all space-y-4',
                submitted
                  ? isCorrect
                    ? 'border-emerald-800/80 bg-emerald-950/20'
                    : 'border-rose-800/80 bg-rose-950/20'
                  : 'border-gray-800 bg-gray-900/80 hover:border-gray-700'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700 flex items-center justify-center text-xs font-bold font-mono">
                    {qIdx + 1}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                    {q.type.replace('-', ' ')}
                  </span>
                </div>

                {submitted && (
                  <span className={cn(
                    'text-xs font-bold px-2 py-0.5 rounded-full',
                    isCorrect ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'
                  )}>
                    {isCorrect ? '✓ Correct' : '✗ Missed'}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-100 font-medium leading-relaxed">
                {q.question}
              </p>

              {/* Multiple Choice Options */}
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = userChoice === optIdx;
                  const isThisCorrect = optIdx === q.correctIndex;

                  let optStyles = 'border-gray-800 bg-gray-950 hover:bg-gray-800/80 text-gray-300';
                  if (submitted) {
                    if (isThisCorrect) {
                      optStyles = 'border-emerald-600 bg-emerald-950/60 text-emerald-100 font-semibold';
                    } else if (isSelected && !isThisCorrect) {
                      optStyles = 'border-rose-600 bg-rose-950/60 text-rose-200 line-through';
                    } else {
                      optStyles = 'border-gray-800/50 bg-gray-950/40 text-gray-500 opacity-60';
                    }
                  } else if (isSelected) {
                    optStyles = 'border-purple-500 bg-purple-950/40 text-white font-medium';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelect(q.id, optIdx)}
                      className={cn(
                        'w-full text-left text-xs p-3 rounded-lg border transition-all flex items-start gap-3',
                        optStyles
                      )}
                    >
                      <span className="font-mono text-gray-500 font-bold">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="flex-1 leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Trap Warning upon submit */}
              {submitted && (
                <div className="pt-3 border-t border-gray-800/60 space-y-2 animate-fade-in">
                  <div className="p-3 bg-gray-950/80 rounded-lg border border-gray-800 text-xs text-gray-300 leading-relaxed">
                    <strong className="text-purple-300 block mb-1">Explanation:</strong>
                    {q.explanation}
                  </div>
                  <div className="p-2.5 bg-amber-950/30 rounded-lg border border-amber-800/40 text-[11px] text-amber-200 flex items-start gap-2">
                    <span className="text-amber-400">⚠️</span>
                    <span><strong>Exam Trap Warning:</strong> {q.trapWarning}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!submitted && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400">
            {Object.keys(selectedAnswers).length} of {checkpoint.questions.length} answered
          </p>
          <button
            type="button"
            disabled={!allAnswered}
            onClick={handleSubmit}
            className={cn(
              'px-6 py-2.5 text-xs font-bold rounded-xl transition-all shadow-md',
              allAnswered
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
            )}
          >
            Submit Active Recall Checkpoint →
          </button>
        </div>
      )}
    </section>
  );
}
