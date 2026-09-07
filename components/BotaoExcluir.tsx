"use client";

import { Trash2, Loader2 } from "lucide-react";
import { excluirVeiculo } from "@/app/veiculos/[id]/actions";
import { useState } from "react";

export function BotaoExcluir({ veiculoId }: { veiculoId: number }) {
  const [loading, setLoading] = useState(false);

  const handleExcluir = async () => {
    // 1. Confirmação de segurança
    const confirmou = confirm(
      "Atenção: Isso excluirá o veículo e TODAS as fotos permanentemente. Deseja continuar?"
    );

    if (!confirmou) return;

    setLoading(true);

    try {
      // 2. Chama a Server Action, que agora deleta as fotos do Google Drive
      // e remove o registro do banco de dados de forma centralizada.
      await excluirVeiculo(veiculoId);
    } catch (error) {
      console.error("Erro no processo de exclusão:", error);
      alert("Ocorreu um erro ao tentar excluir o veículo.");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExcluir}
      disabled={loading}
      className="px-6 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-100 font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Excluindo...
        </>
      ) : (
        <>
          <Trash2 size={16} />
          Excluir Veículo
        </>
      )}
    </button>
  );
}