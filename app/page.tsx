import { db } from "@/db";
import { status as statusTable, veiculos as veiculosTable } from "@/db/schema";
import { asc, desc, ilike, or } from "drizzle-orm";
import { Plus, LayoutDashboard, MoreVertical, Clock } from "lucide-react"; 
import { cn, statusStyles } from "@/lib/utils";
import Link from "next/link";
import KanbanBoard from "@/components/KanbanBoard";
import { SearchVeiculos } from "@/components/SearchVeiculos";
import { ColunaCanvas, VeiculoTabela, VeiculoCanvas, DbFoto } from "@/types/kanban";
import { Suspense } from "react";

async function getDados(searchTerm?: string) {
  const filter = searchTerm 
    ? or(
        ilike(veiculosTable.placa, `%${searchTerm}%`),
        ilike(veiculosTable.modelo, `%${searchTerm}%`),
        ilike(veiculosTable.cliente, `%${searchTerm}%`)
      )
    : undefined;

  // 1. Busca dados do Kanban (Filtrando os veículos internos também)
  const resKanban = await db.query.status.findMany({
    orderBy: [asc(statusTable.ordem)],
    with: {
      veiculos: {
        where: filter, // O Kanban agora também filtra!
        with: { fotos: true },
      },
    },
  });

  // 2. Busca dados da Tabela
  const resTabela = await db.query.veiculos.findMany({
    where: filter,
    limit: 10,
    orderBy: [desc(veiculosTable.id)],
    with: { status: true }
  });

  // 3. Mapeamento Estrito (Date -> String)
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
      data_entrada: typeof v.data_entrada === 'string' ? v.data_entrada : new Date(v.data_entrada).toISOString(),
      data_prevista_entrega: v.data_prevista_entrega 
        ? (typeof v.data_prevista_entrega === 'string' ? v.data_prevista_entrega : new Date(v.data_prevista_entrega).toISOString()) 
        : null,
      fotos: v.fotos.map((f): DbFoto => ({
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
    data_entrada: typeof v.data_entrada === 'string' ? v.data_entrada : new Date(v.data_entrada).toISOString(),
    status: {
      id: v.status.id,
      nome: v.status.nome,
      ordem: v.status.ordem
    }
  }));

  return { colunas, ultimosVeiculos };
}

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { search } = await searchParams;
  const { colunas, ultimosVeiculos } = await getDados(search);

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto space-y-10">
        
        {/* HEADER */}
        <header className="flex justify-between items-center bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
             <Link 
                href="/dashboard" 
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all"
              >
                <LayoutDashboard size={18} className="text-slate-500" />
                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Estatísticas</span>
             </Link>
          </div>

          <h1 className="text-3xl font-black text-[#1E293B] tracking-tighter uppercase italic">
            JC Pneus
          </h1>

          <Link 
            href="/veiculos/novo" 
            className="bg-[#2563EB] hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            Novo veículo
          </Link>
        </header>

        {/* KANBAN BOARD */}
        <section className="space-y-4">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Fluxo de Trabalho</h2>
          <KanbanBoard 
            key={JSON.stringify(colunas)} 
            initialData={colunas} 
          />
        </section>

        {/* TABELA DE ÚLTIMOS VEÍCULOS */}
        <section className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
              {search ? `Resultados: ${search}` : "Últimos veículos"}
            </h2>
            
            <div className="w-full lg:w-auto">
              <Suspense fallback={<div className="h-12 w-64 bg-slate-100 animate-pulse rounded-2xl" />}>
                <SearchVeiculos />
              </Suspense>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
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
                  <tr key={v.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="p-5">
                      <Link href={`/veiculos/${v.id}`} className="font-black text-xl text-slate-800 uppercase tracking-tighter hover:text-blue-600 transition-colors">
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
                    <td className="p-5 text-right text-slate-300">
                      <Link href={`/veiculos/${v.id}`}>
                         <MoreVertical size={20} className="inline group-hover:text-blue-600 transition-colors" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {ultimosVeiculos.length === 0 && (
            <div className="py-24 text-center border-2 border-dashed border-slate-50 rounded-3xl mt-4">
              <p className="text-slate-300 font-black uppercase tracking-[0.2em] italic">
                Nenhum veículo encontrado
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}