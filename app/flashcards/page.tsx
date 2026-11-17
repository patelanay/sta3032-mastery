'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAppState, updateFlashcardProgress, addMistake } from '@/lib/storage';
import { calculateSM2 } from '@/lib/sm2';
import { flashcards } from '@/data/flashcards';
import { KatexRenderer } from '@/components/ui/KatexRenderer';
import { FlagButton } from '@/components/ui/FlagButton';
import { ModuleBadge } from '@/components/ui/Badge';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Flashcard, FlashcardProgress } from '@/types';

type FilterTab = 'All' | 'Scenario' | 'Test Selection' | 'Assumption' | 'Interpretation' | 'When To Use' | '1' | '2' | '3' | '4' | '5' | '6';

const FILTER_TABS: FilterTab[] = ['All', 'Scenario', 'Test Selection', 'Assumption', 'Interpretation', 'When To Use', '1', '2', '3', '4', '5', '6'];

const RATING_CONFIG = [
  { grade: 1 as const, label: 'Again', sub: 'Got scenario wrong', className: 'bg-red-700 hover:bg-red-600 text-white' },
  { grade: 2 as const, label: 'Hard', sub: "Got it, wasn't sure", className: 'bg-orange-600 hover:bg-orange-500 text-white' },
  { grade: 3 as const, label: 'Good', sub: 'Correctly identified', className: 'bg-emerald-700 hover:bg-emerald-600 text-white' },
  { grade: 4 as const, label: 'Easy', sub: 'Know this cold', className: 'bg-blue-700 hover:bg-blue-600 text-white' },
];

function isDue(progress: FlashcardProgress | undefined): boolean {
  if (!progress) return true;
  if (progress.nextReviewDate <= new Date().toISOString().split('T')[0]) return true;
  return false;
}

