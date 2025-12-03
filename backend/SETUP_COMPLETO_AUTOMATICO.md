# 🚀 Setup Automático Completo - Backend Telegram

## ✅ O que já foi feito automaticamente:

1. ✅ **Dependências instaladas** - `npm install` executado
2. ✅ **Cliente Prisma gerado** - Pronto para usar
3. ✅ **Arquivo .env criado** - Com token do bot configurado
4. ✅ **Estrutura de pastas criada** - Tudo no lugar

## 📋 O que você precisa fazer (2 passos simples):

### Passo 1: Criar o Banco de Dados PostgreSQL

**Opção A - Se você TEM PostgreSQL instalado:**

1. Abra o **pgAdmin** (ou qualquer cliente PostgreSQL)
2. Conecte ao servidor
3. Clique com botão direito em **Databases** → **Create** → **Database**
4. Nome: `telegram_groups`
5. Clique em **Save**

**Opção B - Se você NÃO TEM PostgreSQL:**

Use um serviço gratuito online:

1. **Supabase** (Recomendado):
   - Acesse: https://supabase.com
   - Crie uma conta gratuita
   - Crie um novo projeto
   - Copie a **Connection String** (está em Settings → Database)
   - Cole no arquivo `.env` como `DATABASE_URL`

2. **Neon** (Alternativa):
   - Acesse: https://neon.tech
   - Crie uma conta gratuita
   - Crie um novo projeto
   - Copie a **Connection String**
   - Cole no arquivo `.env`

### Passo 2: Atualizar arquivo .env

Abra o arquivo `backend/.env` e atualize a linha `DATABASE_URL`:

**Se usar PostgreSQL local:**
```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/telegram_groups?schema=public"
```

**Se usar Supabase/Neon:**
```env
DATABASE_URL="postgresql://usuario:senha@host:5432/telegram_groups?schema=public"
```
(Copie a connection string completa que eles fornecem)

## 🎯 Após configurar o banco:

Execute estes comandos na pasta `backend`:

```bash
# Criar tabelas no banco
npm run prisma:migrate

# Iniciar servidor
npm run dev
```

## 🧪 Testar se está funcionando:

O servidor estará rodando em: `http://localhost:3000`

Teste o health check:
```
http://localhost:3000/health
```

## 📝 Resumo Rápido:

1. ✅ Dependências → Já instaladas
2. ✅ Prisma → Já configurado
3. ⚠️  Banco de dados → Você precisa criar (pgAdmin ou Supabase)
4. ⚠️  DATABASE_URL → Você precisa atualizar no .env
5. ⏳ Migrations → Execute após configurar banco
6. ⏳ Servidor → Execute após migrations

## 🆘 Precisa de ajuda?

- **PostgreSQL local:** Use pgAdmin (interface gráfica)
- **PostgreSQL online:** Use Supabase (mais fácil, gratuito)
- **Dúvidas:** Consulte `README.md` para mais detalhes

---

**Tempo estimado:** 5-10 minutos para configurar o banco e atualizar o .env








