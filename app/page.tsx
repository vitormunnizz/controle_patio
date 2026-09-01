import { db } from "@/db";
import { status as statusTable, veiculos as veiculosTable } from "@/db/schema";
import { asc, desc, ilike, or } from "drizzle-orm";
import { Plus, LayoutDashboard, Clock } from "lucide-react"; 
import { cn, statusStyles } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import KanbanBoard from "@/components/KanbanBoard";
import { SearchVeiculos } from "@/components/SearchVeiculos";
import { ColunaCanvas, VeiculoTabela, VeiculoCanvas, DbFoto } from "@/types/kanban";
import { Suspense } from "react";

/**
 * Função para buscar e formatar os dados do Banco de Dados
 *searchTerm: termo de busca vindo da URL
 */
async function getDados(searchTerm?: string) {
  // Define o filtro de busca (Placa, Modelo ou Cliente)
  const filter = searchTerm 
    ? or(
        ilike(veiculosTable.placa, `%${searchTerm}%`),
        ilike(veiculosTable.modelo, `%${searchTerm}%`),
        ilike(veiculosTable.cliente, `%${searchTerm}%`)
      )
    : undefined;

  // 1. Busca dados para o Kanban (Filtrado)
  const resKanban = await db.query.status.findMany({
    orderBy: [asc(statusTable.ordem)],
    with: {
      veiculos: {
        where: filter,
        with: { fotos: true },
      },
    },
  });

  // 2. Busca os últimos 10 veículos para a Tabela (Filtrado)
  const resTabela = await db.query.veiculos.findMany({
    where: filter,
    limit: 10,
    orderBy: [desc(veiculosTable.id)],
    with: { status: true }
  });

  // 3. Serialização Manual (Converte Objetos Date em Strings para o Cliente)
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
    data_entrada: v.data_entrada.toString(),
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
    <main className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans antialiased">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* HEADER PREMIUM - 3 COLUNAS */}
        <header className="grid grid-cols-3 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          
          {/* Coluna 1: Dashboard Geral */}
          <div>
             <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl hover:bg-jc-navy hover:text-white transition-all group border border-slate-100 shadow-sm"
              >
                <LayoutDashboard size={16} className="text-jc-blue group-hover:text-jc-yellow" />
                <span className="text-[10px] font-black uppercase tracking-widest">Estatísticas</span>
             </Link>
          </div>

          {/* Coluna 2: Logo Centralizada */}
          <div className="flex justify-center">
            <Link href="/">
              <Image 
                src="/jc.png" 
                alt="JC Pneus Service" 
                width={140} 
                height={55} 
                className="object-contain" 
                priority 
              />
            </Link>
          </div>

          {/* Coluna 3: Novo Veículo */}
          <div className="flex justify-end">
            <Link 
              href="/veiculos/novo" 
              className="bg-jc-yellow hover:bg-yellow-400 text-jc-navy px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all shadow-md active:scale-95 border-b-2 border-yellow-600"
            >
              <Plus size={16} strokeWidth={4} />
              Novo veículo
            </Link>
          </div>
        </header>

        {/* SEÇÃO KANBAN (FLUXO) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 ml-1">
            <div className="h-4 w-1 bg-jc-yellow rounded-full" />
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Fluxo de Oficina</h2>
          </div>
          
          {/* 
            Usamos JSON.stringify como key para que o KanbanBoard resete 
            seu estado interno automaticamente ao detectar mudanças no banco 
          */}
          <KanbanBoard 
            key={JSON.stringify(colunas)} 
            initialData={colunas} 
          />
        </section>

        {/* SEÇÃO TABELA (ÚLTIMOS VEÍCULOS) */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                {search ? `Busca: ${search}` : "Últimos Veículos"}
              </h2>
            </div>
            
            <div className="w-full lg:w-auto">
              <Suspense fallback={<div className="h-10 w-64 bg-slate-100 animate-pulse rounded-xl" />}>
                <SearchVeiculos />
              </Suspense>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Placa</th>
                  <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Modelo / Marca</th>
                  <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                  <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ultimosVeiculos.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="p-4 font-black text-base text-jc-blue uppercase tracking-tighter">
                      {v.placa}
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-600 uppercase">
                      {v.modelo}
                    </td>
                    <td className="p-4 text-xs text-slate-400 font-medium">
                      {v.cliente}
                    </td>
                    <td className="p-4">
                      <div className={cn(
                        "mx-auto w-fit px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm",
                        statusStyles[v.status.nome]?.bg || "bg-slate-100",
                        statusStyles[v.status.nome]?.text || "text-slate-500"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", statusStyles[v.status.nome]?.dot)} />
                        {v.status.nome}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/veiculos/${v.id}`} 
                        className="inline-flex px-3 py-1.5 bg-slate-50 text-slate-400 hover:text-jc-blue hover:bg-blue-50 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-blue-100"
                      >
                         Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {ultimosVeiculos.length === 0 && (
            <div className="py-24 text-center border-2 border-dashed border-slate-50 rounded-3xl mt-4">
              <p className="text-slate-300 font-black uppercase tracking-[0.3em] italic">
                Nenhum registro encontrado
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}