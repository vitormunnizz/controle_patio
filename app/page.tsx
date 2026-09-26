import { db } from "@/db";
import { status as statusTable, veiculos as veiculosTable } from "@/db/schema";
import { asc, desc, ilike, or } from "drizzle-orm";
import { Plus, LayoutDashboard } from "lucide-react"; 
import { cn, statusStyles } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import KanbanBoard from "@/components/KanbanBoard";
import { SearchVeiculos } from "@/components/SearchVeiculos";
import { ColunaCanvas, VeiculoTabela, VeiculoCanvas, FotoSerializada } from "@/types/kanban";
import { Suspense } from "react";

async function getDados(searchTerm?: string) {
  const filter = searchTerm 
    ? or(
        ilike(veiculosTable.placa, `%${searchTerm}%`),
        ilike(veiculosTable.modelo, `%${searchTerm}%`),
        ilike(veiculosTable.cliente, `%${searchTerm}%`)
      )
    : undefined;

  const resKanban = await db.query.status.findMany({
    orderBy: [asc(statusTable.ordem)],
    with: {
      veiculos: {
        where: filter,
        with: { fotos: true },
      },
    },
  });

  const resTabela = await db.query.veiculos.findMany({
    where: filter,
    limit: 10,
    orderBy: [desc(veiculosTable.id)],
    with: { status: true }
  });

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
      data_entrada: String(v.data_entrada),
      data_prevista_entrega: v.data_prevista_entrega ? String(v.data_prevista_entrega) : null,
      fotos: v.fotos.map((f): FotoSerializada => ({
        id: f.id,
        veiculo_id: f.veiculo_id,
        url: f.url,
        created_at: f.created_at ? String(f.created_at) : null
      }))
    }))
  }));

  const ultimosVeiculos: VeiculoTabela[] = resTabela.map((v): VeiculoTabela => ({
    id: v.id,
    placa: v.placa,
    modelo: v.modelo,
    cliente: v.cliente,
    status_id: v.status_id,
    data_entrada: String(v.data_entrada),
    status: {
      id: v.status.id,
      nome: v.status.nome,
      ordem: v.status.ordem
    }
  }));

  return { colunas, ultimosVeiculos };
}

