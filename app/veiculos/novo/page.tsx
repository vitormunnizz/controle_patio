import { db } from "@/db";
import { status } from "@/db/schema";
import { asc } from "drizzle-orm";
import { criarVeiculo } from "./actions";
import Link from "next/link";
import { ArrowLeft, Car, User, CheckCircle2, ChevronDown, Calendar } from "lucide-react";

export default async function NovoVeiculoPage() {
  const listaStatus = await db.select().from(status).orderBy(asc(status.ordem));

  return (
    <main className="min-h-screen bg-slate-100 p-3 sm:p-4 md:p-6 font-sans antialiased text-slate-900 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-4 w-full min-w-0">
        
        {/* HEADER SLIM RESPONSIVO */}
        <header className="bg-jc-navy p-3 rounded-2xl flex items-center justify-between text-white shadow-lg border border-white/5 gap-2 w-full min-w-0">
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
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 overflow-hidden w-full min-w-0">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <Car size={16} className="text-jc-blue shrink-0" />
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">
              Informações Gerais do Veículo
            </h2>
          </div>

          <form action={criarVeiculo} className="p-4 sm:p-6 space-y-4 sm:space-y-5 w-full min-w-0">
            
            {/* GRID DE CAMPOS (2 COLUNAS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full min-w-0">
              
              {/* PLACA */}
              <div className="space-y-1 min-w-0">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1 truncate">
                  Placa
                </label>
                <input
                  name="placa"
                  required
                  maxLength={7}
                  placeholder="ABC1D23"
                  className="w-full border border-slate-100 bg-slate-50 p-2.5 rounded-xl uppercase font-black text-jc-blue outline-none focus:border-jc-blue text-sm"
                />
              </div>

              {/* STATUS INICIAL */}
              <div className="space-y-1 min-w-0">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1 truncate">
                  Status Inicial
                </label>
                <div className="relative">
                  <select
                    name="status_id"
                    className="w-full border border-slate-100 bg-slate-50 p-2.5 rounded-xl font-bold text-slate-700 outline-none focus:border-jc-blue cursor-pointer text-xs sm:text-sm truncate appearance-none pr-8"
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
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1 flex items-center gap-1 truncate">
                  <Car size={10} className="shrink-0" /> Modelo / Marca
                </label>
                <input
                  name="modelo"
                  required
                  placeholder="Ex: Honda Civic"
                  className="w-full border border-slate-100 bg-slate-50 p-2.5 rounded-xl font-bold text-slate-700 outline-none focus:border-jc-blue text-xs sm:text-sm"
                />
              </div>

              {/* CLIENTE */}
              <div className="space-y-1 min-w-0">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1 flex items-center gap-1 truncate">
                  <User size={10} className="shrink-0" /> Cliente
                </label>
                <input
                  name="cliente"
                  required
                  placeholder="Nome do cliente"
                  className="w-full border border-slate-100 bg-slate-50 p-2.5 rounded-xl font-bold text-slate-700 outline-none focus:border-jc-blue text-xs sm:text-sm"
                />
              </div>

              {/* DATA DE ENTRADA */}
              <div className="space-y-1 min-w-0">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1 flex items-center gap-1 truncate">
                  <Calendar size={10} className="shrink-0" /> Entrada
                </label>
                <input
                  name="data_entrada"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full min-w-0 border border-slate-100 bg-slate-50 p-2.5 rounded-xl font-bold text-slate-700 text-xs outline-none focus:border-jc-blue appearance-none"
                />
              </div>

              {/* PREVISÃO DE ENTREGA */}
              <div className="space-y-1 min-w-0">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1 flex items-center gap-1 truncate">
                  <Calendar size={10} className="shrink-0" /> Previsão
                </label>
                <input
                  name="data_prevista_entrega"
                  type="date"
                  className="w-full min-w-0 border border-slate-100 bg-slate-50 p-2.5 rounded-xl font-bold text-slate-700 text-xs outline-none focus:border-jc-blue appearance-none"
                />
              </div>
            </div>

            {/* OBSERVAÇÕES TÉCNICAS */}
            <div className="space-y-1 w-full min-w-0">
              <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest ml-1 block truncate">
                Observações Técnicas / Serviço
              </label>
              <textarea
                name="observacoes"
                rows={3}
                placeholder="Descrição resumida do serviço a ser realizado..."
                className="w-full border border-slate-100 bg-slate-50 p-3 rounded-xl resize-none font-medium text-slate-600 text-xs outline-none focus:border-jc-blue"
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