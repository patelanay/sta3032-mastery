'use client';

import { useState } from 'react';
import type { FormulaItem } from '@/types';
import { KatexRenderer } from '@/components/ui/KatexRenderer';
import { FlagButton } from '@/components/ui/FlagButton';
import { FormulaSheetBadge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface ActiveRecallFormulaCardProps {
  formula: FormulaItem;
}

export function ActiveRecallFormulaCard({ formula }: { formula: FormulaItem }) {
  const [activeRecallMode, setActiveRecallMode] = useState<boolean>(true);
  const [userGuess, setUserGuess] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden shadow-sm transition-all hover:border-gray-700">
      {/* Title bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950/60">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-base font-bold text-white">{formula.title}</span>
          <FormulaSheetBadge onExam3Sheet={formula.onExam3Sheet} />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveRecallMode(!activeRecallMode);
              setRevealed(false);
            }}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border',
              activeRecallMode
                ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
            )}
            title="Toggle between Retrieval Testing Mode and Review Mode"
          >
            {activeRecallMode ? '🧠 Test-First Mode ON' : '📖 Review Mode'}
          </button>

          <FlagButton
            itemId={formula.id}
            title={formula.title}
            content={formula.whenToUse}
            side={formula.module >= 5 ? 'B' : 'A'}
            priority="must-have"
          />
        </div>
      </div>

      <div className="p-4.5 space-y-4">
        {/* Active Recall / Retrieval Challenge */}
        {activeRecallMode && !revealed ? (
          <div className="rounded-xl bg-indigo-950/40 border border-indigo-800/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                ⚡ Active Retrieval Challenge (Dunlosky Testing Effect)
              </span>
              <span className="text-[10px] text-gray-400">Do not read passively!</span>
            </div>

            <p className="text-xs text-gray-200 font-medium">
              Without looking at your notes: <strong className="text-amber-300">Under what exact scenario/conditions do you apply this test, and what is its #1 trap?</strong>
            </p>

            <textarea
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              placeholder="State the data conditions, when to choose this over alternatives, and the fatal exam trap..."
              rows={2}
              className="w-full rounded-lg bg-gray-950 border border-gray-800 p-2.5 text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
            />

            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              Verify My Retrieval Against Master Decision Rules →
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {activeRecallMode && (
              <div className="flex items-center justify-between pb-1 border-b border-gray-800/80">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  ✓ Verified Decision Rules &amp; Application Guide
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRevealed(false);
                    setUserGuess('');
                  }}
                  className="text-[11px] text-gray-400 hover:text-indigo-400 underline"
                >
                  Test Myself Again
                </button>
              </div>
            )}

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
                  ✓ Conditions / Assumptions Checklist
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
                  ↔ vs Alternative (Elaborative Contrast)
                </p>
                <p className="text-xs text-blue-200">{formula.vsAlternative}</p>
              </div>
            )}

            {/* Common Trap */}
            <div className="rounded-lg bg-amber-950/40 border border-amber-700/60 px-3.5 py-2.5">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
                ⚠️ Common Exam Trap
              </p>
              <p className="text-xs text-amber-200">{formula.commonTrap}</p>
            </div>
          </div>
        )}

        {/* Collapsible formula */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowFormula(!showFormula)}
            className="text-xs text-gray-500 hover:text-gray-300 underline"
          >
            {showFormula ? '▲ Hide math equation' : '▼ Show formula (already on your printed sheet)'}
          </button>
          {showFormula && (
            <div className="mt-2.5 rounded-lg bg-gray-950 border border-gray-800 p-3 overflow-x-auto text-center">
              <KatexRenderer latex={formula.latex} display={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
