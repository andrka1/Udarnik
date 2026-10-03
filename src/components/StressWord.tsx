import { stressIndex, plain } from "../data/words";

interface Props {
  word: string;
  /** позиция выделяемой гласной; по умолчанию — правильная ударная */
  at?: number;
  hideYo?: boolean;
  className?: string;
  accentClass?: string;
}

export default function StressWord({ word, at, hideYo = false, className = "", accentClass = "text-accent-400" }: Props) {
  const idx = at ?? stressIndex(word);
  const p = plain(word, hideYo);
  return (
    <span className={className}>
      {p.slice(0, idx)}
      <span className={accentClass}>{p.slice(idx, idx + 1).toUpperCase()}</span>
      {p.slice(idx + 1)}
    </span>
  );
}
