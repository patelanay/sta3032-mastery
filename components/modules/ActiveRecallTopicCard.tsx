'use client';

import { useState } from 'react';
import type { ActiveRecallPrompt } from '@/data/activeRecallPrompts';
import { ActiveRecallTopicModal } from './ActiveRecallTopicModal';
import { cn } from '@/lib/utils';

interface ActiveRecallTopicCardProps {
  topic: string;
  index: number;
  isDone: boolean;
  onToggle: () => void;
  prompt?: ActiveRecallPrompt;
}

export function ActiveRecallTopicCard({
  topic,
  index,
  isDone,
  onToggle,
  prompt,
}: ActiveRecallTopicCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 transition-colors',
          isDone ? 'bg-emerald-950/20' : 'hover:bg-gray-800/50'
        )}
      >
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isDone}
            onChange={onToggle}
            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
          />
          <span
            className={cn(
              'text-sm font-medium',
              isDone ? 'line-through text-gray-500' : 'text-gray-200'
            )}
          >
            {topic}
          </span>
        </label>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {prompt ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-sm',
                isDone
                  ? 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                  : 'bg-indigo-950/70 hover:bg-indigo-900 border-indigo-700/80 text-indigo-300 hover:shadow-indigo-500/10'
              )}
            >
              <span>📖</span>
              <span>Teach Concept &amp; Active Recall</span>
            </button>
          ) : (
            <span className="text-[11px] text-gray-600 italic">Self-check topic</span>
          )}

          {isDone && (
            <span className="text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-800/40">
              ✓ Mastered
            </span>
          )}
        </div>
      </div>

      {prompt && (
        <ActiveRecallTopicModal
          prompt={prompt}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onMastered={() => {
            if (!isDone) onToggle();
          }}
          alreadyDone={isDone}
        />
      )}
    </>
  );
}
