# 💳 Integração Completa PushInPay - Guia Definitivo

## 📚 Documentação Completa

### **Base URL da API**

**URLs possíveis (testadas automaticamente):**
```
https://app.pushinpay.com.br/app  (padrão)
https://app.pushinpay.com.br
https://api.pushinpay.com.br
https://pushinpay.com.br/api
```

**Documentação oficial:**
- Site: https://pushinpay.com.br/
- Docs: https://doc.pushinpay.com.br
- Dashboard: https://app.pushinpay.com.br

### **Endpoints Principais**

#### 1. Criar Cobrança PIX
```
POST /v1/pix/create
POST /api/v1/pix/create
POST /pix/create
POST /api/pix/create
```

#### 2. Consultar Status
```
GET /v1/pix/{transactionId}
GET /api/v1/pix/{transactionId}
GET /pix/{transactionId}
GET /api/pix/{transactionId}
```

---

## 🔐 Autenticação

### **Headers Obrigatórios**
```http
Authorization: Bearer {PUSHINPAY_API_KEY}
Content-Type: application/json
```

### **Variáveis de Ambiente**
```env
# .env.local
NEXT_PUBLIC_PUSHINPAY_API_URL=https://app.pushinpay.com.br/app
PUSHINPAY_API_KEY=sua-chave-api-aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

⚠️ **IMPORTANTE**: Nunca exponha `PUSHINPAY_API_KEY` no front-end. Use apenas em API routes do servidor.

---

## 📤 Estrutura do Body - Criar Cobrança

```typescript
{
  "amount": 19.99,                    // Valor em reais (número decimal)
  "description": "Premium - Grupo XYZ - 30 dias",
  "externalReference": "user-id-group-id-timestamp", // Referência externa (opcional)
  "payer": {
    "email": "cliente@email.com",     // Obrigatório
    "name": "Nome do Cliente",        // Obrigatório
    "document": "12345678900",        // CPF/CNPJ (opcional)
    "phone": "+5511999999999"         // Telefone (opcional)
  },
  "expiresIn": 3600,                  // Tempo de expiração em segundos (padrão: 3600 = 1 hora)
  "callbackUrl": "https://seudominio.com/api/webhooks/pushinpay" // URL do webhook (opcional)
}
```

---

## 📥 Estrutura da Resposta - Criar Cobrança

```typescript
{
  "id": "transaction-id-123",           // ID da transação
  "transactionId": "transaction-id-123", // Alias
  "pixCode": "00020126...",              // Código PIX copia e cola
  "pix_copia_e_cola": "00020126...",     // Alias
  "qrCode": "data:image/png;base64,...",  // QR Code em base64
  "qrCodeBase64": "iVBORw0KG...",        // Base64 puro
  "amount": 19.99,                       // Valor
  "status": "pending",                   // Status inicial
  "expiresAt": "2025-01-01T13:00:00Z",  // Data de expiração (ISO 8601)
  "createdAt": "2025-01-01T12:00:00Z",  // Data de criação
  "paidAt": null                         // Data de pagamento (null se não pago)
}
```

**Nota**: A estrutura pode variar. O código normaliza diferentes formatos automaticamente.

---

## 📊 Status da Cobrança

| Status | Descrição |
|--------|-----------|
| `pending` | Aguardando pagamento |
| `paid` | Pagamento confirmado |
| `expired` | PIX expirado (não foi pago a tempo) |
| `cancelled` | Cobrança cancelada |

---

## 🔄 Consultar Status do Pagamento

### **Request**
```http
GET /v1/pix/{transactionId}
Authorization: Bearer {PUSHINPAY_API_KEY}
```

### **Response**
```json
{
  "id": "transaction-id-123",
  "status": "paid",
  "amount": 19.99,
  "paidAt": "2025-01-01T12:05:00Z",
  "expiresAt": "2025-01-01T13:00:00Z"
}
```

---

## 🎯 Como Usar no Código

### **1. Criar Pagamento (API Route)**

```typescript
import { getPushInPayClient } from '@/lib/pushinpay/client'

const pushInPay = getPushInPayClient()

const payment = await pushInPay.createPixPayment({
  amount: 19.99,
  description: "Premium - Meu Grupo - 30 dias",
  payer: {
    email: "cliente@email.com",
    name: "João Silva"
  },
  expiresIn: 3600,
  callbackUrl: "https://seudominio.com/api/webhooks/pushinpay"
})

// payment.pixCode - Código copia e cola
// payment.qrCodeBase64 - QR Code em base64
```

### **2. Consultar Status**

```typescript
const status = await pushInPay.getPaymentStatus(transactionId)

if (status.status === 'paid') {
  // Pagamento confirmado!
}
```

### **3. Exibir no Front-end**

```tsx
import { PixPaymentDisplay } from '@/components/PixPaymentDisplay'

