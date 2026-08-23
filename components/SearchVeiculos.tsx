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
    
    if (query.trim()) {
      params.set("search", query.trim());
    } else {
      params.delete("search");
    }

    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const handleClear = () => {
    setQuery("");
    router.push("/", { scroll: false });
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-3 w-full items-center">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Placa, cliente ou modelo..."
          className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
        />
      </div>
      
      <button 
        type="submit"
        className="h-12 px-6 bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md shrink-0 flex items-center justify-center"
      >
        Buscar
      </button>

      <button 
        type="button"
        onClick={handleClear}
        className="h-12 px-5 bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 shadow-sm"
      >
        <RotateCcw size={14} />
        Limpar
      </button>
    </form>
  );
}