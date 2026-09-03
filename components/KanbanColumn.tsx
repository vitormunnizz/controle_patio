"use client";
import { useDroppable } from "@dnd-kit/core";
import { cn, statusStyles } from "@/lib/utils";
import { ColunaCanvas } from "@/types/kanban";

export function KanbanColumn({ coluna, children }: { coluna: ColunaCanvas, children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `coluna-${coluna.id}`,
    data: { statusId: coluna.id }
  });

  const style = statusStyles[coluna.nome] || statusStyles["Recebido"];

  return (
    <div 
      ref={setNodeRef} 
      // Largura reduzida para caber tudo em uma tela
      className={cn(
        "min-w-[160px] flex-1 flex flex-col p-1 rounded-xl transition-all duration-200",
        isOver ? "bg-jc-blue/5 ring-1 ring-jc-blue/20 ring-dashed" : "bg-transparent"
      )}
    >
      <div className={cn(
        "flex items-center justify-between p-1.5 rounded-lg border-b-2 mb-2 shadow-sm",
        style.bg, style.border
      )}>
        <span className={cn("text-[7.5px] font-black uppercase tracking-tighter truncate pr-1", style.text)}>
          {coluna.nome}
        </span>
        <span className="bg-white/90 px-1 rounded-full text-[8px] font-black text-slate-500 shrink-0">
          {coluna.veiculos.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}