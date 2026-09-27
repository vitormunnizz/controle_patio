import { db } from "@/db";
import { checklistTecnico, veiculos } from "@/db/schema";
import { ITENS_VEICULO } from "@/lib/checklist-tecnico";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { SalvarComoPdf } from "@/components/SalvarComoPdf";
import { AssinaturaVeiculo } from "@/components/AssinaturaVeiculo";
import Image from "next/image";

function formatarData(data: Date | string | null) {
  if (!data) return "Não informada";
  const valor = typeof data === "string" ? new Date(`${data.slice(0, 10)}T00:00:00`) : data;
  return new Intl.DateTimeFormat("pt-BR").format(valor);
}

export default async function PdfVeiculoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) notFound();

  const [veiculo, checklist] = await Promise.all([
    db.query.veiculos.findFirst({
      where: eq(veiculos.id, id),
      with: { status: true, fotos: true },
    }),
    db.query.checklistTecnico.findFirst({
      where: eq(checklistTecnico.veiculo_id, id),
    }),
  ]);

  if (!veiculo) notFound();

  const itensSalvos = checklist?.itens ?? {};
  const grupos = [...new Set(ITENS_VEICULO.map((item) => item.grupo))];
  const emitidoEm = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date());

  return (
    <main className="pdf-main app-background min-h-screen p-4 pb-24 text-slate-900 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <nav className="print-ui flex items-center gap-3">
          <Link
            href={`/veiculos/${id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-blue-200 hover:text-jc-blue"
          >
            <ArrowLeft size={15} /> Voltar para edição
          </Link>
        </nav>

        <article className="print-page rounded-2xl border border-white bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-8">
          <header className="mb-5 flex items-start justify-between gap-4 border-b-2 border-jc-yellow pb-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-jc-blue">JC Pneus · Ficha do veículo</p>
              <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-jc-navy">{veiculo.placa}</h1>
              <p className="mt-0.5 text-sm font-semibold text-slate-600">{veiculo.modelo}</p>
            </div>
            <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase text-jc-blue">{veiculo.status.nome}</span>
          </header>

          <section className="mb-4">
            <h2 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-jc-navy">Informações do veículo</h2>
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Info label="Cliente" value={veiculo.cliente} />
              <Info label="Placa" value={veiculo.placa} />
              <Info label="Data de entrada" value={formatarData(veiculo.data_entrada)} />
              <Info label="Previsão de entrega" value={formatarData(veiculo.data_prevista_entrega)} />
            </dl>
          </section>

          <section className="mb-4 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
            <h2 className="mb-1 text-[10px] font-extrabold uppercase tracking-wide text-jc-navy">Observações técnicas</h2>
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
              {veiculo.observacoes?.trim() || "Nenhuma observação registrada."}
            </p>
          </section>

          {veiculo.fotos.length > 0 ? (
            <section className="print-group mb-4">
              <h2 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-jc-navy">Fotos do veículo</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {veiculo.fotos.map((foto, index) => (
                  <div key={foto.id} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <Image
                      src={foto.url}
                      alt={`Foto ${index + 1} do veículo ${veiculo.placa}`}
                      fill
                      unoptimized
                      loading="eager"
                      sizes="(max-width: 640px) 50vw, 260px"
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <div className="mb-2 flex items-center gap-2">
              <ClipboardCheck size={15} className="text-jc-blue" />
              <h2 className="text-xs font-extrabold uppercase tracking-wide text-jc-navy">Checklist do veículo</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {grupos.map((grupo) => (
                <section key={grupo} className="print-group rounded-lg border border-slate-200 p-2.5">
                  <h3 className="mb-1.5 border-b border-blue-100 pb-1 text-[9px] font-extrabold uppercase tracking-wide text-jc-blue">{grupo}</h3>
                  <ul className="space-y-1">
                    {ITENS_VEICULO.filter((item) => item.grupo === grupo).map((item) => {
                      const marcado = itensSalvos[item.id] === true;
                      return (
                        <li key={item.id} className="flex items-start gap-1.5 text-[10px] leading-tight text-slate-700">
                          <span className={`mt-px inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-sm border ${marcado ? "border-jc-blue bg-white font-bold text-jc-blue" : "border-slate-400 bg-white"}`}>
                            {marcado ? <span aria-label="Marcado">✓</span> : null}
                          </span>
                          {item.label}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </section>

          <AssinaturaVeiculo emitidoEm={emitidoEm} />
        </article>
      </div>
      <div className="print-ui fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur">
        <SalvarComoPdf />
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
      <dt className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-xs font-semibold text-slate-800">{value}</dd>
    </div>
  );
}
