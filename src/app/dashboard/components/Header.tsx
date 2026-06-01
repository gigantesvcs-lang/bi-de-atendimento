"use client";

import { useState } from "react";
import { Calendar, Clock, Filter } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const currentStart = searchParams.get('start') || '';
  const currentEnd = searchParams.get('end') || '';

  const handleDateChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const start = formData.get('startDate') as string;
    const end = formData.get('endDate') as string;
    
    const params = new URLSearchParams(searchParams.toString());
    if (start) params.set('start', start);
    else params.delete('start');
    
    if (end) params.set('end', end);
    else params.delete('end');
    
    router.push(`${pathname}?${params.toString()}`);
    setShowDatePicker(false);
  };

  const clearFilters = () => {
    router.push(pathname);
    setShowDatePicker(false);
  };

  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard': return 'Atendimento | Visão Geral';
      case '/dashboard/configuracoes': return 'Configurações | Usuários';
      default: return 'Atendimento | Visão Geral';
    }
  };

  return (
    <div className="h-[72px] bg-teal-500 text-white flex items-center justify-between px-8 shrink-0 shadow-md z-20 relative">
      <h1 className="text-xl font-bold tracking-wide">{getPageTitle()}</h1>
      
      <div className="flex items-center gap-6 text-sm font-medium">
        <div className="flex items-center gap-2 relative">
          <Calendar className="w-4 h-4 opacity-80" />
          <button onClick={() => setShowDatePicker(!showDatePicker)} className="hover:underline focus:outline-none">
            {currentStart && currentEnd 
              ? `${currentStart.split('-').reverse().join('/')} - ${currentEnd.split('-').reverse().join('/')}`
              : "Filtrar por data"}
          </button>
          
          {showDatePicker && (
            <div className="absolute top-full right-0 mt-4 bg-white text-slate-800 rounded-lg shadow-xl p-4 w-72 border border-slate-100 z-50">
              <h3 className="font-bold text-sm mb-4">Período de Análise</h3>
              <form onSubmit={handleDateChange} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">De data tal</label>
                  <input type="date" name="startDate" defaultValue={currentStart} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-teal-500" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Até data tal</label>
                  <input type="date" name="endDate" defaultValue={currentEnd} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-teal-500" required />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={clearFilters} className="flex-1 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200">Limpar</button>
                  <button type="submit" className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700">Aplicar</button>
                </div>
              </form>
            </div>
          )}
        </div>
        
        <div className="w-px h-5 bg-teal-400/50"></div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 opacity-80" />
          <span>Atualizado há 5 min</span>
        </div>
        
        <div className="w-px h-5 bg-teal-400/50"></div>
        
        <button className="flex items-center gap-2 hover:bg-teal-600 px-3 py-1.5 rounded-lg transition-colors">
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
        </button>
      </div>
    </div>
  );
}
