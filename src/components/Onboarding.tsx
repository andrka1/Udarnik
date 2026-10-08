import { useState } from "react";

const slides = [
  {
    emoji: "📚",
    title: "Слова для тренировки",
    text: "Слова из присланных списков — в удобных карточках для тренировки.",
    color: "from-brand-500 to-brand-600",
  },
  {
    emoji: "🎯",
    title: "Тренируйтесь как на экзамене",
    text: "Квиз «Где ударение?» и задания в формате ЕГЭ. Ошибки попадают в отдельный список для повторения.",
    color: "from-accent-500 to-accent-600",
  },
  {
    emoji: "➕",
    title: "Добавляйте свои слова",
    text: "Встретили новое слово в пробнике? Добавьте его в словарь: облегчИть — ударная гласная заглавной буквой.",
    color: "from-emerald-500 to-teal-600",
  },
];

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const isLast = step === slides.length - 1;
  const slide = slides[step];

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-10">
      {/* Skip */}
      <div className="flex justify-end h-6">
        {!isLast && (
          <button
            onClick={onDone}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Пропустить
          </button>
        )}
      </div>

      {/* Slide */}
      <div
        key={step}
        className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in"
      >
        <div
          className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center text-6xl mb-8 shadow-soft`}
        >
          {slide.emoji}
        </div>
        <h1 className="text-2xl font-display font-bold text-white mb-3">{slide.title}</h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">{slide.text}</p>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === step ? "w-6 bg-brand-400" : "w-2 bg-slate-700"
            }`}
          />
        ))}
      </div>

      {/* Actions */}
      <button
        onClick={() => (isLast ? onDone() : setStep((s) => s + 1))}
        className="w-full py-4 rounded-2xl bg-brand-500 text-white font-semibold active:scale-[0.98] transition-all shadow-soft"
      >
        {isLast ? "Начать обучение" : "Далее"}
      </button>
    </div>
  );
}
