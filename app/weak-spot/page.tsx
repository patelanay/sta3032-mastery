'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAppState, saveAppState, addMistake } from '@/lib/storage';
import { cn, generateId } from '@/lib/utils';
import { flashcards } from '@/data/flashcards';
import type { MistakeEntry, AppState, Flashcard } from '@/types';

// ───────── Types ─────────
type ErrorType = MistakeEntry['errorType'];
type WarmupItem =
  | { kind: 'flashcard'; card: Flashcard }
  | { kind: 'mistake'; entry: MistakeEntry };

// ───────── Helpers ─────────
const ERROR_BADGE: Record<ErrorType, string> = {
  'wrong-test-selected': 'bg-rose-700 text-rose-100',
  'assumption-missed': 'bg-orange-700 text-orange-100',
  'wrong-hypotheses': 'bg-yellow-700 text-yellow-100',
  'misread-output': 'bg-blue-700 text-blue-100',
  'other': 'bg-gray-700 text-gray-200',
};
const ERROR_LABEL: Record<ErrorType, string> = {
  'wrong-test-selected': 'Wrong Test',
  'assumption-missed': 'Assumption',
  'wrong-hypotheses': 'Wrong H₀/Hₐ',
  'misread-output': 'Misread Output',
  'other': 'Other',
};

// Returns date string in YYYY-MM-DD for local date comparison (midnight reset)
function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate time remaining until next 12:00 AM midnight
function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diff = Math.max(0, midnight.getTime() - now.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
}

function buildWarmupItems(state: AppState): WarmupItem[] {
  // Top mistake items (highest repeat count)
  const mistakeCounts: Record<string, number> = {};
  state.mistakes.forEach(m => {
    mistakeCounts[m.itemId] = (mistakeCounts[m.itemId] ?? 0) + 1;
  });
  const topMistakes = [...state.mistakes]
    .sort((a, b) => (mistakeCounts[b.itemId] ?? 0) - (mistakeCounts[a.itemId] ?? 0))
    .filter((m, i, arr) => arr.findIndex(x => x.itemId === m.itemId) === i)
    .slice(0, 3)
    .map(entry => ({ kind: 'mistake' as const, entry }));

  // Hardest flashcards by lowest efactor
  const progress = state.flashcardProgress;
  const hardCards = [...flashcards]
    .sort((a, b) => {
      const ea = progress[a.id]?.efactor ?? a.efactor;
      const eb = progress[b.id]?.efactor ?? b.efactor;
      return ea - eb;
    })
    .slice(0, 2)
    .map(card => ({ kind: 'flashcard' as const, card }));

  return [...topMistakes, ...hardCards].slice(0, 5);
}

