# 📧 Configuração de Envio de Email

O sistema de alteração de senha usa **Resend** para enviar emails. Siga os passos abaixo para configurar:

## 🚀 Passo 1: Criar conta no Resend

1. Acesse [resend.com](https://resend.com)
2. Crie uma conta gratuita (100 emails/dia grátis)
3. Verifique seu email

## 🔑 Passo 2: Obter API Key

1. No dashboard do Resend, vá em **API Keys**
2. Clique em **Create API Key**
3. Dê um nome (ex: "Telegrupos Production")
4. Copie a chave (começa com `re_`)

## 📝 Passo 3: Configurar domínio (Opcional para produção)

Para produção, você precisa verificar um domínio:

1. No Resend, vá em **Domains**
2. Clique em **Add Domain**
3. Adicione seu domínio (ex: `grupostelegramx.com`)
4. Siga as instruções para adicionar os registros DNS
5. Aguarde a verificação (pode levar alguns minutos)

**Nota**: Para desenvolvimento/teste, você pode usar o domínio padrão do Resend sem verificação.

## ⚙️ Passo 4: Adicionar variáveis de ambiente

Adicione ao seu `.env.local` (desenvolvimento) ou nas variáveis de ambiente do Vercel (produção):

```env
# Resend API Key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# Email remetente (use o domínio verificado ou o padrão do Resend)
RESEND_FROM_EMAIL=noreply@grupostelegramx.com
# ou para desenvolvimento:
# RESEND_FROM_EMAIL=onboarding@resend.dev
```

## ✅ Passo 5: Testar

1. Inicie o servidor: `npm run dev`
2. Acesse `/dashboard/senha`
3. Clique em "Enviar Link de Verificação por Email"
4. Verifique sua caixa de entrada (e spam)

## 🐛 Troubleshooting

### Email não está sendo enviado

1. **Verifique os logs do console**: O sistema loga erros detalhados
2. **Verifique a API Key**: Certifique-se de que `RESEND_API_KEY` está correta
3. **Verifique o domínio**: Em produção, o domínio precisa estar verificado
4. **Verifique spam**: O email pode ter caído na pasta de spam

### Erro: "Invalid API Key"

- Verifique se a chave está correta
- Certifique-se de que não há espaços extras
- Tente gerar uma nova chave no Resend

### Email vai para spam

- Configure SPF, DKIM e DMARC no seu domínio
- Use um domínio verificado (não o padrão do Resend)
- Evite palavras como "reset", "password" no assunto (já configurado)

## 📊 Monitoramento

No dashboard do Resend você pode:
- Ver todos os emails enviados
- Verificar taxa de entrega
- Ver logs de erros
- Monitorar uso da API

## 💰 Limites

**Plano Gratuito:**
- 100 emails/dia
- 3.000 emails/mês
- Domínio verificado: 1

**Para mais emails**, considere um plano pago do Resend.

## 🔒 Segurança

- **Nunca** commite a `RESEND_API_KEY` no Git
- Use variáveis de ambiente sempre
- Revogue chaves antigas se comprometidas
- Monitore uso anormal no dashboard do Resend

