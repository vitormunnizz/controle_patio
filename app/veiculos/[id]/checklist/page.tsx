import { db } from "@/db";
import { checklistTecnico, veiculos } from "@/db/schema";
import { ITENS_VEICULO } from "@/lib/checklist-tecnico";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { salvarChecklistVeiculo } from "../actions";

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
    <main className="app-background min-h-screen p-4 sm:p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-3">
        <header className="flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-jc-navy via-[#073b83] to-jc-blue p-3 sm:px-4 text-white shadow-md border-b-2 border-b-jc-yellow/80">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={`/veiculos/${id}`} aria-label="Voltar para o veículo" className="rounded-xl bg-white/10 p-2.5 hover:bg-white/20 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-base font-extrabold sm:text-lg">
                <ClipboardCheck size={20} className="text-white" /> Checklist do veículo
              </h1>
              <p className="mt-1 truncate text-xs text-white/70">{veiculo.placa} · {veiculo.modelo}</p>
            </div>
          </div>
        </header>

        {erro === "salvar" && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            Não conseguimos salvar o checklist. Tente novamente.
          </p>
        )}

        <form action={salvarChecklistVeiculo.bind(null, id)} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {grupos.map((grupo) => (
            <fieldset key={grupo} className="rounded-xl border border-white bg-white/95 p-3 shadow-[0_5px_18px_rgba(15,23,42,0.055)]">
              <legend className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-jc-blue">{grupo}</legend>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {ITENS_VEICULO.filter((item) => item.grupo === grupo).map(({ id: itemId, label }) => (
                  <label key={itemId} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2 py-1.5 transition-colors hover:border-blue-200 hover:bg-blue-50/40 has-[:checked]:border-blue-200 has-[:checked]:bg-blue-50/70">
                    <input
                      type="checkbox"
                      name={`item_${itemId}`}
                      value="sim"
                      defaultChecked={itensSalvos[itemId] === true || itensSalvos[itemId] === "sim"}
                      className="h-4 w-4 shrink-0 accent-jc-blue"
                    />
                    <span className="flex-1 text-[11px] font-semibold leading-tight text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
          </fieldset>
          ))}
          </div>

          <button type="submit" className="w-full rounded-lg bg-jc-blue px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-jc-navy sm:w-auto">
            Salvar checklist
          </button>
        </form>
      </div>
    </main>
  );
}
