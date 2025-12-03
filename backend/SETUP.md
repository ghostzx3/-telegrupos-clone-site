# 🚀 Guia de Setup Rápido

## 1. Renomear arquivo de ambiente

Renomeie `env.example` para `.env`:

```bash
# Windows (PowerShell)
Rename-Item env.example .env

# Linux/Mac
mv env.example .env
```

## 2. Configurar variáveis

Edite o arquivo `.env` com suas credenciais:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/telegram_groups?schema=public"
TELEGRAM_BOT_TOKEN="seu_token_do_botfather"
PORT=3000
BASE_URL="http://localhost:3000"
```

## 3. Instalar dependências

```bash
npm install
```

## 4. Configurar banco de dados

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Criar tabelas
npm run prisma:migrate
```

## 5. Rodar servidor

```bash
npm run dev
```

Pronto! O servidor estará rodando em `http://localhost:3000`








