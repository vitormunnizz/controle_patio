"use client";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Eye, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { KanbanVeiculo } from "@/types/kanban";

export function KanbanCard({ veiculo }: { veiculo: KanbanVeiculo }) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `veiculo-${veiculo.id}`,
    data: { veiculoId: veiculo.id }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative touch-none group">
      <div 
        {...listeners} 
        {...attributes}
        className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 group-hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing"
      >
        <div className="flex justify-between items-start mb-3">
          <span className="font-black text-xl text-slate-800 uppercase tracking-tighter leading-none">
            {veiculo.placa}
          </span>
          <button 
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={() => router.push(`/veiculos/${veiculo.id}`)}
            className="p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <Eye size={16} />
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-[14px] font-bold text-slate-600 uppercase">{veiculo.modelo}</p>
          <p className="text-[13px] text-slate-400 font-medium">{veiculo.cliente}</p>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-1 text-slate-400">
            <Clock size={12} />
            <span className="text-[11px] font-bold italic">
              {new Date(veiculo.data_entrada).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div className="w-12 h-8 bg-slate-100 rounded-lg relative overflow-hidden border">
            {veiculo.fotos?.[0] && (
              <Image src={veiculo.fotos[0].url} fill className="object-cover" alt="veiculo" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}