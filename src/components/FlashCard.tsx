import { useState, useEffect, useRef } from "react";
import { Word, plain, categories } from "../data/words";
import StressWord from "./StressWord";
import {
  markWordLearned,
  unmarkWordLearned,
  isWordLearned,
} from "../data/storage";

interface Props {
  word: Word;
  onNext: () => void;
  onPrev: () => void;
  onExclude: () => void;
  index: number;
  total: number;
}

export default function FlashCard({ word, onNext, onPrev, onExclude, index, total }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [learned, setLearned] = useState(isWordLearned(word.id));
  const [animating, setAnimating] = useState(false);

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const goNext = () => {
    setFlipped(false);
    setLearned(isWordLearned(word.id));
    setTimeout(onNext, 150);
  };

  const goPrev = () => {
    setFlipped(false);
    setLearned(isWordLearned(word.id));
    setTimeout(onPrev, 150);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word.id]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    swiped.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      swiped.current = true;
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  const handleFlip = () => {
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    setFlipped(!flipped);
  };

  const handleLearned = () => {
    if (learned) {
      unmarkWordLearned(word.id);
      setLearned(false);
    } else {
      markWordLearned(word.id);
      setLearned(true);
      setAnimating(true);
      setTimeout(() => {
        setAnimating(false);
        setFlipped(false);
        onNext();
      }, 600);
    }
  };

  const handleExclude = () => {
    setFlipped(false);
    setTimeout(onExclude, 120);
  };

  const cat = categories.find((c) => c.id === word.category);
  const levelLabel = word.custom ? "моё" : cat ? cat.name.toLowerCase() : "";

  return (
    <div className="flex flex-col items-center gap-4 w-full animate-fade-in">
      {/* Top bar: counter + level + hide */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="font-semibold text-brand-400">{index + 1}</span>
          <span>/</span>
          <span>{total}</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-500/20 text-brand-300">
            {levelLabel}
          </span>
          {learned && <span className="text-emerald-400 text-xs">выучено</span>}
        </div>
        <button
          onClick={handleExclude}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700/50 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition-all active:scale-95"
          title="Скрыть слово, которое уже знаешь точно"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
          Скрыть
        </button>
      </div>

      {/* Card */}
      <div
        className="card-flip w-full aspect-[3/4] max-h-[400px] cursor-pointer"
        onClick={handleFlip}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`card-flip-inner w-full h-full relative ${flipped ? "flipped" : ""}`}>
          {/* Front */}
          <div className="card-front absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-card flex flex-col items-center justify-center p-8">
            <span className="text-xs uppercase tracking-widest text-slate-500 mb-4">Где ударение?</span>
            <h2 className="text-4xl font-display font-bold text-white mb-3 text-center break-all">{plain(word.word)}</h2>
            {word.hint && <p className="text-sm text-slate-400 mb-4 text-center">{word.hint}</p>}
            <div className="mt-4 px-4 py-2 rounded-full bg-slate-700/40 text-xs text-slate-500">
              Нажми чтобы перевернуть
            </div>
          </div>

          {/* Back */}
          <div className="card-back absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 border border-brand-500/30 shadow-soft flex flex-col items-center justify-center p-6 overflow-y-auto">
            <span className="text-xs uppercase tracking-widest text-brand-200 mb-3">Правильно</span>
            <h2 className="text-4xl font-display font-bold text-white mb-3 text-center break-all">
              <StressWord word={word.word} accentClass="text-amber-300" />
            </h2>
            {word.hint && (
              <div className="bg-white/10 rounded-2xl p-3 w-full">
                <p className="text-sm text-brand-100 text-center">{word.hint}</p>
              </div>
            )}
            {word.tip && (
              <div className="mt-3 bg-amber-400/15 border border-amber-300/30 rounded-2xl p-3 w-full">
                <p className="text-xs text-amber-100 text-center">💡 {word.tip}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Swipe hint */}
      <p className="text-[11px] text-slate-500 -mt-1">← свайп, чтобы листать →</p>

      {/* Controls */}
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={goPrev}
          className="flex-1 py-3.5 rounded-2xl bg-slate-800 border border-slate-700/50 text-slate-300 font-medium transition-all active:scale-95"
        >
          ←
        </button>
        <button
          onClick={handleLearned}
          className={`flex-[2] py-3.5 rounded-2xl font-medium transition-all active:scale-95 ${
            animating
              ? "bg-emerald-500 text-white scale-105"
              : learned
              ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
              : "bg-brand-500 text-white hover:bg-brand-600"
          }`}
        >
          {animating ? "✓ Выучил!" : learned ? "Убрать из выученных" : "Знаю ✓"}
        </button>
        <button
          onClick={goNext}
          className="flex-1 py-3.5 rounded-2xl bg-slate-800 border border-slate-700/50 text-slate-300 font-medium transition-all active:scale-95"
        >
          →
        </button>
      </div>
    </div>
  );
}
