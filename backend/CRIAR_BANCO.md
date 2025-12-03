# 🗄️ Criar Banco de Dados PostgreSQL

## Método 1: Usando psql (Recomendado)

### Passo 1: Abrir terminal PowerShell ou CMD

### Passo 2: Conectar ao PostgreSQL

```bash
psql -U postgres
```

Se pedir senha, digite a senha do usuário `postgres`.

### Passo 3: Criar o banco de dados

```sql
CREATE DATABASE telegram_groups;
```

### Passo 4: Verificar se foi criado

```sql
\l
```

Você deve ver `telegram_groups` na lista.

### Passo 5: Sair do psql

```sql
\q
```

---

## Método 2: Usando arquivo SQL

### Passo 1: Executar o script

```bash
psql -U postgres -f criar-banco.sql
```

---

## Método 3: Usando pgAdmin (Interface Gráfica)

1. Abra o **pgAdmin**
2. Conecte ao servidor PostgreSQL
3. Clique com botão direito em **Databases**
4. Selecione **Create** → **Database**
5. Nome: `telegram_groups`
6. Clique em **Save**

---

## Método 4: Usando linha de comando direta

```bash
psql -U postgres -c "CREATE DATABASE telegram_groups;"
```

---

## ⚠️ Problemas Comuns

### Erro: "psql não é reconhecido"

**Solução:** Adicione o PostgreSQL ao PATH do Windows:

1. Encontre a pasta de instalação do PostgreSQL (geralmente: `C:\Program Files\PostgreSQL\15\bin`)
2. Adicione ao PATH do sistema
3. Ou use o caminho completo: `"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres`

### Erro: "password authentication failed"

**Solução:** 
- Verifique se a senha está correta
- Ou use autenticação do Windows se configurada

### Erro: "permission denied"

**Solução:**
- Use um usuário com permissões de superusuário (como `postgres`)
- Ou peça ao administrador para criar o banco

---

## ✅ Verificar se Funcionou

Após criar o banco, atualize o arquivo `.env`:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/telegram_groups?schema=public"
```

Substitua `SUA_SENHA` pela senha do PostgreSQL.

---

## 🚀 Próximo Passo

Após criar o banco, execute:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

Isso criará as tabelas necessárias no banco de dados.








