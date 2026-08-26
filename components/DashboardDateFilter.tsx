"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";

export function DashboardDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [inicio, setInicio] = useState(searchParams.get("from") || "");
  const [fim, setFim] = useState(searchParams.get("to") || "");

  const aplicarFiltro = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (inicio) params.set("from", inicio);
    if (fim) params.set("to", fim);
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 px-3 border-r border-slate-100">
        <CalendarIcon size={16} className="text-slate-400" />
        <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="text-xs font-bold uppercase outline-none bg-transparent" />
      </div>
      <div className="flex items-center gap-2 px-3">
        <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} className="text-xs font-bold uppercase outline-none bg-transparent" />
      </div>
      <button onClick={aplicarFiltro} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
        Filtrar
      </button>
    </div>
  );
}