'use client';

import { useState } from 'react';

export function ActiveRecallLearningBanner() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="rounded-2xl border border-indigo-900/60 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-gray-900 p-5 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl">
            🧠
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Cognitive Science Protocol: Active Retrieval Over Passive Reading</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900 text-indigo-300 font-semibold border border-indigo-700">
                Dunlosky et al.
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Rereading notes creates an <em>&quot;illusion of competence&quot;</em>. This studio incorporates 4 cognitive mechanisms to ensure durable retention:
            </p>
          </div>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xs text-indigo-400 hover:text-indigo-300 whitespace-nowrap self-start"
        >
          {collapsed ? 'View Methods ↓' : 'Hide ↑'}
        </button>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-indigo-900/40">
          <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-800">
            <span className="text-xs font-bold text-indigo-400 block mb-1">
              1. Testing Effect
            </span>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Every topic checklist and formula card requires you to retrieve conditions from memory <em>before</em> seeing the answer.
            </p>
          </div>

          <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-800">
            <span className="text-xs font-bold text-purple-400 block mb-1">
              2. Elaborative Interrogation
            </span>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Click &quot;Active Retrieval Drill&quot; to answer <em>why</em> a formula works and what mathematical assumption protects it.
            </p>
          </div>

          <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-800">
            <span className="text-xs font-bold text-emerald-400 block mb-1">
              3. The Feynman Technique
            </span>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Translate complex statistics into jargon-free, plain-English explanations to uncover blind spots.
            </p>
          </div>

          <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-800">
            <span className="text-xs font-bold text-amber-400 block mb-1">
              4. Interleaved Retrieval
            </span>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Test your ability to discriminate between competing tests (e.g. Welch vs Pooled vs Paired) under randomized prompts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
