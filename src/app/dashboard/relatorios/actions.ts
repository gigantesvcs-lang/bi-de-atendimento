"use server";

import { PrismaClient } from "@prisma/client";
import { generateText, streamText, CoreMessage } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

import { getAtendimentosMetrics } from "../atendimentos/actions";
import { getDashboardMetrics } from "../actions";

const prisma = new PrismaClient();

async function getProviderAndModel() {
  const config = await prisma.configuracoes.findUnique({
    where: { id: "global" }
  });

  if (!config || !config.ai_api_key) {
    throw new Error("Chave de API não configurada. Vá em Configurações para adicionar.");
  }

  const apiKey = config.ai_api_key;
  const modelName = config.ai_model || "gemini-1.5-flash";

  if (config.ai_provider === "google") {
    const google = createGoogleGenerativeAI({ apiKey });
    return google(modelName);
  } else if (config.ai_provider === "openrouter") {
    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey
    });
    return openrouter(modelName);
  } else {
    // Default to OpenAI
    const openai = createOpenAI({ apiKey });
    return openai(modelName);
  }
}

async function fetchContextData(contextId: string) {
  try {
    if (contextId === "visao_geral") {
      const data = await getDashboardMetrics();
      return JSON.stringify(data, null, 2);
    } else if (contextId === "atendimentos") {
      const data = await getAtendimentosMetrics();
      return JSON.stringify(data, null, 2);
    }
  } catch (e: any) {
    console.error("Error fetching context:", e);
    return `{"error": "Falha ao carregar os dados. Erro: ${e.message}"}`;
  }
  return "{}";
}

const SYSTEM_PROMPT = `Você é um Analista Executivo Sênior de BI exclusivo da Gigante Produtos Médicos. 
Você é especializado em analisar dados operacionais, SLA, tempo de resposta e métricas de atendimento para a diretoria.

INSTRUÇÕES CRÍTICAS (Trava de Segurança):
1. Você deve analisar *estritamente* os dados operacionais fornecidos em formato JSON.
2. Responda APENAS perguntas relacionadas ao relatório, indicadores, equipe ou atendimento da Gigante Produtos Médicos.
3. Se o usuário perguntar qualquer assunto fora deste escopo (como programação geral, código, receitas, conhecimentos gerais), você DEVE recusar educadamente dizendo que só pode falar sobre os dados operacionais da empresa.
4. Nunca gere código, exceto markdown (listas, negrito, tabelas) para formatar a resposta.
5. Fale de forma profissional, clara e concisa. Aja como um diretor de operações apresentando resultados.`;

export async function generateGeneralAnalysis(contextId: string) {
  try {
    const model = await getProviderAndModel();
    const dataJson = await fetchContextData(contextId);

    const prompt = `Analise os seguintes dados do painel "${contextId}" e crie um Resumo Executivo destacando:
1. Panorama Geral (Como estão os números principais?)
2. Pontos Positivos (O que está indo bem)
3. Pontos de Atenção (Gargalos, filas, problemas)
4. Ação Recomendada (Sugestão de melhoria)

Use a formatação Markdown para que fique fácil de ler. 

DADOS PARA ANÁLISE:
${dataJson}`;

    const { text } = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt,
      temperature: 0.2, // Low temp for analytical accuracy
    });

    return { text };
  } catch (error: any) {
    console.error("AI Error:", error);
    return { error: error.message || "Erro desconhecido ao chamar a IA." };
  }
}

export async function askQuestion(contextId: string, messages: CoreMessage[]) {
  try {
    const model = await getProviderAndModel();
    const dataJson = await fetchContextData(contextId);

    const systemWithContext = `${SYSTEM_PROMPT}

CONTEXTO ATUAL PARA A PERGUNTA:
${dataJson}`;

    const { text } = await generateText({
      model,
      system: systemWithContext,
      messages,
    });

    return { text };
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return { error: error.message || "Erro desconhecido ao chamar a IA no chat." };
  }
}