export default async function DashboardPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ search?: string }> 
}) {
  const { search } = await searchParams;
  const { colunas, ultimosVeiculos } = await getDados(search);

  return (
    <main className="app-background min-h-screen w-full p-2 sm:p-4 font-sans antialiased text-slate-900 overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto space-y-3 w-full">
        
        {/* HEADER CORRIGIDO */}
        <header className="flex items-center justify-between gap-2 bg-gradient-to-r from-jc-navy via-[#073b83] to-jc-blue px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-md border border-white/10 border-b-2 border-b-jc-yellow/80 text-white w-full">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all group border border-white/10 shrink-0"
          >
            <LayoutDashboard size={14} className="text-jc-yellow transition-colors" />
            <span className="text-[11px] font-bold uppercase tracking-wide hidden xs:inline">Painel</span>
          </Link>

          <Link href="/" className="shrink-0">
            <Image 
              src="/jc.png" 
              alt="JC Pneus" 
              width={90} 
              height={36} 
              className="object-contain h-7 sm:h-9 w-auto" 
              priority 
            />
          </Link>

          <Link 
            href="/veiculos/novo" 
            className="bg-jc-yellow hover:bg-yellow-400 text-jc-navy px-3 py-1.5 sm:px-4 rounded-lg font-extrabold uppercase text-[10px] tracking-wide flex items-center gap-1 transition-all shadow-sm active:scale-95 border-b-2 border-yellow-600 shrink-0"
          >
            <Plus size={14} strokeWidth={4} />
            <span>Novo</span>
          </Link>
        </header>

        {/* KANBAN */}
        <section className="space-y-1.5 w-full">
          <div className="flex items-center gap-2.5 ml-1">
            <div className="h-3.5 w-1 bg-jc-yellow rounded-full" />
            <h2 className="text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.16em]">
              Fluxo de Oficina
            </h2>
          </div>
          <KanbanBoard key={JSON.stringify(colunas)} initialData={colunas} />
        </section>

        {/* ÚLTIMOS VEÍCULOS / BUSCA */}
        <section className="bg-white/95 p-3 sm:p-4 rounded-2xl shadow-[0_8px_28px_rgba(15,23,42,0.055)] border border-white/80 w-full">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 mb-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight uppercase leading-none">
                {search ? "Resultado da Busca" : "Últimos Veículos"}
              </h2>
              <div className="h-0.5 w-10 bg-jc-blue/25 rounded-full" />
            </div>
            
            <div className="w-full md:w-[400px]">
              <Suspense fallback={<div className="h-9 w-full bg-slate-50 animate-pulse rounded-xl" />}>
                <SearchVeiculos />
              </Suspense>
            </div>
          </div>

          {/* VISÃO CARD (CELULAR) */}
          <div className="grid grid-cols-1 gap-2 md:hidden w-full">
            {ultimosVeiculos.length === 0 ? (
              <div className="p-6 text-center text-xs font-bold text-slate-400">
                Nenhum veículo encontrado.
              </div>
            ) : (
              ultimosVeiculos.map((v) => (
                <div key={v.id} className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 space-y-2 w-full">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/veiculos/${v.id}`} className="font-black text-sm text-jc-blue uppercase tracking-tighter truncate">
                      {v.placa}
                    </Link>
                    <div className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 border shrink-0",
                      statusStyles[v.status.nome]?.bg || "bg-slate-100",
                      statusStyles[v.status.nome]?.text || "text-slate-500"
                    )}>
                      <div className={cn("w-1 h-1 rounded-full", statusStyles[v.status.nome]?.dot)} />
                      <span className="truncate max-w-[110px]">{v.status.nome}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Modelo</p>
                      <p className="font-bold text-slate-700 uppercase truncate">{v.modelo}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Cliente</p>
                      <p className="font-medium text-slate-600 truncate">{v.cliente}</p>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200/50 flex justify-end">
                    <Link
                      href={`/veiculos/${v.id}`}
                      className="px-3 py-1.5 bg-white text-slate-600 hover:text-jc-blue rounded-lg text-[10px] font-bold uppercase tracking-wide border border-slate-200/80 shadow-2xs"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* VISÃO TABELA (DESKTOP) */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Placa</th>
                  <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Modelo / Marca</th>
                  <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center">Status Atual</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ultimosVeiculos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-xs font-bold text-slate-400">
                      Nenhum veículo encontrado.
                    </td>
                  </tr>
                ) : (
                  ultimosVeiculos.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-3 py-2">
                        <Link href={`/veiculos/${v.id}`} className="font-black text-sm text-jc-blue uppercase tracking-tighter hover:text-jc-navy transition-colors block">
                          {v.placa}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-xs font-bold text-slate-600 uppercase">{v.modelo}</td>
                      <td className="px-3 py-2 text-xs text-slate-500 font-medium">{v.cliente}</td>
                      <td className="px-3 py-2 text-center">
                        <div className={cn(
                          "mx-auto w-fit px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 border shadow-2xs",
                          statusStyles[v.status.nome]?.bg || "bg-slate-100",
                          statusStyles[v.status.nome]?.text || "text-slate-500"
                        )}>
                          <div className={cn("w-1 h-1 rounded-full", statusStyles[v.status.nome]?.dot)} />
                          {v.status.nome}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link 
                          href={`/veiculos/${v.id}`} 
                          className="inline-flex px-3 py-1.5 bg-slate-50 text-slate-500 hover:text-jc-blue hover:bg-blue-50 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all border border-transparent hover:border-blue-100"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}
