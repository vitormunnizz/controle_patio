"use client";

import { Search, RotateCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchVeiculos() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) params.set("search", query.trim());
    else params.delete("search");
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const handleClear = () => {
    setQuery("");
    router.push("/", { scroll: false });
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 w-full items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Placa, cliente..."
          className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:ring-1 focus:ring-jc-blue transition-all"
        />
      </div>
      
      <button 
        type="submit"
        className="h-9 px-4 bg-slate-900 hover:bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shrink-0"
      >
        Buscar
      </button>

      <button 
        type="button"
        onClick={handleClear}
        className="h-9 px-3 bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
      >
        <RotateCcw size={12} />
        Limpar
      </button>
    </form>
  );
}