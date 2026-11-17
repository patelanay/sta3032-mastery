'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { examQuestions } from '@/data/examQuestions';
import { getAppState, saveAppState, addMistake } from '@/lib/storage';
import { generateId, cn } from '@/lib/utils';
import { KatexRenderer } from '@/components/ui/KatexRenderer';
import type { ExamQuestion, ExamSubpart, ExamSimSession, MistakeEntry } from '@/types';

// ───────── Types ─────────
type SimState = 'setup' | 'active' | 'results';

const EXAM_DESCRIPTIONS: Record<number, string> = {
  1: 'Focus: SLR, Bayes & Probability, 2-Sample Inference',
  2: 'Focus: MLR + ANOVA, Chi-Square Independence, CRD + Tukey',
  3: 'Focus: RCBD, Regression Diagnostics & Transformations, Mixed Inference',
};

const GRADE_ESTIMATE = (pct: number) => {
  if (pct >= 90) return { letter: 'A', color: 'text-emerald-400' };
  if (pct >= 80) return { letter: 'B', color: 'text-blue-400' };
  if (pct >= 70) return { letter: 'C', color: 'text-yellow-400' };
  if (pct >= 60) return { letter: 'D', color: 'text-orange-400' };
  return { letter: 'F', color: 'text-rose-400' };
};

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ───────── History row ─────────
function HistorySection() {
  const [sessions, setSessions] = useState<ExamSimSession[]>([]);
  useEffect(() => {
    setSessions(getAppState().examSessions ?? []);
  }, []);

  if (sessions.length === 0) return null;

  return (
    <div className="mt-10 space-y-3">
      <h2 className="text-lg font-semibold text-gray-300">Previous Sessions</h2>
      <div className="space-y-2">
        {[...sessions].reverse().map(s => {
          const totalEarned = Object.values(s.selfGrades ?? {}).reduce((a, b) => a + b, 0);
          return (
            <div key={s.id} className="flex items-center justify-between bg-gray-800/40 border border-gray-700 rounded-xl px-5 py-3">
              <div>
                <span className="text-gray-200 font-medium">Practice Final {s.practiceExamNum}</span>
                <span className="text-gray-500 text-sm ml-3">{new Date(s.startTime).toLocaleDateString()}</span>
              </div>
              <div className="text-right">
                <p className="text-indigo-400 font-semibold">{totalEarned} pts</p>
                {s.submitted && <p className="text-xs text-gray-500">Submitted</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────── Setup State ─────────
function SetupView({
  onStart,
  initialExam,
}: {
  onStart: (examNum: 1 | 2 | 3) => void;
  initialExam?: 1 | 2 | 3;
}) {
  const [chosen, setChosen] = useState<1 | 2 | 3 | null>(initialExam ?? 1);

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Exam Simulator</h1>
        <p className="text-gray-400 mt-1">Simulate the 2-hour final exam under realistic conditions.</p>
      </div>

      {/* Exam selection */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Choose Practice Exam</h2>
        {([1, 2, 3] as const).map(num => (
          <label
            key={num}
            className={cn(
              'flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition-all',
              chosen === num
                ? 'border-indigo-500 bg-indigo-900/30'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
            )}
          >
            <input
              type="radio"
              name="exam"
              value={num}
              checked={chosen === num}
              onChange={() => setChosen(num)}
              className="mt-1 accent-indigo-500"
            />
            <div>
              <p className="text-white font-semibold text-lg">Practice Final {num}</p>
              <p className="text-gray-400 text-sm mt-0.5">{EXAM_DESCRIPTIONS[num]}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-5 space-y-2">
        <p className="text-amber-400 font-semibold text-sm">📋 Exam Instructions</p>
        <ul className="space-y-1.5 text-sm text-gray-300">
          <li>• 120-minute countdown timer</li>
          <li>• Q1–Q3 are <strong className="text-white">MANDATORY</strong></li>
          <li>• Select exactly <strong className="text-white">2 of Q4–Q7</strong> to answer</li>
          <li>• Formula sheets are allowed <span className="text-green-400">(you have them printed ✓)</span></li>
          <li>• One double-sided note sheet allowed</li>
          <li>• Self-grade after submission — partial credit is possible</li>
        </ul>
      </div>

      <button
        onClick={() => chosen && onStart(chosen)}
        disabled={!chosen}
        className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-lg font-bold transition-colors"
      >
        ▶ Start Exam
      </button>

      <HistorySection />
    </div>
  );
}

// ───────── Active Exam ─────────
function ActiveExam({
  examNum,
  questions,
  onSubmit,
}: {
  examNum: 1 | 2 | 3;
  questions: ExamQuestion[];
  onSubmit: (answers: Record<string, string>, selectedOptional: string[]) => void;
}) {
  const TOTAL_SECS = 120 * 60;
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECS);
  const [selectedQ, setSelectedQ] = useState<string>(questions[0]?.id ?? '');
  const [optionalSelected, setOptionalSelected] = useState<Set<string>>(new Set());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const autoSubmitted = useRef(false);

  const mandatory = questions.filter(q => q.mandatory);
  const optional = questions.filter(q => !q.mandatory);
  const isTimeLow = timeLeft < 10 * 60;

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!autoSubmitted.current) {
        autoSubmitted.current = true;
        alert("⏰ Time's up! Submitting your exam.");
        onSubmit(answers, Array.from(optionalSelected));
      }
      return;
    }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, answers, optionalSelected, onSubmit]);

  function toggleOptional(qId: string) {
    setOptionalSelected(prev => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else if (next.size < 2) {
        next.add(qId);
      }
      return next;
    });
  }

  function handleSubmit() {
    if (optionalSelected.size < 2) {
      alert('Please select exactly 2 optional questions (Q4–Q7) before submitting.');
      return;
    }
    setShowConfirm(true);
  }

  function confirmSubmit() {
    setShowConfirm(false);
    onSubmit(answers, Array.from(optionalSelected));
  }

  const currentQ = questions.find(q => q.id === selectedQ);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center gap-6 shadow-lg">
        <span className="font-semibold text-gray-200">Practice Final {examNum}</span>
        <div className="flex-1" />
        <div className={cn(
          'flex items-center gap-2 font-mono text-xl font-bold px-4 py-1 rounded-lg transition-all',
          isTimeLow ? 'text-rose-400 bg-rose-900/20 animate-pulse' : 'text-white'
        )}>
          <span>⏱</span>
          <span>{formatTime(timeLeft)}</span>
        </div>
        <button
          onClick={handleSubmit}
          className="px-5 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-semibold transition-colors"
        >
          Submit Exam
        </button>
      </div>

      <div className="flex flex-1">
        {/* Left nav panel */}
        <aside className="w-52 shrink-0 border-r border-gray-800 p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mandatory</p>
            <div className="space-y-1">
              {mandatory.map(q => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQ(q.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    selectedQ === q.id ? 'bg-indigo-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  )}
                >
                  Q{q.questionNum}: {q.title.substring(0, 20)}…
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Optional — pick 2
            </p>
            <div className="space-y-1">
              {optional.map(q => {
                const isChosen = optionalSelected.has(q.id);
                const isLocked = !isChosen && optionalSelected.size >= 2;
                return (
                  <div key={q.id} className="flex items-center gap-2">
                    <button
                      onClick={() => toggleOptional(q.id)}
                      disabled={isLocked}
                      className={cn(
                        'w-5 h-5 rounded border-2 shrink-0 transition-colors',
                        isChosen ? 'bg-indigo-600 border-indigo-500' : 'border-gray-600',
                        isLocked && 'opacity-30 cursor-not-allowed'
                      )}
                      aria-label={`Select Q${q.questionNum}`}
                    >
                      {isChosen && <span className="text-white text-xs flex items-center justify-center">✓</span>}
                    </button>
                    <button
                      onClick={() => { if (!isLocked || isChosen) setSelectedQ(q.id); }}
                      className={cn(
                        'flex-1 text-left text-sm py-1.5 transition-colors',
                        selectedQ === q.id ? 'text-indigo-300 font-semibold' : 'text-gray-400 hover:text-gray-200',
                        isLocked && !isChosen && 'opacity-30'
                      )}
                    >
                      Q{q.questionNum}
                    </button>
                  </div>
                );
              })}
            </div>
            {optionalSelected.size < 2 && (
              <p className="text-xs text-amber-400 mt-2">
                Select {2 - optionalSelected.size} more
              </p>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {currentQ ? (
            <>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded-full font-medium">
                    Q{currentQ.questionNum} — {currentQ.totalPoints} pts
                  </span>
                  {!currentQ.mandatory && optionalSelected.has(currentQ.id) && (
                    <span className="text-xs bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full font-medium">Selected ✓</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">{currentQ.title}</h2>
                <p className="text-gray-300 mt-1 leading-relaxed">{currentQ.content}</p>
              </div>

              <div className="space-y-5">
                {currentQ.subparts.map(sub => (
                  <div key={sub.id} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-indigo-400 shrink-0">({sub.label})</span>
                      <div className="flex-1 space-y-1">
                        <p className="text-gray-200">{sub.prompt}</p>
                        <p className="text-xs text-gray-500">{sub.points} points</p>
                      </div>
                    </div>
                    <textarea
                      value={answers[sub.id] ?? ''}
                      onChange={e => setAnswers(prev => ({ ...prev, [sub.id]: e.target.value }))}
                      placeholder="Write your answer here (simulate your blue book)..."
                      className="w-full h-32 bg-blue-950/10 border border-blue-800/30 rounded-xl px-4 py-3 text-gray-100 text-sm font-mono resize-y focus:outline-none focus:border-indigo-500 focus:bg-blue-950/20 transition-colors placeholder-gray-600"
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-16">Select a question from the left panel.</div>
          )}
        </main>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-xl font-bold text-white">Submit Exam?</h3>
            <p className="text-gray-300 text-sm">
              You are submitting Practice Final {examNum} with{' '}
              <strong className="text-indigo-400">{formatTime(TOTAL_SECS - timeLeft)}</strong> elapsed.
              <br /><br />
              Optional questions chosen: Q{Array.from(optionalSelected).map(id => questions.find(q => q.id === id)?.questionNum).join(', Q')}.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                className="flex-1 py-2.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-semibold transition-colors"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ───────── Results / Grading ─────────
function ResultsView({
  examNum,
  questions,
  answers,
  selectedOptional,
  onDone,
}: {
  examNum: 1 | 2 | 3;
  questions: ExamQuestion[];
  answers: Record<string, string>;
  selectedOptional: string[];
  onDone: () => void;
}) {
  const answeredQs = questions.filter(
    q => q.mandatory || selectedOptional.includes(q.id)
  );
  const [selfGrades, setSelfGrades] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const totalPossible = answeredQs.reduce((sum, q) => sum + q.totalPoints, 0);
  const totalEarned = Object.values(selfGrades).reduce((a, b) => a + b, 0);

  function handleGrade(subId: string, val: number, max: number) {
    setSelfGrades(prev => ({ ...prev, [subId]: Math.min(max, Math.max(0, val)) }));
  }

  function handleSubmitGrades() {
    const score = totalEarned;
    const session: ExamSimSession = {
      id: generateId(),
      practiceExamNum: examNum,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      selectedOptional,
      selfGrades,
      submitted: true,
    };

    // Push missed subparts to mistake journal
    answeredQs.forEach(q => {
      q.subparts.forEach(sub => {
        const earned = selfGrades[sub.id] ?? 0;
        if (earned < sub.points * 0.6) {
          const entry: MistakeEntry = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            source: 'exam',
            itemId: sub.id,
            itemTitle: `PF${examNum} Q${q.questionNum}${sub.label}: ${sub.prompt.substring(0, 40)}`,
            module: 1, // default; ideally mapped from question metadata
            errorType: 'other',
            details: `Earned ${earned}/${sub.points} pts. Solution: ${sub.solution.substring(0, 100)}`,
          };
          addMistake(entry);
        }
      });
    });

    const appState = getAppState();
    appState.examSessions = [...(appState.examSessions ?? []), session];
    saveAppState(appState);

    setFinalScore(score);
    setSubmitted(true);
  }

  if (submitted && finalScore !== null) {
    const pct = Math.round((finalScore / totalPossible) * 100);
    const grade = GRADE_ESTIMATE(pct);
    return (
      <div className="max-w-2xl mx-auto py-10 text-center space-y-6">
        <div className="text-6xl">🎓</div>
        <div>
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Practice Final {examNum} — Self-Graded Score</p>
          <p className="text-5xl font-black text-white">{finalScore}<span className="text-gray-500 text-2xl">/{totalPossible}</span></p>
          <p className={cn('text-3xl font-bold mt-2', grade.color)}>Grade Estimate: {grade.letter} ({pct}%)</p>
        </div>
        <p className="text-sm text-gray-400">Missed subparts have been added to your Mistake Journal for review.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={onDone} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors">
            ← Back to Setup
          </button>
          <a href="/weak-spot" className="px-6 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors">
            Review Mistakes
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Self-Grade — Practice Final {examNum}</h1>
          <p className="text-gray-400 text-sm mt-1">Review official solutions and score each sub-part honestly.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Running total</p>
          <p className="text-2xl font-bold text-indigo-400">{totalEarned}<span className="text-gray-500 text-base">/{totalPossible}</span></p>
        </div>
      </div>

      {answeredQs.map(q => (
        <div key={q.id} className="bg-gray-800/40 border border-gray-700 rounded-2xl overflow-hidden">
          <div className="bg-gray-800 px-5 py-3 flex items-center justify-between">
            <h2 className="font-semibold text-white">Q{q.questionNum}: {q.title}</h2>
            <span className="text-sm text-gray-400">{q.totalPoints} pts total</span>
          </div>
          <div className="p-5 space-y-6">
            {q.subparts.map(sub => {
              const earned = selfGrades[sub.id] ?? 0;
              return (
                <div key={sub.id} className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-indigo-400 shrink-0">({sub.label})</span>
                    <p className="text-gray-200">{sub.prompt}</p>
                  </div>

                  {/* Student answer */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Your Answer:</p>
                    <div className="bg-gray-900/60 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 text-sm font-mono whitespace-pre-wrap min-h-[48px]">
                      {answers[sub.id] || <span className="text-gray-600 italic">No answer written</span>}
                    </div>
                  </div>

                  {/* Official solution */}
                  <div className="space-y-1">
                    <p className="text-xs text-emerald-400 font-medium">Official Solution:</p>
                    <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-lg px-4 py-3 space-y-2">
                      <p className="text-gray-200 text-sm">{sub.solution}</p>
                      {sub.solutionLatex && (
                        <div className="text-gray-100">
                          <KatexRenderer math={sub.solutionLatex} display />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Self-grading */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">{sub.points} pts possible</span>
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      Pts earned:
                      <input
                        type="number"
                        min={0}
                        max={sub.points}
                        value={selfGrades[sub.id] ?? 0}
                        onChange={e => handleGrade(sub.id, Number(e.target.value), sub.points)}
                        className="w-16 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1 text-white text-center focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-gray-500">/ {sub.points}</span>
                    </label>
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', earned / sub.points >= 0.6 ? 'bg-emerald-500' : 'bg-rose-500')}
                        style={{ width: `${(earned / sub.points) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Submit */}
      <div className="sticky bottom-4">
        <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-2xl px-6 py-4 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-gray-400 text-sm">Total Self-Grade</p>
            <p className="text-3xl font-bold text-white">
              {totalEarned}<span className="text-gray-500 text-lg">/{totalPossible}</span>
            </p>
          </div>
          <button
            onClick={handleSubmitGrades}
            className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg transition-colors"
          >
            Submit Self-Grades
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────── Page ─────────
function ExamSimulatorContent() {
  const searchParams = useSearchParams();
  const examParam = searchParams.get('exam');
  const parsedExam = examParam ? (Number(examParam) as 1 | 2 | 3) : 1;
  const initialExamNum: 1 | 2 | 3 = [1, 2, 3].includes(parsedExam) ? parsedExam : 1;

  const [simState, setSimState] = useState<SimState>('setup');
  const [examNum, setExamNum] = useState<1 | 2 | 3>(initialExamNum);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [selectedOptional, setSelectedOptional] = useState<string[]>([]);

  useEffect(() => {
    if (examParam && [1, 2, 3].includes(parsedExam)) {
      setExamNum(parsedExam);
    }
  }, [examParam, parsedExam]);

  const questions = examQuestions.filter(q => q.examNum === examNum);

  function handleStart(num: 1 | 2 | 3) {
    setExamNum(num);
    setSimState('active');
  }

  function handleSubmitExam(answers: Record<string, string>, optional: string[]) {
    setExamAnswers(answers);
    setSelectedOptional(optional);
    setSimState('results');
  }

  function handleDone() {
    setSimState('setup');
    setExamAnswers({});
    setSelectedOptional([]);
  }

  if (simState === 'setup') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <SetupView onStart={handleStart} initialExam={examNum} />
      </div>
    );
  }

  if (simState === 'active') {
    return (
      <ActiveExam
        examNum={examNum}
        questions={questions}
        onSubmit={handleSubmitExam}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ResultsView
        examNum={examNum}
        questions={questions}
        answers={examAnswers}
        selectedOptional={selectedOptional}
        onDone={handleDone}
      />
    </div>
  );
}

export default function ExamSimulatorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Exam Simulator...</div>}>
      <ExamSimulatorContent />
    </Suspense>
  );
}
