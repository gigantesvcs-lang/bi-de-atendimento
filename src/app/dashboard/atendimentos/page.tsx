import { getAtendimentosList } from "./actions";
import { MessageSquare, Clock, User, CheckCircle, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AtendimentosPage() {
  const atendimentos = await getAtendimentosList();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Atendimentos Detalhados</h1>
        <p className="text-slate-500 mt-1">Lista dos últimos 100 atendimentos processados pelo sistema.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-4 pl-6 pr-4">Data</th>
                <th className="py-4 pr-4">Contato</th>
                <th className="py-4 pr-4">Canal</th>
                <th className="py-4 pr-4">Intenção</th>
                <th className="py-4 pr-4">Time</th>
                <th className="py-4 pr-4">Espera / TMA</th>
                <th className="py-4 pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {atendimentos.map((atendimento) => {
                const isResolved = atendimento.status_conversa === 'resolved';
                
                return (
                  <tr key={atendimento.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 pl-6 pr-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">
                        {atendimento.data_inicio ? atendimento.data_inicio.toLocaleDateString('pt-BR') : '-'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {atendimento.data_inicio ? atendimento.data_inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </div>
                    </td>
                    
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 rounded-full text-slate-400">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{atendimento.contato_nome || 'Desconhecido'}</div>
                          <div className="text-xs text-slate-500">{atendimento.contato_fone || '-'}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 pr-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                        <MessageSquare className="w-3 h-3" />
                        {atendimento.canal || '-'}
                      </div>
                    </td>
                    
                    <td className="py-4 pr-4">
                      <div className="text-sm font-medium text-slate-800">{atendimento.intent_principal || '-'}</div>
                      <div className="text-xs text-slate-500">{atendimento.sub_intent || '-'}</div>
                    </td>
                    
                    <td className="py-4 pr-4">
                      <span className="text-sm text-slate-600">{atendimento.time_responsavel || 'Aguardando'}</span>
                    </td>
                    
                    <td className="py-4 pr-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-amber-600" title="Tempo de Espera">
                          <Clock className="w-3 h-3" />
                          {atendimento.espera_segundos ? Math.round(atendimento.espera_segundos / 60) : 0} min
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-teal-600" title="Tempo de Atendimento">
                          <Clock className="w-3 h-3" />
                          {atendimento.atendimento_segundos ? Math.round(atendimento.atendimento_segundos / 60) : 0} min
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 pr-6 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isResolved ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {isResolved ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {isResolved ? 'Finalizado' : 'Aberto'}
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {atendimentos.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Nenhum atendimento registrado no período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
