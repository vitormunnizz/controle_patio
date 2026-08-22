import { db } from "@/db";
import { status as statusTable, veiculos as veiculosTable } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import { Plus, LayoutDashboard, Search, Filter, MoreVertical, Clock } from "lucide-react";
import { cn, statusStyles } from "@/lib/utils";
import Link from "next/link";
import KanbanBoard from "@/components/KanbanBoard";
import { ColunaCanvas, VeiculoTabela, VeiculoCanvas } from "@/types/kanban";

async function getDados() {
  // 1. Busca dados do Kanban
  const resKanban = await db.query.status.findMany({
    orderBy: [asc(statusTable.ordem)],
    with: {
      veiculos: {
        with: { fotos: true },
      },
    },
  });

  // 2. Busca dados da Tabela
  const resTabela = await db.query.veiculos.findMany({
    limit: 10,
    orderBy: [desc(veiculosTable.id)],
    with: { status: true }
  });

  // 3. Mapeamento Estrito para Serialização (Date -> String)
  const colunas: ColunaCanvas[] = resKanban.map((col) => ({
    id: col.id,
    nome: col.nome,
    ordem: col.ordem,
    veiculos: col.veiculos.map((v): VeiculoCanvas => ({
      id: v.id,
      placa: v.placa,
      modelo: v.modelo,
      cliente: v.cliente,
      status_id: v.status_id,
      observacoes: v.observacoes,
      data_entrada: v.data_entrada.toString(),
      data_prevista_entrega: v.data_prevista_entrega ? v.data_prevista_entrega.toString() : null,
      fotos: v.fotos.map(f => ({
        id: f.id,
        veiculo_id: f.veiculo_id,
        url: f.url,
        created_at: f.created_at
      }))
    }))
  }));

  const ultimosVeiculos: VeiculoTabela[] = resTabela.map((v): VeiculoTabela => ({
    id: v.id,
    placa: v.placa,
    modelo: v.modelo,
    cliente: v.cliente,
    status_id: v.status_id,
    observacoes: v.observacoes,
    data_entrada: v.data_entrada.toString(),
    status: {
      id: v.status.id,
      nome: v.status.nome,
      ordem: v.status.ordem
    }
  }));

  return { colunas, ultimosVeiculos };
}

export default async function DashboardPage() {
  const { colunas, ultimosVeiculos } = await getDados();

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
             <Link 
                href="/dashboard" 
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-all"
              >
                <LayoutDashboard size={18} className="text-slate-500" />
                <span className="text-sm font-bold text-slate-600 uppercase">Dashboard</span>
             </Link>
          </div>

          <h1 className="text-3xl font-black text-[#1E293B] tracking-tighter uppercase italic">
            JC Pneus
          </h1>

          <Link 
            href="/veiculos/novo" 
            className="bg-[#2563EB] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            Novo veículo
          </Link>
        </header>

        {/* KANBAN BOARD */}
        <KanbanBoard 
          key={JSON.stringify(colunas)} 
          initialData={colunas} 
        />

        {/* TABELA DE ÚLTIMOS VEÍCULOS */}
        <section className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Últimos veículos</h2>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-[350px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Placa</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Modelo</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entrada</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ultimosVeiculos.map((v) => (
                  <tr key={v.id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="p-5">
                      <Link href={`/veiculos/${v.id}`} className="font-black text-lg text-slate-800 uppercase tracking-tighter">
                        {v.placa}
                      </Link>
                    </td>
                    <td className="p-5 text-sm font-bold text-slate-600 uppercase">{v.modelo}</td>
                    <td className="p-5 text-sm text-slate-500 font-medium">{v.cliente}</td>
                    <td className="p-5 text-sm text-slate-400 font-bold">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {new Date(v.data_entrada).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border",
                        statusStyles[v.status.nome]?.bg || "bg-slate-100",
                        statusStyles[v.status.nome]?.text || "text-slate-500",
                        statusStyles[v.status.nome]?.border || "border-slate-200"
                      )}>
                        {v.status.nome}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <Link href={`/veiculos/${v.id}`}>
                         <MoreVertical size={20} className="text-slate-300 inline group-hover:text-blue-600 transition-colors" />
                      </Link>
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