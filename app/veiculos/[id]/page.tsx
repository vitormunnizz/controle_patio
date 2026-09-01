import { db } from "@/db";
import { status as statusTable, veiculos as veiculosTable } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { atualizarVeiculo, deletarFoto } from "./actions"; // Removido excluirVeiculo daqui, pois o BotaoExcluir já importa
import Link from "next/link";
import { ArrowLeft, Trash2, Camera, Calendar, Car, User, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { UploadFoto } from "@/components/UploadFoto";
import { BotaoExcluir } from "@/components/BotaoExcluir"; // Importar o novo botão

export default async function EditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  const veiculo = await db.query.veiculos.findFirst({
    where: eq(veiculosTable.id, id),
    with: { fotos: true }
  });

  const listaStatus = await db.select().from(statusTable).orderBy(asc(statusTable.ordem));

  if (!veiculo) return notFound();

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6 font-sans antialiased">
      <div className="max-w-6xl mx-auto space-y-4">
        
        <header className="bg-jc-navy p-3 rounded-2xl flex items-center justify-between text-white shadow-lg border border-white/5">
          <div className="flex items-center gap-4">
            <Link href="/" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all flex items-center justify-center">
              <ArrowLeft size={18} />
            </Link>
            <div className="h-6 w-[1px] bg-white/20" />
            <h1 className="text-base font-black uppercase italic tracking-tighter">Ficha Técnica</h1>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black bg-jc-yellow text-jc-navy px-3 py-1 rounded-lg uppercase tracking-widest shadow-sm">
               {veiculo.placa}
             </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
               <Car size={16} className="text-jc-blue" />
               <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Informações do Veículo</h2>
            </div>

            <form action={atualizarVeiculo.bind(null, id)} className="p-6 space-y-5">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest ml-1">Placa</label>
                    <input name="placa" defaultValue={veiculo.placa} required className="w-full border border-slate-100 bg-slate-50 p-2.5 rounded-xl uppercase font-black text-jc-blue outline-none focus:ring-2 focus:ring-jc-blue/10" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest ml-1">Status</label>
                    <select name="status_id" defaultValue={veiculo.status_id} className="w-full border border-slate-100 bg-slate-50 p-2.5 rounded-xl font-bold text-slate-700 outline-none">
                      {listaStatus.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                    </select>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest ml-1">Modelo / Marca</label>
                    <input name="modelo" defaultValue={veiculo.modelo} required className="w-full border border-slate-100 bg-slate-50 p-2.5 rounded-xl font-bold text-slate-700 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest ml-1">Cliente</label>
                    <input name="cliente" defaultValue={veiculo.cliente} required className="w-full border border-slate-100 bg-slate-50 p-2.5 rounded-xl font-bold text-slate-700 outline-none" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest ml-1">Entrada</label>
                    <input name="data_entrada" type="date" defaultValue={veiculo.data_entrada.toString()} required className="w-full border border-slate-100 bg-slate-50 p-2.5 rounded-xl font-bold text-slate-700 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest ml-1">Previsão</label>
                    <input name="data_prevista_entrega" type="date" defaultValue={veiculo.data_prevista_entrega?.toString() || ""} className="w-full border border-slate-100 bg-slate-50 p-2.5 rounded-xl font-bold text-slate-700 text-xs" />
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest ml-1">Observações Técnicas</label>
                  <textarea name="observacoes" defaultValue={veiculo.observacoes || ""} rows={3} className="w-full border border-slate-100 bg-slate-50 p-3 rounded-xl resize-none font-medium text-slate-600 text-xs outline-none focus:ring-2 focus:ring-jc-blue/10" />
               </div>

               <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-50">
                  <button type="submit" className="flex-1 bg-jc-blue hover:bg-jc-navy text-white font-black uppercase text-[10px] tracking-[0.15em] py-4 rounded-2xl transition-all shadow-md active:scale-95">
                    Salvar Alterações
                  </button>

                  {/* NOVO BOTÃO DE CLIENTE AQUI */}
                  <BotaoExcluir veiculoId={id} />
               </div>
            </form>
          </div>

          <div className="lg:col-span-5 bg-white p-5 rounded-[32px] shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                 <Camera size={16} className="text-jc-blue" />
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fotos do Veículo</h3>
              </div>
              <UploadFoto veiculoId={id} />
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto no-scrollbar max-h-[500px]">
              {veiculo.fotos.map((foto) => (
                <div key={foto.id} className="relative group aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                  <Image src={foto.url} alt="Veículo" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                    <form action={deletarFoto.bind(null, foto.id, id)}>
                      <button className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg">
                        <Trash2 size={18} />
                      </button>
                    </form>
                  </div>
                </div>
              ))}

              {veiculo.fotos.length === 0 && (
                <div className="col-span-2 py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-50 rounded-3xl text-slate-200">
                  <Camera size={32} strokeWidth={1} className="mb-2" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Nenhuma foto</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}