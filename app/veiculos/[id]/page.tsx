import { db } from "@/db";
import { status as statusTable, veiculos as veiculosTable } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { atualizarVeiculo } from "./actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  const veiculo = await db.query.veiculos.findFirst({
    where: eq(veiculosTable.id, id),
  });

  const listaStatus = await db.select().from(statusTable).orderBy(asc(statusTable.ordem));

  if (!veiculo) return notFound();

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-slate-500 mb-6 hover:text-blue-600 transition-colors">
          <ArrowLeft size={20} /> Voltar ao Kanban
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100">
            <h1 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Editar: {veiculo.placa}</h1>
          </div>

          <form action={atualizarVeiculo.bind(null, id)} className="p-6 space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Placa</label>
                  <input name="placa" defaultValue={veiculo.placa} required className="w-full border p-3 rounded-xl uppercase font-bold text-slate-700" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Status</label>
                  <select name="status_id" defaultValue={veiculo.status_id} className="w-full border p-3 rounded-xl bg-white font-bold text-slate-700">
                    {listaStatus.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>
             </div>
             <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">Modelo</label>
                <input name="modelo" defaultValue={veiculo.modelo} required className="w-full border p-3 rounded-xl font-bold text-slate-700" />
             </div>
             <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">Cliente</label>
                <input name="cliente" defaultValue={veiculo.cliente} required className="w-full border p-3 rounded-xl font-bold text-slate-700" />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Entrada</label>
                  <input name="data_entrada" type="date" defaultValue={veiculo.data_entrada} required className="w-full border p-3 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Previsão</label>
                  <input name="data_prevista_entrega" type="date" defaultValue={veiculo.data_prevista_entrega || ""} className="w-full border p-3 rounded-xl" />
                </div>
             </div>
             <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">Observações</label>
                <textarea name="observacoes" defaultValue={veiculo.observacoes || ""} rows={4} className="w-full border p-3 rounded-xl resize-none" />
             </div>
             <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95">
                Salvar Alterações
             </button>
          </form>
        </div>
      </div>
    </main>
  );
}