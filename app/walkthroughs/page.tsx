'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAppState } from '@/lib/storage';
import { walkthroughs } from '@/data/walkthroughs';
import { ModuleBadge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export default function WalkthroughsPage() {
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const state = getAppState();
    setProgress((state.walkthroughProgress as Record<string, number>) ?? {});
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">🔍 Guided Walkthroughs</h1>
        <p className="text-gray-400 text-lg">
          8 fully-worked problems, broken into 5 progressive stages. Master the{' '}
          <span className="text-indigo-400 font-semibold">decision process</span>, not just the answer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {walkthroughs.map((w) => {
          const done = progress[w.id] ?? 0;
          const pct = Math.round((done / 5) * 100);

          const SOURCE_STYLES: Record<string, string> = {
            HW: 'bg-purple-900 text-purple-300 border-purple-700',
            PF: 'bg-blue-900 text-blue-300 border-blue-700',
          };

          return (
            <Link
              key={w.id}
              href={`/walkthroughs/${w.id}`}
              className="group block rounded-2xl border border-gray-800 bg-gray-900 hover:border-indigo-500 hover:bg-gray-800 transition-all duration-200 p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <ModuleBadge module={w.module} />
                  <span
                    className={cn(
                      'text-xs font-bold border px-2 py-0.5 rounded-full',
                      SOURCE_STYLES[w.source] ?? 'bg-gray-800 text-gray-400 border-gray-700',
                    )}
                  >
                    {w.source}
                  </span>
                </div>
                {done >= 5 && (
                  <span className="text-emerald-400 text-sm font-semibold flex-shrink-0">✓ Complete</span>
                )}
              </div>

              <h2 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors mb-3 leading-snug">
                {w.title}
              </h2>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Stage {Math.min(done, 5)}/5 completed</span>
                  <span className={cn('font-semibold', pct >= 100 ? 'text-emerald-400' : 'text-gray-400')}>
                    {pct}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-700 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      pct >= 100 ? 'bg-emerald-500' : 'bg-indigo-500',
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
