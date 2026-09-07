import { db } from "@/db";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { statusStyles, cn } from "@/lib/utils";
import { SearchVeiculos } from "@/components/SearchVeiculos";

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  // Busca veículos do PostgreSQL com relacionamento
  const veiculos = await db.query.veiculos.findMany({
    where: (veiculos, { ilike, or }) =>
      search
        ? or(
            ilike(veiculos.placa, `%${search}%`),
            ilike(veiculos.cliente, `%${search}%`),
            ilike(veiculos.modelo, `%${search}%`)
          )
        : undefined,
    orderBy: (veiculos, { desc }) => [desc(veiculos.id)],
    with: {
      status: true,
      fotos: true,
    },
  });

  const formatarData = (dataStr: string) => {
    if (!dataStr) return "-";
    const [, mes, dia] = dataStr.split("T")[0].split("-");
    return `${dia}/${mes}`;
  };

  return (
    <main className="min-h-screen bg-slate-100 p-3 sm:p-6">
      <div className="max-w-[1400px] mx-auto space-y-4">
        
        {/* Cabeçalho e Ações Responsivas */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
              title="Voltar ao Kanban"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-jc-navy tracking-tight">
                Relatório Geral <span className="text-jc-blue">| JC PNEUS</span>
              </h1>
              <p className="text-xs font-semibold text-slate-400">
                Histórico de veículos cadastrados ({veiculos.length} registros)
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <div className="w-full sm:w-64">
              <SearchVeiculos />
            </div>

            <a
              href="/api/exportar-csv"
              download
              className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm shrink-0"
            >
              <Download size={14} />
              <span>Exportar CSV</span>
            </a>
          </div>
        </header>

        {/* 1. Visão de Cards no Celular (Visível apenas em telas menores que 'md') */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {veiculos.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center text-slate-400 font-bold text-xs">
              Nenhum veículo encontrado.
            </div>
          ) : (
            veiculos.map((v) => {
              const style = statusStyles[v.status.nome] || statusStyles["Recebido"];
              return (
                <div
                  key={v.id}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      {v.placa}
                    </span>
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                        style.bg,
                        style.text
                      )}
                    >
                      {v.status.nome}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Modelo</p>
                      <p className="font-bold text-slate-700 truncate">{v.modelo}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Cliente</p>
                      <p className="font-bold text-slate-700 truncate">{v.cliente}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Entrada</p>
                      <p className="font-medium text-slate-600">{formatarData(v.data_entrada)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Fotos</p>
                      <p className="font-medium text-slate-600">{v.fotos.length} foto(s)</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <Link
                      href={`/veiculos/${v.id}`}
                      className="px-3 py-1 bg-jc-navy text-jc-yellow rounded-lg text-[10px] font-black uppercase tracking-wider"
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 2. Visão de Tabela no Desktop (Oculta no celular, rolável no tablet) */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Placa</th>
                  <th className="py-3 px-4">Modelo</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Entrada</th>
                  <th className="py-3 px-4">Previsão</th>
                  <th className="py-3 px-4 text-center">Fotos</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {veiculos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                      Nenhum veículo encontrado.
                    </td>
                  </tr>
                ) : (
                  veiculos.map((v) => {
                    const style = statusStyles[v.status.nome] || statusStyles["Recebido"];
                    return (
                      <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-black uppercase text-slate-900">
                          {v.placa}
                        </td>
                        <td className="py-3 px-4 uppercase">{v.modelo}</td>
                        <td className="py-3 px-4">{v.cliente}</td>
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider inline-block",
                              style.bg,
                              style.text
                            )}
                          >
                            {v.status.nome}
                          </span>
                        </td>
                        <td className="py-3 px-4">{formatarData(v.data_entrada)}</td>
                        <td className="py-3 px-4">
                          {v.data_prevista_entrega ? formatarData(v.data_prevista_entrega) : "-"}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-400">
                          {v.fotos.length}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/veiculos/${v.id}`}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-jc-navy hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                          >
                            Editar
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}