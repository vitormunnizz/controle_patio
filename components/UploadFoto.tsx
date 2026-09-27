"use client";

import { Camera, Loader2 } from "lucide-react";
import { useState } from "react";
import { salvarFotoLocal } from "@/app/veiculos/[id]/actions";
import imageCompression from "browser-image-compression";

export function UploadFoto({ veiculoId }: { veiculoId: number }) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 2400,
        initialQuality: 0.9,
        fileType: "image/webp",
      });

      const formData = new FormData();
      formData.append("file", compressed);

      await salvarFotoLocal(veiculoId, formData);
    } catch {
      alert("Não conseguimos salvar a foto. Tente novamente.");
    } finally {
      setLoading(false);
      // Limpa o input para permitir o upload da mesma imagem novamente, se necessário
      e.target.value = "";
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        id={`upload-foto-${veiculoId}`}
        onChange={handleUpload}
        disabled={loading}
      />
      <label
        htmlFor={`upload-foto-${veiculoId}`}
        className="h-9 px-4 bg-jc-blue hover:bg-jc-navy text-white rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all flex items-center gap-2 shadow-sm"
      >
        {loading ? <Loader2 className="animate-spin" size={14} /> : <Camera size={14} />}
        {loading ? "Salvando..." : "Adicionar Foto"}
      </label>
    </div>
  );
}
