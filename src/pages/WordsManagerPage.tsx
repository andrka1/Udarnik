import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categories, plain } from "../data/words";
import {
  getAllWords,
  addCustomWord,
  removeCustomWord,
  getExcludedIds,
  excludeWord,
  includeWord,
  getWeakWordIds,
} from "../data/storage";
import StressWord from "../components/StressWord";

export default function WordsManagerPage() {
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [newWord, setNewWord] = useState("");
  const [newHint, setNewHint] = useState("");
  const [error, setError] = useState<string | null>(null);

  const words = useMemo(() => getAllWords(), [version]);
  const excluded = useMemo(() => new Set(getExcludedIds()), [version]);
  const weak = useMemo(() => new Set(getWeakWordIds()), [version]);

  const q = plain(query.trim());
  const list = words.filter((w) => {
    if (cat === "weak" && !weak.has(w.id)) return false;
    if (cat === "hidden" && !excluded.has(w.id)) return false;
    if (!["all", "weak", "hidden"].includes(cat) && w.category !== cat) return false;
    return !q || plain(w.word).includes(q);
  });

  const add = () => {
    const err = addCustomWord(newWord, newHint);
    setError(err);
    if (!err) {
      setNewWord("");
      setNewHint("");
      setVersion((v) => v + 1);
    }
  };

  const chips = [
    { id: "all", label: "🌐 Все" },
    ...categories.map((c) => ({ id: c.id, label: `${c.emoji} ${c.name}` })),
    ...(words.some((w) => w.custom) ? [{ id: "custom", label: "✍️ Мои" }] : []),
    { id: "weak", label: "❌ Ошибки" },
    { id: "hidden", label: "🙈 Скрытые" },
  ];

  return (
    <div className="px-5 pt-8 pb-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
          ←
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Словарь</h1>
          <p className="text-xs text-slate-400">{words.length} слов · {excluded.size} скрыто</p>
        </div>
      </div>

      {/* Add */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/40">
        <h2 className="text-sm font-semibold text-white mb-1">Добавить своё слово</h2>
        <p className="text-xs text-slate-400 mb-3">Ударную гласную пиши заглавной: облегчИть, каталОг, вручИт</p>
        <input value={newWord} onChange={(e) => setNewWord(e.target.value)} placeholder="Слово, напр. щавЕль" className="input-field mb-2" />
        <input value={newHint} onChange={(e) => setNewHint(e.target.value)} placeholder="Пометка (необязательно)" className="input-field mb-2" />
        {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
        <button onClick={add} disabled={!newWord.trim()} className="w-full py-3 rounded-xl bg-brand-500 text-white text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-40">
          Добавить
        </button>
      </div>

      {/* Search */}
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="🔎 Поиск слова…" className="input-field mb-3" />
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-5 px-5">
        {chips.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              cat === c.id ? "bg-brand-500 text-white" : "bg-slate-800 text-slate-400 border border-slate-700/50"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500 mb-2">Найдено: {list.length}</p>
      <div className="flex flex-col gap-2">
        {list.map((w) => {
          const hidden = excluded.has(w.id);
          return (
            <div key={w.id} className={`p-3 rounded-xl bg-slate-800/50 border border-slate-700/40 flex items-center gap-3 ${hidden ? "opacity-50" : ""}`}>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-display font-semibold text-white">
                  <StressWord word={w.word} />
                  {weak.has(w.id) && <span className="ml-2 text-xs text-red-400">● ошибка</span>}
                </div>
                {(w.hint || w.tip) && (
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {w.hint}
                    {w.hint && w.tip ? " · " : ""}
                    {w.tip && <span className="text-amber-200/70">{w.tip}</span>}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  hidden ? includeWord(w.id) : excludeWord(w.id);
                  setVersion((v) => v + 1);
                }}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-700/60 text-slate-300 active:scale-95 whitespace-nowrap"
              >
                {hidden ? "Вернуть" : "Скрыть"}
              </button>
              {w.custom && (
                <button
                  onClick={() => {
                    if (window.confirm(`Удалить «${plain(w.word, false)}»?`)) {
                      removeCustomWord(w.id);
                      setVersion((v) => v + 1);
                    }
                  }}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/15 text-red-300 active:scale-95"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
