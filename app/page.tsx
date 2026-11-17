'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn, msUntilExam, daysUntilExam } from '@/lib/utils';
import { getAppState } from '@/lib/storage';
import type { ModuleProgress } from '@/types';

// ── Countdown ──────────────────────────────────────────────────────────────

function useCountdown() {
  const [ms, setMs] = useState(msUntilExam());

  useEffect(() => {
    const id = setInterval(() => setMs(msUntilExam()), 1000);
    return () => clearInterval(id);
  }, []);

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-gray-800/80 border border-gray-700 rounded-xl px-5 py-3 min-w-[72px]">
      <span className="text-3xl font-black text-primary-300 tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">{label}</span>
    </div>
  );
}

// ── Module data ─────────────────────────────────────────────────────────────

const MODULE_META: {
  num: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  topics: number;
  color: string;
  barColor: string;
}[] = [
  { num: 1, title: 'Probability & Combinatorics', topics: 8, color: 'text-primary-300', barColor: 'bg-primary-500' },
  { num: 2, title: 'Discrete & Continuous Distributions', topics: 10, color: 'text-purple-300', barColor: 'bg-purple-500' },
  { num: 3, title: 'Point & Interval Estimation', topics: 7, color: 'text-cyan-300', barColor: 'bg-cyan-500' },
  { num: 4, title: 'Hypothesis Testing', topics: 12, color: 'text-warn-300', barColor: 'bg-warn-500' },
  { num: 5, title: 'Simple Linear Regression', topics: 9, color: 'text-danger-300', barColor: 'bg-danger-500' },
  { num: 6, title: 'ANOVA', topics: 6, color: 'text-accent-300', barColor: 'bg-accent-500' },
];

// ── Feature cards ───────────────────────────────────────────────────────────

const FEATURES = [
  {
    href: '/module-explorer',
    icon: '🗺️',
    title: 'Module Explorer',
    desc: 'Browse all formulas with WHEN/WHY context. Flag anything for your note sheet.',
    color: 'border-primary-800 hover:border-primary-600',
  },
  {
    href: '/scenarios',
    icon: '🎯',
    title: 'Scenario Recognition',
    desc: 'Read a paragraph. Pick the right test. Train pattern recognition under pressure.',
    color: 'border-purple-800 hover:border-purple-600',
  },
  {
    href: '/walkthroughs',
    icon: '🪜',
    title: 'Step-by-Step Walkthroughs',
    desc: '5-stage guided problem solving: context → hypotheses → assumptions → compute → interpret.',
    color: 'border-cyan-800 hover:border-cyan-600',
  },
  {
    href: '/cloze',
    icon: '🧩',
    title: 'Cloze Exercises',
    desc: 'Fill in decision trees, ANOVA tables, and assumption checks. Active recall, not reading.',
    color: 'border-warn-800 hover:border-warn-600',
  },
  {
    href: '/flashcards',
    icon: '🃏',
    title: 'SM-2 Flashcards',
    desc: 'Spaced-repetition cards focused on scenario identification and test selection.',
    color: 'border-pink-800 hover:border-pink-600',
  },
  {
    href: '/note-sheet',
    icon: '📋',
    title: 'Smart Note Sheet',
    desc: 'Build and print your one double-sided note sheet. Organized by priority and side.',
    color: 'border-accent-800 hover:border-accent-600',
  },
  {
    href: '/derivation-dojo',
    icon: '📐',
    title: 'Derivation Dojo',
    desc: 'Master the 8 Q4-Q7 proof patterns (40% of exam). Drag-to-order or step-by-step reveal.',
    color: 'border-danger-800 hover:border-danger-600',
  },
  {
    href: '/exam-simulator',
    icon: '📝',
    title: 'Exam Simulator',
    desc: '2-hour timed practice finals with self-grading. Mistakes auto-feed your Weak Spot journal.',
    color: 'border-indigo-800 hover:border-indigo-600',
  },
];

// ── Main page ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const { days, hours, minutes, seconds } = useCountdown();
  const [moduleProgress, setModuleProgress] = useState<Record<number, ModuleProgress>>({});

  useEffect(() => {
    const state = getAppState();
    const rawProg = state.moduleProgress ?? {};
    const formatted: Record<number, ModuleProgress> = {};
    for (let i = 1; i <= 6; i++) {
      const done = (rawProg[`mod${i}`] as number) ?? 0;
      formatted[i] = {
        moduleNum: i as 1 | 2 | 3 | 4 | 5 | 6,
        topicsCompleted: done,
        totalTopics: MODULE_META[i - 1]?.topics ?? 5,
      };
    }
    setModuleProgress(formatted);
  }, []);

  const days2 = daysUntilExam();
  const urgent = days2 <= 7;
  const warning = days2 <= 14 && days2 > 7;

  return (
    <div className="flex flex-col items-center w-full px-4 py-10 gap-12 max-w-6xl mx-auto">

      {/* ── Hero ── */}
      <section className="text-center space-y-4 w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-900/40 border border-primary-800 text-primary-400 text-xs font-semibold uppercase tracking-widest">
          Final Exam · Dec 8, 2026 · 10:00 AM EST
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
          STA3032 Final Exam{' '}
          <span className="text-primary-400">Mastery Studio</span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          You have the formula sheets.{' '}
          <span className="text-white font-semibold">
            This app trains you to know WHEN and WHY to use them.
          </span>
        </p>

        {/* Countdown */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <CountdownUnit value={days} label="days" />
          <CountdownUnit value={hours} label="hrs" />
          <CountdownUnit value={minutes} label="min" />
          <CountdownUnit value={seconds} label="sec" />
        </div>

        {urgent && (
          <p className="text-danger-400 font-bold animate-pulse text-sm">
            🚨 Final stretch — focus on weak spots and proof patterns!
          </p>
        )}
        {warning && !urgent && (
          <p className="text-warn-400 font-semibold text-sm">
            ⚡ Two weeks out — now is the time to drill scenarios.
          </p>
        )}

        {/* CTA */}
        <div className="pt-2">
          <Link
            href="/weak-spot?warmup=true"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary-900/40 text-base"
          >
            🔥 Start Daily Warmup
          </Link>
        </div>
      </section>

      {/* ── Module Progress ── */}
      <section className="w-full space-y-4">
        <h2 className="text-xl font-bold text-gray-200">📊 Module Progress</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULE_META.map((m) => {
            const progress = moduleProgress[m.num];
            const completed = progress?.topicsCompleted ?? 0;
            const total = progress?.totalTopics ?? m.topics;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            return (
              <Link
                key={m.num}
                href={`/module-explorer?module=${m.num}`}
                className="group bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={cn('text-sm font-semibold', m.color)}>
                    Module {m.num}
                  </span>
                  <span className="text-xs text-gray-500">{completed}/{total} topics</span>
                </div>
                <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  {m.title}
                </p>
                {/* Progress bar */}
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', m.barColor)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{pct}% complete</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="w-full space-y-4">
        <h2 className="text-xl font-bold text-gray-200">🛠️ Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className={cn(
                'group bg-gray-900 border rounded-xl p-5 transition-all space-y-2 hover:bg-gray-800/60',
                f.color,
              )}
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
                {f.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
