import { db } from "@/db";
import { status as statusTable, veiculos as veiculosTable } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { atualizarVeiculo } from "./actions";
import Link from "next/link";
import { Car, User, Calendar, Camera, FileDown } from "lucide-react";
import { notFound } from "next/navigation";
import { UploadFoto } from "@/components/UploadFoto";
import { BotaoExcluir } from "@/components/BotaoExcluir";
import { GaleriaFotos } from "@/components/GaleriaFotos";
import { FotoSerializada } from "@/types/kanban";
import { AvisoChecklistSalvo } from "@/components/AvisoChecklistSalvo";
import { NavegacaoChecklist } from "@/components/NavegacaoChecklist";
import { PageHeader } from "@/components/PageHeader";

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
    <main className="app-background page-main font-sans antialiased text-slate-900">
      <div className="page-container page-stack min-w-0">
        <PageHeader
          backHref="/"
          backLabel="Voltar para a oficina"
          title="Ficha técnica"
          rightContent={(
            <>
            <Link
              href={`/veiculos/${id}/pdf`}
              className="page-header-action"
            >
              <FileDown size={16} /> <span className="sm:hidden">PDF</span><span className="hidden sm:inline">Gerar PDF</span>
            </Link>
            <span className="page-header-badge hidden sm:inline-flex">{veiculo.placa}</span>
            </>
          )}
        />

        {checklist === "salvo" && (
          <AvisoChecklistSalvo />
        )}

        {erro === "salvar" && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            Não conseguimos salvar as alterações. Confira os dados e tente novamente.
          </p>
        )}
        {erro === "placa-repetida" && (
          <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
            O banco ainda precisa ser atualizado para aceitar mais de um atendimento com a mesma placa.
          </p>
        )}
        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full min-w-0">

          {/* COLUNA FORMULÁRIO (ESQUERDA) */}
          <div className="lg:col-span-7 bg-white/95 rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-white overflow-hidden w-full min-w-0">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <Car size={16} className="text-jc-blue shrink-0" />
              <h2 className="page-section-title truncate uppercase">Informações gerais</h2>
            </div>

            <form id={`editar-veiculo-${id}`} action={atualizarVeiculo.bind(null, id)} className="p-3 sm:p-5 space-y-3 w-full min-w-0">
              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3 sm:gap-4 w-full min-w-0">
                <div className="space-y-1 min-w-0">
                  <label htmlFor="editar-placa" className="page-field-label block truncate ml-1 text-slate-500 uppercase tracking-wide">Placa</label>
                  <input
                    name="placa"
                    id="editar-placa"
                    defaultValue={veiculo.placa}
                    required
                    maxLength={7}
                    className="w-full border border-slate-200 bg-white shadow-sm p-2.5 rounded-xl uppercase font-black text-jc-blue outline-none focus:border-jc-blue text-sm"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <label htmlFor="editar-status" className="page-field-label block truncate ml-1 text-slate-500 uppercase tracking-wide">Status</label>
                  <select
                    name="status_id"
                    id="editar-status"
                    defaultValue={veiculo.status_id}
                    className="w-full border border-slate-200 bg-white shadow-sm p-2.5 rounded-xl font-bold text-slate-700 outline-none focus:border-jc-blue cursor-pointer text-sm truncate"
                  >
                    {listaStatus.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3 sm:gap-4 w-full min-w-0">
                <div className="space-y-1 min-w-0">
                  <label htmlFor="editar-modelo" className="page-field-label flex items-center gap-1 truncate ml-1 text-slate-500 uppercase tracking-wide">
                    <Car size={10} className="shrink-0" /> Modelo
                  </label>
                  <input
                    name="modelo"
                    id="editar-modelo"
                    defaultValue={veiculo.modelo}
                    required
                    className="w-full border border-slate-200 bg-white shadow-sm p-2.5 rounded-xl font-bold text-slate-700 outline-none focus:border-jc-blue text-sm"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <label htmlFor="editar-cliente" className="page-field-label flex items-center gap-1 truncate ml-1 text-slate-500 uppercase tracking-wide">
                    <User size={10} className="shrink-0" /> Cliente
                  </label>
                  <input
                    name="cliente"
                    id="editar-cliente"
                    defaultValue={veiculo.cliente}
                    required
                    className="w-full border border-slate-200 bg-white shadow-sm p-2.5 rounded-xl font-bold text-slate-700 outline-none focus:border-jc-blue text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3 sm:gap-4 w-full min-w-0">
                <div className="space-y-1 min-w-0">
                  <label htmlFor="editar-data-entrada" className="page-field-label flex items-center gap-1 truncate ml-1 text-slate-500 uppercase tracking-wide">
                    <Calendar size={10} className="shrink-0" /> Entrada
                  </label>
                  <input
                    name="data_entrada"
                    id="editar-data-entrada"
                    type="date"
                    defaultValue={formatarDataInput(veiculo.data_entrada)}
                    required
                    className="w-full min-w-0 border border-slate-200 bg-white shadow-sm p-2.5 rounded-xl font-semibold text-slate-700 text-sm outline-none focus:border-jc-blue appearance-none"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <label htmlFor="editar-data-prevista" className="page-field-label flex items-center gap-1 truncate ml-1 text-slate-500 uppercase tracking-wide">
                    <Calendar size={10} className="shrink-0" /> Previsão
                  </label>
                  <input
                    name="data_prevista_entrega"
                    id="editar-data-prevista"
                    type="date"
                    defaultValue={formatarDataInput(veiculo.data_prevista_entrega)}
                    className="w-full min-w-0 border border-slate-200 bg-white shadow-sm p-2.5 rounded-xl font-semibold text-slate-700 text-sm outline-none focus:border-jc-blue appearance-none"
                  />
                </div>
              </div>

              <NavegacaoChecklist veiculoId={id} erro={erro} />

              <div className="space-y-1 w-full min-w-0">
                <label htmlFor="observacoes" className="page-field-label mb-1.5 ml-1 block truncate uppercase tracking-wide text-slate-500">
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

              <div className="flex flex-col min-[360px]:flex-row gap-3 pt-4 border-t border-slate-50 w-full min-w-0">
                <button
                  type="submit"
                  className="flex-1 bg-jc-yellow/80 hover:bg-jc-yellow active:bg-jc-yellow/80 text-slate-900 font-black uppercase text-sm tracking-wide py-3.5 sm:py-4 rounded-2xl transition-colors shadow-md active:scale-95 cursor-pointer text-center"
                >
                  Salvar Alterações
                </button>
                <BotaoExcluir veiculoId={id} />
              </div>
            </form>
          </div>

          {/* No celular, as fotos ficam recolhidas para não aparecer um cartão cortado. */}
          <details className="rounded-2xl border border-white bg-white/95 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] lg:hidden">
            <summary className="page-section-title cursor-pointer uppercase">Fotos do veículo</summary>
            <div className="mt-4">
              <div className="mb-4 flex justify-end">
                <UploadFoto veiculoId={id} />
              </div>
              <GaleriaFotos fotos={fotosVeiculo} veiculoId={id} />
            </div>
          </details>

          {/* Coluna da galeria em telas maiores */}
          <div className="hidden lg:col-span-5 lg:flex bg-white/95 p-4 sm:p-5 rounded-2xl sm:rounded-[32px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-white flex-col w-full min-w-0 overflow-hidden">
            <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Camera size={16} className="text-jc-blue shrink-0" />
                <h3 className="page-section-title truncate uppercase">Fotos do veículo</h3>
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