// ───────── Warmup Tab ─────────
function WarmupTab() {
  const [state, setState] = useState<AppState | null>(null);
  const [items, setItems] = useState<WarmupItem[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reAnswer, setReAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [doneToday, setDoneToday] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());

  useEffect(() => {
    const s = getAppState();
    setState(s);
    setItems(buildWarmupItems(s));

    // Check if user already finished warmup today (since last midnight)
    const todayStr = getTodayDateString();
    if (s.lastWarmupDate) {
      const lastDate = s.lastWarmupDate.split('T')[0];
      if (lastDate === todayStr) {
        setDoneToday(true);
      }
    }
  }, []);

  // Countdown timer for session and midnight reset
  useEffect(() => {
    const id = setInterval(() => {
      if (!doneToday) {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }
      setCountdown(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(id);
  }, [doneToday, startTime]);

  const remaining = Math.max(0, 15 * 60 - elapsed);
  const remMin = Math.floor(remaining / 60);
  const remSec = remaining % 60;

  function advance() {
    if (index + 1 >= items.length) {
      const appState = getAppState();
      appState.lastWarmupDate = new Date().toISOString();
      saveAppState(appState);
      setDoneToday(true);
    } else {
      setIndex(i => i + 1);
      setFlipped(false);
      setRevealed(false);
      setReAnswer('');
    }
  }

  // ALREADY COMPLETED TODAY — LOCKED OUT UNTIL MIDNIGHT RESET
  if (doneToday) {
    return (
      <div className="max-w-xl mx-auto py-12 px-6 bg-gray-900 border border-gray-800 rounded-3xl text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-3xl">
          ✓
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Daily Warmup Completed for Today</h2>
          <p className="text-sm text-gray-400">
            You have already finished today&apos;s 15-minute warmup. To prevent cramming fatigue and maximize spaced retrieval, your next queue resets at <span className="text-indigo-400 font-semibold">12:00 AM midnight</span>.
          </p>
        </div>

        {/* Midnight Reset Countdown */}
        <div className="p-4 bg-gray-950 border border-gray-800 rounded-2xl space-y-2">
          <p className="text-xs uppercase tracking-widest font-bold text-gray-500">Resets In</p>
          <div className="flex justify-center items-center gap-3 font-mono text-2xl font-bold text-indigo-400">
            <span>{String(countdown.hours).padStart(2, '0')}h</span>
            <span className="text-gray-600">:</span>
            <span>{String(countdown.minutes).padStart(2, '0')}m</span>
            <span className="text-gray-600">:</span>
            <span>{String(countdown.seconds).padStart(2, '0')}s</span>
          </div>
          <p className="text-[11px] text-gray-500">
            Next queue will re-pull your top 5 repeat weak spots at midnight.
          </p>
        </div>

        <div className="pt-2 text-xs text-gray-500">
          Want to continue practicing? Head over to the{' '}
          <a href="/scenarios" className="text-indigo-400 hover:underline">Scenario Recognition Trainer</a> or{' '}
          <a href="/module-explorer" className="text-indigo-400 hover:underline">Module Explorer</a>.
        </div>
      </div>
    );
  }

  if (!state || items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 space-y-3">
        <p className="text-5xl">🎯</p>
        <p className="text-lg font-semibold text-gray-300">No weak spots logged yet!</p>
        <p className="text-sm text-gray-500">
          As you practice in the Scenario Trainer or take Flashcard drills, any misses will be queued here for your daily 15-minute warmup.
        </p>
      </div>
    );
  }

  const item = items[index];
  const reviewedCount = index;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>{reviewedCount}/{items.length} items reviewed — {remMin}:{String(remSec).padStart(2, '0')} remaining (est.)</span>
          <span className={cn('font-mono', remaining < 60 ? 'text-rose-400' : 'text-gray-400')}>
            {remMin}m {String(remSec).padStart(2, '0')}s
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${(reviewedCount / items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Item card */}
      {item.kind === 'flashcard' && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded-full font-medium">Flashcard</span>
            <span className="text-xs text-gray-500 capitalize">{item.card.type}</span>
          </div>
          <p className="text-gray-100 text-lg leading-relaxed">{item.card.front}</p>

          {!flipped ? (
            <button
              onClick={() => setFlipped(true)}
              className="w-full py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
            >
              Flip Card
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-900/30 border border-indigo-700/50 rounded-xl">
                <p className="text-indigo-100">{item.card.back}</p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(['Again', 'Hard', 'Good', 'Easy'] as const).map((label, idx) => (
                  <button
                    key={label}
                    onClick={advance}
                    className={cn(
                      'py-2 rounded-lg text-sm font-semibold transition-colors',
                      idx === 0 && 'bg-rose-700 hover:bg-rose-600 text-white',
                      idx === 1 && 'bg-orange-600 hover:bg-orange-500 text-white',
                      idx === 2 && 'bg-emerald-700 hover:bg-emerald-600 text-white',
                      idx === 3 && 'bg-blue-700 hover:bg-blue-600 text-white',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-center text-gray-500">Again=wrong | Hard=unsure | Good=correct | Easy=instant</p>
            </div>
          )}
        </div>
      )}

      {item.kind === 'mistake' && (
        <div className="bg-gray-800/60 border border-rose-800/40 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-rose-800 text-rose-200 px-2 py-0.5 rounded-full font-medium">Past Mistake</span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', ERROR_BADGE[item.entry.errorType])}>
              {ERROR_LABEL[item.entry.errorType]}
            </span>
          </div>
          <p className="text-gray-200 font-medium">{item.entry.itemTitle}</p>
          <p className="text-gray-400 text-sm">{item.entry.details}</p>

          {!revealed ? (
            <div className="space-y-3">
              <textarea
                value={reAnswer}
                onChange={e => setReAnswer(e.target.value)}
                placeholder="What is the correct approach here? Type your answer..."
                className="w-full h-24 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm resize-none focus:outline-none focus:border-indigo-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setRevealed(true)}
                  className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium transition-colors"
                >
                  Reveal Correct Answer
                </button>
                <button
                  onClick={advance}
                  className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                >
                  I Got It → Next
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-900/20 border border-emerald-700/40 rounded-xl">
                <p className="text-xs text-emerald-400 font-semibold mb-1">Correct Approach:</p>
                <p className="text-gray-200 text-sm">{item.entry.details}</p>
              </div>
              <button
                onClick={advance}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
              >
                Next Item →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ───────── Mistake Journal Tab ─────────
function MistakeJournalTab() {
  const [state, setState] = useState<AppState | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterError, setFilterError] = useState<ErrorType | 'all'>('all');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const refresh = useCallback(() => setState(getAppState()), []);
  useEffect(() => { refresh(); }, [refresh]);

  const mistakes = state?.mistakes ?? [];
  const sorted = [...mistakes].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const filtered = sorted.filter(m => {
    if (filterError !== 'all' && m.errorType !== filterError) return false;
    if (filterModule !== 'all' && String(m.module) !== filterModule) return false;
    if (filterSource !== 'all' && m.source !== filterSource) return false;
    return true;
  });

  // Summary stats
  const totalMistakes = mistakes.length;
  const errorCounts: Partial<Record<ErrorType, number>> = {};
  const moduleCounts: Record<number, number> = {};
  mistakes.forEach(m => {
    errorCounts[m.errorType] = (errorCounts[m.errorType] ?? 0) + 1;
    moduleCounts[m.module] = (moduleCounts[m.module] ?? 0) + 1;
  });
  const topError = Object.entries(errorCounts).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0];

  function handleClearAll() {
    const s = getAppState();
    s.mistakes = [];
    saveAppState(s);
    setConfirmClear(false);
    refresh();
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Logged Mistakes</p>
          <p className="text-2xl font-bold text-white mt-1">{totalMistakes}</p>
        </div>
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Top Point Leak</p>
          <p className="text-lg font-bold text-rose-400 mt-1">
            {topError ? `${ERROR_LABEL[topError[0] as ErrorType]} (${topError[1]})` : 'None yet'}
          </p>
        </div>
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Highest-Miss Module</p>
          <p className="text-lg font-bold text-yellow-400 mt-1">
            {Object.keys(moduleCounts).length > 0
              ? `Module ${Object.entries(moduleCounts).sort((a, b) => b[1] - a[1])[0][0]}`
              : 'None yet'}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterError}
          onChange={e => setFilterError(e.target.value as ErrorType | 'all')}
          aria-label="Filter by error type"
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Error Types</option>
          <option value="wrong-test-selected">Wrong Test</option>
          <option value="assumption-missed">Assumption Missed</option>
          <option value="wrong-hypotheses">Wrong H₀/Hₐ</option>
          <option value="misread-output">Misread Output</option>
          <option value="other">Other</option>
        </select>

        <select
          value={filterModule}
          onChange={e => setFilterModule(e.target.value)}
          aria-label="Filter by module"
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Modules</option>
          {[1, 2, 3, 4, 5, 6].map(m => (
            <option key={m} value={String(m)}>Module {m}</option>
          ))}
        </select>

        <select
          value={filterSource}
          onChange={e => setFilterSource(e.target.value)}
          aria-label="Filter by source"
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Sources</option>
          <option value="scenario">Scenario</option>
          <option value="walkthrough">Walkthrough</option>
          <option value="flashcard">Flashcard</option>
          <option value="exam">Exam Sim</option>
        </select>

        <div className="flex-1" />

        {!confirmClear ? (
          <button
            onClick={() => setConfirmClear(true)}
            className="text-sm text-rose-400 hover:text-rose-300 border border-rose-700/50 rounded-lg px-3 py-1.5 hover:bg-rose-900/20 transition-colors"
          >
            Clear All Mistakes
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-rose-300">Are you sure?</span>
            <button onClick={handleClearAll} className="text-sm text-rose-400 font-semibold hover:text-rose-300">Yes, clear</button>
            <button onClick={() => setConfirmClear(false)} className="text-sm text-gray-400 hover:text-gray-300">Cancel</button>
          </div>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No mistakes match your filters. Keep studying!
        </div>
      ) : (
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-800 text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Topic / Item</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Error Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filtered.map(m => (
                <>
                  <tr
                    key={m.id}
                    onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                    className="cursor-pointer hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(m.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-300 capitalize">{m.source}</td>
                    <td className="px-4 py-3 text-gray-200 max-w-[200px] truncate">{m.itemTitle}</td>
                    <td className="px-4 py-3 text-gray-400">Mod {m.module}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', ERROR_BADGE[m.errorType])}>
                        {ERROR_LABEL[m.errorType]}
                      </span>
                    </td>
                  </tr>
                  {expandedId === m.id && (
                    <tr key={`${m.id}-detail`} className="bg-gray-900/60">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Full timestamp: {new Date(m.timestamp).toLocaleString()}</p>
                          <p className="text-sm text-gray-200">{m.details}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ───────── Page ─────────
function WeakSpotContent() {
  const searchParams = useSearchParams();
  const warmupParam = searchParams.get('warmup') === 'true';
  const [activeTab, setActiveTab] = useState<'warmup' | 'journal'>(warmupParam ? 'warmup' : 'journal');

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Weak-Spot Journal & Daily Warmup</h1>
        <p className="text-gray-400 mt-1">
          Review your hardest topics and track every mistake to close knowledge gaps before the exam.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-800/60 rounded-xl w-fit border border-gray-700">
        {(['warmup', 'journal'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            )}
          >
            {tab === 'warmup' ? '☀️ Daily Warmup' : '📋 Mistake Journal'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'warmup' ? <WarmupTab /> : <MistakeJournalTab />}
    </main>
  );
}

export default function WeakSpotPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Weak-Spot Studio...</div>}>
      <WeakSpotContent />
    </Suspense>
  );
}
