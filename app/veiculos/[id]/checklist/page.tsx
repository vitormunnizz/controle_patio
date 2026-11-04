import { db } from "@/db";
import { checklistTecnico, veiculos } from "@/db/schema";
import { ITENS_VEICULO } from "@/lib/checklist-tecnico";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { salvarChecklistVeiculo } from "../actions";
import { PageHeader } from "@/components/PageHeader";

const grupos = [...new Set(ITENS_VEICULO.map((item) => item.grupo))];

export default async function ChecklistVeiculoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { id: rawId } = await params;
  const { erro } = await searchParams;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) notFound();

  const [veiculo, checklist] = await Promise.all([
    db.query.veiculos.findFirst({ where: eq(veiculos.id, id) }),
    db.query.checklistTecnico.findFirst({ where: eq(checklistTecnico.veiculo_id, id) }),
  ]);

  if (!veiculo) notFound();

  const itensSalvos = (checklist?.itens ?? {}) as Record<string, boolean | string>;

  return (
    <main className="app-background page-main text-slate-900">
      <div className="page-container page-stack">
        <PageHeader
          backHref={`/veiculos/${id}`}
          backLabel="Voltar para o veículo"
          title="Checklist do veículo"
          subtitle={`${veiculo.placa} · ${veiculo.modelo}`}
        />

        {erro === "salvar" && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            Não conseguimos salvar o checklist. Tente novamente.
          </p>
        )}

        <form action={salvarChecklistVeiculo.bind(null, id)} className="space-y-3">
          <div className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {grupos.map((grupo) => (
            <fieldset key={grupo} className="rounded-xl border border-white bg-white/95 p-3 shadow-[0_5px_18px_rgba(15,23,42,0.055)]">
              <legend className="page-caption rounded-full bg-blue-50 px-2.5 py-1 font-extrabold uppercase tracking-wide text-jc-blue">{grupo}</legend>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {ITENS_VEICULO.filter((item) => item.grupo === grupo).map(({ id: itemId, label }) => (
                  <label key={itemId} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2 py-2 transition-colors hover:border-blue-200 hover:bg-blue-50/40 has-[:checked]:border-blue-200 has-[:checked]:bg-blue-50/70">
                    <input
                      type="checkbox"
                      name={`item_${itemId}`}
                      value="sim"
                      defaultChecked={itensSalvos[itemId] === true || itensSalvos[itemId] === "sim"}
                      className="h-[18px] w-[18px] shrink-0 accent-jc-blue"
                    />
                    <span className="flex-1 text-sm font-semibold leading-tight text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
          </fieldset>
          ))}
          </div>

          <button type="submit" className="w-full rounded-lg bg-jc-blue px-5 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-jc-navy sm:w-auto">
            Salvar checklist
          </button>
        </form>
      </div>
    </main>
  );
}
