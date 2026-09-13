"use client";
import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend
} from 'recharts';

interface StatusData { name: string; total: number; }
interface TrendData { data: string; recebidos: number; entregues?: number; }

export function StatusChart({ data }: { data: StatusData[] }) {
  const COLORS = ['#0047BB', '#f97316', '#a855f7', '#ef4444', '#FFD700', '#22c55e', '#001F5C'];
  
  // Detecta se está em tela mobile para ajustar a altura dinamicamente
  const [chartHeight, setChartHeight] = useState(320);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setChartHeight(340); // Altura expandida no mobile para caber todos os 7 status
      } else {
        setChartHeight(260); // Altura padrão para telas maiores
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-auto">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} margin={{ bottom: 75, left: -25, right: 10, top: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={({ x, y, payload }) => (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={12}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize={8}
                  fontWeight={900}
                  transform="rotate(-40)"
                >
                  {payload.value}
                </text>
              </g>
            )}
            interval={0}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8' }} />
          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '9px' }} />
          <Bar dataKey="total" radius={[3, 3, 0, 0]} barSize={16}>
            {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ComparisonChart({ data }: { data: TrendData[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 15, right: 10, left: -25, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 700 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8' }} />
        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '9px' }} />
        {/* LEGENDA INTERNA MINI */}
        <Legend 
          verticalAlign="top" 
          align="right" 
          iconSize={6}
          wrapperStyle={{ top: -5, right: 0, fontSize: '8px', fontWeight: '900', textTransform: 'uppercase' }} 
        />
        <Line type="monotone" dataKey="recebidos" stroke="#0047BB" strokeWidth={2} dot={{ r: 2 }} name="Recebidos" />
        <Line type="monotone" dataKey="entregues" stroke="#FFD700" strokeWidth={2} dot={{ r: 2 }} name="Entregues" />
      </LineChart>
    </ResponsiveContainer>
  );
}