import { db } from "@/db";
import { status } from "@/db/schema";
import { asc } from "drizzle-orm";
import { criarVeiculo } from "./actions";
import Link from "next/link";
import { ArrowLeft, Car, User, CheckCircle2, ChevronDown, FileText, Calendar } from "lucide-react";

export default async function NovoVeiculoPage() {
  const listaStatus = await db.select().from(status).orderBy(asc(status.ordem));

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-3 sm:p-4 md:p-6 font-sans text-slate-900">
      {/* Container principal flexível para se adequar ao viewport sem quebrar em telas pequenas */}
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-[32px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden my-auto max-h-[95vh] sm:max-h-[90vh]">

        {/* HEADER SLIM */}
        <header className="bg-jc-navy p-3.5 sm:p-4 md:px-8 flex items-center gap-3 sm:gap-4 text-white shrink-0">
          <Link href="/" className="bg-white/10 hover:bg-white/20 p-1.5 sm:p-2 rounded-xl transition-all shrink-0">
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </Link>

          <div className="h-5 sm:h-6 w-[1px] bg-white/20" />

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-black uppercase tracking-tight italic truncate">
              Cadastro de Veículos
            </h1>
          </div>
          
          <span className="text-[9px] font-black text-jc-yellow uppercase tracking-[0.2em] hidden sm:block shrink-0">
            JC Pneus Service
          </span>
        </header>

        {/* FORMULÁRIO COMPACTO COM SCROLL RESPONSIVO */}
        <form action={criarVeiculo} className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 sm:gap-y-5">

            {/* COLUNA 01 */}
            <div className="space-y-3 sm:space-y-4">
              <span className="text-[9px] font-black text-jc-blue uppercase tracking-widest border-b border-slate-100 block pb-1">
                01. Identificação
              </span>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                  Placa
                </label>
                <input
                  name="placa"
                  required
                  maxLength={7}
                  placeholder="ABC1D23"
                  className="w-full bg-slate-50 border-2 border-slate-100 p-2.5 rounded-xl text-lg sm:text-xl font-black text-jc-blue uppercase focus:border-jc-blue outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                  Modelo / Marca
                </label>
                <div className="relative">
                  <Car size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    name="modelo" 
                    required 
                    placeholder="Ex: Honda Civic" 
                    className="w-full bg-slate-50 border-2 border-slate-100 pl-10 pr-3 py-2.5 rounded-xl font-bold text-slate-700 text-sm focus:border-jc-blue outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                  Cliente
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    name="cliente" 
                    required 
                    placeholder="Nome do cliente" 
                    className="w-full bg-slate-50 border-2 border-slate-100 pl-10 pr-3 py-2.5 rounded-xl font-bold text-slate-700 text-sm focus:border-jc-blue outline-none" 
                  />
                </div>
              </div>
            </div>

            {/* COLUNA 02 */}
            <div className="space-y-3 sm:space-y-4">
              <span className="text-[9px] font-black text-jc-blue uppercase tracking-widest border-b border-slate-100 block pb-1">
                02. Planejamento
              </span>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                  Status Inicial
                </label>
                <div className="relative">
                  <select
                    name="status_id"
                    className="w-full bg-slate-50 border-2 border-slate-100 p-2.5 rounded-xl font-bold text-slate-700 text-sm focus:border-jc-blue outline-none cursor-pointer appearance-none"
                  >
                    {listaStatus.map((s) => (
                      <option key={s.id} value={s.id}>{s.nome}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 flex items-center gap-1.5">
                    <Calendar size={12} /> Entrada
                  </label>
                  <input 
                    name="data_entrada" 
                    type="date" 
                    required 
                    defaultValue={new Date().toISOString().split('T')[0]} 
                    className="w-full bg-slate-50 border-2 border-slate-100 p-2 rounded-xl font-bold text-slate-700 text-xs outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 flex items-center gap-1.5">
                    <Calendar size={12} /> Previsão
                  </label>
                  <input 
                    name="data_prevista_entrega" 
                    type="date" 
                    className="w-full bg-slate-50 border-2 border-slate-100 p-2 rounded-xl font-bold text-slate-700 text-xs outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                  Observações
                </label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3.5 top-3.5 text-slate-300" />
                  <textarea
                    name="observacoes"
                    rows={2}
                    placeholder="Descrição do serviço..."
                    className="w-full bg-slate-50 border-2 border-slate-100 pl-10 pr-3 py-2.5 rounded-xl font-medium text-slate-600 text-xs focus:border-jc-blue outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BOTÃO FINAL */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-slate-50 flex justify-center">
            <button
              type="submit"
              className="w-full sm:w-auto bg-jc-yellow hover:bg-[#ffea00] cursor-pointer text-jc-navy px-8 sm:px-12 py-3.5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-yellow-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-b-4 border-yellow-600"
            >
              <CheckCircle2 size={16} />
              Salvar Veículo
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}