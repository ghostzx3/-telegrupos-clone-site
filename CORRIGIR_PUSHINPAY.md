# 🔧 Como Corrigir o Erro "Route v1/pix/create could not be found"

## ❌ Erro Atual
```
The route v1/pix/create could not be found
```

## ✅ Soluções

### 1. **Verificar URL da API PushInPay**

A URL pode estar incorreta. Verifique no arquivo `.env.local`:

```env
# URL correta da API PushInPay:
NEXT_PUBLIC_PUSHINPAY_API_URL=https://app.pushinpay.com.br/app
```

### 2. **Verificar Documentação Oficial**

A PushInPay pode ter mudado a estrutura da API. Acesse:
- Dashboard PushInPay → Configurações → API
- Ou documentação oficial: https://docs.pushinpay.com.br

### 3. **Verificar Endpoint Correto**

O endpoint pode ser diferente. Algumas opções comuns:

```
/v1/pix/create
/api/v1/pix/create
/pix/create
/api/pix/create
/transactions/pix
/api/transactions/pix
```

### 4. **Testar Manualmente com cURL**

Teste diretamente para ver qual endpoint funciona:

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
    }
  }'
```

Se retornar 404, tente outros endpoints:
- `/app/api/v1/pix/create`
- `/app/pix/create`
- `/app/api/pix/create`

### 5. **Verificar se a API Key está Correta**

1. Acesse o dashboard PushInPay
2. Vá em Configurações → API
3. Copie a API Key novamente
4. Cole no `.env.local` sem espaços extras

### 6. **Contatar Suporte PushInPay**

Se nenhuma das opções funcionar:
1. Entre em contato com suporte PushInPay
2. Pergunte qual é o endpoint correto para criar PIX
3. Pergunte qual é a URL base da API

## 📝 Informações para Suporte

Quando contatar o suporte, forneça:
- A URL que você está usando
- O endpoint que está tentando
- A mensagem de erro completa
- Se você tem acesso à documentação da API

## 🔄 Após Corrigir

1. Atualize o `.env.local` com a URL correta
2. Reinicie o servidor: `npm run dev` ou `bun run dev`
3. Tente gerar o PIX novamente

## 💡 Dica

O código agora tenta automaticamente vários endpoints. Verifique os logs do servidor para ver quais endpoints foram tentados e qual erro cada um retornou.

