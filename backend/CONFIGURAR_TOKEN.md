# 🔑 Configurar Token do Bot

## ⚠️ IMPORTANTE: Segurança

O token do bot foi compartilhado. **Recomendo regenerar o token** no BotFather por segurança.

## 📝 Passo a Passo

### 1. Criar arquivo .env

Na pasta `backend/`, crie um arquivo chamado `.env` (sem extensão).

### 2. Copiar conteúdo do env.example

Copie o conteúdo de `env.example` para `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/telegram_groups?schema=public"

# Telegram Bot Token
TELEGRAM_BOT_TOKEN="7673997316:AAH-MYNThox9gnH_LP3sWPEAxa48Q5v_G5E"

# Server
PORT=3000
NODE_ENV=development

# Base URL para servir arquivos estáticos
BASE_URL="http://localhost:3000"
```

### 3. Atualizar DATABASE_URL

Substitua `user`, `password` e `localhost:5432` pelos seus dados do PostgreSQL:

```env
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/telegram_groups?schema=public"
```

### 4. Verificar se .env está no .gitignore

✅ O arquivo `.env` já está no `.gitignore` - não será commitado no Git.

## 🔄 Regenerar Token (Recomendado)

Como o token foi compartilhado, é recomendado regenerá-lo:

1. Abra o Telegram
2. Procure por [@BotFather](https://t.me/BotFather)
3. Envie `/revoke`
4. Selecione seu bot
5. Um novo token será gerado
6. Atualize o `.env` com o novo token

## ✅ Próximos Passos

Após configurar o `.env`:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

O servidor estará rodando e pronto para receber requisições!








