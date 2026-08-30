import { db } from "@/db";
import { status } from "@/db/schema";
import { asc } from "drizzle-orm";
import { criarVeiculo } from "./actions";
import Link from "next/link";
import { ArrowLeft, Car, User, CheckCircle2, ChevronDown, FileText } from "lucide-react"; // Removido Calendar e PlusCircle

export default async function NovoVeiculoPage() {
  const listaStatus = await db.select().from(status).orderBy(asc(status.ordem));

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-3xl bg-white rounded-[32px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[95vh]">

        {/* HEADER */}
        <header className="bg-jc-navy p-5 flex items-center gap-4 text-white">
          <Link href="/" className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all shrink-0">
            <ArrowLeft size={20} />
          </Link>

          <div className="h-6 w-[1px] bg-white/20" />

          <div className="flex items-center gap-3 flex-1">
            <h1 className="text-lg font-black uppercase tracking-tight italic">Cadastro de Veículos</h1>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">JC Pneus Service</span>
        </header>

        {/* FORMULÁRIO */}
        <form action={criarVeiculo} className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

            {/* SEÇÃO IDENTIFICAÇÃO */}
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Placa</label>
                <input
                  name="placa"
                  required
                  maxLength={7}
                  placeholder="ABC1D23"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xl font-black text-jc-blue uppercase focus:ring-2 focus:ring-jc-blue/10 focus:border-jc-blue outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Modelo / Marca</label>
                <div className="relative">
                  <Car size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input name="modelo" required placeholder="Ex: Honda Civic" className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-2xl font-bold text-slate-700 text-sm focus:border-jc-blue focus:bg-white outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Cliente</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input name="cliente" required placeholder="Nome do proprietário" className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-2xl font-bold text-slate-700 text-sm focus:border-jc-blue focus:bg-white outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* SEÇÃO PLANEJAMENTO */}
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Status de Entrada</label>
                <div className="relative">
                  <select
                    name="status_id"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl font-bold text-slate-700 text-sm focus:border-jc-blue outline-none cursor-pointer appearance-none"
                  >
                    {listaStatus.map((s) => (
                      <option key={s.id} value={s.id}>{s.nome}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1 text-center">Data Entrada</label>
                  <input name="data_entrada" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl font-bold text-slate-700 text-xs outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1 text-center">Previsão</label>
                  <input name="data_prevista_entrega" type="date" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl font-bold text-slate-700 text-xs outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Observações</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <textarea
                    name="observacoes"
                    rows={2}
                    placeholder="Descrição do serviço..."
                    className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-2xl font-medium text-slate-600 text-sm focus:border-jc-blue outline-none resize-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BOTÃO DE AÇÃO */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
            <button
              type="submit"
              className="w-full md:w-auto bg-jc-yellow hover:bg-[#ffea00] text-jc-navy px-12 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.15em] shadow-lg shadow-yellow-200 transition-all active:scale-95 flex items-center justify-center gap-3 border-b-4 border-yellow-600"
            >
              <CheckCircle2 size={18} />
              Confirmar Cadastro
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}