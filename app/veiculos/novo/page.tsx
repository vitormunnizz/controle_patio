import { db } from "@/db";
import { status } from "@/db/schema";
import { asc } from "drizzle-orm";
import { criarVeiculo, criarVeiculoEChecklist } from "@/app/actions";
import Link from "next/link";
import { ArrowLeft, Car, User, CheckCircle2, ChevronDown, Calendar, ClipboardCheck } from "lucide-react";

export default async function NovoVeiculoPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const listaStatus = await db.select().from(status).orderBy(asc(status.ordem));

  return (
    <main className="app-background min-h-screen p-4 sm:p-6 font-sans antialiased text-slate-900 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-4 w-full min-w-0">
        
        {/* HEADER SLIM RESPONSIVO */}
        <header className="bg-gradient-to-r from-jc-navy via-[#073b83] to-jc-blue p-3 rounded-2xl flex items-center justify-between text-white shadow-md border border-white/10 border-b-2 border-b-jc-yellow/80 gap-2 w-full min-w-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link 
              href="/" 
              className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all flex items-center justify-center shrink-0"
            >
              <ArrowLeft size={18} strokeWidth={3} />
            </Link>
            <div className="h-6 w-[1px] bg-white/20 shrink-0" />
            <h1 className="text-xs sm:text-base font-black uppercase italic tracking-tighter text-jc-whitte truncate">
              Cadastro de Veículo
            </h1>
          </div>
        </header>

        {/* CONTAINER DO FORMULÁRIO */}
        <div className="bg-white/95 rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-white overflow-hidden w-full min-w-0">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <Car size={16} className="text-jc-blue shrink-0" />
            <h2 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider truncate">
              Informações Gerais do Veículo
            </h2>
          </div>

          <form action={criarVeiculo} className="p-4 sm:p-6 space-y-4 sm:space-y-5 w-full min-w-0">
            {erro === "placa-existente" && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                Já existe um veículo cadastrado com essa placa. Confira a placa ou abra o cadastro existente para editá-lo.
              </p>
            )}
            {erro === "salvar" && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                Não conseguimos cadastrar o veículo agora. Confira os dados e tente novamente.
              </p>
            )}
            
            {/* GRID DE CAMPOS (2 COLUNAS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full min-w-0">
              
              {/* PLACA */}
              <div className="space-y-1 min-w-0">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block ml-1 truncate">
                  Placa
                </label>
                <input
                  name="placa"
                  required
                  maxLength={7}
                  placeholder="ABC1D23"
                  className="w-full border border-slate-200 bg-white shadow-sm p-2.5 rounded-xl uppercase font-black text-jc-blue outline-none focus:border-jc-blue text-sm"
                />
              </div>

              {/* STATUS INICIAL */}
              <div className="space-y-1 min-w-0">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block ml-1 truncate">
                  Status Inicial
                </label>
                <div className="relative">
                  <select
                    name="status_id"
                    className="w-full border border-slate-200 bg-white shadow-sm p-2.5 rounded-xl font-bold text-slate-700 outline-none focus:border-jc-blue cursor-pointer text-sm truncate appearance-none pr-8"
                  >
                    {listaStatus.map((s) => (
                      <option key={s.id} value={s.id}>{s.nome}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* MODELO */}
              <div className="space-y-1 min-w-0">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block ml-1 flex items-center gap-1 truncate">
                  <Car size={10} className="shrink-0" /> Modelo / Marca
                </label>
                <input
                  name="modelo"
                  required
                  placeholder="Ex: Honda Civic"
                  className="w-full border border-slate-200 bg-white shadow-sm p-2.5 rounded-xl font-bold text-slate-700 outline-none focus:border-jc-blue text-sm"
                />
              </div>

              {/* CLIENTE */}
              <div className="space-y-1 min-w-0">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block ml-1 flex items-center gap-1 truncate">
                  <User size={10} className="shrink-0" /> Cliente
                </label>
                <input
                  name="cliente"
                  required
                  placeholder="Nome do cliente"
                  className="w-full border border-slate-200 bg-white shadow-sm p-2.5 rounded-xl font-bold text-slate-700 outline-none focus:border-jc-blue text-sm"
                />
              </div>

              {/* DATA DE ENTRADA */}
              <div className="space-y-1 min-w-0">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block ml-1 flex items-center gap-1 truncate">
                  <Calendar size={10} className="shrink-0" /> Entrada
                </label>
                <input
                  name="data_entrada"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full min-w-0 border border-slate-200 bg-white shadow-sm p-2.5 rounded-xl font-semibold text-slate-700 text-sm outline-none focus:border-jc-blue appearance-none"
                />
              </div>

              {/* PREVISÃO DE ENTREGA */}
              <div className="space-y-1 min-w-0">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block ml-1 flex items-center gap-1 truncate">
                  <Calendar size={10} className="shrink-0" /> Previsão
                </label>
                <input
                  name="data_prevista_entrega"
                  type="date"
                  className="w-full min-w-0 border border-slate-200 bg-white shadow-sm p-2.5 rounded-xl font-semibold text-slate-700 text-sm outline-none focus:border-jc-blue appearance-none"
                />
              </div>
            </div>

            <button
              type="submit"
              formAction={criarVeiculoEChecklist}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-blue-900 bg-jc-blue px-5 py-3.5 text-xs font-black uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-jc-navy active:scale-[0.99]"
            >
              <ClipboardCheck size={18} strokeWidth={2.5} className="text-white" />
              Salvar e abrir checklist
            </button>

            {/* OBSERVAÇÕES TÉCNICAS */}
            <div className="space-y-1 w-full min-w-0">
              <label htmlFor="observacoes" className="mb-1.5 ml-1 block truncate text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Observações Técnicas / Serviço
              </label>
              <textarea
                id="observacoes"
                name="observacoes"
                rows={2}
                placeholder="Descrição resumida do serviço a ser realizado..."
                className="w-full border border-slate-200 bg-white shadow-sm p-3 rounded-xl resize-none font-medium text-slate-600 text-sm outline-none focus:border-jc-blue"
              />
            </div>

            {/* BOTÃO SALVAR */}
            <div className="pt-4 border-t border-slate-50 w-full min-w-0">
              <button
                type="submit"
                className="w-full bg-jc-yellow/80 hover:bg-jc-yellow active:bg-jc-yellow/80 text-slate-900 font-black uppercase text-[10px] tracking-widest py-3.5 sm:py-4 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                Cadastrar Veículo
              </button>
            </div>

          </form>
        </div>

      </div>
    </main>
  );
}
