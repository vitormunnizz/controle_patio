"use client";

import { Camera, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { salvarFotoNoBanco } from "@/app/veiculos/[id]/actions";

export function UploadFoto({ veiculoId }: { veiculoId: number }) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      // 1. Gerar um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${veiculoId}/${Date.now()}.${fileExt}`;

      // 2. Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('veiculos')
        .upload(fileName, file);

      if (error) throw error;

      // 3. Pegar a URL Pública da foto
      const { data: { publicUrl } } = supabase.storage
        .from('veiculos')
        .getPublicUrl(fileName);

      // 4. Salvar essa URL no seu banco de dados PostgreSQL
      await salvarFotoNoBanco(veiculoId, publicUrl);

      alert("Foto adicionada com sucesso!");
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao enviar foto. Verifique se o Bucket está como 'Public'.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" // Força abrir a câmera no celular
        className="hidden" 
        id="upload-pic"
        onChange={handleUpload}
        disabled={loading}
      />
      <label 
        htmlFor="upload-pic" 
        className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95 shadow-md flex items-center gap-2"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
        {loading ? "Enviando..." : "Adicionar Foto"}
      </label>
    </div>
  );
}