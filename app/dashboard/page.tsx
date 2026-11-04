import { and, count, eq, gte, lte } from "drizzle-orm";
import { CalendarDays, CarFront, CheckCircle2, Clock3, TrendingUp } from "lucide-react";
import { db } from "@/db";
import { status as statusTable, veiculos as veiculosTable } from "@/db/schema";
import { DashboardDateFilter } from "@/components/DashboardDateFilter";
import { PageHeader } from "@/components/PageHeader";
import { cn, statusStyles } from "@/lib/utils";

type DashboardSearchParams = Promise<{ from?: string; to?: string }>;

function isoDataLocal(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return ano + "-" + mes + "-" + dia;
}

function validarData(data?: string) {
  if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return null;
  const [ano, mes, dia] = data.split("-").map(Number);
  const dataUTC = new Date(Date.UTC(ano, mes - 1, dia));
  if (dataUTC.getUTCFullYear() !== ano || dataUTC.getUTCMonth() !== mes - 1 || dataUTC.getUTCDate() !== dia) return null;
  return data;
}

function subtrairDias(dataIso: string, dias: number) {
  const [ano, mes, dia] = dataIso.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia);
  data.setDate(data.getDate() - dias);
  return isoDataLocal(data);
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams;
}) {
  const { from, to } = await searchParams;
  const hoje = isoDataLocal(new Date());
  const dataFim = validarData(to) ?? hoje;
  const dataInicio = validarData(from) ?? subtrairDias(dataFim, 29);
  const periodoValido = dataInicio <= dataFim;

  const statusQuery = periodoValido
    ? await db
        .select({ nome: statusTable.nome, total: count(veiculosTable.id) })
        .from(statusTable)
        .leftJoin(
          veiculosTable,
          and(
            eq(statusTable.id, veiculosTable.status_id),
            gte(veiculosTable.data_entrada, dataInicio),
            lte(veiculosTable.data_entrada, dataFim),
          ),
        )
        .groupBy(statusTable.id, statusTable.nome)
        .orderBy(statusTable.ordem)
    : [];

  const statusData = statusQuery.map((item) => ({ nome: item.nome, total: Number(item.total) }));
  const statusAtivos = statusData.filter((item) => item.total > 0);
  const statusVazios = statusData.filter((item) => item.total === 0);
  const totalVeiculos = statusData.reduce((total, item) => total + item.total, 0);
  const totalFinalizados = statusData
    .filter((item) => item.nome === "Finalizado" || item.nome === "Entregue")
    .reduce((total, item) => total + item.total, 0);
  const diasPeriodo = periodoValido
    ? Math.floor((Date.parse(dataFim + "T00:00:00Z") - Date.parse(dataInicio + "T00:00:00Z")) / 86_400_000) + 1
    : 0;
  const taxaFinalizacao = totalVeiculos > 0 ? Math.round((totalFinalizados / totalVeiculos) * 100) : 0;

  return (
    <main className="app-background page-main text-slate-900">
      <div className="page-container page-stack">
        <PageHeader backHref="/" backLabel="Voltar para a oficina" title="Dashboard" />

        <section aria-label="Filtro de período" className="flex flex-col gap-2 rounded-2xl border border-white bg-white/95 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-4 sm:py-3">
          <div className="flex shrink-0 items-center gap-2 px-1 text-xs font-extrabold uppercase tracking-wider text-slate-500">
            <CalendarDays size={15} className="text-jc-blue" />
            Período da análise
          </div>
          <div className="min-w-0 flex-1 sm:max-w-[900px]">
            <DashboardDateFilter initialFrom={dataInicio} initialTo={dataFim} />
          </div>
          {!periodoValido && (
            <p role="alert" className="mt-2 text-sm font-semibold text-red-700">
              A data inicial precisa ser anterior à data final.
            </p>
          )}
        </section>

        <section aria-label="Indicadores do período" className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <Indicador titulo="Entradas" valor={totalVeiculos} detalhe="veículos no período" icone={<CarFront size={18} />} cor="blue" />
          <Indicador titulo="Finalizados" valor={totalFinalizados} detalhe="finalizados ou entregues" icone={<CheckCircle2 size={18} />} cor="green" />
          <Indicador titulo="Taxa de finalização" valor={taxaFinalizacao} unidade="%" detalhe="do total de entradas" icone={<TrendingUp size={18} />} cor="purple" />
          <Indicador titulo="Período" valor={diasPeriodo} unidade="dias" detalhe="intervalo selecionado" icone={<Clock3 size={18} />} cor="slate" />
        </section>

        <section aria-labelledby="etapas-titulo" className="rounded-2xl border border-white bg-white/95 p-4 shadow-[0_8px_28px_rgba(15,23,42,0.055)] sm:p-5">
          <div className="mb-3 flex flex-col gap-1 sm:mb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="etapas-titulo" className="page-section-title">Veículos por etapa</h2>
            </div>
            <p className="text-sm font-medium text-slate-500">
              {totalVeiculos} {totalVeiculos === 1 ? "veículo encontrado" : "veículos encontrados"}
            </p>
          </div>

          {totalVeiculos === 0 ? (
            <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-5 text-center">
              <CalendarDays size={22} className="text-slate-300" />
              <p className="mt-2 text-sm font-bold text-slate-600">
                {periodoValido ? "Nenhum veículo neste período" : "Confira as datas selecionadas"}
              </p>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                {periodoValido
                  ? "Tente ampliar o intervalo para ver o movimento da oficina."
                  : "A data inicial precisa ser anterior à data final para exibir os resultados."}
              </p>
            </div>
          ) : (
            <div className={cn("grid grid-cols-1 gap-3", statusAtivos.length > 1 && "sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4")}>
              {statusAtivos.map((item) => (
                <CartaoEtapa key={item.nome} nome={item.nome} total={item.total} totalGeral={totalVeiculos} />
              ))}
            </div>
          )}

          {totalVeiculos > 0 && statusVazios.length > 0 && (
            <details className="mt-4 border-t border-slate-100 pt-3">
              <summary className="w-fit cursor-pointer text-sm font-semibold text-slate-500 transition-colors hover:text-jc-blue">
                Ver {statusVazios.length} {statusVazios.length === 1 ? "etapa sem veículos" : "etapas sem veículos"}
              </summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {statusVazios.map((item) => {
                  const estilo = statusStyles[item.nome] || statusStyles["Recebido"];
                  return (
                    <span key={item.nome} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600">
                      <span className={cn("h-2 w-2 rounded-full", estilo.dot)} />
                      {item.nome} · 0
                    </span>
                  );
                })}
              </div>
            </details>
          )}
        </section>
      </div>
    </main>
  );
}

