import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProgress, resetProgress, clearExcluded, STORAGE_KEY } from "../data/storage";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [exportText, setExportText] = useState<string | null>(null);
  const [importText, setImportText] = useState("");
  const [copied, setCopied] = useState(false);

  const handleReset = () => {
    if (window.confirm("Сбросить весь прогресс? Свои слова сохранятся. Это действие необратимо.")) {
      resetProgress();
      navigate("/");
    }
  };

  const handleExport = () => {
    setExportText(localStorage.getItem(STORAGE_KEY) || JSON.stringify(getProgress()));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportText || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // буфер недоступен — пользователь выделит текст вручную
    }
  };

  const handleImport = () => {
    const text = importText.trim();
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object") throw new Error("bad");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      window.alert("Прогресс восстановлен!");
      navigate("/");
    } catch {
      window.alert("Неверный формат резервной копии.");
    }
  };

  return (
    <div className="px-5 pt-8 pb-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        >
          ←
        </button>
        <h1 className="text-2xl font-display font-bold text-white">Настройки</h1>
      </div>

      {/* Backup */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          💾 Резервная копия
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          Сохрани прогресс в текст и восстанови его на другом устройстве или после переустановки.
        </p>
        <button
          onClick={handleExport}
          className="w-full py-3 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300 text-sm font-medium active:scale-[0.98] transition-all"
        >
          Создать резервную копию
        </button>
        {exportText && (
          <div className="mt-3">
            <textarea
              readOnly
              value={exportText}
              onFocus={(e) => e.target.select()}
              className="w-full h-24 p-3 rounded-xl bg-slate-800 border border-slate-700/50 text-slate-300 text-xs font-mono resize-none"
            />
            <button
              onClick={handleCopy}
              className="w-full mt-2 py-2.5 rounded-xl bg-slate-800 border border-slate-700/50 text-slate-300 text-sm font-medium active:scale-[0.98] transition-all"
            >
              {copied ? "Скопировано ✓" : "Копировать"}
            </button>
          </div>
        )}
        <label className="text-xs text-slate-400 mt-4 mb-2 block">Восстановить из копии</label>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Вставь сюда сохранённый текст…"
          className="w-full h-24 p-3 rounded-xl bg-slate-800 border border-slate-700/50 text-slate-200 text-xs font-mono resize-none mb-2"
        />
        <button
          onClick={handleImport}
          disabled={!importText.trim()}
          className="w-full py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-medium active:scale-[0.98] transition-all disabled:opacity-40"
        >
          Восстановить прогресс
        </button>
      </div>

      {/* Danger zone */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Данные</h2>
        <button
          onClick={() => {
            clearExcluded();
            window.alert("Все скрытые слова снова в тренировках.");
          }}
          className="w-full mb-3 py-3.5 rounded-2xl bg-slate-800 border border-slate-700/50 text-slate-300 font-medium active:scale-[0.98] transition-all"
        >
          Вернуть скрытые слова
        </button>
        <button
          onClick={handleReset}
          className="w-full py-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-medium active:scale-[0.98] transition-all"
        >
          Сбросить прогресс
        </button>
      </div>
    </div>
  );
}
