import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { categories } from "../data/words";
import { getProgress, getExcludedIds, getAllWords, getWeakWordIds, getStreak } from "../data/storage";
import CategoryCard from "../components/CategoryCard";
import StressWord from "../components/StressWord";

export default function HomePage() {
  const navigate = useNavigate();
  const words = useMemo(() => getAllWords(), []);
  const progress = getProgress();
  const learned = new Set(progress.learnedWords);
  const excluded = new Set(getExcludedIds());
  const newWordsCount = words.filter((w) => !learned.has(w.id) && !excluded.has(w.id)).length;
  const weakCount = getWeakWordIds().length;
  const streak = getStreak();

  // Слово дня — одинаковое в течение суток
  const d = new Date();
  const seed = d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate();
  const wordOfDay = words[(seed * 7919) % words.length];

  const customWords = words.filter((w) => w.custom);

  return (
    <div className="px-5 pt-8 pb-4 animate-fade-in">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Удар<span className="text-brand-400">ник</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Ударения · задание 4 ЕГЭ</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/words")} aria-label="Словарь" className="w-11 h-11 rounded-xl bg-brand-500 text-white flex items-center justify-center active:scale-95 transition-all text-xl font-semibold">+</button>
          <button
            onClick={() => navigate("/settings")}
            aria-label="Настройки"
            className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Word of the day */}
      {wordOfDay && (
        <div className="mb-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-slate-500">Слово дня</div>
            <div className="text-2xl font-display font-bold text-white mt-1">
              <StressWord word={wordOfDay.word} />
            </div>
            {wordOfDay.tip && <div className="text-xs text-slate-400 mt-1">💡 {wordOfDay.tip}</div>}
          </div>
          <div className="text-center shrink-0 pl-3">
            <div className="text-2xl">🔥</div>
            <div className="text-xs text-slate-400">{streak} дн.</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <button
          onClick={() => navigate("/flashcards")}
          className="p-5 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white text-left transition-all active:scale-[0.97] shadow-soft"
        >
          <div className="text-2xl mb-2">📚</div>
          <h3 className="font-semibold text-sm">Карточки</h3>
          <p className="text-xs text-brand-200 mt-0.5">{newWordsCount} новых слов</p>
        </button>
        <button
          onClick={() => navigate("/quiz")}
          className="p-5 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 text-white text-left transition-all active:scale-[0.97] shadow-soft"
        >
          <div className="text-2xl mb-2">🧠</div>
          <h3 className="font-semibold text-sm">Квиз</h3>
          <p className="text-xs text-orange-200 mt-0.5">Где ударение?</p>
        </button>
      </div>

      <button
        onClick={() => navigate("/ege")}
        className="w-full mb-3 p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-left transition-all active:scale-[0.98] shadow-soft flex items-center gap-4"
      >
        <div className="text-2xl">📝</div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Задание 4 в формате ЕГЭ</h3>
          <p className="text-xs text-white/80 mt-0.5">Выбери все варианты с верным ударением</p>
        </div>
        <span className="text-white/70 text-xl">→</span>
      </button>

      <button
        onClick={() => navigate("/words")}
        className="w-full mb-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-left transition-all active:scale-[0.98] shadow-soft flex items-center gap-4"
      >
        <div className="text-2xl">📖</div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Словарь</h3>
          <p className="text-xs text-white/80 mt-0.5">
            {words.length} слов · поиск · свои слова{weakCount > 0 ? ` · ${weakCount} с ошибками` : ""}
          </p>
        </div>
        <span className="text-white/70 text-xl">→</span>
      </button>

      <div className="mb-4">
        <h2 className="text-lg font-display font-bold text-white mb-4">Категории</h2>
        <div className="flex flex-col gap-3">
          {categories.map((cat) => {
            const catWords = words.filter((w) => w.category === cat.id);
            return (
              <CategoryCard
                key={cat.id}
                category={cat}
                totalCount={catWords.length}
                learnedCount={catWords.filter((w) => learned.has(w.id)).length}
              />
            );
          })}
          {customWords.length > 0 && (
            <CategoryCard
              category={{ id: "custom", name: "Мои слова", emoji: "✍️", description: "Добавленные тобой", color: "from-slate-500 to-slate-600" }}
              totalCount={customWords.length}
              learnedCount={customWords.filter((w) => learned.has(w.id)).length}
            />
          )}
        </div>
      </div>
    </div>
  );
}
