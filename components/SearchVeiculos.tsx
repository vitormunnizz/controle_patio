// components/SearchVeiculos.tsx
"use client";

import { Search, RotateCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchVeiculos() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [term, setTerm] = useState(searchParams.get("search") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) {
      router.push(`/?search=${encodeURIComponent(term)}`);
    } else {
      router.push("/");
    }
  };

  const handleReset = () => {
    setTerm("");
    router.push("/");
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-1.5 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <input
          type="text"
          placeholder="Placa, cliente..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="w-full h-9 pl-8 pr-3 bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-jc-blue/30"
        />
      </div>
      <button
        type="submit"
        className="h-9 px-3 bg-jc-navy cursor-pointer text-white rounded-xl text-[9px] font-black uppercase tracking-wider shrink-0"
      >
        Buscar
      </button>
      {searchParams.get("search") && (
        <button
          type="button"
          onClick={handleReset}
          className="h-9 px-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors shrink-0"
        >
          <RotateCcw size={14} />
        </button>
      )}
    </form>
  );
}