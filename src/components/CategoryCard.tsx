import { useNavigate } from "react-router-dom";
import { Category } from "../data/words";

interface Props {
  category: Category;
  totalCount: number;
  learnedCount: number;
}

export default function CategoryCard({ category, totalCount, learnedCount }: Props) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/flashcards/${category.id}`)}
      className="w-full p-4 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center gap-4 transition-all duration-200 hover:bg-slate-800 active:scale-[0.98] group"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-xl shadow-soft`}>
        {category.emoji}
      </div>
      <div className="flex-1 text-left min-w-0">
        <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors">{category.name}</h3>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{category.description}</p>
      </div>
      <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
        {learnedCount}/{totalCount}
      </span>
    </button>
  );
}
