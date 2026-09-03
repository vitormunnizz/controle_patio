import { db } from "@/db";
import { status as statusTable, veiculos as veiculosTable } from "@/db/schema";
import { asc, desc, ilike, or } from "drizzle-orm";
import { Plus, LayoutDashboard } from "lucide-react"; 
import { cn, statusStyles } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import KanbanBoard from "@/components/KanbanBoard";
import { SearchVeiculos } from "@/components/SearchVeiculos";
import { ColunaCanvas, VeiculoTabela, VeiculoCanvas, DbFoto } from "@/types/kanban";
import { Suspense } from "react";

async function getDados(searchTerm?: string) {
  const filter = searchTerm ? or(ilike(veiculosTable.placa, `%${searchTerm}%`), ilike(veiculosTable.modelo, `%${searchTerm}%`), ilike(veiculosTable.cliente, `%${searchTerm}%`)) : undefined;
  const resKanban = await db.query.status.findMany({
    orderBy: [asc(statusTable.ordem)],
    with: { veiculos: { where: filter, with: { fotos: true } } },
  });
  const resTabela = await db.query.veiculos.findMany({
    where: filter, limit: 10, orderBy: [desc(veiculosTable.id)], with: { status: true }
  });

  const colunas: ColunaCanvas[] = resKanban.map((col) => ({
    ...col,
    veiculos: col.veiculos.map((v): VeiculoCanvas => ({
      ...v,
      data_entrada: v.data_entrada.toString(),
      data_prevista_entrega: v.data_prevista_entrega ? v.data_prevista_entrega.toString() : null,
      fotos: v.fotos.map(f => ({ ...f }))
    }))
  }));

  const ultimosVeiculos: VeiculoTabela[] = resTabela.map((v): VeiculoTabela => ({
    ...v, data_entrada: v.data_entrada.toString(), status: { ...v.status }
  }));

  return { colunas, ultimosVeiculos };
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search } = await searchParams;
  const { colunas, ultimosVeiculos } = await getDados(search);

  return (
    <main className="min-h-screen bg-slate-50 p-2 md:p-4 font-sans antialiased text-slate-900">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* HEADER COMPACTO */}
        <header className="grid grid-cols-3 items-center bg-white px-5 py-2 rounded-2xl shadow-sm border border-slate-100">
          <div>
             <Link href="/dashboard" className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg hover:bg-jc-navy hover:text-white transition-all group">
                <LayoutDashboard size={14} className="text-jc-blue group-hover:text-jc-yellow" />
                <span className="text-[9px] font-black uppercase tracking-widest">Painel</span>
             </Link>
          </div>

          <div className="flex justify-center">
            {/* Logo reduzida para 100px */}
            <Link href="/">
              <Image src="/jc.png" alt="JC" width={100} height={40} className="object-contain" priority />
            </Link>
          </div>

          <div className="flex justify-end">
            <Link href="/veiculos/novo" className="bg-jc-yellow hover:bg-yellow-400 text-jc-navy px-4 py-1.5 rounded-lg font-black uppercase text-[9px] tracking-widest flex items-center gap-1.5 transition-all shadow-sm active:scale-95 border-b-2 border-yellow-600">
              <Plus size={14} strokeWidth={4} />
              Novo
            </Link>
          </div>
        </header>

        {/* KANBAN */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 ml-1">
            <div className="h-3 w-1 bg-jc-yellow rounded-full" />
            <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Fluxo de Oficina</h2>
          </div>
          <KanbanBoard key={JSON.stringify(colunas)} initialData={colunas} />
        </section>

        {/* TABELA COMPACTA */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-5">
            <div className="flex flex-col gap-0.5">
              {/* Título reduzido de text-3xl para text-base */}
              <h2 className="text-base font-black text-slate-800 tracking-tighter uppercase italic leading-none">
                {search ? "Busca" : "Últimos Veículos"}
              </h2>
              <div className="h-1 w-12 bg-jc-blue/20 rounded-full" />
            </div>
            
            <div className="w-full lg:w-[450px]">
              <Suspense fallback={<div className="h-9 w-64 bg-slate-50 animate-pulse rounded-xl" />}>
                <SearchVeiculos />
              </Suspense>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Placa</th>
                  <th className="p-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Modelo</th>
                  <th className="p-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                  <th className="p-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ultimosVeiculos.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-all group">
                    <td className="p-2.5 font-black text-sm text-jc-blue uppercase tracking-tighter leading-none">
                      {v.placa}
                    </td>
                    <td className="p-2.5 text-[11px] font-bold text-slate-600 uppercase">
                      {v.modelo}
                    </td>
                    <td className="p-2.5 text-[11px] text-slate-400 font-medium">
                      {v.cliente}
                    </td>
                    <td className="p-2.5 text-center">
                      <div className={cn(
                        "mx-auto w-fit px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 border shadow-sm",
                        statusStyles[v.status.nome]?.bg || "bg-slate-100",
                        statusStyles[v.status.nome]?.text || "text-slate-500"
                      )}>
                        <div className={cn("w-1 h-1 rounded-full", statusStyles[v.status.nome]?.dot)} />
                        {v.status.nome}
                      </div>
                    </td>
                    <td className="p-2.5 text-right">
                      <Link 
                        href={`/veiculos/${v.id}`} 
                        className="inline-flex px-2 py-1 bg-slate-50 text-slate-400 hover:text-jc-blue hover:bg-blue-50 rounded-md text-[8px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-blue-100"
                      >
                         Editar
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