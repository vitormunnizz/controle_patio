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
          className="w-full h-11 pl-10 pr-3 bg-slate-50 text-slate-800 rounded-xl text-sm font-medium placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jc-blue/25 focus:border-jc-blue"
        />
      </div>
      <button
        type="submit"
        className="h-11 px-4 bg-jc-navy cursor-pointer text-white rounded-xl text-[11px] font-bold uppercase tracking-wide shrink-0 hover:bg-jc-blue transition-colors"
      >
        Buscar
      </button>
      {searchParams.get("search") && (
        <button
          type="button"
          onClick={handleReset}
          className="h-11 px-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors shrink-0"
        >
          <RotateCcw size={14} />
        </button>
      )}
    </form>
  );
}
