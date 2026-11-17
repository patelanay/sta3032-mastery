'use client';

import { useState, useEffect } from 'react';
import { getAppState, removeNoteSheetEntry, saveAppState, exportStateJSON, importStateJSON, addNoteSheetEntry } from '@/lib/storage';
import { KatexRenderer } from '@/components/ui/KatexRenderer';
import { cn } from '@/lib/utils';
import type { NoteSheetEntry } from '@/types';

type Priority = 'must-have' | 'trap' | 'proof' | 'example';

const PRIORITY_BADGES: Record<Priority, { label: string; color: string }> = {
  'must-have': { label: '⭐ Must Have', color: 'bg-rose-950 text-rose-300 border-rose-700' },
  trap: { label: '⚠️ Trap', color: 'bg-amber-950 text-amber-300 border-amber-700' },
  proof: { label: '📐 Proof', color: 'bg-purple-950 text-purple-300 border-purple-700' },
  example: { label: '💡 Example', color: 'bg-blue-950 text-blue-300 border-blue-700' },
};

// Essential formulas missing from the Exam 3 provided formula sheet that must be on the note sheet
const RECOMMENDED_EXAM_PREP_ITEMS: Array<{
  id: string;
  side: 'A' | 'B';
  priority: Priority;
  title: string;
  latex: string;
  vars: string;
  trap: string;
}> = [
  {
    id: 'rec-01',
    side: 'A',
    priority: 'must-have',
    title: 'Welch Two-Sample t-test & Satterthwaite Degrees of Freedom',
    latex: 't = \\frac{\\bar{x}_1 - \\bar{x}_2}{\\sqrt{s_1^2/n_1 + s_2^2/n_2}}, \\quad \\nu = \\frac{\\left(\\frac{s_1^2}{n_1} + \\frac{s_2^2}{n_2}\\right)^2}{\\frac{(s_1^2/n_1)^2}{n_1-1} + \\frac{(s_2^2/n_2)^2}{n_2-1}}',
    vars: 'x̄₁, x̄₂ = sample means, s₁², s₂² = sample variances, n₁, n₂ = sample sizes. Round ν DOWN.',
    trap: 'Exam 3 sheet does NOT include Welch t! When variances differ (s₁/s₂ > 2), this is the mandatory test.',
  },
  {
    id: 'rec-02',
    side: 'A',
    priority: 'trap',
    title: "Bayes' Rule with Law of Total Probability",
    latex: 'P(B_j \\mid A) = \\frac{P(A \\mid B_j)P(B_j)}{\\sum_{i=1}^k P(A \\mid B_i)P(B_i)}',
    vars: 'P(B_j) = prior probability, P(A|B_j) = likelihood / sensitivity, P(B_j|A) = posterior probability.',
    trap: 'Do not confuse P(A|B) with P(B|A). Rare disease base rate makes posterior much lower than test sensitivity!',
  },
  {
    id: 'rec-03',
    side: 'A',
    priority: 'must-have',
    title: 'Chi-Square Test for Population Variance σ²',
    latex: '\\chi^2 = \\frac{(n-1)s^2}{\\sigma_0^2} \\sim \\chi^2_{n-1}, \\quad 100(1-\\alpha)\\% \\text{ CI: } \\left(\\frac{(n-1)s^2}{\\chi^2_{\\alpha/2, n-1}}, \\frac{(n-1)s^2}{\\chi^2_{1-\\alpha/2, n-1}}\\right)',
    vars: 's² = sample variance, σ₀² = hypothesized variance, df = n - 1.',
    trap: 'Notice the swap in denominators! Larger critical value χ²_{α/2} is the LOWER bound denominator.',
  },
  {
    id: 'rec-04',
    side: 'A',
    priority: 'must-have',
    title: 'Large-Sample Two-Proportion Test & CI (p₁ - p₂)',
    latex: 'z = \\frac{\\hat{p}_1 - \\hat{p}_2}{\\sqrt{\\hat{p}(1-\\hat{p})(1/n_1 + 1/n_2)}}, \\quad \\hat{p} = \\frac{x_1 + x_2}{n_1 + n_2}',
    vars: 'p̂ = pooled proportion (ONLY for testing H₀: p₁ = p₂). For CI, use unpooled standard errors.',
    trap: 'For CI: SE = √(p̂₁(1-p̂₁)/n₁ + p̂₂(1-p̂₂)/n₂). For hypothesis test: use pooled p̂!',
  },
  {
    id: 'rec-05',
    side: 'B',
    priority: 'must-have',
    title: 'Partial F-test for Subset of MLR Predictors',
    latex: 'F = \\frac{(SSE_{Red} - SSE_{Full}) / q}{MSE_{Full}} = \\frac{(SSR_{Full} - SSR_{Red}) / q}{MSE_{Full}} \\sim F_{q, n-k-1}',
    vars: 'q = number of predictors dropped in reduced model, k = total predictors in full model, n = sample size.',
    trap: 'NOT on Exam 3 sheet! Tests H₀: β_{g+1} = ... = β_k = 0 simultaneously. Cannot be replaced by individual t-tests.',
  },
  {
    id: 'rec-06',
    side: 'B',
    priority: 'must-have',
    title: 'Adjusted R² & AIC Model Selection Criteria',
    latex: 'R^2_{adj} = 1 - \\frac{n-1}{n-k-1}(1-R^2), \\quad AIC = n \\ln\\left(\\frac{SSE}{n}\\right) + 2(k+1)',
    vars: 'k = number of slope predictors, n = sample size, SSE = error sum of squares. Lower AIC is better!',
    trap: 'Adding variables ALWAYS increases R², but only increases R²_adj if Partial F > 1.',
  },
  {
    id: 'rec-07',
    side: 'B',
    priority: 'must-have',
    title: 'CRD One-Way ANOVA Complete Table Formulas',
    latex: 'SS_{Trt} = \\sum n_i(\\bar{y}_i - \\bar{y})^2, \\quad SSE = \\sum(n_i-1)s_i^2, \\quad F = \\frac{MS_{Trt}}{MSE} = \\frac{SS_{Trt}/(k-1)}{SSE/(N-k)}',
    vars: 'k = number of groups, N = total observations across all groups, df_Trt = k-1, df_Error = N-k.',
    trap: 'ANOVA table structure is NOT on the Exam 3 sheet! You must bring df, SS, MS, and F definitions.',
  },
  {
    id: 'rec-08',
    side: 'B',
    priority: 'must-have',
    title: 'Tukey HSD Post-Hoc Minimum Significant Difference',
    latex: 'HSD = q_{\\alpha, k, N-k} \\sqrt{\\frac{MSE}{n}}',
    vars: 'q = studentized range table value, k = number of treatments, N - k = error df, n = group size.',
    trap: 'Only valid after omnibus ANOVA rejects H₀. If |ȳ_i - ȳ_j| > HSD, group means differ significantly.',
  },
  {
    id: 'rec-09',
    side: 'B',
    priority: 'must-have',
    title: 'Randomized Complete Block Design (RCBD) ANOVA',
    latex: 'SST = SS_{Trt} + SS_{Bl} + SSE, \\quad df: (k-1), (b-1), (k-1)(b-1), \\quad F_{Trt} = \\frac{MS_{Trt}}{MSE}',
    vars: 'k = treatments, b = blocks. df_Trt = k-1, df_Bl = b-1, df_Error = (k-1)(b-1), df_Total = bk - 1.',
    trap: 'Notice that MSE denominator df is (k-1)(b-1), which is smaller than in CRD! Blocking removes block variation.',
  },
  {
    id: 'rec-10',
    side: 'B',
    priority: 'proof',
    title: 'Centering Invariance & Proof Identities (Q4–Q7)',
    latex: 'Z = X - \\bar{x} \\implies a_1 = b_1, \\quad a_0 = \\bar{y}, \\quad SSR = b_1^2 SS_{xx}, \\quad R^2 = r^2',
    vars: 'b₁ = r(s_y/s_x). Centering shifts the intercept to ȳ but leaves slope, residuals, and R² invariant.',
    trap: 'Key for proof problems: ∑(x_i - x̄) = 0 and Cov(Ȳ, β̂₁) = 0.',
  },
];

