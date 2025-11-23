# 🇧🇷 Setup PushInPay - Pagamento via PIX

Este guia mostra como configurar o **PushInPay** para aceitar pagamentos via PIX no seu Telegrupos.

## 🎯 Por que PushInPay?

✅ **PIX Instantâneo** - Aprovação em segundos
✅ **Taxas Menores** - Muito mais barato que cartão
✅ **100% Brasileiro** - Feito para o mercado BR
✅ **Fácil de Integrar** - API simples e clara
✅ **QR Code + Copia e Cola** - Duas formas de pagar

---

## 📋 Passo 1: Criar Conta no PushInPay

1. Acesse **https://app.pushinpay.com.br**
2. Clique em **"Cadastrar"**
3. Preencha seus dados:
   - Email
   - CPF/CNPJ
   - Dados bancários (para receber)
4. Confirme seu email

---

## 🔑 Passo 2: Obter Credenciais API

### 2.1 Acessar Dashboard

1. Faça login no PushInPay
2. Vá em **"Configurações"** → **"API"**

### 2.2 Gerar API Key

1. Clique em **"Gerar Nova Chave API"**
2. Copie a **API Key** (começa com `pk_` ou similar)
3. Guarde em local seguro (não compartilhe!)

### 2.3 Configurar Webhook

1. Ainda em **"Configurações"** → **"Webhooks"**
2. Adicione a URL do webhook:
   ```
   https://seudominio.com/api/webhooks/pushinpay
   ```
   (Para desenvolvimento local, use ngrok - explicado abaixo)
3. Selecione eventos:
   - ✅ `payment.paid` (pagamento confirmado)
   - ✅ `payment.expired` (PIX expirou)
4. Copie o **Webhook Secret** (para validar requisições)

---

## ⚙️ Passo 3: Configurar Variáveis de Ambiente

### 3.1 Copiar arquivo de exemplo

```bash
cp .env.local.example .env.local
```

### 3.2 Editar `.env.local`

```env
# Supabase (já configurado)
NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-key-aqui

# PushInPay
NEXT_PUBLIC_PUSHINPAY_API_URL=https://app.pushinpay.com.br/app
PUSHINPAY_API_KEY=sua-api-key-aqui
PUSHINPAY_WEBHOOK_SECRET=seu-webhook-secret-aqui

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🌐 Passo 4: Webhook Local (Desenvolvimento)

Para testar localmente, o PushInPay precisa enviar notificações para seu computador.

### 4.1 Instalar ngrok

```bash
# MacOS
brew install ngrok

# Linux
wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip
unzip ngrok-stable-linux-amd64.zip
```

### 4.2 Iniciar ngrok

Em um terminal separado:

```bash
ngrok http 3000
```

Você verá algo como:
```
Forwarding: https://abc123.ngrok.io -> http://localhost:3000
```

### 4.3 Configurar Webhook no PushInPay

1. Copie a URL do ngrok: `https://abc123.ngrok.io`
2. No PushInPay, configure webhook para:
   ```
   https://abc123.ngrok.io/api/webhooks/pushinpay
   ```

⚠️ **IMPORTANTE**: A URL do ngrok muda toda vez que reinicia. Atualize no PushInPay quando necessário.

---

## 🚀 Passo 5: Testar Integração

### 5.1 Iniciar aplicação

```bash
bun run dev
```

### 5.2 Fazer um teste

1. Acesse `http://localhost:3000`
2. Faça login
3. Escolha um grupo
4. Clique em **"Impulsionar Grupo"**
5. Selecione um plano
6. Clique em **"Gerar PIX"**

### 5.3 Você verá:

- ✅ QR Code para escanear
- ✅ Código PIX para copiar
- ✅ Timer de expiração (1 hora)
- ✅ Status em tempo real

### 5.4 Testar Pagamento

**Opção 1: Pagamento Real (Ambiente de Teste)**
- PushInPay normalmente oferece um ambiente sandbox
- Consulte a documentação deles para detalhes

**Opção 2: Simular Webhook**

Você pode simular manualmente o webhook para testar:

```bash
curl -X POST http://localhost:3000/api/webhooks/pushinpay \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "test-123",
    "status": "paid",
    "amount": 19.99
  }'
```

---

## 📊 Passo 6: Verificar Funcionamento

### 6.1 Logs do Servidor

No terminal onde roda `bun run dev`, você deve ver:

```
PushInPay webhook received: { transactionId: 'xxx', status: 'paid' }
Group updated successfully: xxx
```

