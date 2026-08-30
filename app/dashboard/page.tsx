import { db } from "@/db";
import { status as statusTable, veiculos as veiculosTable } from "@/db/schema";
import { count, eq, and, gte, lte, asc } from "drizzle-orm";
import { StatusChart, ComparisonChart } from "@/components/DashboardCharts";
import { DashboardDateFilter } from "@/components/DashboardDateFilter";
import Link from "next/link";
import { ArrowLeft, Car, CheckCircle2, Clock, TrendingUp, BarChart3, ClipboardList } from "lucide-react";
import { cn, statusStyles } from "@/lib/utils";
import { Suspense } from "react";

interface PageProps { searchParams: Promise<{ from?: string; to?: string }>; }

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const { from, to } = await searchParams;
  const hoje = new Date();
  const dataInicioStr = from || new Date(new Date().setDate(hoje.getDate() - 30)).toISOString().split('T')[0];
  const dataFimStr = to || hoje.toISOString().split('T')[0];

  const filtroData = and(gte(veiculosTable.data_entrada, dataInicioStr), lte(veiculosTable.data_entrada, dataFimStr));

  // Queries
  const [totalResult] = await db.select({ value: count() }).from(veiculosTable).where(filtroData);
  const [entreguesResult] = await db.select({ value: count() }).from(veiculosTable).where(and(filtroData, eq(veiculosTable.status_id, 7)));

  const statusQuery = await db.select({ name: statusTable.nome, total: count(veiculosTable.id) }).from(statusTable).leftJoin(veiculosTable, and(eq(statusTable.id, veiculosTable.status_id), filtroData)).groupBy(statusTable.id, statusTable.nome).orderBy(statusTable.ordem);
  const statusData = statusQuery.map(s => ({ name: s.name, total: Number(s.total) }));

  const entradasPorDia = await db.select({ dia: veiculosTable.data_entrada, total: count() }).from(veiculosTable).where(filtroData).groupBy(veiculosTable.data_entrada).orderBy(asc(veiculosTable.data_entrada));
  
  const lineChartData = entradasPorDia.map(d => ({ 
    data: new Date(d.dia).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), 
    recebidos: Number(d.total),
    entregues: 0 
  }));

  return (
    <main className="h-screen bg-[#F8FAFC] p-2 md:p-4 font-sans overflow-hidden">
      <div className="max-w-6xl mx-auto h-full flex flex-col gap-3">
        
        {/* HEADER ATUALIZADO */}
        <header className="bg-jc-navy p-3 rounded-2xl flex items-center justify-between text-white shadow-lg shrink-0 border border-white/5">
          <div className="flex items-center gap-3 px-2">
            {/* Seta com fundo arredondado */}
            <Link href="/" className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all shrink-0 flex items-center justify-center">
              <ArrowLeft size={14} strokeWidth={3} />
            </Link>
            
            {/* Traço divisor vertical */}
            <div className="h-6 w-[1px] bg-white/20" />

            {/* DASHBOARD Title */}
            <h1 className="text-xl font-black uppercase italic tracking-tighter text-jc-white">
              Dashboard
            </h1>
          </div>

          <Suspense fallback={<div className="h-8 w-32 bg-white/5 rounded-lg animate-pulse" />}>
            <DashboardDateFilter />
          </Suspense>
        </header>

        {/* MÉTRICAS MINI */}
        <div className="grid grid-cols-4 gap-3 shrink-0">
          <StatCard title="Entradas" value={Number(totalResult?.value || 0)} icon={<Car size={14} />} color="text-jc-blue" bgColor="bg-blue-50" />
          <StatCard title="Finalizados" value={Number(entreguesResult?.value || 0)} icon={<CheckCircle2 size={14} />} color="text-green-600" bgColor="bg-green-50" />
          <StatCard title="Taxa" value={Number(totalResult?.value) > 0 ? Math.round((Number(entreguesResult?.value)/Number(totalResult?.value))*100) : 0} unit="%" icon={<TrendingUp size={14} />} color="text-purple-600" bgColor="bg-purple-50" />
          <StatCard title="Período" value={from ? (Math.ceil((new Date(dataFimStr).getTime() - new Date(dataInicioStr).getTime()) / (1000 * 3600 * 24))) : 30} unit="d" icon={<Clock size={14} />} color="text-slate-500" bgColor="bg-slate-200" />
        </div>

        {/* GRID CENTRAL */}
        <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
          {/* DISTRIBUIÇÃO */}
          <div className="col-span-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="text-jc-blue" size={12} />
                <h3 className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status dos Veículos</h3>
            </div>
            <div className="flex-1 min-h-0">
              <StatusChart data={statusData} />
            </div>
          </div>

          {/* RESUMO DO FLUXO - SEM CORTE NO TEXTO */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-3">
                <ClipboardList className="text-jc-blue" size={12} />
                <h3 className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Resumo do Fluxo</h3>
            </div>
            <div className="space-y-1 flex-1 overflow-hidden">
              {statusData.map((s, i) => {
                const style = statusStyles[s.name] || statusStyles["Recebido"];
                return (
                  <div key={i} className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50/50 border border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full shadow-sm", style.dot)} />
                        {/* Removido o truncate e o max-w para o texto aparecer todo */}
                        <span className={cn("text-[9px] font-black uppercase tracking-tight", style.text)}>
                          {s.name}
                        </span>
                    </div>
                    <span className="text-xs font-black text-jc-navy">{s.total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* MOVIMENTAÇÃO DIÁRIA */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm h-[200px] shrink-0 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="text-jc-blue" size={12} />
                <h3 className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Movimentação Diária</h3>
            </div>
            <div className="flex-1 min-h-0">
               <ComparisonChart data={lineChartData} />
            </div>
        </div>

      </div>
    </main>
  );
}

function StatCard({ title, value, unit = "", icon, color, bgColor }: { title: string, value: number, unit?: string, icon: React.ReactNode, color: string, bgColor: string }) {
  return (
    <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm">
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-inner", bgColor, color)}>{icon}</div>
      <div>
        <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider leading-none mb-0.5">{title}</p>
        <p className="text-sm font-black text-jc-navy leading-none">{value}<span className="text-[8px] opacity-30 ml-0.5">{unit}</span></p>
      </div>
    </div>
  );
}