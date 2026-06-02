"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Brain, Loader2, Sparkles } from "lucide-react";
import { generateGeneralAnalysis, askQuestion } from "./actions";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function RelatoriosPage() {
  const [contextId, setContextId] = useState("visao_geral");
  const [generalAnalysis, setGeneralAnalysis] = useState<string>("");
  const [loadingGeneral, setLoadingGeneral] = useState(false);
  
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleGenerateGeneral = async () => {
    setLoadingGeneral(true);
    const result = await generateGeneralAnalysis(contextId);
    if (result.error) {
      setGeneralAnalysis(`**Erro:** ${result.error}`);
    } else {
      setGeneralAnalysis(result.text || "");
    }
    setLoadingGeneral(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || loadingChat) return;

    const newMessages = [...messages, { role: "user" as const, content: chatInput }];
    setMessages(newMessages);
    setChatInput("");
    setLoadingChat(true);

    const result = await askQuestion(contextId, newMessages);
    if (result.error) {
      setMessages([...newMessages, { role: "assistant", content: `**Erro:** ${result.error}` }]);
    } else {
      setMessages([...newMessages, { role: "assistant", content: result.text || "" }]);
    }
    
    setLoadingChat(false);
  };

  return (
    <div className="p-8 bg-[#f8fafb] min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">IA Analytics</h1>
        <p className="text-slate-500 mt-1">Análise inteligente dos dados do painel em tempo real.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)] min-h-[600px]">
        
        {/* Lado Esquerdo - Análise Geral */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-full">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Brain className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Análise Executiva Geral</h2>
            </div>
            
            <div className="flex gap-3">
              <select 
                value={contextId} 
                onChange={(e) => setContextId(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="visao_geral">Painel: Visão Geral</option>
                <option value="atendimentos">Painel: Atendimentos</option>
              </select>
              <button 
                onClick={handleGenerateGeneral}
                disabled={loadingGeneral}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl transition-colors shadow-md shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                {loadingGeneral ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Analisar
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
            {generalAnalysis ? (
              <div className="prose prose-sm prose-indigo max-w-none text-slate-700">
                <ReactMarkdown>{generalAnalysis}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Brain className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-center px-4">Selecione um painel e clique em "Analisar" para gerar um relatório executivo.</p>
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito - Chat */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-full">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-lg">
              <Bot className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Assistente de Dados</h2>
              <p className="text-sm text-slate-500">Faça perguntas sobre o painel selecionado</p>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50 flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Bot className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-center px-4">O que você gostaria de saber sobre os dados?</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-teal-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-tl-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <div className="prose prose-sm max-w-none text-slate-700">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loadingChat && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-slate-700 shadow-sm rounded-2xl rounded-tl-sm px-5 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Qual o tempo médio de resposta?"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={loadingChat}
              />
              <button 
                type="submit" 
                disabled={!chatInput.trim() || loadingChat}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
