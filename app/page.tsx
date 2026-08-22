import { db } from "@/db";
import { status as statusTable, veiculos as veiculosTable } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import { Plus, LayoutDashboard, Search, Filter } from "lucide-react";
import { cn, statusStyles } from "@/lib/utils";
import Link from "next/link";
import KanbanBoard from "@/components/KanbanBoard"; // Importando o novo componente funcional

async function getDados() {
  const colunas = await db.query.status.findMany({
    orderBy: [asc(statusTable.ordem)],
    with: {
      veiculos: {
        with: { fotos: true },
      },
    },
  });

  const ultimosVeiculos = await db.query.veiculos.findMany({
    limit: 10,
    orderBy: [desc(veiculosTable.id)],
    with: { status: true }
  });

  return { colunas, ultimosVeiculos };
}

export default async function DashboardPage() {
  const { colunas, ultimosVeiculos } = await getDados();

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
             <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-all">
                <LayoutDashboard size={18} className="text-slate-500" />
                <span className="text-sm font-bold text-slate-600">Dashboard Geral</span>
             </Link>
          </div>

          <h1 className="text-3xl font-black text-[#1E293B] tracking-tight uppercase">JC Pneus</h1>

          <Link 
            href="/veiculos/novo" 
            className="bg-[#2563EB] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            Novo veículo
          </Link>
        </header>

        {/* --- KANBAN BOARD FUNCIONAL (Aqui estava o loop antigo) --- */}
        <KanbanBoard initialData={colunas} />

        {/* --- TABELA DE ÚLTIMOS VEÍCULOS --- */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Últimos veículos</h2>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[300px]"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
                <Filter size={16} /> Filtros
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-[11px] font-black text-slate-400 uppercase">Placa</th>
                  <th className="p-4 text-[11px] font-black text-slate-400 uppercase">Modelo</th>
                  <th className="p-4 text-[11px] font-black text-slate-400 uppercase">Cliente</th>
                  <th className="p-4 text-[11px] font-black text-slate-400 uppercase">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ultimosVeiculos.map((v) => (
                  <tr key={v.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 font-bold text-slate-700 uppercase">
                      <Link href={`/veiculos/${v.id}`}>{v.placa}</Link>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{v.modelo}</td>
                    <td className="p-4 text-slate-500">{v.cliente}</td>
                    <td className="p-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        statusStyles[v.status.nome]?.bg || "bg-slate-100",
                        statusStyles[v.status.nome]?.text || "text-slate-500"
                      )}>
                        {v.status.nome}
                      </span>
                    </td>
                    <td className="p-4 text-right italic text-xs text-slate-300">
                      <Link href={`/veiculos/${v.id}`}>Ver detalhes</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}