'use client';

import { useState } from 'react';
import type { ActiveRecallPrompt } from '@/data/activeRecallPrompts';
import { KatexRenderer } from '@/components/ui/KatexRenderer';
import { cn } from '@/lib/utils';

interface ActiveRecallTopicModalProps {
  prompt: ActiveRecallPrompt;
  isOpen: boolean;
  onClose: () => void;
  onMastered: () => void;
  alreadyDone: boolean;
}

type TabMode = 'interrogate' | 'feynman' | 'selfcheck';

export function ActiveRecallTopicModal({
  prompt,
  isOpen,
  onClose,
  onMastered,
  alreadyDone,
}: ActiveRecallTopicModalProps) {
  const [activeTab, setActiveTab] = useState<TabMode>('interrogate');
  const [userText, setUserText] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const toggleCheck = (idx: number) => {
    setCheckedQuestions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleMarkMastered = () => {
    onMastered();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-gray-900 border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-800 bg-gray-950/60 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700">
                Active Recall Protocol
              </span>
              <span className="text-xs text-gray-400">Module {prompt.module}</span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">
              {prompt.topicTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Cognitive Method Selector */}
        <div className="flex border-b border-gray-800 bg-gray-950/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('interrogate')}
            className={cn(
              'flex-1 py-3 px-4 border-b-2 transition-all flex items-center justify-center gap-2',
              activeTab === 'interrogate'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-950/20'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            )}
          >
            <span>🧠 Elaborative Interrogation</span>
          </button>
          <button
            onClick={() => setActiveTab('feynman')}
            className={cn(
              'flex-1 py-3 px-4 border-b-2 transition-all flex items-center justify-center gap-2',
              activeTab === 'feynman'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            )}
          >
            <span>🗣️ Feynman Explanation</span>
          </button>
          <button
            onClick={() => setActiveTab('selfcheck')}
            className={cn(
              'flex-1 py-3 px-4 border-b-2 transition-all flex items-center justify-center gap-2',
              activeTab === 'selfcheck'
                ? 'border-amber-500 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            )}
          >
            <span>🎯 Rapid Self-Check</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Method 1: Elaborative Interrogation */}
          {activeTab === 'interrogate' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-950/30 border border-indigo-800/60 rounded-xl space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Cognitive Prompt: Ask &quot;Why / Under What Conditions?&quot;
                </span>
                <p className="text-gray-100 font-medium text-sm leading-relaxed">
                  {prompt.interrogationPrompt}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Force your brain to recall without looking (Type your reasoning below):
                </label>
                <textarea
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  placeholder="Explain why this property holds, what assumption enables it, or what happens if violated..."
                  rows={4}
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 p-3.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Method 2: Feynman Explanation */}
          {activeTab === 'feynman' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-xl space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Feynman Technique: Teach it Simply
                </span>
                <p className="text-gray-100 font-medium text-sm leading-relaxed">
                  {prompt.feynmanPrompt}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Your plain-English explanation (No jargon or buzzwords allowed):
                </label>
                <textarea
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  placeholder="Explain like you're talking to a friend: 'Imagine you have...'"
                  rows={4}
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 p-3.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Method 3: Rapid Self-Check */}
          {activeTab === 'selfcheck' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-xl space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Rapid Retrieval Diagnostic
                </span>
                <p className="text-gray-100 text-sm">
                  Can you answer these specific exam scenarios from memory right now?
                </p>
              </div>

              <div className="space-y-2.5">
                {prompt.selfCheckQuestions.map((q, idx) => (
                  <label
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-800 bg-gray-950/60 hover:bg-gray-800/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedQuestions[idx]}
                      onChange={() => toggleCheck(idx)}
                      className="mt-0.5 w-4 h-4 rounded accent-amber-500"
                    />
                    <span className="text-xs text-gray-200 leading-relaxed font-medium">
                      {q}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Reveal & Model Answer Accordion */}
          <div className="pt-2">
            {!revealed ? (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="w-full py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl border border-gray-700 transition-all flex items-center justify-center gap-2"
              >
                <span>🔍 Reveal Model Retrieval &amp; Key Mechanisms</span>
              </button>
            ) : (
              <div className="space-y-4 p-4.5 rounded-xl bg-gray-950 border border-gray-800 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                    ✓ Model Expert Answer
                  </span>
                  <button
                    onClick={() => setRevealed(false)}
                    className="text-[11px] text-gray-500 hover:text-gray-400 underline"
                  >
                    Hide
                  </button>
                </div>

                <p className="text-sm text-gray-200 leading-relaxed">
                  {prompt.modelAnswer}
                </p>

                {prompt.modelAnswerLatex && (
                  <div className="py-2 text-center overflow-x-auto">
                    <KatexRenderer latex={prompt.modelAnswerLatex} display={true} />
                  </div>
                )}

                {/* Key Concepts Rubric */}
                <div className="border-t border-gray-800 pt-3">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                    Key Concepts You Should Have Retrieved:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {prompt.keyConcepts.map((concept, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 font-medium"
                      >
                        ✓ {concept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-950 flex items-center justify-between gap-3">
          <p className="text-[11px] text-gray-500">
            {alreadyDone ? '✓ Already marked mastered' : 'Forces durable memory consolidation'}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleMarkMastered}
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-700/20"
            >
              <span>✓ Mark Retrieved &amp; Mastered</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
