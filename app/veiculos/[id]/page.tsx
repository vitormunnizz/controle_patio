import { db } from "@/db";
import { status as statusTable, veiculos as veiculosTable } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { atualizarVeiculo } from "./actions";
import Link from "next/link";
import { ArrowLeft, Car, User, Calendar, Camera } from "lucide-react";
import { notFound } from "next/navigation";
import { UploadFoto } from "@/components/UploadFoto";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { GaleriaFotos } from "@/components/GaleriaFotos";
import { FotoSerializada } from "@/types/kanban";

export default async function EditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (isNaN(id)) return notFound();

  const veiculo = await db.query.veiculos.findFirst({
    where: eq(veiculosTable.id, id),
    with: { fotos: true }
  });

  const listaStatus = await db.select().from(statusTable).orderBy(asc(statusTable.ordem));

  if (!veiculo) return notFound();

  // Função para formatar a data corretamente no input tipo 'date' (YYYY-MM-DD)
  const formatarDataInput = (data: Date | string | null) => {
    if (!data) return "";
    if (typeof data === "string") return data.split("T")[0];
    return new Date(data).toISOString().split("T")[0];
  };

  // Mapeamento para enviar dados limpos ao componente de Galeria
  const fotosVeiculo: FotoSerializada[] = veiculo.fotos.map(f => ({
    id: f.id,
    veiculo_id: f.veiculo_id,
    url: f.url,
    created_at: f.created_at ? new Date(f.created_at).toISOString() : null
  }));

  return (
    <main className="min-h-screen bg-slate-100 p-3 sm:p-4 md:p-6 font-sans antialiased text-slate-900 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-4 w-full min-w-0">

        {/* HEADER SLIM RESPONSIVO */}
        <header className="bg-jc-navy p-3 rounded-2xl flex items-center justify-between text-white shadow-lg border border-white/5 gap-2 w-full min-w-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link href="/" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all flex items-center justify-center shrink-0">
              <ArrowLeft size={18} strokeWidth={3} />
            </Link>
            <div className="h-6 w-[1px] bg-white/20 shrink-0" />
            <h1 className="text-xs sm:text-base font-black uppercase italic tracking-tighter text-jc-whitte truncate">
              Ficha Técnica
            </h1>
          </div>
          <span className="text-[9px] sm:text-[10px] font-black bg-white text-jc-navy px-2 sm:px-3 py-1 rounded-lg uppercase tracking-widest shadow-sm shrink-0">
            Placa: {veiculo.placa}
          </span>
        </header>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full min-w-0">

          {/* COLUNA FORMULÁRIO (ESQUERDA) */}
          <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 overflow-hidden w-full min-w-0">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <Car size={16} className="text-jc-blue shrink-0" />
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">Informações Gerais</h2>
            </div>

            <form action={atualizarVeiculo.bind(null, id)} className="p-3 sm:p-6 space-y-4 w-full min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full min-w-0">
                <div className="space-y-1 min-w-0">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1 truncate">Placa</label>
                  <input
                    name="placa"
                    defaultValue={veiculo.placa}
                    required
                    maxLength={7}
                    className="w-full border border-slate-100 bg-slate-50 p-2.5 rounded-xl uppercase font-black text-jc-blue outline-none focus:border-jc-blue text-sm"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1 truncate">Status</label>
                  <select
                    name="status_id"
                    defaultValue={veiculo.status_id}
                    className="w-full border border-slate-100 bg-slate-50 p-2.5 rounded-xl font-bold text-slate-700 outline-none focus:border-jc-blue cursor-pointer text-xs sm:text-sm truncate"
                  >
                    {listaStatus.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full min-w-0">
                <div className="space-y-1 min-w-0">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1 flex items-center gap-1 truncate">
                    <Car size={10} className="shrink-0" /> Modelo
                  </label>
                  <input
                    name="modelo"
                    defaultValue={veiculo.modelo}
                    required
                    className="w-full border border-slate-100 bg-slate-50 p-2.5 rounded-xl font-bold text-slate-700 outline-none focus:border-jc-blue text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1 flex items-center gap-1 truncate">
                    <User size={10} className="shrink-0" /> Cliente
                  </label>
                  <input
                    name="cliente"
                    defaultValue={veiculo.cliente}
                    required
                    className="w-full border border-slate-100 bg-slate-50 p-2.5 rounded-xl font-bold text-slate-700 outline-none focus:border-jc-blue text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full min-w-0">
                <div className="space-y-1 min-w-0">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1 flex items-center gap-1 truncate">
                    <Calendar size={10} className="shrink-0" /> Entrada
                  </label>
                  <input
                    name="data_entrada"
                    type="date"
                    defaultValue={formatarDataInput(veiculo.data_entrada)}
                    required
                    className="w-full min-w-0 border border-slate-100 bg-slate-50 p-2.5 rounded-xl font-bold text-slate-700 text-xs outline-none focus:border-jc-blue appearance-none"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1 flex items-center gap-1 truncate">
                    <Calendar size={10} className="shrink-0" /> Previsão
                  </label>
                  <input
                    name="data_prevista_entrega"
                    type="date"
                    defaultValue={formatarDataInput(veiculo.data_prevista_entrega)}
                    className="w-full min-w-0 border border-slate-100 bg-slate-50 p-2.5 rounded-xl font-bold text-slate-700 text-xs outline-none focus:border-jc-blue appearance-none"
                  />
                </div>
              </div>

              <div className="space-y-1 w-full min-w-0">
                <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest ml-1 block truncate">
                  Observações Técnicas
                </label>
                <textarea
                  name="observacoes"
                  defaultValue={veiculo.observacoes || ""}
                  rows={3}
                  className="w-full border border-slate-100 bg-slate-50 p-3 rounded-xl resize-none font-medium text-slate-600 text-xs outline-none focus:border-jc-blue"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-50 w-full min-w-0">
                <button
                  type="submit"
                  className="flex-1 bg-jc-yellow/80 hover:bg-jc-yellow active:bg-jc-yellow/80 text-slate-900 font-black uppercase text-[10px] tracking-widest py-3.5 sm:py-4 rounded-2xl transition-colors shadow-md active:scale-95 cursor-pointer text-center"
                >
                  Salvar Alterações
                </button>
                <BotaoExcluir veiculoId={id} />
              </div>
            </form>
          </div>

          {/* COLUNA GALERIA (DIREITA) */}
          <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-[32px] shadow-sm border border-slate-200 h-full flex flex-col w-full min-w-0 overflow-hidden">
            <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Camera size={16} className="text-jc-blue shrink-0" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Fotos do Veículo</h3>
              </div>
              <div className="shrink-0">
                <UploadFoto veiculoId={id} />
              </div>
            </div>

            <div className="w-full min-w-0 overflow-hidden">
              <GaleriaFotos fotos={fotosVeiculo} veiculoId={id} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}