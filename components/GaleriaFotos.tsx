"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, Trash2, Camera, Loader2 } from "lucide-react";
import { deletarFotoLocal } from "@/app/veiculos/[id]/actions";
import { FotoSerializada } from "@/types/kanban";

export function GaleriaFotos({ fotos, veiculoId }: { fotos: FotoSerializada[], veiculoId: number }) {
  const [imgZoom, setImgZoom] = useState<string | null>(null);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);
  const botaoFecharRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!imgZoom) return;

    const elementoAnterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const fecharComEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setImgZoom(null);
    };

    botaoFecharRef.current?.focus();
    window.addEventListener("keydown", fecharComEscape);
    return () => {
      window.removeEventListener("keydown", fecharComEscape);
      elementoAnterior?.focus();
    };
  }, [imgZoom]);

  const handleDeletar = async (e: React.MouseEvent, fotoId: number, url: string) => {
    e.stopPropagation();
    if (!confirm("Excluir esta foto permanentemente?")) return;

    setExcluindoId(fotoId);
    try {
      await deletarFotoLocal(fotoId, veiculoId, url);
    } catch {
      alert("Não conseguimos remover essa foto. Tente novamente.");
    } finally {
      setExcluindoId(null);
    }
  };

  if (fotos.length === 0) return (
    <div className="py-16 sm:py-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-200">
      <Camera size={32} strokeWidth={1} className="mb-2 h-7 w-7 sm:h-8 sm:w-8" />
      <span className="text-xs font-black uppercase tracking-widest">Sem fotos</span>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[380px] pr-1">
        {fotos.map((foto) => (
          <div
            key={foto.id} 
            className="relative group aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100"
          >
            {/* Imagem do veículo */}
            <Image 
              src={foto.url} 
              alt={`Foto do veículo ${foto.id}`}
              fill 
              className="pointer-events-none object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized 
            />
            <button
              type="button"
              aria-label={`Ampliar foto do veículo ${foto.id}`}
              onClick={() => setImgZoom(foto.url)}
              className="absolute inset-0 z-10 cursor-zoom-in"
            />

            {/* 
              Botão de exclusão:
              1. opacity-0 group-hover:opacity-100 esconde o botão e só exibe ao passar o mouse.
              2. top-2 right-2 mantém o botão no canto superior direito.
              3. z-20 garante o clique sem overlay nem sombras adicionais.
            */}
            <button 
              type="button"
              aria-label={`Excluir foto ${foto.id}`}
              disabled={excluindoId === foto.id} 
              onClick={(e) => handleDeletar(e, foto.id, foto.url)} 
              className="absolute top-2 right-2 z-20 p-2 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-xl transition-all cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-50"
            >
              {excluindoId === foto.id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
            </button>
          </div>
        ))}
      </div>

      {imgZoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada do veículo"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300 cursor-pointer"
          onClick={() => setImgZoom(null)}
        >
          <button
            ref={botaoFecharRef}
            type="button"
            aria-label="Fechar foto ampliada"
            onClick={(event) => { event.stopPropagation(); setImgZoom(null); }}
            className="absolute top-5 right-5 rounded-full bg-white/10 p-2 text-white transition-all hover:bg-white/20"
          >
            <X size={20} strokeWidth={3} />
          </button>
          <div className="relative w-full h-full flex items-center justify-center">
             <Image src={imgZoom} alt="Zoom" fill className="object-contain" unoptimized />
          </div>
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/20 text-xs font-black uppercase tracking-[0.4em]">
            JC PNEUS SERVICE
          </span>
        </div>
      )}
    </>
  );
}
