-- Script para criar o banco de dados telegram_groups
-- Execute este arquivo usando: psql -U postgres -f criar-banco.sql

-- Criar banco de dados (se não existir)
CREATE DATABASE telegram_groups;

-- Conectar ao banco criado
\c telegram_groups

-- Verificar se foi criado
SELECT datname FROM pg_database WHERE datname = 'telegram_groups';








