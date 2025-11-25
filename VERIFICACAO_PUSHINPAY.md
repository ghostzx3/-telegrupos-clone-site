# 🔍 Verificação de Configuração PushInPay

## 📋 Checklist de Verificação

### 1. **Verificar API Key**

Execute o endpoint de teste:
```bash
GET http://localhost:3000/api/payments/test-config
```

Ou acesse no navegador:
```
http://localhost:3000/api/payments/test-config
```

**O que verificar:**
- ✅ `apiKey.present` deve ser `true`
- ✅ `apiKey.length` deve ser maior que 0
- ✅ `apiKey.valid` deve ser `true`

### 2. **Verificar URL da API**

**URLs conhecidas da PushInPay:**
- `https://app.pushinpay.com.br/app` (atual)
- `https://app.pushinpay.com.br`
- `https://api.pushinpay.com.br`
- `https://pushinpay.com.br/api`

**Documentação oficial:**
- Site: https://pushinpay.com.br/
- Docs: https://doc.pushinpay.com.br

### 3. **Variáveis de Ambiente**

Verifique se estão configuradas no `.env.local`:

```env
# Obrigatório
PUSHINPAY_API_KEY=sua-chave-api-aqui

# Opcional (usa padrão se não configurado)
NEXT_PUBLIC_PUSHINPAY_API_URL=https://app.pushinpay.com.br/app

# Necessário para webhooks
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. **Logs do Servidor**

Ao tentar criar um pagamento, verifique os logs:

```
[PushInPay] Inicializando cliente com API Key: xxxx...xxxx
[PushInPay] Base URL configurada: https://app.pushinpay.com.br/app
[PushInPay] POST https://app.pushinpay.com.br/app/v1/pix/create
[PushInPay] Headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ***' }
```

**Se aparecer erro 401/403:**
- API Key inválida ou expirada
- Verifique se a chave está correta no `.env.local`
- Reinicie o servidor após alterar

**Se aparecer erro 404:**
- Endpoint não encontrado
- URL da API pode estar incorreta
- Verifique a documentação oficial

### 5. **Testar Criação de Pagamento**

```bash
curl -X POST http://localhost:3000/api/payments/create-pix \
  -H "Content-Type: application/json" \
  -H "Cookie: seu-cookie-de-sessao" \
  -d '{
    "groupId": "uuid-do-grupo",
    "planType": "premium",
    "duration": 30
  }'
```

**Resposta esperada:**
```json
{
  "paymentId": "uuid",
  "transactionId": "id-transacao",
  "pixCode": "00020126...",
  "qrCodeImage": "data:image/png;base64,...",
  "amount": 19.99,
  "expiresAt": "2025-01-01T13:00:00Z"
}
```

## 🐛 Problemas Comuns

### **Erro: "PUSHINPAY_API_KEY não configurada"**

**Solução:**
1. Verifique se o arquivo `.env.local` existe na raiz do projeto
2. Adicione a linha: `PUSHINPAY_API_KEY=sua-chave-aqui`
3. Reinicie o servidor Next.js

### **Erro: "401 Unauthorized"**

**Possíveis causas:**
- API Key incorreta
- API Key expirada
- API Key não tem permissões

**Solução:**
1. Acesse o painel da PushInPay: https://app.pushinpay.com.br
2. Verifique se a chave está ativa
3. Gere uma nova chave se necessário
4. Atualize o `.env.local` e reinicie

### **Erro: "404 Not Found"**

**Possíveis causas:**
- URL da API incorreta
- Endpoint mudou

**Solução:**
1. Verifique a documentação: https://doc.pushinpay.com.br
2. Teste diferentes URLs:
   - `https://app.pushinpay.com.br/app`
   - `https://app.pushinpay.com.br`
   - `https://api.pushinpay.com.br`
3. Entre em contato com o suporte da PushInPay

### **Erro: "Endpoint não encontrado"**

O código tenta automaticamente múltiplos endpoints. Se nenhum funcionar:

1. Verifique os logs do servidor para ver quais endpoints foram testados
2. Consulte a documentação oficial
3. Entre em contato com o suporte

## 📞 Suporte PushInPay

- **Email:** suporte@pushinpay.com.br
- **Site:** https://pushinpay.com.br
- **Documentação:** https://doc.pushinpay.com.br
- **Dashboard:** https://app.pushinpay.com.br

## ✅ Verificação Rápida

Execute este comando para verificar tudo de uma vez:

```bash
# 1. Verificar configuração
curl http://localhost:3000/api/payments/test-config

# 2. Verificar se a API route está ativa
curl http://localhost:3000/api/payments/create-pix
```

Se ambos retornarem JSON válido, a configuração básica está correta!






