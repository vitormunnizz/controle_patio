"use client";

import { Trash2, Loader2 } from "lucide-react";
import { excluirVeiculo } from "@/app/veiculos/[id]/actions"; // Importado com o nome correto
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export function BotaoExcluir({ veiculoId }: { veiculoId: number }) {
  const [loading, setLoading] = useState(false);

  const handleExcluir = async () => {
    // 1. Confirmação de segurança
    const confirmou = confirm("Atenção: Isso excluirá o veículo e TODAS as fotos permanentemente. Deseja continuar?");
    
    if (!confirmou) return;

    setLoading(true);

    try {
      // 2. Limpar arquivos físicos no Supabase Storage
      // Listamos todos os arquivos dentro da pasta que tem o ID do veículo
      const { data: files, error: listError } = await supabase.storage
        .from('veiculos')
        .list(`${veiculoId}`);

      if (files && files.length > 0) {
        const pathsParaDeletar = files.map(f => `${veiculoId}/${f.name}`);
        const { error: deleteError } = await supabase.storage
          .from('veiculos')
          .remove(pathsParaDeletar);
          
        if (deleteError) console.error("Erro ao limpar storage:", deleteError);
      }

      // 3. Chamar a ação do servidor para apagar o registro no Banco de Dados
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