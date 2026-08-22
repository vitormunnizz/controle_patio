import { db } from "@/db";
import { status as statusTable, veiculos as veiculosTable } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { atualizarVeiculo, deletarFoto } from "./actions"; // Adicionamos deletarFoto
import Link from "next/link";
import { ArrowLeft, Trash2, Camera, Calendar } from "lucide-react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { UploadFoto } from "@/components/UploadFoto";

export default async function EditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  // Buscamos o veículo já incluindo as fotos relacionadas
  const veiculo = await db.query.veiculos.findFirst({
    where: eq(veiculosTable.id, id),
    with: { fotos: true }
  });

  const listaStatus = await db.select().from(statusTable).orderBy(asc(statusTable.ordem));

  if (!veiculo) return notFound();

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-[10px] font-black uppercase tracking-[0.2em]">
            <ArrowLeft size={16} /> Voltar ao Kanban
          </Link>
          <h1 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Ficha do Veículo</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LADO ESQUERDO: FORMULÁRIO (7 colunas) */}
          <div className="lg:col-span-7 bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-800 uppercase italic">Dados Cadastrais: {veiculo.placa}</h2>
            </div>

            <form action={atualizarVeiculo.bind(null, id)} className="p-6 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Placa</label>
                    <input name="placa" defaultValue={veiculo.placa} required className="w-full border border-slate-200 p-3 rounded-2xl uppercase font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Status</label>
                    <select name="status_id" defaultValue={veiculo.status_id} className="w-full border border-slate-200 p-3 rounded-2xl bg-white font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500">
                      {listaStatus.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                    </select>
                  </div>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Modelo / Marca</label>
                  <input name="modelo" defaultValue={veiculo.modelo} required className="w-full border border-slate-200 p-3 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Nome do Cliente</label>
                  <input name="cliente" defaultValue={veiculo.cliente} required className="w-full border border-slate-200 p-3 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Data de Entrada</label>
                    <input name="data_entrada" type="date" defaultValue={veiculo.data_entrada.toString()} required className="w-full border border-slate-200 p-3 rounded-2xl font-bold text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Previsão Entrega</label>
                    <input name="data_prevista_entrega" type="date" defaultValue={veiculo.data_prevista_entrega?.toString() || ""} className="w-full border border-slate-200 p-3 rounded-2xl font-bold text-slate-700" />
                  </div>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Observações Técnicas</label>
                  <textarea name="observacoes" defaultValue={veiculo.observacoes || ""} rows={4} className="w-full border border-slate-200 p-3 rounded-2xl resize-none font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-500" />
               </div>
               <button type="submit" className="w-full bg-blue-600 text-white font-black uppercase text-sm py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
                  Salvar Alterações
               </button>
            </form>
          </div>

          {/* LADO DIREITO: FOTOS (5 colunas) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Galeria de Fotos</h3>
                <UploadFoto veiculoId={id} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {veiculo.fotos.map((foto) => (
                  <div key={foto.id} className="relative group aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                    <Image 
                      src={foto.url} 
                      alt="Veículo" 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    
                    {/* Overlay de Ações na Foto */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                      <div className="flex justify-end">
                        <form action={deletarFoto.bind(null, foto.id, id)}>
                          <button className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg">
                            <Trash2 size={16} />
                          </button>
                        </form>
                      </div>
                      <div className="flex items-center gap-1.5 text-white text-[9px] font-black uppercase bg-black/30 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                        <Calendar size={10} />
                        {new Date(foto.created_at || "").toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}

                {veiculo.fotos.length === 0 && (
                  <div className="col-span-2 py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[32px] text-slate-300">
                    <Camera size={48} strokeWidth={1} className="mb-2" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Nenhuma foto anexada</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}