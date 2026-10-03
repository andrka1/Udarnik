import { useEffect, useMemo, useState } from "react";
import { categories, Word } from "../data/words";
import {
  saveQuizResult,
  getProgress,
  recordWordError,
  recordWordCorrect,
  getWeakWordIds,
  excludeWord,
  getExcludedIds,
  getAllWords,
  shuffle,
} from "../data/storage";
import QuizCard from "../components/QuizCard";

type QuizState = "setup" | "playing" | "results";
type QuizMode = "new" | "errors" | "all";

export default function QuizPage() {
  const words = useMemo(() => getAllWords(), []);
  const [state, setState] = useState<QuizState>("setup");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [questionCount, setQuestionCount] = useState(20);
  const [quizMode, setQuizMode] = useState<QuizMode>("all");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [answered, setAnswered] = useState(0);

  const modeCounts = useMemo<Record<QuizMode, number>>(() => {
    const progress = getProgress();
    const excluded = new Set(getExcludedIds());
    const weak = new Set(getWeakWordIds());
    const inCategory = (w: Word) =>
      selectedCategory === "all" ? true : w.category === selectedCategory;
    const base = words.filter((w) => inCategory(w) && !excluded.has(w.id));
    return {
      new: base.filter((w) => !progress.learnedWords.includes(w.id)).length,
      errors: base.filter((w) => weak.has(w.id)).length,
      all: base.length,
    };
  }, [selectedCategory, state]);

  useEffect(() => {
    if (modeCounts[quizMode] === 0) {
      if (modeCounts.new > 0) setQuizMode("new");
      else if (modeCounts.all > 0) setQuizMode("all");
    }
  }, [modeCounts, quizMode]);

  const startQuiz = () => {
    const progress = getProgress();
    const excluded = new Set(getExcludedIds());

    const inCategory = (w: Word) =>
      selectedCategory === "all" ? true : w.category === selectedCategory;

    let pool = words.filter((w) => inCategory(w) && !excluded.has(w.id));

    if (quizMode === "new") {
      pool = pool.filter((w) => !progress.learnedWords.includes(w.id));
    } else if (quizMode === "errors") {
      const weakOrder = getWeakWordIds();
      const weakSet = new Set(weakOrder);
      pool = pool
        .filter((w) => weakSet.has(w.id))
        .sort((a, b) => weakOrder.indexOf(a.id) - weakOrder.indexOf(b.id));
    }

    if (pool.length === 0) {
      pool = words.filter((w) => inCategory(w) && !excluded.has(w.id));
    }

    const ordered =
      quizMode === "errors" ? pool : shuffle(pool);
    const selected = ordered.slice(0, Math.min(questionCount, ordered.length));
    setQuizWords(selected);
    setCurrentQuestion(0);
    setScore(0);
    setAnswered(0);
    setState("playing");
  };

  const finish = (finalScore: number, total: number) => {
    saveQuizResult(finalScore, Math.max(total, 1), selectedCategory);
    setState("results");
  };

  const handleAnswer = (correct: boolean) => {
    const current = quizWords[currentQuestion];
    if (current) {
      if (correct) recordWordCorrect(current.id);
      else recordWordError(current.id);
    }
    const newScore = correct ? score + 1 : score;
    const newAnswered = answered + 1;
    setScore(newScore);
    setAnswered(newAnswered);

    const next = currentQuestion + 1;
    if (next >= quizWords.length) {
      finish(newScore, newAnswered);
    } else {
      setCurrentQuestion(next);
    }
  };

  const handleExclude = () => {
    const current = quizWords[currentQuestion];
    if (!current) return;
    excludeWord(current.id);
    const remaining = quizWords.filter((_, i) => i !== currentQuestion);
    setQuizWords(remaining);
    if (currentQuestion >= remaining.length) {
      if (remaining.length === 0 && answered === 0) {
        setState("setup");
      } else {
        finish(score, answered);
      }
    }
  };

  const totalAnswered = answered;
  const scorePercent = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;

  if (state === "setup") {
    return (
      <div className="px-5 pt-8 pb-4 animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-white mb-2">Квиз</h1>
        <p className="text-slate-400 text-sm mb-6">Где ударение? Нажми на нужную гласную</p>

        {/* Quiz mode */}
        <div className="mb-5">
          <label className="text-sm font-medium text-slate-300 mb-3 block">Режим</label>
          <div className="flex gap-2">
            {([
              { key: "new" as QuizMode, label: "Новые", emoji: "🆕" },
              { key: "errors" as QuizMode, label: "Ошибки", emoji: "❌" },
              { key: "all" as QuizMode, label: "Все", emoji: "📖" },
            ]).map(({ key, label, emoji }) => {
              const count = modeCounts[key];
              const disabled = count === 0;
              return (
                <button
                  key={key}
                  onClick={() => setQuizMode(key)}
                  disabled={disabled}
                  className={`flex-1 py-3 rounded-xl text-xs font-medium transition-all ${
                    quizMode === key
                      ? "bg-brand-500 text-white"
                      : "bg-slate-800 text-slate-400 border border-slate-700/50"
                  } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  {emoji} {label}
                  <span className="block text-[10px] opacity-70 mt-0.5">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category */}
        <div className="mb-5">
          <label className="text-sm font-medium text-slate-300 mb-3 block">Категория</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-brand-500 text-white"
                  : "bg-slate-800 text-slate-400 border border-slate-700/50"
              }`}
            >
              🌐 Все
            </button>
            {[...categories, ...(words.some((w) => w.custom) ? [{ id: "custom", emoji: "✍️", name: "Мои" }] : [])].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-brand-500 text-white"
                    : "bg-slate-800 text-slate-400 border border-slate-700/50"
                }`}
              >
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Question count */}
        <div className="mb-8">
          <label className="text-sm font-medium text-slate-300 mb-3 block">Количество вопросов</label>
          <div className="flex gap-2">
            {[10, 20, 30, 50].map((count) => (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                  questionCount === count
                    ? "bg-brand-500 text-white"
                    : "bg-slate-800 text-slate-400 border border-slate-700/50"
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={startQuiz}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-400 text-white font-semibold text-base active:scale-[0.98] transition-all"
        >
          Начать квиз
        </button>
      </div>
    );
  }

  if (state === "playing") {
    const current = quizWords[currentQuestion];
    if (!current) {
      return (
        <div className="px-5 pt-8 pb-4 text-center text-slate-400">
          Нет слов для квиза
        </div>
      );
    }
    return (
      <div className="px-5 pt-8 pb-4">
        <QuizCard
          key={current.id}
          word={current}
          onAnswer={handleAnswer}
          onExclude={handleExclude}
          questionNum={currentQuestion + 1}
          totalQuestions={quizWords.length}
        />
      </div>
    );
  }

  // results
  return (
    <div className="px-5 pt-8 pb-4 animate-fade-in flex flex-col items-center">
      <h1 className="text-2xl font-display font-bold text-white mb-6">Результаты</h1>
      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex flex-col items-center justify-center mb-6">
        <span className="text-4xl font-display font-bold text-white">{scorePercent}%</span>
        <span className="text-sm text-slate-400 mt-1">{score} / {totalAnswered}</span>
      </div>
      <p className="text-slate-400 text-sm mb-8 text-center">
        {scorePercent >= 80
          ? "Отлично! 🎉"
          : scorePercent >= 50
          ? "Хороший результат! 👍"
          : "Продолжай тренироваться! 💪"}
      </p>
      <button
        onClick={() => setState("setup")}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-400 text-white font-semibold text-base active:scale-[0.98] transition-all"
      >
        Ещё раз
      </button>
    </div>
  );
}
