# 🔧 Troubleshooting - Pagamento PIX

## Problema: "Payment failed" - Não gera código PIX

### ✅ Verificações Necessárias

#### 1. **Variáveis de Ambiente**

Verifique se as seguintes variáveis estão configuradas no `.env.local`:

```env
NEXT_PUBLIC_PUSHINPAY_API_URL=https://app.pushinpay.com.br/app
PUSHINPAY_API_KEY=55100|0Txmg61bJiFKg1EwOoDeZRR1Q0tWo8DMCdMoXJP1e17ef85e
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Importante:**
- `NEXT_PUBLIC_PUSHINPAY_API_URL` deve começar com `https://`
- `PUSHINPAY_API_KEY` não deve ter espaços ou quebras de linha
- Reinicie o servidor após alterar variáveis de ambiente

#### 2. **Verificar Logs do Servidor**

No terminal onde roda `npm run dev` ou `bun run dev`, você verá logs detalhados:

```
PushInPay API Error: {
  status: 401,
  data: { message: 'Invalid API key' },
  ...
}
```

**Erros comuns:**
- `401 Unauthorized` → API Key incorreta
- `404 Not Found` → URL da API incorreta
- `Network Error` → Problema de conexão

#### 3. **Estrutura da Resposta da PushInPay**

A API pode retornar dados em formatos diferentes. O código agora suporta:

```javascript
// Formato 1 (padrão)
{
  transactionId: "...",
  pixCode: "...",
  pixQrCode: "..."
}

// Formato 2 (alternativo)
{
  id: "...",
  pix_code: "...",
  qr_code: "..."
}
```

#### 4. **Testar API Manualmente**

Você pode testar a API diretamente:

```bash
curl -X POST https://app.pushinpay.com.br/app/v1/pix/create \
  -H "Authorization: Bearer SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 19.99,
    "description": "Teste",
    "payer": {
      "email": "teste@email.com",
      "name": "Teste"
    },
    "expiresIn": 3600
  }'
```

#### 5. **Verificar Console do Navegador**

Abra o DevTools (F12) e vá em **Console**. Você verá erros detalhados:

```javascript
Error creating payment: Erro ao criar pagamento PIX: Invalid API key
```

## 🔍 Soluções Comuns

### Erro: "PushInPay API Key not configured"

**Solução:**
1. Verifique se o arquivo `.env.local` existe
2. Adicione `PUSHINPAY_API_KEY=sua-chave`
3. Reinicie o servidor

### Erro: "Código PIX não encontrado na resposta"

**Solução:**
1. Verifique os logs do servidor para ver a estrutura da resposta
2. A API pode usar nomes de campos diferentes
3. Entre em contato com suporte PushInPay para confirmar formato

### Erro: "Network Error" ou "ECONNREFUSED"

**Solução:**
1. Verifique sua conexão com internet
2. Verifique se a URL da API está correta
3. Tente acessar a URL no navegador para ver se está online

### Erro: "401 Unauthorized"

**Solução:**
1. Verifique se a API Key está correta
2. Verifique se não há espaços extras na chave
3. Gere uma nova API Key no dashboard PushInPay

## 📝 Debug Mode

O código agora inclui informações de debug em desenvolvimento. Quando houver erro, você verá:

```json
{
  "error": "Erro ao criar pagamento PIX",
  "details": "Invalid API key",
  "debug": {
    "apiUrl": "https://app.pushinpay.com.br/app",
    "hasApiKey": true,
    "responseStatus": 401,
    "responseData": { ... }
  }
}
```

## 🚀 Próximos Passos

1. **Verifique os logs** do servidor para ver o erro exato
2. **Confirme as variáveis** de ambiente estão corretas
3. **Teste a API** manualmente com curl
4. **Verifique a documentação** da PushInPay para formato correto

## 📞 Suporte

Se o problema persistir:
1. Copie os logs completos do servidor
2. Copie a mensagem de erro exata da página
3. Verifique se a conta PushInPay está ativa
4. Entre em contato com suporte PushInPay