export default function FlashcardsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [cardProgress, setCardProgress] = useState<Record<string, FlashcardProgress>>({});
  const [dueQueue, setDueQueue] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });
  const [sessionDone, setSessionDone] = useState(false);

  useEffect(() => {
    const state = getAppState();
    setCardProgress(state.flashcardProgress ?? {});
  }, []);

  useEffect(() => {
    let filtered = flashcards;
    if (activeFilter === 'Scenario') filtered = flashcards.filter((c: Flashcard) => c.type === 'scenario');
    else if (activeFilter === 'Test Selection') filtered = flashcards.filter((c: Flashcard) => c.type === 'test-selection');
    else if (activeFilter === 'Assumption') filtered = flashcards.filter((c: Flashcard) => c.type === 'assumption');
    else if (activeFilter === 'Interpretation') filtered = flashcards.filter((c: Flashcard) => c.type === 'interpretation');
    else if (activeFilter === 'When To Use') filtered = flashcards.filter((c: Flashcard) => c.type === 'when-to-use');
    else if (['1', '2', '3', '4', '5', '6'].includes(activeFilter)) {
      filtered = flashcards.filter((c: Flashcard) => c.module === parseInt(activeFilter));
    }

    const due = filtered.filter((c: Flashcard) => isDue(cardProgress[c.id]));
    const nonDue = filtered.filter((c: Flashcard) => !isDue(cardProgress[c.id]));
    setDueQueue([...due, ...nonDue]);
    setCurrentIdx(0);
    setFlipped(false);
    setSessionDone(false);
  }, [activeFilter, cardProgress]);

  const currentCard = dueQueue[currentIdx];

  const handleRate = useCallback(
    (grade: 1 | 2 | 3 | 4) => {
      if (!currentCard) return;

      const existing = cardProgress[currentCard.id];
      const result = calculateSM2(currentCard, grade, existing);
      updateFlashcardProgress(currentCard.id, result);

      if (grade === 1) {
        addMistake({
          id: generateId(),
          source: 'flashcard',
          errorType: 'wrong-test-selected',
          itemId: currentCard.id,
          itemTitle: currentCard.front.substring(0, 60),
          module: currentCard.module,
          details: `Rated "Again" on flashcard: ${currentCard.front.substring(0, 80)}`,
          timestamp: new Date().toISOString(),
        });
      }

      setSessionStats((prev) => ({
        reviewed: prev.reviewed + 1,
        correct: prev.correct + (grade >= 3 ? 1 : 0),
      }));
      setCardProgress((prev) => ({ ...prev, [currentCard.id]: result }));

      const nextIdx = currentIdx + 1;
      if (nextIdx >= dueQueue.length) {
        setSessionDone(true);
      } else {
        setCurrentIdx(nextIdx);
        setFlipped(false);
      }
    },
    [currentCard, currentIdx, dueQueue.length, cardProgress],
  );

  const dueCount = dueQueue.filter((c) => isDue(cardProgress[c.id])).length;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">⚡ Active Recall (SM-2)</h1>
        <p className="text-gray-400">
          Formula sheets are given — all cards train <span className="text-indigo-400 font-semibold">decision making</span>, test selection, and LINE assumptions.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
              activeFilter === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex justify-between items-center bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 mb-6 text-sm">
        <div className="flex gap-4 text-gray-400">
          <span>Due today: <strong className="text-amber-400">{dueCount}</strong></span>
          <span>Deck: <strong className="text-white">{dueQueue.length}</strong></span>
        </div>
        <div className="text-gray-400">
          Card <strong className="text-white">{dueQueue.length > 0 ? currentIdx + 1 : 0}</strong> of <strong className="text-white">{dueQueue.length}</strong>
        </div>
      </div>

      {/* Session Done Screen */}
      {sessionDone || !currentCard ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center space-y-4">
          <div className="text-5xl">🎯</div>
          <h2 className="text-2xl font-bold text-white">Queue Complete!</h2>
          <p className="text-gray-400">
            Reviewed: <strong className="text-white">{sessionStats.reviewed}</strong> cards |
            Correct: <strong className="text-emerald-400">{sessionStats.correct}</strong>
          </p>
          <button
            onClick={() => {
              setCurrentIdx(0);
              setSessionDone(false);
              setSessionStats({ reviewed: 0, correct: 0 });
              const state = getAppState();
              setCardProgress(state.flashcardProgress ?? {});
            }}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
          >
            Review Again
          </button>
        </div>
      ) : (
        /* Flashcard */
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 min-h-[260px] flex flex-col justify-between shadow-xl">
            {/* Card meta */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <ModuleBadge module={currentCard.module} />
                <span className="text-xs bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded-full capitalize">
                  {currentCard.type.replace('-', ' ')}
                </span>
                {isDue(cardProgress[currentCard.id]) && (
                  <span className="text-xs bg-amber-900/60 text-amber-300 border border-amber-700 px-2 py-0.5 rounded-full">
                    Due
                  </span>
                )}
              </div>
              <FlagButton
                itemId={currentCard.id}
                title={currentCard.front.substring(0, 50)}
                content={currentCard.back}
                side="A"
                priority="trap"
              />
            </div>

            {/* Front / Back text */}
            <div className="my-auto space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Prompt / Scenario</p>
                <p className="text-base font-medium text-white leading-relaxed">{currentCard.front}</p>
                {currentCard.frontLatex && (
                  <div className="mt-2 text-indigo-300">
                    <KatexRenderer latex={currentCard.frontLatex} display={true} />
                  </div>
                )}
              </div>

              {flipped && (
                <div className="border-t border-gray-800 pt-4 mt-4 space-y-2">
                  <p className="text-xs text-emerald-400 uppercase tracking-widest font-semibold">Answer & Decision Rule</p>
                  <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{currentCard.back}</p>
                  {currentCard.backLatex && (
                    <div className="mt-2 text-emerald-300">
                      <KatexRenderer latex={currentCard.backLatex} display={true} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Flip / Controls */}
            {!flipped ? (
              <button
                onClick={() => setFlipped(true)}
                className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Flip Card (Show Answer)
              </button>
            ) : (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {RATING_CONFIG.map(({ grade, label, sub, className }) => (
                  <button
                    key={grade}
                    onClick={() => handleRate(grade)}
                    className={cn('py-2 px-1 rounded-xl text-center transition-all duration-150', className)}
                  >
                    <div className="text-xs font-bold">{label}</div>
                    <div className="text-[10px] opacity-80 truncate">{sub}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
