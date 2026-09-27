"use client";

import { Download } from "lucide-react";

export function SalvarComoPdf() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex w-full max-w-sm cursor-pointer items-center justify-center gap-2 rounded-xl border-b-4 border-blue-950 bg-jc-blue px-6 py-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-md transition-colors hover:bg-jc-navy active:scale-[0.99]"
    >
      <Download size={19} /> Salvar ficha como PDF
    </button>
  );
}
