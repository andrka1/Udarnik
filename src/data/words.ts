// Орфоэпический словник ЕГЭ (ФИПИ), задание 4, + частые слова из сборников.
// Формат строки: слово с ЗАГЛАВНОЙ ударной гласной | пометка (видна всегда) | подсказка (после ответа)

export interface Word {
  id: string; // само слово с ударением, напр. «облегчИть»
  word: string; // то же, с заглавной ударной гласной
  category: string;
  hint?: string;
  tip?: string;
  custom?: boolean;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

export const categories: Category[] = [
  { id: "nouns", name: "Существительные", emoji: "📦", description: "кремЕнь, бАнты, ногтЕй…", color: "from-brand-500 to-brand-600" },
  { id: "adjectives", name: "Прилагательные", emoji: "🎨", description: "мозаИчный, красИвее, настОящий…", color: "from-pink-500 to-rose-600" },
  { id: "verbs", name: "Глаголы", emoji: "⚡", description: "облегчИть, ворвалАсь, вручИт…", color: "from-accent-500 to-accent-600" },
  { id: "participles", name: "Причастия", emoji: "🧩", description: "нажИвший, довезЁнный, зАпертый…", color: "from-emerald-500 to-teal-600" },
  { id: "gerunds", name: "Деепричастия", emoji: "🏃", description: "прибЫв…", color: "from-amber-500 to-orange-600" },
  { id: "adverbs", name: "Наречия", emoji: "🕰️", description: "дОверху, прозорлИво…", color: "from-indigo-500 to-violet-600" },
  { id: "extra", name: "Другие слова", emoji: "⭐", description: "Дополнительные слова из присланных списков", color: "from-sky-500 to-cyan-600" },
];

const RAW: Record<string, string> = {
  nouns: `
дОйка
еретИк
цЕнтнер
цемЕнт
наготА
ногтЕй
кремЕнь
бАнты
локтЕй
тамОжня
корЫсть
камбалА
послЕдний
нЕдруг
морехОд
слЕсари
товАрищество
знАчимость
пОручни
партЕр
каталОг
придАное
директОров
профессорОв
диспансЕр
бухгАлтеров
обеспЕчение
сосредотОчение
`,
  adjectives: `
красИвее
вернА
мозаИчный
причАстный
заговОрной
деревЯнный
знАчимый
слИвовый
настОящий
корИчневый
`,
  verbs: `
облегчИть
ворвалАсь
кровоточИть
дождалАсь
озлОбить
откУпорить
закУпорить
чЕрпать
щЁлкать
углубИть
прИбыл
совралА
вручИт
сверлИт
взялАсь
вручИм
набралА
щемИт
звонИт
повторИт
клАла
обнялАсь
послАла
воссоздАл
сорИт
`,
  participles: `
кровоточАщий
нажИвший
зАпертый
снятА
занятА
Убрана
углублЁнный
довезЁнный
`,
  gerunds: `
прибЫв
`,
  adverbs: `
дОверху
прозорлИво
`,
  extra: `
тУфля
свЁкла
срЕдство
`,
};

export const VOWELS = "аеёиоуыэюяАЕЁИОУЫЭЮЯ";
export const isVowel = (ch: string) => VOWELS.includes(ch);

/** Индекс ударной (заглавной) гласной */
export function stressIndex(word: string): number {
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    if (isVowel(ch) && ch !== ch.toLowerCase()) return i;
  }
  // одна гласная или ё — считаем её ударной
  const yo = word.toLowerCase().indexOf("ё");
  if (yo >= 0) return yo;
  for (let i = 0; i < word.length; i++) if (isVowel(word[i])) return i;
  return -1;
}

/** Слово без ударения; ё заменяется на е, чтобы не подсказывать */
export function plain(word: string, hideYo = true): string {
  const low = word.toLowerCase();
  return hideYo ? low.replace(/ё/g, "е") : low;
}

/** Слово с ударной заглавной гласной в позиции idx */
export function withStressAt(word: string, idx: number, hideYo = true): string {
  const p = plain(word, hideYo);
  return p.slice(0, idx) + p[idx].toUpperCase() + p.slice(idx + 1);
}

export function vowelPositions(word: string): number[] {
  const res: number[] = [];
  for (let i = 0; i < word.length; i++) if (isVowel(word[i])) res.push(i);
  return res;
}

function parse(): Word[] {
  const list: Word[] = [];
  const seen = new Set<string>();
  for (const [category, raw] of Object.entries(RAW)) {
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t) continue;
      const [w, hint, tip] = t.split("|").map((s) => s.trim());
      if (seen.has(w)) continue;
      seen.add(w);
      list.push({ id: w, word: w, category, hint: hint || undefined, tip: tip || undefined });
    }
  }
  return list;
}

export const baseWords: Word[] = parse();
