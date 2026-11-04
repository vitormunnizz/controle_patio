"use client";

import { useRouter, usePathname } from "next/navigation";
import { Filter, RotateCcw } from "lucide-react";

export function DashboardDateFilter({ initialFrom, initialTo }: { initialFrom: string; initialTo: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const fromUrl = initialFrom;
  const toUrl = initialTo;

  const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const from = String(formData.get("from") || "");
    const to = String(formData.get("to") || "");

    const params = new URLSearchParams();
    
    if (from) params.set("from", from); 
    else params.delete("from");
    
    if (to) params.set("to", to); 
    else params.delete("to");

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handleReset = () => {
    router.push(pathname, { scroll: false });
  };

  return (
    <form onSubmit={handleFilter} className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-3">
      <div className="grid min-w-0 grid-cols-2 gap-2">
        <label className="page-caption flex min-w-0 flex-col gap-1 font-semibold text-slate-500">
          De
          <input
            name="from"
            type="date"
            key={`from-${fromUrl}`}
            defaultValue={fromUrl}
            className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-800 outline-none transition-colors focus:border-jc-blue focus:bg-white focus:ring-2 focus:ring-blue-100 sm:px-3 sm:text-sm"
          />
        </label>
        <label className="page-caption flex min-w-0 flex-col gap-1 font-semibold text-slate-500">
          Até
          <input
            name="to"
            type="date"
            key={`to-${toUrl}`}
            defaultValue={toUrl}
            className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-800 outline-none transition-colors focus:border-jc-blue focus:bg-white focus:ring-2 focus:ring-blue-100 sm:px-3 sm:text-sm"
          />
        </label>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="inline-flex h-10 min-w-[96px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-jc-yellow px-3 text-xs font-extrabold text-jc-navy shadow-sm transition-colors hover:bg-yellow-400 active:scale-[0.99] sm:flex-none sm:text-sm">
          <Filter size={15} /> <span>Filtrar</span>
        </button>
        <button type="button" onClick={handleReset} className="inline-flex h-10 min-w-[96px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 px-3 text-xs font-bold text-jc-navy transition-colors hover:border-slate-400 hover:bg-slate-200 active:scale-[0.99] sm:flex-none sm:text-sm">
          <RotateCcw size={15} /> <span>Limpar</span>
        </button>
      </div>
    </form>
  );
}
