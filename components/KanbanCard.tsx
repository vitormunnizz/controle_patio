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

  // Trata a string 'YYYY-MM-DD' diretamente para evitar deslocamento de fuso no new Date()
  const formatarDataEntrada = (dataStr: string) => {
    if (!dataStr) return "";
    const [, mes, dia] = dataStr.split("T")[0].split("-");
    if (!dia || !mes) return dataStr;
    return `${dia}/${mes}`;
  };

  return (
    <div ref={setNodeRef} style={style} className="relative touch-none">
      <div 
        {...listeners} 
        {...attributes}
        className="bg-white p-2 rounded-lg shadow-[0_2px_8px_rgba(15,23,42,0.07)] border border-white border-l-2 border-l-blue-200 group hover:border-l-jc-blue hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="font-black text-sm text-slate-800 uppercase tracking-tighter leading-none">
            {veiculo.placa}
          </span>
          
          <button 
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={() => router.push(`/veiculos/${veiculo.id}`)}
            className="px-2 py-0.5 bg-blue-50 text-jc-blue rounded text-[8px] font-bold uppercase tracking-wide cursor-pointer hover:bg-jc-blue hover:text-white transition-colors"
          >
            Editar
          </button>
        </div>

        <div className="space-y-0.5 pointer-events-none mb-1.5">
          <p className="text-[10px] font-bold text-slate-700 uppercase truncate">
            {veiculo.modelo}
          </p>
          <p className="text-[9px] text-slate-500 font-medium truncate">
            {veiculo.cliente}
          </p>
        </div>

        <div className="pt-1 border-t border-slate-50 flex justify-between items-center pointer-events-none">
          <span className="text-[8px] font-semibold text-slate-400">
            {formatarDataEntrada(veiculo.data_entrada)}
          </span>
        </div>
      </div>
    </div>
  );
}
