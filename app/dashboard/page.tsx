import { db } from "@/db";
import { status as statusTable, veiculos as veiculosTable } from "@/db/schema";
import { count, eq, and, gte, lte, asc } from "drizzle-orm";
import { StatusChart, ComparisonChart } from "@/components/DashboardCharts";
import { DashboardDateFilter } from "@/components/DashboardDateFilter";
import Link from "next/link";
import { ArrowLeft, Car, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const { from, to } = await searchParams;

  // Definição do período (Padrão: últimos 30 dias)
  const hoje = new Date();
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(hoje.getDate() - 30);

  const dataInicioStr = from || trintaDiasAtras.toISOString().split('T')[0];
  const dataFimStr = to || hoje.toISOString().split('T')[0];

  // 1. Filtro base para as queries
  const filtroData = and(
    gte(veiculosTable.data_entrada, dataInicioStr),
    lte(veiculosTable.data_entrada, dataFimStr)
  );

  // 2. Busca Total de Veículos no Período
  const [totalResult] = await db
    .select({ value: count() })
    .from(veiculosTable)
    .where(filtroData);
  const totalNoPeriodo = Number(totalResult?.value || 0);

  // 3. Busca Veículos Entregues no Período (Status ID 7 = Entregue)
  const [entreguesResult] = await db
    .select({ value: count() })
    .from(veiculosTable)
    .where(and(filtroData, eq(veiculosTable.status_id, 7)));
  const entreguesNoPeriodo = Number(entreguesResult?.value || 0);

  // 4. Distribuição por Status (Gráfico de Barras e Lista)
  const statusQuery = await db
    .select({
      name: statusTable.nome,
      total: count(veiculosTable.id),
    })
    .from(statusTable)
    .leftJoin(veiculosTable, and(eq(statusTable.id, veiculosTable.status_id), filtroData))
    .groupBy(statusTable.id, statusTable.nome)
    .orderBy(statusTable.ordem);

  const statusData = statusQuery.map(s => ({ 
    name: s.name, 
    total: Number(s.total) 
  }));

  // 5. Tendência de Entradas (Gráfico de Linha)
  const entradasPorDia = await db
    .select({
      dia: veiculosTable.data_entrada,
      total: count(),
    })
    .from(veiculosTable)
    .where(filtroData)
    .groupBy(veiculosTable.data_entrada)
    .orderBy(asc(veiculosTable.data_entrada));

  const lineChartData = entradasPorDia.map(d => ({
    data: new Date(d.dia).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    recebidos: Number(d.total),
    entregues: 0 // Preparado para quando houver coluna data_entrega
  }));

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <ArrowLeft size={14} /> Voltar ao Kanban
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Relatório Geral
            </h1>
          </div>
          
          <Suspense fallback={<div className="h-14 w-64 bg-white rounded-2xl animate-pulse" />}>
            <DashboardDateFilter />
          </Suspense>
        </header>

        {/* --- CARDS DE MÉTRICAS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Novas Entradas" 
            value={totalNoPeriodo} 
            icon={<Car size={24} />} 
            color="text-blue-600" 
            bgColor="bg-blue-50" 
          />
          <StatCard 
            title="Total Entregues" 
            value={entreguesNoPeriodo} 
            icon={<CheckCircle2 size={24} />} 
            color="text-green-600" 
            bgColor="bg-green-50" 
          />
          <StatCard 
            title="Taxa de Conclusão" 
            value={totalNoPeriodo > 0 ? Math.round((entreguesNoPeriodo / totalNoPeriodo) * 100) : 0} 
            unit="%" 
            icon={<TrendingUp size={24} />} 
            color="text-purple-600" 
            bgColor="bg-purple-50" 
          />
          <StatCard 
            title="Período Ativo" 
            value={from ? 0 : 30} 
            unit=" Dias" 
            icon={<Clock size={24} />} 
            color="text-slate-400" 
            bgColor="bg-slate-100" 
          />
        </div>

        {/* --- ÁREA DE GRÁFICOS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* GRÁFICO DE BARRAS (Esquerda - Ocupa 2 colunas) */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
            <h3 className="text-sm font-black text-slate-400 mb-8 uppercase tracking-[0.1em]">
              Distribuição por Status
            </h3>
            <StatusChart data={statusData} />
          </div>
          
          {/* GRÁFICO DE TENDÊNCIA (Ocupa a largura total abaixo) */}
          <div className="lg:col-span-3 bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
            <h3 className="text-sm font-black text-slate-400 mb-8 uppercase tracking-[0.1em]">
              Volume de Entradas Diárias no Período
            </h3>
            <ComparisonChart data={lineChartData} />
          </div>

          {/* LISTA RESUMO (Direita - Ocupa 1 coluna) */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
            <h3 className="text-sm font-black text-slate-400 mb-8 uppercase tracking-[0.1em]">
              Resumo do Fluxo
            </h3>
            <div className="space-y-3">
              {statusData.map((s, i) => (
                <div 
                  key={i} 
                  className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <span className="text-[11px] font-black text-slate-500 uppercase">
                    {s.name}
                  </span>
                  <span className="text-xl font-black text-slate-900">
                    {s.total}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

// Componente Interno de Card
function StatCard({ 
  title, value, unit = "", icon, color, bgColor 
}: { 
  title: string; value: number; unit?: string; icon: React.ReactNode; color: string; bgColor: string 
}) {
  return (
    <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-200 flex items-center gap-5 transition-transform hover:scale-[1.02]">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner", bgColor, color)}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
          {title}
        </p>
        <p className="text-2xl font-black text-slate-900 leading-none">
          {value}{unit}
        </p>
      </div>
    </div>
  );
}