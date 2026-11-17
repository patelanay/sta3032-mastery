'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { addNoteSheetEntry, getAppState } from '@/lib/storage';
import type { NoteSheetEntry } from '@/types';

interface FlagButtonProps {
  itemId: string;
  title: string;
  latex?: string;
  content?: string;
  side?: 'A' | 'B';
  priority?: 'must-have' | 'trap' | 'proof' | 'example';
  defaultSide?: 'A' | 'B';
  className?: string;
}

type Priority = 'must-have' | 'trap' | 'proof' | 'example';

const PRIORITY_LABELS: Record<Priority, string> = {
  'must-have': '⭐ Must Have',
  trap: '⚠️ Trap',
  proof: '📐 Proof',
  example: '💡 Example',
};

export function FlagButton({
  itemId,
  title,
  latex,
  content,
  side: initialSide,
  priority: initialPriority,
  defaultSide = 'A',
  className,
}: FlagButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<'A' | 'B'>(initialSide ?? defaultSide);
  const [priority, setPriority] = useState<Priority>(initialPriority ?? 'must-have');
  const [note, setNote] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const state = getAppState();
    setIsSaved(state.noteSheet.some((n) => n.itemId === itemId));
  }, [itemId]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function handleSave() {
    const entry: NoteSheetEntry = {
      itemId,
      title,
      latex,
      side,
      priority,
      customNote: note,
      masteryStreak: 0,
      archived: false,
      content: content ?? title,
    };
    addNoteSheetEntry(entry);
    setIsSaved(true);
    setOpen(false);
  }

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        title={isSaved ? 'Saved to Note Sheet' : 'Add to Note Sheet'}
        className={cn(
          'p-1.5 rounded-md transition-colors',
          isSaved
            ? 'text-amber-400 hover:text-amber-300'
            : 'text-gray-500 hover:text-amber-400',
        )}
        aria-label="Add to note sheet"
      >
        {isSaved ? (
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z"
            />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-200 truncate">{title}</p>

          {/* Side selection */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Sheet Side</p>
            <div className="flex gap-2">
              {(['A', 'B'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={cn(
                    'flex-1 py-1 rounded text-sm font-medium transition-colors',
                    side === s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
                  )}
                >
                  Side {s}
                </button>
              ))}
            </div>
          </div>

          {/* Priority selection */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Priority</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    'py-1 px-2 rounded text-xs font-medium transition-colors',
                    priority === p
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
                  )}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Custom note */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Custom Note (optional)</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="e.g. remember to check variance equality first"
              className="w-full text-xs bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {isSaved ? 'Update Entry' : '+ Add to Note Sheet'}
          </button>
        </div>
      )}
    </div>
  );
}

export default FlagButton;
