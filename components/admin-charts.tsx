'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export function AdminCharts({ statsList }: { statsList: any[] }) {
  // Data for Productivity Ranking (Top 5)
  const rankingData = statsList
    .map(p => ({
      id: p.id,
      name: p.full_name, // Unique identifier
      shortName: p.full_name.split(' ')[0],
      total: p.evolutions_count + p.assessments_count,
      avaliacoes: p.assessments_count,
      evolucoes: p.evolutions_count
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  // Data for Patients Distribution (Pie)
  const patientsData = statsList
    .map(p => ({
      id: p.id,
      name: p.full_name, // Unique identifier
      shortName: p.full_name.split(' ')[0],
      value: p.patients_count
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Growth Data (Users per month - Mocked or based on created_at)
  const growthData = statsList.reduce((acc: any[], p) => {
    const month = new Date(p.created_at).toLocaleDateString('pt-BR', { month: 'short' });
    const existing = acc.find(d => d.month === month);
    if (existing) {
      existing.users += 1;
    } else {
      acc.push({ month, users: 1 });
    }
    return acc;
  }, []).reverse();

  const COLORS = ['#0ea5e9', '#22d3ee', '#6366f1', '#8b5cf6', '#ec4899'];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Ranking de Produtividade */}
      <div className="card">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Produtividade por Profissional</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rankingData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="shortName" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="avaliacoes" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Avaliações" />
              <Bar dataKey="evolucoes" fill="#22d3ee" radius={[4, 4, 0, 0]} name="Evoluções" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Crescimento da Plataforma */}
      <div className="card">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Novos Profissionais</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="users" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} name="Profissionais" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribuição de Pacientes */}
      <div className="card lg:col-span-2">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 text-center">Volume de Pacientes por Profissional</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={patientsData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {patientsData.map((entry, index) => (
                  <Cell key={entry.id} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {patientsData.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs font-medium text-slate-600">{p.shortName}: {p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
