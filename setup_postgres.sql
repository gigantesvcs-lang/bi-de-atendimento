-- Criar o schema atendimento (se não existir)
CREATE SCHEMA IF NOT EXISTS atendimento;

-- Criar a tabela fact_atendimentos
CREATE TABLE IF NOT EXISTS atendimento.fact_atendimentos (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER UNIQUE,
    contato_nome VARCHAR(255),
    contato_fone VARCHAR(50),
    canal VARCHAR(50),
    origem VARCHAR(50),
    intent_principal VARCHAR(100),
    sub_intent VARCHAR(100),
    time_responsavel VARCHAR(100),
    status_conversa VARCHAR(50),
    data_inicio TIMESTAMP,
    data_primeira_resposta_humana TIMESTAMP,
    data_fechamento TIMESTAMP,
    espera_segundos INTEGER DEFAULT 0,
    atendimento_segundos INTEGER DEFAULT 0,
    total_mensagens INTEGER DEFAULT 0,
    atualizado_em TIMESTAMP
);

-- Criar schema public e tabela usuarios
CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT NOW()
);
