"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Calendar as CalendarIcon, Filter, RotateCcw } from "lucide-react";

export function DashboardDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Pegamos os valores atuais para preencher o formulário ao carregar
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
    // Limpa a URL e a página recarregará com os valores padrão
    router.push(pathname, { scroll: false });
  };

  return (
    <form onSubmit={handleFilter} className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/10">
      {/* Container dos Inputs */}
      <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg shadow-inner">
        <CalendarIcon size={12} className="text-slate-300" />
        <input 
          name="from"
          type="date" 
          key={`from-${fromUrl}`} // Força o input a atualizar visualmente no reset
          defaultValue={fromUrl} 
          className="text-[9px] font-black text-slate-700 uppercase outline-none bg-transparent w-[92px]" 
        />
        <span className="text-slate-200 font-bold">/</span>
        <input 
          name="to"
          type="date" 
          key={`to-${toUrl}`} // Força o input a atualizar visualmente no reset
          defaultValue={toUrl} 
          className="text-[9px] font-black text-slate-700 uppercase outline-none bg-transparent w-[92px]" 
        />
      </div>
      
      {/* Botão Filtrar */}
      <button 
        type="submit"
        className="bg-jc-yellow hover:bg-yellow-400 text-jc-navy h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1 shadow-sm"
      >
        <Filter size={10} />
        Filtrar
      </button>

      {/* Botão Limpar Fixo */}
      <button 
        type="button"
        onClick={handleReset}
        className="bg-white/10 hover:bg-white/20 text-white h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1 shadow-sm border border-white/5"
      >
        <RotateCcw size={11} />
        Limpar
      </button>
    </form>
  );
}