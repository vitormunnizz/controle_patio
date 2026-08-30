"use client";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend
} from 'recharts';

interface StatusData { name: string; total: number; }
interface TrendData { data: string; recebidos: number; entregues?: number; }

export function StatusChart({ data }: { data: StatusData[] }) {
  const COLORS = ['#0047BB', '#f97316', '#a855f7', '#ef4444', '#FFD700', '#22c55e', '#001F5C'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ bottom: 30, left: -35, top: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 900 }}
          interval={0}
          angle={-25}
          textAnchor="end"
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8' }} />
        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '9px' }} />
        <Bar dataKey="total" radius={[3, 3, 0, 0]} barSize={20}>
          {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ComparisonChart({ data }: { data: TrendData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 5, left: -35, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 700 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8' }} />
        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '9px' }} />
        {/* LEGENDA INTERNA MINI */}
        <Legend 
          verticalAlign="top" 
          align="right" 
          iconSize={6}
          wrapperStyle={{ top: -10, right: 0, fontSize: '8px', fontWeight: '900', textTransform: 'uppercase' }} 
        />
        <Line type="monotone" dataKey="recebidos" stroke="#0047BB" strokeWidth={2} dot={{ r: 2 }} name="Recebidos" />
        <Line type="monotone" dataKey="entregues" stroke="#FFD700" strokeWidth={2} dot={{ r: 2 }} name="Entregues" />
      </LineChart>
    </ResponsiveContainer>
  );
}