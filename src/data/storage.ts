import { baseWords, Word, stressIndex } from "./words";

export interface QuizResult {
  date: string;
  correct: number;
  total: number;
  mode: string; // "letter" | "ege" | category id
}

export interface UserProgress {
  dataVersion: number;
  learnedWords: string[];
  excludedWords: string[];
  quizResults: QuizResult[];
  wordErrors: Record<string, number>;
  customWords: Word[];
  streak: number;
  lastActiveDate: string;
}

export const STORAGE_KEY = "udarnik_progress";

const defaults = (): UserProgress => ({
  dataVersion: 1,
  learnedWords: [],
  excludedWords: [],
  quizResults: [],
  wordErrors: {},
  customWords: [],
  streak: 0,
  lastActiveDate: "",
});

export function getProgress(): UserProgress {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return defaults();
    return { ...defaults(), ...JSON.parse(s) };
  } catch {
    return defaults();
  }
}

export function saveProgress(p: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // хранилище недоступно
  }
}

function update(fn: (p: UserProgress) => void): UserProgress {
  const p = getProgress();
  fn(p);
  touchStreak(p);
  saveProgress(p);
  return p;
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function touchStreak(p: UserProgress) {
  const t = today();
  if (p.lastActiveDate === t) return;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yStr = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`;
  p.streak = p.lastActiveDate === yStr ? p.streak + 1 : 1;
  p.lastActiveDate = t;
}

export function getStreak(): number {
  const p = getProgress();
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yStr = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`;
  return p.lastActiveDate === today() || p.lastActiveDate === yStr ? p.streak : 0;
}

// ---------- слова ----------
export function getAllWords(): Word[] {
  const custom = getProgress().customWords.map((w) => ({ ...w, custom: true }));
  const ids = new Set(baseWords.map((w) => w.id));
  return [...baseWords, ...custom.filter((w) => !ids.has(w.id))];
}

export function addCustomWord(word: string, hint?: string): string | null {
  const w = word.trim().replace(/\s+/g, "");
  if (!w) return "Введи слово";
  if (!/^[а-яёА-ЯЁ-]+$/.test(w)) return "Только русские буквы";
  const upper = [...w].filter((c) => c !== c.toLowerCase());
  if (upper.length !== 1 || stressIndex(w) < 0) return "Выдели ударную гласную ОДНОЙ заглавной буквой: звонИт";
  if (getAllWords().some((x) => x.id === w)) return "Такое слово уже есть";
  update((p) => {
    p.customWords.push({ id: w, word: w, category: "custom", hint: hint?.trim() || undefined, custom: true });
  });
  return null;
}

export function removeCustomWord(id: string): void {
  update((p) => {
    p.customWords = p.customWords.filter((w) => w.id !== id);
  });
}

export function markWordLearned(id: string): void {
  update((p) => {
    if (!p.learnedWords.includes(id)) p.learnedWords.push(id);
  });
}
export function unmarkWordLearned(id: string): void {
  update((p) => {
    p.learnedWords = p.learnedWords.filter((x) => x !== id);
  });
}
export function isWordLearned(id: string): boolean {
  return getProgress().learnedWords.includes(id);
}

export function excludeWord(id: string): void {
  update((p) => {
    if (!p.excludedWords.includes(id)) p.excludedWords.push(id);
  });
}
export function includeWord(id: string): void {
  update((p) => {
    p.excludedWords = p.excludedWords.filter((x) => x !== id);
  });
}
export function getExcludedIds(): string[] {
  return getProgress().excludedWords;
}
export function clearExcluded(): void {
  update((p) => {
    p.excludedWords = [];
  });
}

export function recordWordError(id: string): void {
  update((p) => {
    p.wordErrors[id] = (p.wordErrors[id] || 0) + 1;
    p.learnedWords = p.learnedWords.filter((x) => x !== id);
  });
}
export function recordWordCorrect(id: string): void {
  update((p) => {
    if (p.wordErrors[id]) {
      p.wordErrors[id] -= 1;
      if (p.wordErrors[id] <= 0) delete p.wordErrors[id];
    }
  });
}
export function getWeakWordIds(): string[] {
  const e = getProgress().wordErrors;
  return Object.keys(e)
    .filter((k) => e[k] > 0)
    .sort((a, b) => e[b] - e[a]);
}

export function saveQuizResult(correct: number, total: number, mode: string): void {
  update((p) => {
    p.quizResults.push({ date: new Date().toISOString(), correct, total, mode });
    if (p.quizResults.length > 200) p.quizResults = p.quizResults.slice(-200);
  });
}

export function resetProgress(): void {
  const custom = getProgress().customWords;
  saveProgress({ ...defaults(), customWords: custom });
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
