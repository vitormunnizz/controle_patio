import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const statusStyles: Record<string, { bg: string, border: string, text: string }> = {
  "Recebido": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  "Aguardando orçamento": { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  "Aguardando aprovação": { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  "Aguardando peças": { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
  "Em manutenção": { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
  "Finalizado": { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700" },
  "Entregue": { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" },
};