function Indicador({
  titulo,
  valor,
  unidade,
  detalhe,
  icone,
  cor,
}: {
  titulo: string;
  valor: number;
  unidade?: string;
  detalhe: string;
  icone: React.ReactNode;
  cor: "blue" | "green" | "purple" | "slate";
}) {
  const cores = {
    blue: "bg-blue-50 text-jc-blue",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <article className="grid min-w-0 grid-cols-[32px_minmax(0,1fr)] gap-x-2 rounded-2xl border border-slate-100 bg-white p-2.5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] sm:grid-cols-[36px_minmax(0,1fr)] sm:gap-x-3 sm:p-3">
      <div className={cn("row-span-3 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg sm:h-9 sm:w-9 sm:rounded-xl", cores[cor])}>{icone}</div>
      <p className="page-caption min-w-0 whitespace-normal font-bold uppercase leading-tight tracking-wide text-slate-500">{titulo}</p>
      <p className="mt-0.5 flex items-baseline gap-1 text-lg font-black leading-none text-jc-navy sm:text-xl">
        {valor}<span className="text-xs font-bold text-slate-400">{unidade}</span>
      </p>
      <p className="page-caption mt-0.5 min-w-0 whitespace-normal break-words leading-snug text-slate-500">{detalhe}</p>
    </article>
  );
}

function CartaoEtapa({ nome, total, totalGeral }: { nome: string; total: number; totalGeral: number }) {
  const estilo = statusStyles[nome] || statusStyles["Recebido"];
  const percentual = totalGeral > 0 ? Math.round((total / totalGeral) * 100) : 0;

  return (
    <article className={cn("rounded-2xl border p-3 transition-shadow hover:shadow-md sm:p-3.5", estilo.border, "bg-white")}>
      <div className="flex min-h-10 items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", estilo.dot)} />
          <h3 className={cn("text-xs font-extrabold leading-snug sm:text-sm", estilo.text)}>{nome}</h3>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-bold", estilo.bg, estilo.text)}>{percentual}%</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-xl font-black leading-none text-slate-900">{total}</span>
        <span className="text-xs font-medium text-slate-500">{total === 1 ? "veículo" : "veículos"}</span>
      </div>
      <div
        role="progressbar"
        aria-label={percentual + "% dos veículos estão em " + nome}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentual}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"
      >
        <div className={cn("h-full rounded-full transition-[width] duration-500", estilo.dot)} style={{ width: percentual + "%" }} />
      </div>
    </article>
  );
}
