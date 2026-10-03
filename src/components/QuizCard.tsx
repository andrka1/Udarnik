import { useState } from "react";
import { Word, plain, stressIndex, isVowel, categories } from "../data/words";
import StressWord from "./StressWord";

interface Props {
  word: Word;
  onAnswer: (correct: boolean) => void;
  onExclude: () => void;
  questionNum: number;
  totalQuestions: number;
}

export default function QuizCard({ word, onAnswer, onExclude, questionNum, totalQuestions }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const correctIdx = stressIndex(word.word);
  const letters = [...plain(word.word)];
  const showResult = selected !== null;
  const isCorrect = selected === correctIdx;
  const cat = categories.find((c) => c.id === word.category);

  const handleSelect = (i: number) => {
    if (showResult) return;
    setSelected(i);
    if (i === correctIdx) {
      setTimeout(() => onAnswer(true), 1100);
    }
  };

  const letterStyle = (i: number) => {
    if (!isVowel(letters[i])) return "text-white cursor-default";
    if (!showResult)
      return "bg-slate-700/60 border border-slate-600/60 text-brand-200 hover:bg-brand-500/30 active:scale-90";
    if (i === correctIdx) return "bg-emerald-500/30 border border-emerald-400 text-emerald-200";
    if (i === selected) return "bg-red-500/25 border border-red-500 text-red-300 line-through";
    return "bg-slate-800/40 border border-slate-700/30 text-slate-500";
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full animate-slide-up">
      <div className="w-full">
        <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
          <span>Вопрос {questionNum}/{totalQuestions}</span>
          <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300">
            {word.custom ? "моё" : cat?.name.toLowerCase()}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500"
            style={{ width: `${(questionNum / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 p-6 pt-10 text-center relative">
        <button
          onClick={() => !showResult && onExclude()}
          disabled={showResult}
          className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-700/50 border border-slate-600/50 text-[11px] text-slate-300 hover:text-white active:scale-95 transition-all disabled:opacity-40"
          title="Я точно знаю это слово — убрать из квиза"
        >
          Знаю
        </button>

        <span className="text-xs uppercase tracking-widest text-slate-500 mb-4 block">
          Нажми на ударную гласную
        </span>

        <div className="flex flex-wrap justify-center gap-1 mb-3">
          {letters.map((ch, i) =>
            isVowel(ch) ? (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showResult}
                className={`min-w-[2.4rem] h-12 px-1.5 rounded-xl text-3xl font-display font-bold transition-all ${letterStyle(i)}`}
              >
                {showResult && i === correctIdx ? ch.toUpperCase() : ch}
              </button>
            ) : (
              <span key={i} className="h-12 flex items-center text-3xl font-display font-bold text-white px-0.5">
                {ch}
              </span>
            )
          )}
        </div>

        {word.hint && <p className="text-sm text-slate-400">{word.hint}</p>}

        {showResult && (
          <div className="mt-4 animate-fade-in">
            <p className={`text-lg font-semibold ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
              {isCorrect ? "Верно! " : "Правильно: "}
              <StressWord word={word.word} className="text-white" accentClass="text-amber-300" />
            </p>
            {word.tip && (
              <p className="mt-3 text-xs text-amber-200/90 bg-amber-400/10 border border-amber-300/20 rounded-xl p-2">
                💡 {word.tip}
              </p>
            )}
          </div>
        )}
      </div>

      {showResult && !isCorrect && (
        <button
          onClick={() => onAnswer(false)}
          className="w-full py-4 rounded-2xl bg-brand-500 text-white font-semibold active:scale-[0.98] transition-all"
        >
          Дальше →
        </button>
      )}
    </div>
  );
}
