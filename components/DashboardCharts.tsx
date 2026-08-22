"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

// 1. Definimos a interface para os dados do gráfico
interface StatusData {
  name: string;
  total: number;
}

interface StatusChartProps {
  data: StatusData[];
}

export function StatusChart({ data }: StatusChartProps) {
  // Cores seguindo a identidade visual do Kanban
  const COLORS = [
    '#3b82f6', // Recebido (Azul)
    '#f97316', // Aguardando orçamento (Laranja)
    '#a855f7', // Aguardando aprovação (Roxo)
    '#ef4444', // Aguardando peças (Vermelho)
    '#22c55e', // Em manutenção (Verde)
    '#14b8a6', // Finalizado (Teal)
    '#64748b', // Entregue (Cinza)
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="#f1f5f9" 
          />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
            interval={0}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#94a3b8' }} 
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
            }}
          />
          <Bar 
            dataKey="total" 
            radius={[6, 6, 0, 0]} 
            barSize={45}
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}