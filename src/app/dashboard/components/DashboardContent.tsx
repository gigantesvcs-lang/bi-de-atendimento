"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { HeadphonesIcon, CheckCircle, Clock, AlertCircle } from "lucide-react";

const COLORS = ['#0d9488', '#14b8a6', '#5eead4', '#ccfbf1', '#115e59', '#0f766e'];

export default function DashboardContent({ metrics }: { metrics: any }) {
  return (
    <div className="space-y-6">
      
      {/* Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total de Atendimentos" 
          value={metrics.cards.total.value} 
          growth={metrics.cards.total.growth}
          icon={<HeadphonesIcon className="w-6 h-6 text-teal-600" />}
        />
        <MetricCard 
          title="Finalizados" 
          value={metrics.cards.success.value} 
          growth={metrics.cards.success.growth}
          icon={<CheckCircle className="w-6 h-6 text-teal-600" />}
        />
        <MetricCard 
          title="Tempo Médio (TMA)" 
          value={`${metrics.cards.tma.value.toFixed(1)}m`} 
          growth={metrics.cards.tma.growth}
          icon={<Clock className="w-6 h-6 text-teal-600" />}
          invertColors // Less time is better
        />
        <MetricCard 
          title="Aguardando" 
          value={metrics.cards.waiting.value} 
          growth={metrics.cards.waiting.growth}
          icon={<AlertCircle className="w-6 h-6 text-teal-600" />}
          invertColors
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de Área - Timeline */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Atendimentos ao longo do tempo</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.charts.timeline}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4'}}
                />
                <Area type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Donut - Origens */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 mb-6">Atendimentos por Origem</h3>
          <div className="h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.charts.origem}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {metrics.charts.origem.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-800">{metrics.cards.total.value}</span>
              <span className="text-xs font-medium text-slate-500">Total</span>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            {metrics.charts.origem.map((item: any, index: number) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm text-slate-600 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-800">{item.value}</span>
                  <span className="text-xs text-slate-400 w-8 text-right">
                    {metrics.cards.total.value > 0 ? Math.round((item.value / metrics.cards.total.value) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Barras Horizontais - Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Status dos Atendimentos</h3>
          <div className="space-y-4">
            {metrics.charts.status.map((item: any, index: number) => {
              const percentage = metrics.cards.total.value > 0 ? (item.value / metrics.cards.total.value) * 100 : 0;
              return (
                <div key={item.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-600">{item.name}</span>
                    <span className="text-sm font-bold text-slate-800">{item.value}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full" 
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: COLORS[index % COLORS.length] 
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico de Barras - Especialidades */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Sub Intenções (Especialidades e Currículos)</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.charts.specialty} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={100} />
                <Tooltip cursor={{fill: '#f8fafb'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  growth, 
  icon,
  invertColors = false
}: { 
  title: string, 
  value: string | number, 
  growth: number,
  icon: React.ReactNode,
  invertColors?: boolean
}) {
  const isPositive = growth >= 0;
  // If invertColors is true, positive growth (more wait time/abandonment) is BAD (red), negative is GOOD (teal)
  const isGood = invertColors ? !isPositive : isPositive;
  
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
          {icon}
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
          isGood ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'
        }`}>
          {isPositive ? '↑' : '↓'} {Math.abs(Math.round(growth))}%
        </div>
      </div>
      <div>
        <h4 className="text-slate-500 text-sm font-medium mb-1">{title}</h4>
        <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</div>
      </div>
      <div className="mt-4 text-xs font-medium text-slate-400">
        vs. período anterior
      </div>
    </div>
  );
}
