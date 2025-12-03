# 🔐 Configurar Secrets no GitHub Actions

## ⚠️ Sobre os Avisos do Linter

Os avisos "Context access might be invalid" que aparecem no arquivo `ci.yml` são **esperados e normais**. Eles aparecem porque:

1. O linter do GitHub Actions não pode verificar se as secrets estão definidas no repositório
2. Esses são apenas **avisos informativos**, não erros
3. O workflow funcionará corretamente se as secrets estiverem configuradas

## ✅ Como Configurar as Secrets

### Passo 1: Acessar Configurações do Repositório

1. Vá para o seu repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** → **Actions**

### Passo 2: Adicionar as Secrets

Clique em **New repository secret** e adicione cada uma das seguintes:

#### 1. NEXT_PUBLIC_SUPABASE_URL
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: A URL do seu projeto Supabase (ex: `https://xxxxx.supabase.co`)

#### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: A chave anon/public do Supabase

#### 3. SUPABASE_SERVICE_ROLE_KEY
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: A chave service role do Supabase (mantenha segura!)

#### 4. NEXT_PUBLIC_APP_URL
- **Name**: `NEXT_PUBLIC_APP_URL`
- **Value**: A URL da sua aplicação (ex: `https://www.grupostelegramx.com`)

### Passo 3: Verificar

Após adicionar todas as secrets, o workflow do GitHub Actions poderá acessá-las durante o build.

## 📝 Onde Encontrar os Valores

### Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Vá para o seu projeto
3. Clique em **Settings** → **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### App URL
- Use a URL do seu site em produção
- Exemplo: `https://www.grupostelegramx.com`

## 🔒 Segurança

- ⚠️ **Nunca** commite secrets no código
- ✅ Use sempre GitHub Secrets para valores sensíveis
- ✅ As secrets são criptografadas e não aparecem nos logs
- ✅ Apenas pessoas com acesso ao repositório podem ver/editar secrets

## 🧪 Testar

Após configurar as secrets:

1. Faça um commit e push para o repositório
2. Vá para a aba **Actions** no GitHub
3. Veja o workflow executando
4. O build deve funcionar corretamente

## 🐛 Troubleshooting

### Build falha com "secret not found"
- Verifique se o nome da secret está exatamente igual (case-sensitive)
- Verifique se a secret foi adicionada no repositório correto

### Avisos do linter persistem
- Isso é normal e esperado
- Os avisos não impedem o funcionamento do workflow
- Eles aparecem porque o linter não pode verificar secrets em tempo de edição

## 📚 Referências

- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Supabase API Keys](https://supabase.com/docs/guides/api)








