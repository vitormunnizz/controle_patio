"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, RotateCcw, Calendar } from "lucide-react";

export function DashboardDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const fromUrl = searchParams.get("from") || "";
  const toUrl = searchParams.get("to") || "";

  const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const from = formData.get("from") as string;
    const to = formData.get("to") as string;

    const params = new URLSearchParams(searchParams.toString());
    
    if (from) params.set("from", from); 
    else params.delete("from");
    
    if (to) params.set("to", to); 
    else params.delete("to");

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleReset = () => {
    router.push(pathname, { scroll: false });
  };

  // Abre o calendário nativo ao clicar
  const openPicker = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
      e.currentTarget.showPicker();
    } catch {
      // Fallback para navegadores antigos
    }
  };

  return (
    <form 
      onSubmit={handleFilter} 
      className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-1.5 bg-white/10 p-1.5 rounded-xl border border-white/10 w-full sm:w-auto"
    >
      {/* Container de datas: dividido metade a metade (50% / 50%) */}
      <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white rounded-lg shadow-inner w-full sm:w-[220px] shrink-0">
        <Calendar size={13} className="text-slate-400 shrink-0" />
        
        <input 
          name="from"
          type="date" 
          key={`from-${fromUrl}`}
          defaultValue={fromUrl} 
          onClick={openPicker}
          className="flex-1 w-full text-[10px] font-black text-slate-700 uppercase outline-none bg-transparent p-0 text-center border-none focus:ring-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden" 
        />
        
        <span className="text-slate-300 font-bold text-[10px] shrink-0">/</span>
        
        <input 
          name="to"
          type="date" 
          key={`to-${toUrl}`}
          defaultValue={toUrl} 
          onClick={openPicker}
          className="flex-1 w-full text-[10px] font-black text-slate-700 uppercase outline-none bg-transparent p-0 text-center border-none focus:ring-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden" 
        />
      </div>
      
      {/* Botões do Filtro */}
      <div className="flex items-center gap-1.5 w-full sm:w-auto">
        <button 
          type="submit"
          className="flex-1 sm:flex-initial bg-jc-yellow hover:bg-yellow-400 text-jc-navy h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1 shadow-sm cursor-pointer"
        >
          <Filter size={10} />
          <span>Filtrar</span>
        </button>

        <button 
          type="button"
          onClick={handleReset}
          className="flex-1 sm:flex-initial bg-white/10 hover:bg-white/20 text-white h-7 px-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1 shadow-sm border border-white/5 cursor-pointer"
        >
          <RotateCcw size={10} />
          <span>Limpar</span>
        </button>
      </div>
    </form>
  );
}