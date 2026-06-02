"use client";

import { useState, useEffect } from "react";
import { getAtendimentosMetrics } from "../actions";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Users, Clock, CheckCircle, AlertCircle, Filter, TrendingUp, TrendingDown } from "lucide-react";

function TrendBadge({ trend, positiveIsUp }: { trend: number, positiveIsUp: boolean }) {
  const isPositiveTrend = trend > 0;
  const isGood = positiveIsUp ? isPositiveTrend : !isPositiveTrend;
  const colorClass = isGood ? 'text-teal-600 bg-teal-50' : 'text-red-600 bg-red-50';
  const Icon = isPositiveTrend ? TrendingUp : TrendingDown;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${colorClass}`}>
      <Icon className="w-3 h-3" />
      {Math.abs(trend).toFixed(1)}%
    </div>
  );
}

export default function AtendimentosDashboard({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData);
  const [selectedTeam, setSelectedTeam] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const metrics = await getAtendimentosMetrics(selectedTeam);
      setData(metrics);
      setLoading(false);
    }
    if (selectedTeam !== undefined) {
      loadData();
    }
  }, [selectedTeam]);

  const COLORS = ['#0f766e', '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Atendimento Humano</h1>
          <p className="text-slate-500 mt-1">Métricas de performance da equipe no Chatwoot (Últimos 30 dias).</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
          <Filter className="w-5 h-5 text-slate-400" />
          <select 
            className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 outline-none cursor-pointer"
            value={selectedTeam || ''}
            onChange={(e) => setSelectedTeam(e.target.value ? parseInt(e.target.value) : undefined)}
          >
            <option value="">Todos os Setores</option>
            {data.teams.map((t: any) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="text-sm text-slate-500 animate-pulse">Atualizando dados...</div>}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <TrendBadge trend={data.cards.filaAtiva.trend} positiveIsUp={data.cards.filaAtiva.positiveIsUp} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Fila Ativa (Gargalo)</p>
            <h3 className="text-2xl font-bold text-slate-900">{data.cards.filaAtiva.value}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <TrendBadge trend={data.cards.tm1r.trend} positiveIsUp={data.cards.tm1r.positiveIsUp} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tempo Médio 1ª Resposta</p>
            <h3 className="text-2xl font-bold text-slate-900">{data.cards.tm1r.value.toFixed(1)} min</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <TrendBadge trend={data.cards.resolucoes.trend} positiveIsUp={data.cards.resolucoes.positiveIsUp} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Volume Resolvido</p>
            <h3 className="text-2xl font-bold text-slate-900">{data.cards.resolucoes.value}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <TrendBadge trend={data.cards.tmr.trend} positiveIsUp={data.cards.tmr.positiveIsUp} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tempo Médio Resolução</p>
            <h3 className="text-2xl font-bold text-slate-900">{data.cards.tmr.value.toFixed(1)} min</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Ranking de Produtividade</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.ranking} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  itemStyle={{ color: '#0f172a', fontWeight: '500' }}
                  formatter={(value: any) => typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}
                />
                <Bar dataKey="value" fill="#0f766e" radius={[0, 4, 4, 0]} name="Resolvidos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Velocidade por Atendente (Minutos)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.velocidade} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  itemStyle={{ color: '#0f172a', fontWeight: '500' }}
                  formatter={(value: any) => typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}
                />
                <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} name="TM1R (min)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Termômetro de Sobrecarga (Conversas Paradas)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.sobrecarga} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  itemStyle={{ color: '#0f172a', fontWeight: '500' }}
                  formatter={(value: any) => typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}
                />
                <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} name="Conversas Abertas">
                  {data.charts.sobrecarga.map((entry: any, index: number) => (
                    <Cell key={"cell-" + index} fill={entry.value > 10 ? '#ef4444' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
