import { db } from "@/db";
import { status as statusTable, veiculos as veiculosTable } from "@/db/schema";
import { count, eq, and, gte, lte } from "drizzle-orm";
import { StatusChart } from "@/components/DashboardCharts";
import { DashboardDateFilter } from "@/components/DashboardDateFilter";
import Link from "next/link";
import { ArrowLeft, Car, CheckCircle2, Clock, TrendingUp, BarChart3, Table } from "lucide-react";
import { cn, statusStyles } from "@/lib/utils";
import { Suspense } from "react";

interface PageProps { searchParams: Promise<{ from?: string; to?: string }>; }

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const { from, to } = await searchParams;

  // Garantir limites completos de data no formato YYYY-MM-DD
  const hoje = new Date();
  const data30DiasAtras = new Date(hoje);
  data30DiasAtras.setDate(hoje.getDate() - 30);

  const dataInicioStr = from || data30DiasAtras.toISOString().split('T')[0];
  const dataFimStr = to || hoje.toISOString().split('T')[0];

  // Trata o limite de fim até o final do dia (23:59:59)
  const filtroData = and(
    gte(veiculosTable.data_entrada, `${dataInicioStr} 00:00:00`),
    lte(veiculosTable.data_entrada, `${dataFimStr} 23:59:59`)
  );

  // Queries
  const [totalResult] = await db.select({ value: count() }).from(veiculosTable).where(filtroData);
  const [entreguesResult] = await db.select({ value: count() }).from(veiculosTable).where(and(filtroData, eq(veiculosTable.status_id, 7)));

  const statusQuery = await db.select({ 
    name: statusTable.nome, 
    total: count(veiculosTable.id) 
  })
  .from(statusTable)
  .leftJoin(veiculosTable, and(eq(statusTable.id, veiculosTable.status_id), filtroData))
  .groupBy(statusTable.id, statusTable.nome)
  .orderBy(statusTable.ordem);

  const statusData = statusQuery.map(s => ({ name: s.name, total: Number(s.total) }));
  const totalVeiculos = Number(totalResult?.value || 0);

  return (
    <main className="min-h-screen lg:h-screen bg-[#F8FAFC] p-2.5 sm:p-3 font-sans overflow-x-hidden lg:overflow-hidden">
      <div className="max-w-6xl mx-auto h-full flex flex-col gap-2.5">
        
        {/* HEADER RESPONSIVO */}
        <header className="bg-jc-navy p-2.5 rounded-xl flex flex-col sm:flex-row items-center justify-between text-white shadow-md shrink-0 border border-white/5 gap-2 sm:gap-2">
          <div className="flex items-center gap-3 px-1 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <Link href="/" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all shrink-0 flex items-center justify-center">
                <ArrowLeft size={13} strokeWidth={3} />
              </Link>
              
              <div className="h-5 w-[1px] bg-white/20" />

              <h1 className="text-base sm:text-lg font-black uppercase italic tracking-tighter text-white">
                Dashboard
              </h1>
            </div>
          </div>

          <div className="w-full sm:w-auto flex justify-end">
            <Suspense fallback={<div className="h-7 w-28 bg-white/5 rounded-lg animate-pulse" />}>
              <DashboardDateFilter />
            </Suspense>
          </div>
        </header>

        {/* MÉTRICAS MINI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
          <StatCard title="Entradas" value={totalVeiculos} icon={<Car size={13} />} color="text-jc-blue" bgColor="bg-blue-50" />
          <StatCard title="Finalizados" value={Number(entreguesResult?.value || 0)} icon={<CheckCircle2 size={13} />} color="text-green-600" bgColor="bg-green-50" />
          <StatCard title="Taxa" value={totalVeiculos > 0 ? Math.round((Number(entreguesResult?.value) / totalVeiculos) * 100) : 0} unit="%" icon={<TrendingUp size={13} />} color="text-purple-600" bgColor="bg-purple-50" />
          <StatCard title="Período" value={from ? (Math.ceil((new Date(dataFimStr).getTime() - new Date(dataInicioStr).getTime()) / (1000 * 3600 * 24))) : 30} unit="d" icon={<Clock size={13} />} color="text-slate-500" bgColor="bg-slate-200" />
        </div>

        {/* 1. GRÁFICO VISUAL (TOPO - OCUPA O ESPAÇO DISPONÍVEL) */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-2 mb-1 shrink-0">
              <BarChart3 className="text-jc-blue" size={14} />
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Distribuição por Status</h3>
          </div>
          <div className="flex-1 w-full min-h-0">
            <StatusChart data={statusData} />
          </div>
        </div>

        {/* 2. TABELA DETALHADA DO FLUXO (EMBAIXO - TAMANHO COMPACTO FIXO) */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
                <Table className="text-jc-blue" size={14} />
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resumo do Fluxo</h3>
            </div>
          </div>

          <div className="w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[8px] font-black uppercase tracking-wider text-slate-400">
                  <th className="pb-1">Status</th>
                  <th className="pb-1 text-center">Quantidade</th>
                  <th className="pb-1 text-right">Proporção</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statusData.map((s, idx) => {
                  const style = statusStyles[s.name] || statusStyles["Recebido"];
                  const percentual = totalVeiculos > 0 ? ((s.total / totalVeiculos) * 100).toFixed(0) : "0";
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-1 pr-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full shrink-0", style.dot)} />
                          <span className={cn("font-bold uppercase text-[10px]", style.text)}>
                            {s.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-1 text-center font-black text-jc-navy text-xs">{s.total}</td>
                      <td className="py-1 text-right font-bold text-slate-400 text-[11px]">{percentual}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}

function StatCard({ title, value, unit = "", icon, color, bgColor }: { title: string, value: number, unit?: string, icon: React.ReactNode, color: string, bgColor: string }) {
  return (
    <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm">
      <div className={cn("w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center shrink-0 shadow-inner", bgColor, color)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider leading-none mb-0.5 truncate">{title}</p>
        <p className="text-xs sm:text-xs font-black text-jc-navy leading-none">
          {value}<span className="text-[8px] opacity-40 ml-0.5">{unit}</span>
        </p>
      </div>
    </div>
  );
}