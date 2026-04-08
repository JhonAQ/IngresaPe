import { BookOpen, ChevronDown } from "lucide-react";

export function CourseProgress() {
  return (
    <button className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors w-full text-left">
      <div className="flex items-center gap-3 w-full">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center border-2 border-green-200 shrink-0">
          <BookOpen size={20} className="text-green-600" />
        </div>
        <div className="flex flex-col items-start flex-1 pr-2 w-full">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1">
            Curso Actual
          </span>
          <span className="text-lg font-black text-slate-800 leading-none mb-2">
            Biología Celular
          </span>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-[35%] rounded-full"></div>
          </div>
        </div>
      </div>
      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200 shrink-0 ml-2">
        <ChevronDown size={20} className="text-slate-500" strokeWidth={3} />
      </div>
    </button>
  );
}