import { db } from "@/db";
import { status as statusTable, veiculos as veiculosTable } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { atualizarVeiculo } from "./actions";
import Link from "next/link";
import { ArrowLeft, Car, User, Calendar, Camera, FileDown } from "lucide-react";
import { notFound } from "next/navigation";
import { UploadFoto } from "@/components/UploadFoto";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { GaleriaFotos } from "@/components/GaleriaFotos";
import { FotoSerializada } from "@/types/kanban";
import { AvisoChecklistSalvo } from "@/components/AvisoChecklistSalvo";
import { NavegacaoChecklist } from "@/components/NavegacaoChecklist";

export default async function EditarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string; checklist?: string }>;
}) {
  const { id: rawId } = await params;
  const { erro, checklist } = await searchParams;
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
    <main className="app-background min-h-screen p-4 sm:p-6 font-sans antialiased text-slate-900 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-4 w-full min-w-0">

        {/* HEADER SLIM RESPONSIVO */}
        <header className="bg-gradient-to-r from-jc-navy via-[#073b83] to-jc-blue p-3 rounded-2xl flex items-center justify-between text-white shadow-md border border-white/10 border-b-2 border-b-jc-yellow/80 gap-2 w-full min-w-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link href="/" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all flex items-center justify-center shrink-0">
              <ArrowLeft size={18} strokeWidth={3} />
            </Link>
            <div className="h-6 w-[1px] bg-white/20 shrink-0" />
            <h1 className="text-xs sm:text-base font-black uppercase italic tracking-tighter text-jc-whitte truncate">
              Ficha Técnica
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/veiculos/${id}/pdf`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-white/20"
            >
              <FileDown size={14} /> Gerar PDF
            </Link>
            <span className="text-[9px] sm:text-[10px] font-black bg-white text-jc-navy px-2 sm:px-3 py-1 rounded-lg uppercase tracking-widest shadow-sm">
              Placa: {veiculo.placa}
            </span>
          </div>
        </header>

        {checklist === "salvo" && (
          <AvisoChecklistSalvo />
        )}

        {erro === "salvar" && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            Não conseguimos salvar as alterações. Confira os dados e tente novamente.
          </p>
        )}
        {erro === "placa-existente" && (
          <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
            Já existe outro veículo cadastrado com essa placa. Confira o número informado.
          </p>
        )}

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full min-w-0">

          {/* COLUNA FORMULÁRIO (ESQUERDA) */}
          <div className="lg:col-span-7 bg-white/95 rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-white overflow-hidden w-full min-w-0">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <Car size={16} className="text-jc-blue shrink-0" />
              <h2 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider truncate">Informações Gerais</h2>
            </div>

            <form id={`editar-veiculo-${id}`} action={atualizarVeiculo.bind(null, id)} className="p-3 sm:p-6 space-y-4 w-full min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full min-w-0">
                <div className="space-y-1 min-w-0">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block ml-1 truncate">Placa</label>
                  <input
                    name="placa"
                    defaultValue={veiculo.placa}
                    required
                    maxLength={7}
                    className="w-full border border-slate-200 bg-white shadow-sm p-2.5 rounded-xl uppercase font-black text-jc-blue outline-none focus:border-jc-blue text-sm"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block ml-1 truncate">Status</label>
                  <select
                    name="status_id"
                    defaultValue={veiculo.status_id}
                    className="w-full border border-slate-200 bg-white shadow-sm p-2.5 rounded-xl font-bold text-slate-700 outline-none focus:border-jc-blue cursor-pointer text-sm truncate"
                  >
                    {listaStatus.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full min-w-0">
                <div className="space-y-1 min-w-0">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block ml-1 flex items-center gap-1 truncate">
                    <Car size={10} className="shrink-0" /> Modelo
                  </label>
                  <input
                    name="modelo"
                    defaultValue={veiculo.modelo}
                    required
                    className="w-full border border-slate-200 bg-white shadow-sm p-2.5 rounded-xl font-bold text-slate-700 outline-none focus:border-jc-blue text-sm"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block ml-1 flex items-center gap-1 truncate">
                    <User size={10} className="shrink-0" /> Cliente
                  </label>
                  <input
                    name="cliente"
                    defaultValue={veiculo.cliente}
                    required
                    className="w-full border border-slate-200 bg-white shadow-sm p-2.5 rounded-xl font-bold text-slate-700 outline-none focus:border-jc-blue text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full min-w-0">
                <div className="space-y-1 min-w-0">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block ml-1 flex items-center gap-1 truncate">
                    <Calendar size={10} className="shrink-0" /> Entrada
                  </label>
                  <input
                    name="data_entrada"
                    type="date"
                    defaultValue={formatarDataInput(veiculo.data_entrada)}
                    required
                    className="w-full min-w-0 border border-slate-200 bg-white shadow-sm p-2.5 rounded-xl font-semibold text-slate-700 text-sm outline-none focus:border-jc-blue appearance-none"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block ml-1 flex items-center gap-1 truncate">
                    <Calendar size={10} className="shrink-0" /> Previsão
                  </label>
                  <input
                    name="data_prevista_entrega"
                    type="date"
                    defaultValue={formatarDataInput(veiculo.data_prevista_entrega)}
                    className="w-full min-w-0 border border-slate-200 bg-white shadow-sm p-2.5 rounded-xl font-semibold text-slate-700 text-sm outline-none focus:border-jc-blue appearance-none"
                  />
                </div>
              </div>

              <NavegacaoChecklist veiculoId={id} erro={erro} />

              <div className="space-y-1 w-full min-w-0">
                <label htmlFor="observacoes" className="mb-1.5 ml-1 block truncate text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Observações Técnicas
                </label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  defaultValue={veiculo.observacoes || ""}
                  rows={2}
                  className="w-full border border-slate-200 bg-white shadow-sm p-3 rounded-xl resize-none font-medium text-slate-600 text-sm outline-none focus:border-jc-blue"
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
          <div className="lg:col-span-5 bg-white/95 p-4 sm:p-5 rounded-2xl sm:rounded-[32px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-white h-full flex flex-col w-full min-w-0 overflow-hidden">
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
