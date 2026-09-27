"use client";

import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { useEffect } from "react";

export function NavegacaoChecklist({
  veiculoId,
  erro,
}: {
  veiculoId: number;
  erro?: string;
}) {
  const chaveRascunho = `veiculo-${veiculoId}-rascunho`;
  const chaveEnvio = `${chaveRascunho}-enviado`;

  useEffect(() => {
    const formulario = document.getElementById(`editar-veiculo-${veiculoId}`) as HTMLFormElement | null;
    if (!formulario) return;

    try {
      const envioPendente = sessionStorage.getItem(chaveEnvio) === "sim";
      if (envioPendente && erro !== "salvar") {
        sessionStorage.removeItem(chaveRascunho);
        sessionStorage.removeItem(chaveEnvio);
      } else {
        const salvo = sessionStorage.getItem(chaveRascunho);
        if (salvo) {
          const valores = JSON.parse(salvo) as Record<string, string>;
          for (const [nome, valor] of Object.entries(valores)) {
            const campo = formulario.elements.namedItem(nome);
            if (campo instanceof HTMLInputElement || campo instanceof HTMLSelectElement || campo instanceof HTMLTextAreaElement) {
              campo.value = valor;
            }
          }
          sessionStorage.removeItem(chaveRascunho);
        }
        if (envioPendente) sessionStorage.removeItem(chaveEnvio);
      }
    } catch {
      // O formulário continua utilizável caso o navegador bloqueie o armazenamento da sessão.
    }

    const aoEnviar = () => sessionStorage.setItem(chaveEnvio, "sim");
    formulario.addEventListener("submit", aoEnviar);
    return () => formulario.removeEventListener("submit", aoEnviar);
  }, [chaveEnvio, chaveRascunho, erro, veiculoId]);

  function preservarRascunho() {
    const formulario = document.getElementById(`editar-veiculo-${veiculoId}`) as HTMLFormElement | null;
    if (!formulario) return;

    try {
      const valores = Object.fromEntries(new FormData(formulario).entries());
      sessionStorage.setItem(chaveRascunho, JSON.stringify(valores));
    } catch {
      // A navegação segue normalmente se o armazenamento da sessão não estiver disponível.
    }
  }

  return (
    <Link
      href={`/veiculos/${veiculoId}/checklist`}
      onClick={preservarRascunho}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-blue-900 bg-jc-blue px-5 py-3.5 text-xs font-black uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-jc-navy active:scale-[0.99]"
    >
      <ClipboardCheck size={18} strokeWidth={2.5} className="text-white" />
      Abrir checklist
    </Link>
  );
}
