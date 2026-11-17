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

type TabMode = 'lesson' | 'interrogate' | 'feynman' | 'selfcheck';

export function ActiveRecallTopicModal({
  prompt,
  isOpen,
  onClose,
  onMastered,
  alreadyDone,
}: ActiveRecallTopicModalProps) {
  const [activeTab, setActiveTab] = useState<TabMode>('lesson');
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

  const lesson = prompt.lesson;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-gray-900 border border-gray-700 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-800 bg-gray-950/70 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700">
                Cognitive Mastery Engine
              </span>
              <span className="text-xs text-gray-400">Module {prompt.module}</span>
            </div>
            <h2 className="text-xl font-bold text-white leading-snug">
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

        {/* Cognitive Flow Tab Selector */}
        <div className="flex border-b border-gray-800 bg-gray-950/50 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('lesson')}
            className={cn(
              'flex-1 py-3 px-4 border-b-2 transition-all flex items-center justify-center gap-2 whitespace-nowrap',
              activeTab === 'lesson'
                ? 'border-blue-500 text-blue-300 bg-blue-950/20'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            )}
          >
            <span>📖 1. Teach Me Concept (Intuition &amp; Example)</span>
          </button>
          <button
            onClick={() => setActiveTab('interrogate')}
            className={cn(
              'flex-1 py-3 px-4 border-b-2 transition-all flex items-center justify-center gap-2 whitespace-nowrap',
              activeTab === 'interrogate'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-950/20'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            )}
          >
            <span>🧠 2. Interrogation</span>
          </button>
          <button
            onClick={() => setActiveTab('feynman')}
            className={cn(
              'flex-1 py-3 px-4 border-b-2 transition-all flex items-center justify-center gap-2 whitespace-nowrap',
              activeTab === 'feynman'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            )}
          >
            <span>🗣️ 3. Feynman</span>
          </button>
          <button
            onClick={() => setActiveTab('selfcheck')}
            className={cn(
              'flex-1 py-3 px-4 border-b-2 transition-all flex items-center justify-center gap-2 whitespace-nowrap',
              activeTab === 'selfcheck'
                ? 'border-amber-500 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            )}
          >
            <span>🎯 4. Diagnostic</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: DEEP TEACHING CONCEPT BREAKDOWN */}
          {activeTab === 'lesson' && (
            <div className="space-y-5 animate-fade-in">
              {/* 1. Intuitive Explanation */}
              <div className="p-4.5 bg-blue-950/30 border border-blue-800/60 rounded-2xl space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <span>💡</span> Intuitive Explanation (Why It Works Physically)
                </span>
                <p className="text-gray-100 text-sm leading-relaxed whitespace-pre-line">
                  {lesson?.intuitiveExplanation ?? prompt.modelAnswer}
                </p>
              </div>

              {/* 2. Visual / Slide ASCII Diagram */}
              {lesson?.diagramOrVisual && (
                <div className="p-4 bg-gray-950 border border-gray-800 rounded-2xl space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    📊 Visual Diagram &amp; Geometry
                  </span>
                  <pre className="font-mono text-xs text-indigo-300 overflow-x-auto leading-snug">
                    {lesson.diagramOrVisual}
                  </pre>
                </div>
              )}

              {/* 3. Core Mathematical Rule & Formula */}
              <div className="p-4 bg-gray-950 border border-gray-800 rounded-2xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <span>⚡</span> Core Decision Rule &amp; Mathematical Definition
                </span>
                <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line font-medium">
                  {lesson?.coreRule ?? 'Verify all underlying distribution assumptions before applying formulas.'}
                </p>

                {(lesson?.latexFormula || prompt.modelAnswerLatex) && (
                  <div className="py-2.5 px-4 bg-gray-900 border border-gray-800 rounded-xl text-center overflow-x-auto">
                    <KatexRenderer 
                      latex={lesson?.latexFormula || prompt.modelAnswerLatex || ''} 
                      display={true} 
                    />
                  </div>
                )}
              </div>

              {/* 4. Complete Worked Problem Example with Numbers */}
              {lesson?.workedExample && (
                <div className="p-5 bg-gradient-to-b from-gray-900 to-gray-950 border border-emerald-900/50 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <span>🧪</span> Step-by-Step Worked Exam Example
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">Actual Lindberg Exam Pattern</span>
                  </div>

                  <p className="text-xs text-gray-300 font-medium italic">
                    {lesson.workedExample.context}
                  </p>

                  <div className="space-y-1.5 pl-2 border-l-2 border-emerald-600/60 my-2">
                    {lesson.workedExample.stepByStep.map((step, idx) => (
                      <p key={idx} className="text-xs text-gray-200 leading-relaxed font-mono">
                        {step}
                      </p>
                    ))}
                  </div>

                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-xs text-emerald-200 font-semibold flex items-center justify-between flex-wrap gap-2">
                    <span>Final Answer: {lesson.workedExample.result}</span>
                    {lesson.workedExample.resultLatex && (
                      <span className="text-right">
                        <KatexRenderer latex={lesson.workedExample.resultLatex} display={false} />
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 5. Fatal Exam Trap Warning */}
              <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-2xl space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span>⚠️</span> The Fatal Exam Trap to Avoid
                </span>
                <p className="text-xs text-amber-200 leading-relaxed">
                  {lesson?.examPitfall ?? 'Watch out for boundary conditions, degrees of freedom calculation, and pooled vs unpooled conditions.'}
                </p>
              </div>

              {/* 6. Action Button: Move from Teach -> Active Recall */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('interrogate')}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  <span>🧠 Concept Understood! Now Test My Active Recall →</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Elaborative Interrogation */}
          {activeTab === 'interrogate' && (
            <div className="space-y-4 animate-fade-in">
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
                  Force your brain to recall without looking back at the lesson (Type your reasoning below):
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

          {/* STEP 3: Feynman Explanation */}
          {activeTab === 'feynman' && (
            <div className="space-y-4 animate-fade-in">
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

          {/* STEP 4: Rapid Diagnostic */}
          {activeTab === 'selfcheck' && (
            <div className="space-y-4 animate-fade-in">
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

          {/* Reveal & Model Answer Accordion for Retrieval Tabs */}
          {activeTab !== 'lesson' && (
            <div className="pt-2">
              {!revealed ? (
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="w-full py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl border border-gray-700 transition-all flex items-center justify-center gap-2"
                >
                  <span>🔍 Verify My Retrieval Against Expert Answer</span>
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
          )}
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
