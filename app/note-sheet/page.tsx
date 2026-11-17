'use client';

import { useState, useEffect } from 'react';
import { getAppState, removeNoteSheetEntry, saveAppState, exportStateJSON, importStateJSON } from '@/lib/storage';
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

export default function NoteSheetStudioPage() {
  const [entries, setEntries] = useState<NoteSheetEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'A' | 'B'>('A');

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
          <h1 className="text-3xl font-bold text-white mb-1">📝 Two-Sided Note Sheet Studio</h1>
          <p className="text-gray-400 text-sm">
            UF STA3032 allows <strong className="text-white">one double-sided note sheet</strong>. Build your perfect Side A & Side B.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>🖨️</span>
            <span>Print Sheet (2-Column PDF)</span>
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

      {/* Side Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('A')}
          className={cn(
            'flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border text-center',
            activeTab === 'A'
              ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
              : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white',
          )}
        >
          <span>Side A: Modules 1–4 + Foundations</span>
          <span className="ml-2 text-xs opacity-75 font-mono">({sideA.length} items)</span>
        </button>
        <button
          onClick={() => setActiveTab('B')}
          className={cn(
            'flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border text-center',
            activeTab === 'B'
              ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
              : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white',
          )}
        >
          <span>Side B: Modules 5–6 Regression & Proofs</span>
          <span className="ml-2 text-xs opacity-75 font-mono">({sideB.length} items)</span>
        </button>
      </div>

      {/* Active Side Items */}
      <div className="space-y-4">
        {(activeTab === 'A' ? sideA : sideB).length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center space-y-3">
            <p className="text-gray-400 text-base">
              No items flagged for Side {activeTab} yet.
            </p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Click the bookmark icon (🔖) next to any formula, scenario, proof, or walkthrough step throughout the app to send it directly here.
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

      {/* Hidden Print Container */}
      <div id="note-sheet-print" className="hidden">
        <div style={{ pageBreakAfter: 'always', padding: '15mm' }}>
          <h1 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '4mm' }}>
            STA3032 Final Exam Note Sheet — Side A (Modules 1–4)
          </h1>
          <div className="note-sheet-columns">
            {sideA.map((e) => (
              <div key={e.itemId} style={{ breakInside: 'avoid', marginBottom: '3mm' }}>
                <strong>{e.title}</strong>
                {e.latex && <div>{e.latex}</div>}
                {e.customNote && <div style={{ fontStyle: 'italic', color: '#555' }}>Note: {e.customNote}</div>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '15mm' }}>
          <h1 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '4mm' }}>
            STA3032 Final Exam Note Sheet — Side B (Modules 5–6 & Proofs)
          </h1>
          <div className="note-sheet-columns">
            {sideB.map((e) => (
              <div key={e.itemId} style={{ breakInside: 'avoid', marginBottom: '3mm' }}>
                <strong>{e.title}</strong>
                {e.latex && <div>{e.latex}</div>}
                {e.customNote && <div style={{ fontStyle: 'italic', color: '#555' }}>Note: {e.customNote}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
