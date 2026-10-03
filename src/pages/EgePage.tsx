import { useMemo, useState } from "react";
import { Word, stressIndex, vowelPositions, withStressAt } from "../data/words";
import StressWord from "../components/StressWord";
import {
  getAllWords,
  getExcludedIds,
  getWeakWordIds,
  recordWordCorrect,
  recordWordError,
  saveQuizResult,
  shuffle,
} from "../data/storage";

interface Item {
  word: Word;
  shownIdx: number;
  correct: boolean;
}
type Task = Item[];
type State = "setup" | "playing" | "results";

function wrongIdx(word: string): number {
  const right = stressIndex(word);
  const others = vowelPositions(word).filter((i) => i !== right);
  // чаще берём соседнюю гласную — самая типичная ошибка
  others.sort((a, b) => Math.abs(a - right) - Math.abs(b - right));
  return Math.random() < 0.7 ? others[0] : others[Math.floor(Math.random() * others.length)];
}

function makeTask(pool: Word[]): Task {
  const picked = shuffle(pool).slice(0, 5);
  // как в ЕГЭ: от 2 до 4 верных вариантов
  const nCorrect = 2 + Math.floor(Math.random() * 3);
  const correctSet = new Set(shuffle(picked.map((_, i) => i)).slice(0, nCorrect));
  return picked.map((w, i) => {
    const ok = correctSet.has(i);
    return { word: w, correct: ok, shownIdx: ok ? stressIndex(w.word) : wrongIdx(w.word) };
  });
}

