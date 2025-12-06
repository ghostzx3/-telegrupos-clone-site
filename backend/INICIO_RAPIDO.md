# ⚡ Início Rápido - 2 Passos Simples

## ✅ O que JÁ está pronto:

- ✅ Dependências instaladas
- ✅ Prisma configurado
- ✅ Token do bot configurado
- ✅ Código completo funcionando

## 🎯 Você só precisa fazer 2 coisas:

### 1️⃣ Criar Banco de Dados (Escolha UMA opção)

#### Opção A: Supabase (MAIS FÁCIL - 2 minutos) ⭐

1. Acesse: https://supabase.com
2. Clique em **"Start your project"** (gratuito)
3. Faça login com GitHub
4. Clique em **"New Project"**
5. Escolha um nome (ex: "telegram-groups")
6. Escolha uma senha (anote ela!)
7. Aguarde criar (1-2 minutos)
8. Vá em **Settings** → **Database**
9. Procure por **"Connection string"** → **"URI"**
10. Copie a string (começa com `postgresql://...`)

#### Opção B: PostgreSQL Local (se já tiver instalado)

1. Abra **pgAdmin**
2. Conecte ao servidor
3. Clique direito em **Databases** → **Create** → **Database**
4. Nome: `telegram_groups`
5. **Save**

### 2️⃣ Colar no arquivo .env

1. Abra o arquivo: `backend/.env`
2. Encontre a linha: `DATABASE_URL="postgresql://user:password..."`
3. **Substitua** por uma das opções:

**Se usou Supabase:**
```env
DATABASE_URL="cole_aqui_a_connection_string_do_supabase"
```

**Se usou PostgreSQL local:**
```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/telegram_groups?schema=public"
```
(Substitua `SUA_SENHA` pela senha do PostgreSQL)

## 🚀 Depois disso, execute:

```bash
cd backend

# Criar tabelas
npm run prisma:migrate

# Iniciar servidor
npm run dev
```

## ✅ Pronto!

O servidor estará rodando em: **http://localhost:3000**

Teste: http://localhost:3000/health

---

## 💡 Dica

**Use Supabase** - É mais fácil, gratuito e não precisa instalar nada!











