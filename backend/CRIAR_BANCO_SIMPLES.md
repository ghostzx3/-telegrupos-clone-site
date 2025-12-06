# 🗄️ Criar Banco de Dados - Guia Rápido

## 🚀 Método Mais Fácil: Script Automático

### Opção 1: Executar Script PowerShell

1. Abra o PowerShell na pasta `backend`
2. Execute:
   ```powershell
   .\criar-banco.ps1
   ```
3. Digite suas credenciais quando solicitado
4. Pronto! ✅

---

## 📋 Método Manual (se o script não funcionar)

### Se você tem pgAdmin instalado:

1. Abra o **pgAdmin 4**
2. Conecte ao servidor PostgreSQL
3. Clique com botão direito em **Databases**
4. Selecione **Create** → **Database**
5. Nome: `telegram_groups`
6. Clique em **Save**

### Se você tem acesso ao psql:

1. Abra o terminal
2. Navegue até a pasta do PostgreSQL (ex: `C:\Program Files\PostgreSQL\15\bin`)
3. Execute:
   ```bash
   psql.exe -U postgres
   ```
4. Digite a senha
5. Execute:
   ```sql
   CREATE DATABASE telegram_groups;
   ```
6. Digite `\q` para sair

---

## 🔧 Se PostgreSQL não está instalado

### Instalar PostgreSQL no Windows:

1. Baixe em: https://www.postgresql.org/download/windows/
2. Execute o instalador
3. Durante a instalação:
   - Anote a senha do usuário `postgres`
   - Porta padrão: `5432`
4. Após instalar, use um dos métodos acima

---

## ✅ Após Criar o Banco

Atualize o arquivo `.env`:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/telegram_groups?schema=public"
```

Substitua `SUA_SENHA` pela senha que você configurou.

---

## 🧪 Testar Conexão

Após configurar, teste:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

Se funcionar, as tabelas serão criadas automaticamente! ✅