export default function EgePage() {
  const [state, setState] = useState<State>("setup");
  const [taskCount, setTaskCount] = useState(5);
  const [onlyWeak, setOnlyWeak] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<Word[]>([]);

  const words = useMemo(() => getAllWords(), []);
  const weakCount = useMemo(() => getWeakWordIds().length, [state]);

  const start = () => {
    const excluded = new Set(getExcludedIds());
    let pool = words.filter((w) => vowelPositions(w.word).length >= 2 && !excluded.has(w.id));
    if (onlyWeak) {
      const weak = new Set(getWeakWordIds());
      const weakPool = pool.filter((w) => weak.has(w.id));
      // если слабых мало — добираем случайными
      pool = weakPool.length >= 5 ? weakPool : [...weakPool, ...shuffle(pool.filter((w) => !weak.has(w.id))).slice(0, 5 - weakPool.length)];
    }
    if (pool.length < 5) pool = words.filter((w) => vowelPositions(w.word).length >= 2);
    setTasks(Array.from({ length: taskCount }, () => makeTask(pool)));
    setCurrent(0);
    setSelected(new Set());
    setChecked(false);
    setScore(0);
    setMistakes([]);
    setState("playing");
  };

  const toggle = (i: number) => {
    if (checked) return;
    setSelected((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };

  const check = () => {
    const task = tasks[current];
    let allOk = true;
    const wrong: Word[] = [];
    task.forEach((it, i) => {
      const ok = selected.has(i) === it.correct;
      if (ok) recordWordCorrect(it.word.id);
      else {
        allOk = false;
        recordWordError(it.word.id);
        wrong.push(it.word);
      }
    });
    if (allOk) setScore((s) => s + 1);
    setMistakes((m) => [...m, ...wrong.filter((w) => !m.some((x) => x.id === w.id))]);
    setChecked(true);
  };

  const next = () => {
    if (current + 1 >= tasks.length) {
      saveQuizResult(score, tasks.length, "ege");
      setState("results");
    } else {
      setCurrent((c) => c + 1);
      setSelected(new Set());
      setChecked(false);
    }
  };

  if (state === "setup") {
    return (
      <div className="px-5 pt-8 pb-4 animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-white mb-2">Задание 4</h1>
        <p className="text-slate-400 text-sm mb-6">Тренировка в формате ЕГЭ</p>

        <div className="mb-6 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/40 text-sm text-slate-300 leading-relaxed">
          Укажите варианты ответов, в которых <b className="text-white">верно</b> выделена буква, обозначающая ударный
          гласный звук. Верных ответов — от 2 до 4. Балл ставится, только если выбраны все верные варианты и ни одного
          лишнего.
        </div>

        <div className="mb-5">
          <label className="text-sm font-medium text-slate-300 mb-3 block">Слова</label>
          <div className="flex gap-2">
            {[
              { key: false, label: "Все", emoji: "📖", count: words.length },
              { key: true, label: "Мои ошибки", emoji: "❌", count: weakCount },
            ].map(({ key, label, emoji, count }) => (
              <button
                key={label}
                onClick={() => setOnlyWeak(key)}
                disabled={key && count === 0}
                className={`flex-1 py-3 rounded-xl text-xs font-medium transition-all ${
                  onlyWeak === key ? "bg-brand-500 text-white" : "bg-slate-800 text-slate-400 border border-slate-700/50"
                } ${key && count === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {emoji} {label}
                <span className="block text-[10px] opacity-70 mt-0.5">{count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="text-sm font-medium text-slate-300 mb-3 block">Количество заданий</label>
          <div className="flex gap-2">
            {[1, 5, 10, 20].map((n) => (
              <button
                key={n}
                onClick={() => setTaskCount(n)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                  taskCount === n ? "bg-brand-500 text-white" : "bg-slate-800 text-slate-400 border border-slate-700/50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={start}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-base active:scale-[0.98] transition-all"
        >
          Начать
        </button>
      </div>
    );
  }

  if (state === "playing") {
    const task = tasks[current];
    const answer = task
      .map((it, i) => (it.correct ? i + 1 : null))
      .filter(Boolean)
      .join("");
    const userAnswer = [...selected].sort().map((i) => i + 1).join("");
    const allOk = answer === userAnswer;

    return (
      <div className="px-5 pt-8 pb-4 animate-slide-up">
        <div className="w-full mb-5">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>Задание {current + 1}/{tasks.length}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">баллы: {score}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${((current + 1) / tasks.length) * 100}%` }}
            />
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-4">
          Отметь варианты, в которых <b className="text-white">верно</b> выделена ударная гласная:
        </p>

        <div className="flex flex-col gap-3 mb-5">
          {task.map((it, i) => {
            const isSel = selected.has(i);
            let style = isSel
              ? "bg-brand-500/20 border-brand-400 text-white"
              : "bg-slate-800/80 border-slate-700/50 text-white";
            if (checked) {
              const ok = isSel === it.correct;
              style = it.correct
                ? "bg-emerald-500/15 border-emerald-500 text-emerald-100"
                : isSel
                ? "bg-red-500/15 border-red-500 text-red-200"
                : "bg-slate-800/40 border-slate-700/30 text-slate-400";
              if (!ok && it.correct) style += " ring-1 ring-amber-400/60";
            }
            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`w-full py-4 px-5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.99] ${style}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 shrink-0 rounded-md border flex items-center justify-center text-xs ${
                      isSel ? "bg-brand-500 border-brand-400 text-white" : "border-slate-600 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className="text-slate-500 font-mono text-sm">{i + 1})</span>
                  <span className="text-xl font-display font-semibold tracking-wide">
                    {withStressAt(it.word.word, it.shownIdx)}
                  </span>
                  {it.word.hint && <span className="text-[11px] text-slate-500 ml-auto text-right">{it.word.hint}</span>}
                </div>
                {checked && !it.correct && (
                  <div className="mt-2 pl-9 text-sm text-slate-300">
                    Правильно: <StressWord word={it.word.word} className="font-semibold text-white" accentClass="text-amber-300" />
                    {it.word.tip && <span className="block text-xs text-amber-200/80 mt-1">💡 {it.word.tip}</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {checked ? (
          <>
            <div
              className={`mb-4 p-4 rounded-2xl border text-center ${
                allOk ? "bg-emerald-500/10 border-emerald-500/40" : "bg-red-500/10 border-red-500/40"
              }`}
            >
              <div className={`font-semibold ${allOk ? "text-emerald-300" : "text-red-300"}`}>
                {allOk ? "Верно! +1 балл" : "0 баллов"}
              </div>
              <div className="text-sm text-slate-300 mt-1">
                Ответ: <b className="text-white font-mono">{answer}</b>
                {!allOk && (
                  <>
                    {" "}· твой: <b className="font-mono">{userAnswer || "—"}</b>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={next}
              className="w-full py-4 rounded-2xl bg-brand-500 text-white font-semibold active:scale-[0.98] transition-all"
            >
              {current + 1 >= tasks.length ? "Результаты" : "Следующее задание →"}
            </button>
          </>
        ) : (
          <button
            onClick={check}
            disabled={selected.size === 0}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold active:scale-[0.98] transition-all disabled:opacity-40"
          >
            Проверить
          </button>
        )}
      </div>
    );
  }

  const percent = tasks.length ? Math.round((score / tasks.length) * 100) : 0;
  return (
    <div className="px-5 pt-8 pb-4 animate-fade-in flex flex-col items-center">
      <h1 className="text-2xl font-display font-bold text-white mb-6">Результаты</h1>
      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex flex-col items-center justify-center mb-6">
        <span className="text-4xl font-display font-bold text-white">{percent}%</span>
        <span className="text-sm text-slate-400 mt-1">{score} / {tasks.length} баллов</span>
      </div>
      <p className="text-slate-400 text-sm mb-6 text-center">
        {percent >= 80 ? "Отлично! 🎉" : percent >= 50 ? "Хороший результат! 👍" : "Продолжай тренироваться! 💪"}
      </p>
      {mistakes.length > 0 && (
        <div className="w-full mb-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Повтори эти слова</h2>
          <div className="flex flex-wrap gap-2">
            {mistakes.map((w) => (
              <span key={w.id} className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/50 text-sm text-white">
                <StressWord word={w.word} accentClass="text-amber-300" />
              </span>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setState("setup")}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-base active:scale-[0.98] transition-all"
      >
        Ещё раз
      </button>
    </div>
  );
}
