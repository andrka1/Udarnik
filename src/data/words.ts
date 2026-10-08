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
  { id: "nouns", name: "Существительные", emoji: "📦", description: "кремЕнь, бАнты, партЕр…", color: "from-brand-500 to-brand-600" },
  { id: "adjectives", name: "Прилагательные", emoji: "🎨", description: "мозаИчный, красИвее, слИвовый…", color: "from-pink-500 to-rose-600" },
  { id: "verbs", name: "Глаголы", emoji: "⚡", description: "облегчИт, ворвалАсь, звонИт…", color: "from-accent-500 to-accent-600" },
  { id: "participles", name: "Причастия", emoji: "🧩", description: "прИнятый, довезЁнный, зАпертый…", color: "from-emerald-500 to-teal-600" },
  { id: "gerunds", name: "Деепричастия", emoji: "🏃", description: "прибЫв, поднЯв…", color: "from-amber-500 to-orange-600" },
  { id: "adverbs", name: "Наречия", emoji: "🕰️", description: "дОверху, дОнизу, прозорлИво…", color: "from-indigo-500 to-violet-600" },
];

const RAW: Record<string, string> = {
  nouns: `
дОечка
еретИк
цЕнтнер
цемЕнт
ногтЕй
кремЕнь
бАнты
локтЕй
тамОжня
корЫсть
партЕр
дешевИзна
каталОг
придАное
директорОв
профессорОв
диспансЕр
бухгАлтеров
шофЁров
слЕсари
некролОг
крАны
газопровОд
пОручни
знАчимость
сосредотОчение
обеспЕчение
срЕдство
тУфля
свЁкла
`,
  adjectives: `
мозаИчный
красИвее
вернА
знАчимый
слИвовый
`,
  verbs: `
облегчИт
ворвалАсь
дождалАсь
наделЯт
откУпорить
закУпорить
чЕрпать
щЁлкать
углубИт
воссоздалА
озлОбить
кровоточИть
совралА
вручИт
сверлИт
кАшлянуть
послАла
пломбировАть
взялАсь
набралА
звонИт
повторЯт
обнялАсь
сорИт
начАть
нагрузИт
`,
  participles: `
кровоточАщий
прИнятый
почИвший
кормЯщий
зАпертый
углублЁнный
довезЁнный
снятА
занятА
Убрана
`,
  gerunds: `
прибЫв
поднЯв
`,
  adverbs: `
дОверху
прозорлИво
дОнизу
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
