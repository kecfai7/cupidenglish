// src/components/ArrowPractice.jsx (Cupid Practice)
import React, { useState } from 'react';
import { PRESET_SENTENCES } from '../services/translationService';
import confetti from 'canvas-confetti';
import { CheckCircle2, RotateCcw, HelpCircle, ArrowRight, Award, Sparkles, Heart } from 'lucide-react';

export function ArrowPractice() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSentence = PRESET_SENTENCES[currentIndex];

  // Scramble chunks for word ordering quiz
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);

  // Get scrambled version of chunks
  const [scrambledChunks, setScrambledChunks] = useState(() => {
    return [...currentSentence.chunks].sort(() => Math.random() - 0.5);
  });

  const handleSelectChunk = (chunk, idx) => {
    if (selectedIndices.includes(idx) || isCompleted) return;

    const newSelection = [...selectedIndices, idx];
    setSelectedIndices(newSelection);

    // Check if finished
    if (newSelection.length === currentSentence.chunks.length) {
      // Check correctness
      const userOrder = newSelection.map(i => scrambledChunks[i].english).join(' ');
      const correctOrder = currentSentence.chunks.map(c => c.english).join(' ');

      if (userOrder.trim() === correctOrder.trim()) {
        setIsCompleted(true);
        setScore(prev => prev + 10);
        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        } catch {
          // Ignore confetti errors
        }
      }
    }
  };

  const handleResetCurrent = () => {
    setSelectedIndices([]);
    setIsCompleted(false);
    setShowHint(false);
    setScrambledChunks([...currentSentence.chunks].sort(() => Math.random() - 0.5));
  };

  const handleNextSentence = () => {
    const nextIdx = (currentIndex + 1) % PRESET_SENTENCES.length;
    setCurrentIndex(nextIdx);
    setSelectedIndices([]);
    setIsCompleted(false);
    setShowHint(false);
    setScrambledChunks([...PRESET_SENTENCES[nextIdx].chunks].sort(() => Math.random() - 0.5));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Quiz Header & Score Bar */}
      <section className="bg-white dark:bg-slate-900 border border-pink-300 dark:border-slate-800 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
            <span>💘 큐피드 어순 실전 훈련소</span>
            <span className="text-xs px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-500/20 text-pink-900 dark:text-pink-300 font-black border border-pink-300 dark:border-pink-500/30">
              문제 {currentIndex + 1} / {PRESET_SENTENCES.length}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-1 font-bold">
            한글 어순을 보며 영문의 큐피드 카메라 순서대로 조각을 완성하세요.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-pink-100/90 dark:bg-pink-500/20 border border-pink-300 dark:border-pink-500/40 text-pink-950 dark:text-pink-300 font-black text-sm shadow-sm">
            <Award className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            <span>점수: {score} P</span>
          </div>

          <button onClick={handleResetCurrent} className="btn-secondary text-xs" title="다시 시도">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>초기화</span>
          </button>
        </div>
      </section>

      {/* Main Target Sentence Card */}
      <section className="bg-white dark:bg-slate-900 border border-pink-300 dark:border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-xl">
        <div className="space-y-3">
          <span className="text-xs font-black text-pink-700 dark:text-pink-400 uppercase tracking-wider block">
            🎯 목표 어순 (TARGET CHUNK)
          </span>
          <div className="p-4 sm:p-5 rounded-2xl bg-pink-100/80 dark:bg-slate-950 border border-pink-300 dark:border-slate-800 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-lg sm:text-2xl font-black text-pink-950 dark:text-pink-100 leading-relaxed font-brand">
              "{currentSentence.arrowKorean}"
            </h3>
          </div>
        </div>

        {/* User Workspace (Selected Chips) */}
        <div className="p-6 rounded-2xl bg-pink-50/80 dark:bg-slate-950 border border-pink-300 dark:border-slate-800 min-h-[110px] flex flex-wrap items-center justify-center gap-2.5 shadow-inner">
          {selectedIndices.length === 0 ? (
            <span className="text-xs sm:text-sm text-pink-800 dark:text-pink-300/80 font-extrabold">
              👇 아래의 영어 조각들을 큐피드 잉글리시 순서대로 클릭하세요 💘
            </span>
          ) : (
            selectedIndices.map((sIdx, i) => (
              <div key={i} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm font-black shadow-md border border-pink-400/30 flex items-center gap-2 animate-fade-in">
                <span>{scrambledChunks[sIdx].english}</span>
                <span className="text-[11px] font-bold opacity-90 px-1.5 py-0.5 rounded bg-white/20">({scrambledChunks[sIdx].role})</span>
              </div>
            ))
          )}
        </div>

        {/* Scrambled Chips Pool */}
        <div className="space-y-3">
          <span className="text-xs text-slate-800 dark:text-slate-200 font-black block">
            조각 선택 (주인공 ➔ 동작 ➔ 대상 ➔ 전치사 ➔ 장소 ➔ 시간)
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {scrambledChunks.map((chunk, idx) => {
              const isSelected = selectedIndices.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectChunk(chunk, idx)}
                  disabled={isSelected || isCompleted}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-black transition-all ${
                    isSelected
                      ? 'opacity-40 bg-pink-100/60 dark:bg-slate-900 border-pink-200 dark:border-slate-800 text-pink-400 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-950 border-pink-300 dark:border-pink-500/40 text-pink-950 dark:text-pink-100 hover:bg-pink-100 dark:hover:bg-slate-800 hover:border-pink-500 hover:scale-105 shadow-md'
                  }`}
                >
                  {chunk.english}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hint button */}
        {!isCompleted && (
          <div className="pt-2">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-pink-700 dark:text-pink-400 hover:text-pink-900 dark:hover:text-pink-300 inline-flex items-center gap-1.5 transition-colors font-black"
            >
              <HelpCircle className="w-4 h-4 text-pink-600" />
              <span>{showHint ? '힌트 닫기' : '💡 어순 힌트 보기'}</span>
            </button>

            {showHint && (
              <div className="mt-3 p-4 rounded-2xl bg-pink-100/90 dark:bg-pink-950/80 border border-pink-300 dark:border-pink-500/30 text-xs text-pink-950 dark:text-pink-200 text-left max-w-xl mx-auto space-y-1.5 font-bold shadow-sm">
                <strong className="block text-pink-900 dark:text-pink-300 text-sm">💡 힌트 순서:</strong>
                {currentSentence.chunks.map((c, i) => (
                  <span key={i} className="inline-block mr-2 text-xs">
                    [{i + 1}] {c.role} ({c.text})
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Completion Banner */}
        {isCompleted && (
          <div className="p-6 rounded-2xl bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200 space-y-4 animate-fade-in shadow-xl">
            <div className="flex items-center justify-center gap-2 text-lg font-black text-emerald-900 dark:text-emerald-300">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <span>정답입니다! 💘 정확한 큐피드 영문이 완성되었습니다.</span>
            </div>
            <p className="text-base sm:text-lg font-brand text-emerald-950 dark:text-white font-black">
              "{currentSentence.english}"
            </p>

            <button onClick={handleNextSentence} className="btn-primary">
              <span>다음 문제 도전</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
