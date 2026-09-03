"use client";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { VeiculoCanvas } from "@/types/kanban";

export function KanbanCard({ veiculo }: { veiculo: VeiculoCanvas }) {
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
    <div ref={setNodeRef} style={style} className="relative touch-none">
      <div 
        {...listeners} 
        {...attributes}
        className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 group hover:border-jc-blue/30 transition-all cursor-grab active:cursor-grabbing"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="font-black text-sm text-slate-800 uppercase tracking-tighter leading-none">
            {veiculo.placa}
          </span>
          
          <button 
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={() => router.push(`/veiculos/${veiculo.id}`)}
            className="px-2 py-0.5 bg-jc-navy text-jc-yellow rounded text-[8px] font-black uppercase tracking-widest cursor-pointer shadow-sm"
          >
            Editar
          </button>
        </div>

        <div className="space-y-0.5 pointer-events-none mb-3">
          <p className="text-[11px] font-bold text-slate-600 uppercase truncate">
            {veiculo.modelo}
          </p>
          <p className="text-[10px] text-slate-400 font-medium italic truncate">
            {veiculo.cliente}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-50 flex justify-between items-center pointer-events-none">
          <span className="text-[9px] font-bold text-slate-300">
            {new Date(veiculo.data_entrada).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}