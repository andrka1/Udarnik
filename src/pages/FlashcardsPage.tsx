import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { categories } from "../data/words";
import { getProgress, getExcludedIds, excludeWord, getAllWords, shuffle } from "../data/storage";
import FlashCard from "../components/FlashCard";

type FilterMode = "new" | "learned" | "all";

export default function FlashcardsPage() {
  const { category } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  // No category picker anymore: the Cards tab opens ALL words straight away.
  // A category may still arrive via a deep link (/flashcards/:category).
  const [selectedCategory, setSelectedCategory] = useState<string>(category || "all");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [excludeVersion, setExcludeVersion] = useState(0);
  const [shuffled, setShuffled] = useState(false);
  const words = useMemo(() => getAllWords(), []);

  const excludedIds = useMemo(() => new Set(getExcludedIds()), [excludeVersion]);

  const filteredWords = useMemo(() => {
    const progress = getProgress();
    let pool =
      selectedCategory === "all"
        ? words
        : words.filter((w) => w.category === selectedCategory);

    pool = pool.filter((w) => !excludedIds.has(w.id));

    if (filterMode === "new") {
      pool = pool.filter((w) => !progress.learnedWords.includes(w.id));
    } else if (filterMode === "learned") {
      pool = pool.filter((w) => progress.learnedWords.includes(w.id));
    }
    return shuffled ? shuffle(pool) : pool;
  }, [selectedCategory, filterMode, excludedIds, shuffled, words]);

  const handleNext = () => {
    if (filteredWords.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredWords.length);
  };

  const handlePrev = () => {
    if (filteredWords.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + filteredWords.length) % filteredWords.length);
  };

  const handleExclude = (wordId: string) => {
    excludeWord(wordId);
    setExcludeVersion((v) => v + 1);
    setCurrentIndex((prev) => {
      const newLen = filteredWords.length - 1;
      if (newLen <= 0) return 0;
      return prev % newLen;
    });
  };

  const currentWord = filteredWords[Math.min(currentIndex, Math.max(filteredWords.length - 1, 0))];
  const categoryInfo =
    selectedCategory === "custom"
      ? { name: "Мои слова" }
      : categories.find((c) => c.id === selectedCategory);
  const isAll = selectedCategory === "all";

  return (
    <div className="px-5 pt-6 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {!isAll && (
          <button
            onClick={() => {
              setSelectedCategory("all");
              setCurrentIndex(0);
              navigate("/flashcards", { replace: true });
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            ←
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-lg font-display font-bold text-white">
            {isAll ? "Карточки" : categoryInfo?.name}
          </h1>
          <p className="text-xs text-slate-400">{isAll ? "Все слова задания 4" : "Тренировка по теме"}</p>
        </div>
        <button
          onClick={() => {
            setShuffled((v) => !v);
            setCurrentIndex(0);
          }}
          className={`px-3 h-9 rounded-xl text-xs font-medium border transition-all active:scale-95 ${
            shuffled ? "bg-brand-500 border-brand-500 text-white" : "bg-slate-800 border-slate-700/50 text-slate-300"
          }`}
          title="Перемешать"
        >
          🔀 {shuffled ? "Вразброс" : "По порядку"}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {([
          { key: "all" as FilterMode, label: "Все", emoji: "📖" },
          { key: "new" as FilterMode, label: "Новые", emoji: "🆕" },
          { key: "learned" as FilterMode, label: "Выученные", emoji: "✅" },
        ]).map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => {
              setFilterMode(key);
              setCurrentIndex(0);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
              filterMode === key
                ? "bg-brand-500 text-white"
                : "bg-slate-800 text-slate-400 border border-slate-700/50"
            }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {filteredWords.length === 0 || !currentWord ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">{filterMode === "new" ? "🎉" : "📖"}</div>
          <p className="text-lg font-semibold text-white mb-2">
            {filterMode === "new" ? "Всё выучено!" : "Пока пусто"}
          </p>
          <p className="text-sm text-slate-400">
            {filterMode === "new"
              ? "Все слова выучены или скрыты."
              : "Здесь пока нет таких слов."}
          </p>
          <button
            onClick={() => {
              setFilterMode("all");
              setCurrentIndex(0);
            }}
            className="mt-6 px-6 py-3 rounded-2xl bg-brand-500 text-white font-medium active:scale-95 transition-all"
          >
            Показать все слова
          </button>
        </div>
      ) : (
        <FlashCard
          key={currentWord.id}
          word={currentWord}
          onNext={handleNext}
          onPrev={handlePrev}
          onExclude={() => handleExclude(currentWord.id)}
          index={Math.min(currentIndex, filteredWords.length - 1)}
          total={filteredWords.length}
        />
      )}
    </div>
  );
}