<PixPaymentDisplay
  paymentId={payment.id}
  pixCode={payment.pixCode}
  qrCodeImage={payment.qrCodeBase64}
  amount={payment.amount}
  expiresAt={payment.expiresAt}
  onPaymentConfirmed={() => {
    // Redirecionar ou atualizar UI
  }}
/>
```

---

## 🔔 Webhook - Receber Notificações

### **Endpoint do Webhook**
```
POST /api/webhooks/pushinpay
```

### **Estrutura da Notificação**
```json
{
  "transactionId": "transaction-id-123",
  "status": "paid",
  "amount": 19.99,
  "externalReference": "user-id-group-id-timestamp"
}
```

### **Validação do Webhook**

1. Verificar assinatura (se PushInPay fornecer)
2. Buscar pagamento no banco pelo `transactionId`
3. Atualizar status
4. Processar pagamento (atualizar grupo, etc.)

---

## 🖼️ Exibir QR Code no Front-end

### **Opção 1: Base64 Direto**
```tsx
<Image
  src={qrCodeBase64} // "data:image/png;base64,..."
  alt="QR Code PIX"
  width={256}
  height={256}
/>
```

### **Opção 2: Gerar a partir do Código PIX**
```typescript
import QRCode from 'qrcode'

const qrCodeBase64 = await QRCode.toDataURL(pixCode, {
  errorCorrectionLevel: 'M',
  type: 'image/png',
  width: 256
})
```

---

## 🔒 Segurança

### **✅ Boas Práticas Implementadas**

1. **API Key no servidor apenas**
   - Nunca expor no front-end
   - Usar apenas em API routes

2. **Validação de dados**
   - Validar entrada antes de enviar
   - Sanitizar dados do usuário

3. **Tratamento de erros**
   - Não expor informações sensíveis
   - Logs detalhados apenas em desenvolvimento

4. **Autenticação**
   - Verificar usuário logado
   - Verificar permissões

5. **Timeout**
   - 30 segundos para requisições
   - Evitar travamentos

---

## 📝 Logs e Debug

### **Logs Automáticos**

O cliente PushInPay registra automaticamente:
- Todas as requisições (método, URL)
- Todas as respostas (status)
- Erros detalhados

### **Exemplo de Log**
```
[PushInPay] POST /v1/pix/create
[PushInPay] Response 200 from /v1/pix/create
[PushInPay] Pagamento criado com sucesso via /v1/pix/create
```

### **Debug em Desenvolvimento**

Em `NODE_ENV=development`, as respostas incluem:
```json
{
  "error": "...",
  "details": "...",
  "debug": {
    "message": "...",
    "stack": "...",
    "status": 500
  }
}
```

---

## 🧪 Testar a Integração

### **1. Testar Criação de Pagamento**

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

### **2. Testar Consulta de Status**

```bash
curl http://localhost:3000/api/payments/status/{payment-id} \
  -H "Cookie: seu-cookie-de-sessao"
```

### **3. Testar Webhook (Simulação)**

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

## 🐛 Troubleshooting

### **Erro: "API Key not configured"**
- Verifique se `PUSHINPAY_API_KEY` está no `.env.local`
- Reinicie o servidor após alterar

### **Erro: "Endpoint não encontrado"**
- Verifique se `NEXT_PUBLIC_PUSHINPAY_API_URL` está correto
- Consulte a documentação da PushInPay

### **Erro: "401 Unauthorized"**
- Verifique se a API Key está correta
- Verifique se não há espaços extras na chave

### **QR Code não aparece**
- Verifique se `qrCodeBase64` está no formato correto
- Tente gerar QR Code a partir do `pixCode`

---

## 📦 Arquivos Criados

1. **`src/lib/pushinpay/client.ts`** - Cliente PushInPay completo
2. **`src/app/api/payments/create-pix/route.ts`** - API route atualizada
3. **`src/app/api/payments/status/[id]/route.ts`** - API route para consultar status
4. **`src/components/PixPaymentDisplay.tsx`** - Componente para exibir PIX

---

## ✅ Checklist de Implementação

- [x] Cliente PushInPay criado
- [x] Criação de cobrança PIX
- [x] Retorno de código copia e cola
- [x] Retorno de QR Code base64
- [x] Consulta de status
- [x] Tratamento de erros
- [x] Logs detalhados
- [x] Validação de dados
- [x] Segurança (API Key no servidor)
- [x] Componente React para exibir
- [x] Timer de expiração
- [x] Verificação automática de status
- [x] Webhook handler

---

## 🚀 Próximos Passos

1. Configure as variáveis de ambiente
2. Teste a criação de pagamento
3. Teste o webhook
4. Integre o componente no front-end
5. Monitore os logs

---

## 📞 Suporte

- **Documentação PushInPay**: https://docs.pushinpay.com.br
- **Dashboard**: https://app.pushinpay.com.br
- **Suporte**: suporte@pushinpay.com.br

