import { useNavigate } from "react-router-dom";
import { getProgress, getStreak, getWeakWordIds, getAllWords } from "../data/storage";
import { categories } from "../data/words";
import ProgressRing from "../components/ProgressRing";
import StressWord from "../components/StressWord";

export default function StatsPage() {
  const navigate = useNavigate();
  const progress = getProgress();
  const streak = getStreak();
  const words = getAllWords();
  const learned = new Set(progress.learnedWords);
  const totalWords = words.length;
  const learnedCount = words.filter((w) => learned.has(w.id)).length;
  const learnedPercent = Math.round((learnedCount / Math.max(totalWords, 1)) * 100);

  const recent = progress.quizResults.slice(-5).reverse();
  const avgScore =
    progress.quizResults.length > 0
      ? Math.round(progress.quizResults.reduce((a, r) => a + (r.correct / r.total) * 100, 0) / progress.quizResults.length)
      : 0;
  const weakIds = getWeakWordIds();
  const weakWords = weakIds.map((id) => words.find((w) => w.id === id)).filter(Boolean).slice(0, 30);

  return (
    <div className="px-5 pt-8 pb-4 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-white mb-2">Прогресс</h1>
      <p className="text-slate-400 text-sm mb-8">Твоя статистика по ударениям</p>

      <div className="flex items-center justify-center mb-8">
        <ProgressRing progress={learnedPercent} size={160} strokeWidth={10}>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{learnedCount}</div>
            <div className="text-xs text-slate-400">из {totalWords} слов</div>
          </div>
        </ProgressRing>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/40 text-center">
          <div className="text-2xl mb-1">🔥</div>
          <div className="text-xl font-bold text-white">{streak}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {streak % 10 === 1 && streak % 100 !== 11 ? "день" : [2, 3, 4].includes(streak % 10) && ![12, 13, 14].includes(streak % 100) ? "дня" : "дней"}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/40 text-center">
          <div className="text-2xl mb-1">📝</div>
          <div className="text-xl font-bold text-white">{progress.quizResults.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">тренировок</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/40 text-center">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-xl font-bold text-white">{avgScore}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">средний</div>
        </div>
      </div>

      {weakWords.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-white">⚠️ Слабые слова · {weakIds.length}</div>
            <button onClick={() => navigate("/quiz")} className="text-xs text-amber-300">
              Повторить →
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {weakWords.map((w) => (
              <span key={w!.id} className="px-2.5 py-1 rounded-lg bg-slate-900/60 text-sm text-white">
                <StressWord word={w!.word} accentClass="text-amber-300" />
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">По категориям</h2>
        <div className="space-y-3">
          {categories.map((cat) => {
            const catWords = words.filter((w) => w.category === cat.id);
            const l = catWords.filter((w) => learned.has(w.id)).length;
            const percent = catWords.length ? Math.round((l / catWords.length) * 100) : 0;
            return (
              <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40">
                <span className="text-lg">{cat.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-white font-medium">{cat.name}</span>
                    <span className="text-xs text-slate-400">{l}/{catWords.length}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {recent.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Последние тренировки</h2>
          <div className="space-y-2">
            {recent.map((q, i) => {
              const percent = Math.round((q.correct / q.total) * 100);
              const cat = categories.find((c) => c.id === q.mode);
              const label = q.mode === "ege" ? "📝 Формат ЕГЭ" : cat ? `${cat.emoji} Квиз · ${cat.name}` : "🧠 Квиз · все";
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40">
                  <span className="text-sm text-slate-300">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{q.correct}/{q.total}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        percent >= 70 ? "bg-emerald-500/20 text-emerald-400" : percent >= 50 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {learnedCount === 0 && progress.quizResults.length === 0 && (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">📖</div>
          <p className="text-slate-400 text-sm">
            Учи слова и проходи тренировки,
            <br />
            чтобы видеть свой прогресс здесь!
          </p>
        </div>
      )}
    </div>
  );
}
