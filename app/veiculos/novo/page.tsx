// app/veiculos/novo/page.tsx
import { db } from "@/db";
import { status } from "@/db/schema";
import { asc } from "drizzle-orm";
import { criarVeiculo } from "./actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NovoVeiculoPage() {
  // Buscamos os status para o usuário escolher no formulário
  const listaStatus = await db.select().from(status).orderBy(asc(status.ordem));

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6">
          <ArrowLeft size={20} />
          <span>Voltar para o Dashboard</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h1 className="text-xl font-bold text-slate-800">Cadastrar Novo Veículo</h1>
            <p className="text-sm text-slate-500">Preencha as informações para iniciar a ordem de serviço.</p>
          </div>

          <form action={criarVeiculo} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Placa */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Placa</label>
                <input 
                  name="placa" 
                  required 
                  className="w-full border border-slate-200 p-2.5 rounded-xl uppercase focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  placeholder="ABC1D23" 
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Status Inicial</label>
                <select 
                  name="status_id" 
                  className="w-full border border-slate-200 p-2.5 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  {listaStatus.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modelo e Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Modelo</label>
                <input name="modelo" required className="w-full border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Toyota Corolla" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Cliente</label>
                <input name="cliente" required className="w-full border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nome do proprietário" />
              </div>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Data de Entrada</label>
                <input 
                  name="data_entrada" 
                  type="date" 
                  required 
                  className="w-full border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  defaultValue={new Date().toISOString().split('T')[0]} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Previsão de Entrega</label>
                <input 
                  name="data_prevista_entrega" 
                  type="date" 
                  className="w-full border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Observações / Descrição do Problema</label>
              <textarea 
                name="observacoes" 
                rows={4} 
                className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                placeholder="Descreva o que precisa ser feito ou detalhes do veículo..."
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-100 active:scale-[0.98]"
            >
              Salvar e Cadastrar Veículo
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}