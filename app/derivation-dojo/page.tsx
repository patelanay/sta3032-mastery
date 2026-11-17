'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { derivations } from '@/data/derivations';
import { addNoteSheetEntry } from '@/lib/storage';
import { generateId, cn } from '@/lib/utils';
import { KatexRenderer } from '@/components/ui/KatexRenderer';
import type { DerivationProof, ProofStep } from '@/types';

// ───────── Difficulty mapping ─────────
const DIFFICULTY: Record<number, { label: string; color: string }> = {
  1: { label: 'Medium', color: 'bg-yellow-700 text-yellow-100' },
  2: { label: 'Hard', color: 'bg-orange-700 text-orange-100' },
  3: { label: 'Hard', color: 'bg-orange-700 text-orange-100' },
  4: { label: 'Medium', color: 'bg-yellow-700 text-yellow-100' },
  5: { label: 'Hard', color: 'bg-orange-700 text-orange-100' },
  6: { label: 'Medium', color: 'bg-yellow-700 text-yellow-100' },
  7: { label: 'Hard', color: 'bg-orange-700 text-orange-100' },
  8: { label: 'Hard', color: 'bg-orange-700 text-orange-100' },
};

// ───────── Sortable Step ─────────
function SortableStep({
  step,
  index,
  status,
}: {
  step: ProofStep;
  index: number;
  status: 'default' | 'correct' | 'wrong';
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'p-4 rounded-xl border cursor-grab active:cursor-grabbing select-none transition-colors',
        status === 'correct' && 'border-emerald-600 bg-emerald-900/30',
        status === 'wrong' && 'border-rose-600 bg-rose-900/30',
        status === 'default' && 'border-gray-700 bg-gray-800/60 hover:border-gray-500',
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-sm font-mono text-gray-500 shrink-0">
          {status === 'correct' ? '✓' : status === 'wrong' ? '✗' : `${index + 1}.`}
        </span>
        <div className="space-y-2">
          <p className="text-gray-200 text-sm">{step.content}</p>
          {step.latex && (
            <div className="text-gray-300">
              <KatexRenderer math={step.latex} display />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ───────── Step Ordering Mode ─────────
function StepOrderingMode({ proof }: { proof: DerivationProof }) {
  const [items, setItems] = useState<ProofStep[]>(() => {
    const shuffled = [...proof.steps];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [statuses, setStatuses] = useState<('default' | 'correct' | 'wrong')[]>(
    () => proof.steps.map(() => 'default')
  );
  const [checked, setChecked] = useState(false);
  const [mastered, setMastered] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems(prev => {
      const oldIdx = prev.findIndex(s => s.id === active.id);
      const newIdx = prev.findIndex(s => s.id === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
    setStatuses(proof.steps.map(() => 'default'));
    setChecked(false);
  }

  function checkOrder() {
    const newStatuses = items.map((step, idx) =>
      step.id === proof.steps[idx].id ? 'correct' : 'wrong'
    );
    setStatuses(newStatuses as ('correct' | 'wrong')[]);
    setChecked(true);
    if (newStatuses.every(s => s === 'correct')) setMastered(true);
  }

  function revealOrder() {
    setItems([...proof.steps]);
    setStatuses(proof.steps.map(() => 'correct'));
    setChecked(true);
    setMastered(true);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        Drag the steps into the correct proof order, then click <strong className="text-gray-200">Check Order</strong>.
      </p>

      {mastered && (
        <div className="p-4 bg-emerald-900/30 border border-emerald-700 rounded-xl text-center">
          <span className="text-2xl">⭐</span>
          <p className="text-emerald-400 font-bold mt-1">✓ Proof mastered!</p>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((step, idx) => (
              <SortableStep key={step.id} step={step} index={idx} status={statuses[idx]} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex gap-3">
        <button
          onClick={checkOrder}
          className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
        >
          Check Order
        </button>
        <button
          onClick={revealOrder}
          className="px-4 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors"
        >
          Reveal Correct Order
        </button>
      </div>

      {checked && !mastered && (
        <p className="text-sm text-rose-400 text-center">
          Some steps are out of order. Try again or reveal the correct order.
        </p>
      )}
    </div>
  );
}

// ───────── Step-by-Step Reveal Mode ─────────
function StepRevealMode({ proof }: { proof: DerivationProof }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [mastered, setMastered] = useState(false);
  const step = proof.steps[currentStep];

  function handleFlag() {
    addNoteSheetEntry({
      itemId: proof.id,
      side: 'B',
      priority: 'proof',
      title: proof.title,
      content: proof.description,
      customNote: '',
      masteryStreak: 0,
      archived: false,
    });
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Step {currentStep + 1} of {proof.steps.length}</span>
          {mastered && <span className="text-emerald-400 font-semibold">✓ Proof mastered! ⭐</span>}
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${((currentStep + 1) / proof.steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step card */}
      <div className="bg-gray-800/60 border border-indigo-700/40 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-indigo-700 rounded-full text-white text-sm font-bold flex items-center justify-center shrink-0">
            {currentStep + 1}
          </span>
          <p className="text-gray-200 font-medium">{step.content}</p>
        </div>
        {step.latex && (
          <div className="bg-gray-900/60 rounded-lg p-4">
            <KatexRenderer math={step.latex} display />
          </div>
        )}
        <div className="pt-2 border-t border-gray-700">
          <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wide mb-1">Why this step:</p>
          <p className="text-sm text-gray-300 leading-relaxed">{step.explanation}</p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentStep(i => Math.max(0, i - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-gray-200 font-medium transition-colors"
        >
          ← Previous Step
        </button>
        <div className="flex-1" />
        <button
          onClick={handleFlag}
          className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-amber-700/40 text-amber-400 font-medium transition-colors border border-amber-700/30"
        >
          🔖 Flag proof
        </button>
        {currentStep < proof.steps.length - 1 ? (
          <button
            onClick={() => setCurrentStep(i => i + 1)}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
          >
            Next Step →
          </button>
        ) : (
          <button
            onClick={() => setMastered(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
          >
            ✓ Mark Mastered
          </button>
        )}
      </div>
    </div>
  );
}

// ───────── Proof Trainer Panel ─────────
function ProofTrainer({ proof, onClose }: { proof: DerivationProof; onClose: () => void }) {
  const [mode, setMode] = useState<'ordering' | 'reveal'>('ordering');

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-purple-800 text-purple-200 px-2 py-0.5 rounded-full font-medium">
                Pattern {proof.pattern}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">{proof.title}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{proof.description}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl ml-4 shrink-0">✕</button>
        </div>

        {/* Mode tabs */}
        <div className="px-6 py-3 border-b border-gray-800 flex gap-1">
          {(['ordering', 'reveal'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                mode === m ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'
              )}
            >
              {m === 'ordering' ? '⇅ Step Ordering' : '👁 Step-by-Step Reveal'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {mode === 'ordering' ? (
            <StepOrderingMode proof={proof} />
          ) : (
            <StepRevealMode proof={proof} />
          )}
        </div>
      </div>
    </div>
  );
}

// ───────── Page ─────────
export default function DerivationDojoPage() {
  const [activeProof, setActiveProof] = useState<DerivationProof | null>(null);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Derivation Dojo</h1>
        <p className="text-sm text-gray-400 mt-1">Q4–Q7 Proof Patterns</p>
        <div className="mt-3 p-4 bg-purple-950/30 border border-purple-800/40 rounded-xl">
          <p className="text-purple-200 text-sm">
            <strong>Questions 4–7 carry 40% of the exam.</strong> These are the 8 proof patterns that appear across Practice Finals 1–3.
            Practice ordering the steps before you memorize — understanding <em>why</em> each step follows is what gets you full marks.
          </p>
        </div>
      </div>

      {/* Proof grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {derivations.map(proof => {
          const diff = DIFFICULTY[proof.pattern] ?? { label: 'Medium', color: 'bg-yellow-700 text-yellow-100' };
          return (
            <button
              key={proof.id}
              onClick={() => setActiveProof(proof)}
              className="text-left p-5 bg-gray-800/60 border border-gray-700 hover:border-purple-600/60 hover:bg-gray-800 rounded-2xl transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="w-9 h-9 bg-purple-800/60 group-hover:bg-purple-700/60 rounded-lg text-purple-200 font-bold text-lg flex items-center justify-center transition-colors">
                  {proof.pattern}
                </span>
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', diff.color)}>
                  {diff.label}
                </span>
              </div>
              <h3 className="font-semibold text-white mb-1">{proof.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{proof.description}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                <span>{proof.steps.length} steps</span>
                <span>·</span>
                <span className="text-purple-400 group-hover:text-purple-300">Open Proof Trainer →</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Trainer modal */}
      {activeProof && (
        <ProofTrainer proof={activeProof} onClose={() => setActiveProof(null)} />
      )}
    </main>
  );
}
