"use client";
import { useDroppable } from "@dnd-kit/core";
import { cn, statusStyles } from "@/lib/utils";
import { KanbanColuna } from "@/types/kanban";

export function KanbanColumn({ coluna, children }: { coluna: KanbanColuna, children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `coluna-${coluna.id}`,
    data: { statusId: coluna.id }
  });

  const style = statusStyles[coluna.nome] || statusStyles["Recebido"];

  return (
    <div ref={setNodeRef} className={cn(
      "min-w-[300px] flex-1 flex flex-col p-2 rounded-2xl transition-colors min-h-[600px]",
      isOver ? "bg-slate-200/40" : "bg-transparent"
    )}>
      <div className={cn("flex justify-between items-center p-3.5 rounded-xl border-b-4 mb-4 shadow-sm", style.bg, style.border)}>
        <span className={cn("text-[11px] font-black uppercase tracking-wider", style.text)}>
          {coluna.nome}
        </span>
        <span className="bg-white/90 px-2.5 py-0.5 rounded-full text-xs font-black text-slate-500 shadow-sm">
          {coluna.veiculos.length}
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}