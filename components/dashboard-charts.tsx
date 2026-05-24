'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function DashboardCharts({ recentEvolutions }: { recentEvolutions: any[] }) {
  // Aggregate evolutions by day for the last 15 days
  const evolutionsByDay = (recentEvolutions ?? []).reduce((acc: Record<string, number>, e) => {
    acc[e.session_date] = (acc[e.session_date] || 0) + 1;
    return acc;
  }, {});

  const chartData = Array.from({ length: 15 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    return {
      date: iso,
      label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      weekday: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
      count: evolutionsByDay[iso] || 0
    };
  }).reverse();

  return (
    <div className="card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-brand-900">Desempenho de Atendimentos</h2>
          <p className="text-xs text-slate-500">Volume de evoluções nos últimos 15 dias</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-brand-600">{recentEvolutions?.length ?? 0}</div>
          <div className="text-[10px] uppercase text-slate-400 font-bold">Total Período</div>
        </div>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#64748b' }}
              interval={1}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#0ea5e9" 
              fillOpacity={1} 
              fill="url(#colorCount)" 
              strokeWidth={3}
              name="Evoluções"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
