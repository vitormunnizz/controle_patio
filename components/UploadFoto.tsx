"use client";

import { Camera, Loader2 } from "lucide-react";
import { useState } from "react";

export function UploadFoto({ veiculoId }: { veiculoId: number }) {
  const [loading, setLoading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    // Aqui você integraria com o UploadThing ou Supabase depois.
    // Por enquanto, apenas um alerta para testar o funcionamento.
    alert(`Pronto para subir foto do veículo ${veiculoId}. Precisamos configurar um Storage real agora.`);
    setLoading(false);
  };

  return (
    <div className="relative">
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" // Garante que abra a câmera traseira no mobile
        className="hidden" 
        id="upload-pic"
        onChange={handleFile}
        disabled={loading}
      />
      <label 
        htmlFor="upload-pic" 
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 shadow-md"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
        Adicionar Foto
      </label>
    </div>
  );
}