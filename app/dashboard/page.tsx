import { db } from "@/db";
import { status as statusTable, veiculos as veiculosTable } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { StatusChart } from "@/components/DashboardCharts";
import Link from "next/link";
import { ArrowLeft, Car, CheckCircle2, Clock, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function AnalyticsPage() {
  // 1. Busca o Total Geral
  const [totalResult] = await db.select({ value: count() }).from(veiculosTable);
  const totalGeral = Number(totalResult?.value || 0);

  // 2. Veículos por Status (Para o Gráfico e Resumo)
  // Fazemos um Left Join para garantir que apareçam status que não têm carros no momento (com total 0)
  const queryResult = await db
    .select({
      name: statusTable.nome,
      total: count(veiculosTable.id),
    })
    .from(statusTable)
    .leftJoin(veiculosTable, eq(statusTable.id, veiculosTable.status_id))
    .groupBy(statusTable.id, statusTable.nome)
    .orderBy(statusTable.ordem);

  // Mapeamos os dados garantindo que o total seja número (o count do PG às vezes retorna string)
  const statusDataRaw = queryResult.map(item => ({
    name: item.name,
    total: Number(item.total)
  }));

  // 3. Lógica para os Cards de Resumo
  const emManutencao = statusDataRaw.find(s => s.name === "Em manutenção")?.total || 0;
  const aguardandoAprovacao = statusDataRaw.find(s => s.name === "Aguardando aprovação")?.total || 0;
  const entregues = statusDataRaw.find(s => s.name === "Entregue")?.total || 0;

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col gap-2">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <ArrowLeft size={14} /> Voltar ao Kanban
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Relatório Geral
          </h1>
        </header>

        {/* --- CARDS DE MÉTRICAS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total de Veículos" 
            value={totalGeral} 
            icon={<Car size={24} />} 
            color="bg-blue-600" 
            bgColor="bg-blue-50" 
          />
          <StatCard 
            title="Entregues" 
            value={entregues} 
            icon={<CheckCircle2 size={24} />} 
            color="text-slate-600" 
            bgColor="bg-slate-100" 
          />
        </div>

        {/* --- ÁREA DE GRÁFICOS E TABELA --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* GRÁFICO DE BARRAS */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
            <h3 className="text-sm font-black text-slate-400 mb-8 uppercase tracking-[0.1em]">
              Veículos por Status
            </h3>
            <StatusChart data={statusDataRaw} />
          </div>

          {/* LISTA RESUMO LADO DIREITO */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
            <h3 className="text-sm font-black text-slate-400 mb-8 uppercase tracking-[0.1em]">
              Distribuição Atual
            </h3>
            <div className="space-y-3">
              {statusDataRaw.map((s, i) => (
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

// Componente Interno de Card de Estatística
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, icon, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-200 flex items-center gap-5">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", bgColor, color)}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
          {title}
        </p>
        <p className="text-2xl font-black text-slate-900 leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}