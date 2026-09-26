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
    <main className="min-h-screen bg-slate-100 p-3 sm:p-6 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-4">
        <header className="flex items-center justify-between gap-3 rounded-2xl bg-jc-navy p-4 text-white shadow-lg">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={`/veiculos/${id}`} aria-label="Voltar para o veículo" className="rounded-full bg-white/10 p-2 hover:bg-white/20">
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-sm font-black uppercase sm:text-base">
                <ClipboardCheck size={18} className="text-jc-yellow" /> Checklist do veículo
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

        <form action={salvarChecklistVeiculo.bind(null, id)} className="space-y-4">
          {grupos.map((grupo) => (
            <fieldset key={grupo} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <legend className="px-2 text-xs font-black uppercase tracking-widest text-jc-blue">{grupo}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {ITENS_VEICULO.filter((item) => item.grupo === grupo).map(({ id: itemId, label }) => (
                  <label key={itemId} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50 has-[:checked]:border-green-200 has-[:checked]:bg-green-50">
                    <input
                      type="checkbox"
                      name={`item_${itemId}`}
                      value="sim"
                      defaultChecked={itensSalvos[itemId] === true || itensSalvos[itemId] === "sim"}
                      className="h-5 w-5 accent-green-600"
                    />
                    <span className="flex-1 text-sm font-semibold text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          <button type="submit" className="w-full rounded-xl bg-jc-yellow px-5 py-3.5 text-sm font-black uppercase tracking-wide text-jc-navy shadow-sm transition-colors hover:bg-yellow-300 sm:w-auto">
            Salvar checklist
          </button>
        </form>
      </div>
    </main>
  );
}