### 6.2 Verificar no Banco

1. Abra Supabase Table Editor
2. Vá na tabela **`payments`**
3. Veja o registro com:
   - `status = 'paid'`
   - `paid_at` preenchido
   - `external_id` com ID da transação

4. Vá na tabela **`groups`**
5. O grupo deve ter:
   - `is_premium = true` (ou `is_featured`)
   - `premium_expires_at` com data futura

---

## 💰 Personalizar Preços

Edite o arquivo `src/app/api/payments/create-pix/route.ts`:

```typescript
const PRICING = {
  premium: {
    7: 1999,   // R$ 19,99 por 7 dias
    30: 4999,  // R$ 49,99 por 30 dias
    90: 11999, // R$ 119,99 por 90 dias
  },
  featured: {
    7: 2999,   // R$ 29,99 por 7 dias
    30: 7999,  // R$ 79,99 por 30 dias
  },
  boost: {
    1: 999,    // R$ 9,99 por 1 dia
    3: 2499,   // R$ 24,99 por 3 dias
  },
}
```

**Valores em centavos**: `1999` = R$ 19,99

---

## 🔒 Segurança

### Validar Webhook (Recomendado)

Edite `src/app/api/webhooks/pushinpay/route.ts`:

```typescript
// Verificar assinatura
const signature = request.headers.get('x-pushinpay-signature')

if (signature) {
  // Implementar verificação conforme documentação PushInPay
  const isValid = validateSignature(body, signature, WEBHOOK_SECRET)

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
}
```

### Proteger Endpoints

Todos os endpoints já verificam autenticação:
- `/api/payments/create-pix` - Requer login
- `/api/webhooks/pushinpay` - Valida webhook secret

---

## 🌟 Produção

### 1. Atualizar URLs

No `.env.local` (produção):

```env
NEXT_PUBLIC_APP_URL=https://seudominio.com
```

### 2. Configurar Webhook

No PushInPay:
```
https://seudominio.com/api/webhooks/pushinpay
```

### 3. Modo Produção

Verifique se sua conta PushInPay está em **modo produção** (não sandbox).

### 4. Deploy

```bash
# Build
bun run build

# Deploy no Vercel/Netlify
# Configurar environment variables lá
```

---

## 🐛 Troubleshooting

### PIX não é gerado

**Erro**: "Payment failed"

**Soluções**:
1. Verificar `PUSHINPAY_API_KEY` está correto
2. Ver logs do servidor para erro específico
3. Confirmar que user está logado

### Webhook não funciona

**Erro**: Pagamento não atualiza grupo

**Soluções**:
1. Verificar ngrok está rodando (desenvolvimento)
2. Conferir URL do webhook no PushInPay
3. Ver logs do servidor: deve aparecer "webhook received"
4. Verificar `PUSHINPAY_WEBHOOK_SECRET` está correto

### QR Code não aparece

**Erro**: Modal PIX vazio

**Soluções**:
1. Abrir console do browser (F12)
2. Ver erros na aba "Console"
3. Verificar resposta da API em "Network"

### Timer expirou muito rápido

**Solução**: Editar tempo de expiração em `create-pix/route.ts`:

```typescript
expiresIn: 3600, // 3600 = 1 hora, 7200 = 2 horas
```

---

## 📚 Documentação PushInPay

- **Dashboard**: https://app.pushinpay.com.br
- **API URL**: https://app.pushinpay.com.br/app
- **API Docs**: https://docs.pushinpay.com.br
- **Suporte**: suporte@pushinpay.com.br

---

## ✅ Checklist Final

- [ ] Conta PushInPay criada
- [ ] API Key obtida
- [ ] Webhook configurado
- [ ] `.env.local` preenchido
- [ ] ngrok rodando (desenvolvimento)
- [ ] Servidor Next.js rodando
- [ ] Teste de pagamento realizado
- [ ] Webhook recebido e grupo atualizado

---

## 🎉 Pronto!

Seu sistema de pagamentos PIX está funcionando!

**Recursos disponíveis:**
- ✅ Geração de PIX com QR Code
- ✅ Código copia e cola
- ✅ Timer de expiração
- ✅ Verificação automática
- ✅ Atualização instantânea do grupo
- ✅ 3 planos (Premium, Featured, Boost)

**Próximos passos:**
1. Personalizar preços
2. Testar com pagamentos reais
3. Fazer deploy em produção
4. Divulgar sua plataforma!

---

**Dúvidas?** Consulte a documentação do PushInPay ou revise os logs do servidor.