export default function NoteSheetStudioPage() {
  const [entries, setEntries] = useState<NoteSheetEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'cheat-sheet'>('cheat-sheet');

  const loadEntries = () => {
    const state = getAppState();
    setEntries(state.noteSheet ?? []);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleRemove = (itemId: string) => {
    removeNoteSheetEntry(itemId);
    loadEntries();
  };

  const handleNoteChange = (itemId: string, note: string) => {
    const state = getAppState();
    const idx = state.noteSheet.findIndex((n) => n.itemId === itemId);
    if (idx !== -1) {
      state.noteSheet[idx].customNote = note;
      saveAppState(state);
      setEntries([...state.noteSheet]);
    }
  };

  const handleAddRecommendedToSheet = (rec: typeof RECOMMENDED_EXAM_PREP_ITEMS[0]) => {
    const newEntry: NoteSheetEntry = {
      itemId: rec.id,
      side: rec.side,
      priority: rec.priority,
      title: rec.title,
      latex: rec.latex,
      content: `${rec.vars} | Trap: ${rec.trap}`,
      customNote: rec.trap,
      masteryStreak: 0,
      archived: false,
    };
    addNoteSheetEntry(newEntry);
    loadEntries();
  };

  const handleAddAllRecommended = () => {
    RECOMMENDED_EXAM_PREP_ITEMS.forEach((rec) => {
      addNoteSheetEntry({
        itemId: rec.id,
        side: rec.side,
        priority: rec.priority,
        title: rec.title,
        latex: rec.latex,
        content: `${rec.vars} | Trap: ${rec.trap}`,
        customNote: rec.trap,
        masteryStreak: 0,
        archived: false,
      });
    });
    loadEntries();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const json = exportStateJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sta3032-notesheet-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        importStateJSON(text);
        loadEntries();
      } catch (err) {
        alert('Failed to import JSON state.');
      }
    };
    reader.readAsText(file);
  };

  const sideA = entries.filter((e) => e.side === 'A' && !e.archived);
  const sideB = entries.filter((e) => e.side === 'B' && !e.archived);

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">📝 Exam Cheat Sheet & Note Sheet Studio</h1>
          <p className="text-gray-400 text-sm">
            UF STA3032 allows <strong className="text-white">one double-sided note sheet</strong>. Below is your master cheat sheet of everything missing from the Exam 3 formula sheet.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>🖨️</span>
            <span>Print 2-Column Note Sheet</span>
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 rounded-xl text-xs transition-colors"
          >
            Export JSON
          </button>
          <label className="px-3 py-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 rounded-xl text-xs transition-colors cursor-pointer">
            Import JSON
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveTab('cheat-sheet')}
          className={cn(
            'py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border text-center',
            activeTab === 'cheat-sheet'
              ? 'bg-amber-950/70 border-amber-500 text-amber-200 shadow-lg shadow-amber-500/10'
              : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white',
          )}
        >
          <span>⭐ Master Exam Cheat Sheet</span>
          <span className="block text-[10px] text-amber-400/80 font-mono mt-0.5">Missing Formulas & Variables</span>
        </button>

        <button
          onClick={() => setActiveTab('A')}
          className={cn(
            'py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border text-center',
            activeTab === 'A'
              ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
              : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white',
          )}
        >
          <span>Side A: Modules 1–4</span>
          <span className="block text-[10px] text-indigo-400 font-mono mt-0.5">({sideA.length} items flagged)</span>
        </button>

        <button
          onClick={() => setActiveTab('B')}
          className={cn(
            'py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border text-center',
            activeTab === 'B'
              ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
              : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white',
          )}
        >
          <span>Side B: Modules 5–6 & Proofs</span>
          <span className="block text-[10px] text-indigo-400 font-mono mt-0.5">({sideB.length} items flagged)</span>
        </button>
      </div>

      {/* ── TAB 1: MASTER EXAM CHEAT SHEET ── */}
      {activeTab === 'cheat-sheet' && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-950/40 border border-amber-700/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div>
              <h2 className="text-sm font-bold text-amber-300">
                🚨 Formula Sheet Gap Analysis (What You MUST Bring on Your Note Sheet)
              </h2>
              <p className="text-xs text-amber-200/90 mt-1">
                The provided Exam 3 formula sheet ONLY includes basic SLR and the MLR sum-of-squares identity. Below is the curated list of 10 essential formulas, variable definitions, and trap warnings to put on your 1-page double-sided sheet.
              </p>
            </div>
            <button
              onClick={handleAddAllRecommended}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-colors shadow-sm whitespace-nowrap self-start sm:self-auto"
            >
              + Add All to My Note Sheet
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RECOMMENDED_EXAM_PREP_ITEMS.map((rec) => {
              const alreadyAdded = entries.some((e) => e.itemId === rec.id);

              return (
                <div
                  key={rec.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3 hover:border-gray-700 transition-colors shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                        Target Side {rec.side}
                      </span>
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-bold border', PRIORITY_BADGES[rec.priority].color)}>
                        {PRIORITY_BADGES[rec.priority].label}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{rec.title}</h3>

                    <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl overflow-x-auto text-center">
                      <KatexRenderer latex={rec.latex} display={true} />
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="text-gray-300">
                        <strong className="text-indigo-400">Variables:</strong> {rec.vars}
                      </p>
                      <p className="text-amber-300/90 bg-amber-950/30 p-2 rounded-lg border border-amber-900/40">
                        <strong className="text-amber-400">Exam Trap:</strong> {rec.trap}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">
                      {alreadyAdded ? '✓ Added to your note sheet' : 'Not yet added'}
                    </span>
                    <button
                      onClick={() => handleAddRecommendedToSheet(rec)}
                      disabled={alreadyAdded}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                        alreadyAdded
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white',
                      )}
                    >
                      {alreadyAdded ? 'Added ✓' : '+ Add to Sheet'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2 & 3: ACTIVE SIDE A OR B LIST ── */}
      {(activeTab === 'A' || activeTab === 'B') && (
        <div className="space-y-4">
          {(activeTab === 'A' ? sideA : sideB).length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center space-y-3">
              <p className="text-gray-400 text-base">
                No custom items flagged for Side {activeTab} yet.
              </p>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Check the <button onClick={() => setActiveTab('cheat-sheet')} className="text-amber-400 underline font-semibold">Master Exam Cheat Sheet</button> tab to add essential missing formulas with 1 click, or click 🔖 anywhere in the app!
              </p>
            </div>
          ) : (
            (activeTab === 'A' ? sideA : sideB).map((entry) => {
              const priorityBadge = PRIORITY_BADGES[entry.priority] ?? PRIORITY_BADGES['must-have'];

              return (
                <div
                  key={entry.itemId}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3 hover:border-gray-700 transition-colors shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          'text-xs font-semibold px-2 py-0.5 rounded-full border',
                          priorityBadge.color,
                        )}
                      >
                        {priorityBadge.label}
                      </span>
                      <h3 className="text-base font-bold text-white">{entry.title}</h3>
                    </div>
                    <button
                      onClick={() => handleRemove(entry.itemId)}
                      className="text-xs text-gray-500 hover:text-rose-400 transition-colors"
                    >
                      Remove ✕
                    </button>
                  </div>

                  {entry.latex && (
                    <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl overflow-x-auto text-center">
                      <KatexRenderer latex={entry.latex} display={true} />
                    </div>
                  )}

                  {entry.content && entry.content !== entry.title && (
                    <p className="text-xs text-gray-300 leading-relaxed bg-gray-950/60 p-3 rounded-lg border border-gray-800">
                      {entry.content}
                    </p>
                  )}

                  <div>
                    <textarea
                      value={entry.customNote ?? ''}
                      onChange={(e) => handleNoteChange(entry.itemId, e.target.value)}
                      placeholder="Personal reminder / trap warning..."
                      rows={1}
                      className="w-full text-xs bg-gray-950 border border-gray-800 rounded-lg p-2 text-amber-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Hidden Print Container for Clean 2-Page Double-Sided PDF */}
      <div id="note-sheet-print" className="hidden">
        <div style={{ pageBreakAfter: 'always', padding: '12mm' }}>
          <h1 style={{ fontSize: '13pt', fontWeight: 'bold', marginBottom: '3mm', borderBottom: '1px solid #000', paddingBottom: '2mm' }}>
            STA3032 Final Exam Note Sheet — Side A (Modules 1–4: Probability & Inference)
          </h1>
          <div className="note-sheet-columns">
            {sideA.map((e) => (
              <div key={e.itemId} style={{ breakInside: 'avoid', marginBottom: '4mm', border: '1px solid #ccc', padding: '2mm', borderRadius: '2mm' }}>
                <strong style={{ fontSize: '9pt' }}>{e.title}</strong>
                {e.latex && <div style={{ fontSize: '8.5pt', margin: '1mm 0' }}>{e.latex}</div>}
                {e.content && e.content !== e.title && <div style={{ fontSize: '8pt', color: '#333' }}>{e.content}</div>}
                {e.customNote && <div style={{ fontSize: '8pt', color: '#b45309', fontWeight: 'bold' }}>Trap: {e.customNote}</div>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '12mm' }}>
          <h1 style={{ fontSize: '13pt', fontWeight: 'bold', marginBottom: '3mm', borderBottom: '1px solid #000', paddingBottom: '2mm' }}>
            STA3032 Final Exam Note Sheet — Side B (Modules 5–6: Regression, ANOVA & Q4–Q7 Proofs)
          </h1>
          <div className="note-sheet-columns">
            {sideB.map((e) => (
              <div key={e.itemId} style={{ breakInside: 'avoid', marginBottom: '4mm', border: '1px solid #ccc', padding: '2mm', borderRadius: '2mm' }}>
                <strong style={{ fontSize: '9pt' }}>{e.title}</strong>
                {e.latex && <div style={{ fontSize: '8.5pt', margin: '1mm 0' }}>{e.latex}</div>}
                {e.content && e.content !== e.title && <div style={{ fontSize: '8pt', color: '#333' }}>{e.content}</div>}
                {e.customNote && <div style={{ fontSize: '8pt', color: '#b45309', fontWeight: 'bold' }}>Trap: {e.customNote}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
