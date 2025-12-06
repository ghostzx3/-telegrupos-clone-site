# ✅ Requisitos para o Sistema de Busca Automática de Foto do Telegram

Este documento lista **tudo que é necessário** para o sistema funcionar corretamente no site.

## 📋 Checklist de Requisitos

### ✅ 1. Código já implementado (NÃO precisa fazer nada)

- ✅ API Route: `src/app/api/telegram/fetch-group-info/route.ts`
- ✅ Componente Modal: `src/components/SubmitGroupModal.tsx`
- ✅ Página de Cadastro: `src/app/dashboard/cadastrar/page.tsx`
- ✅ Configuração Next.js: `next.config.js` (domínios de imagem configurados)

### ⚙️ 2. Configurações necessárias

#### 2.1. Variável de Ambiente (OPCIONAL mas recomendado)

**O que é**: Token do bot do Telegram para melhor precisão na busca.

**Por que é opcional**: O sistema funciona sem ele, usando um método alternativo de scraping.

**Como configurar**:

1. Crie um bot no Telegram:
   - Acesse [@BotFather](https://t.me/BotFather) no Telegram
   - Envie o comando `/newbot`
   - Siga as instruções para criar o bot
   - Copie o token fornecido (formato: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

2. Adicione ao arquivo `.env.local`:
   ```env
   TELEGRAM_BOT_TOKEN=seu-token-aqui
   ```

**Exemplo**:
```env
TELEGRAM_BOT_TOKEN=7673997316:AAH-MYNThox9gnH_LP3sWPEAxa48Q5v_G5E
```

**Nota**: Se você já tem o token configurado no arquivo `.env.local`, está tudo certo!

#### 2.2. Domínios de Imagem no Next.js (JÁ CONFIGURADO ✅)

O arquivo `next.config.js` já está configurado com os domínios necessários:

```javascript
images: {
  domains: ['ext.same-assets.com', 'telegram.org', 'cdn4.telegram-cdn.org', 'cdn5.telegram-cdn.org'],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.telegram-cdn.org',
    },
    {
      protocol: 'https',
      hostname: 'api.telegram.org',
    },
  ],
}
```

**Não precisa fazer nada** - já está configurado!

### 🚀 3. Como testar se está funcionando

1. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   # ou
   bun run dev
   ```

2. **Acesse o formulário de cadastro**:
   - Modal: Clique em "Enviar Grupo" na homepage
   - Página: Acesse `/dashboard/cadastrar`

3. **Teste com um link do Telegram**:
   - Cole um link público: `https://t.me/gruponome`
   - Ou um link privado: `https://t.me/+-OLvgVKNHH4xYzVh`
   - Aguarde 1 segundo
   - A foto e o nome devem ser preenchidos automaticamente

4. **Verifique o console do navegador** (F12):
   - Deve aparecer logs como: `[Telegram] Buscando informações para: ...`
   - Se houver erros, eles aparecerão aqui

### 🔍 4. Verificações finais

#### ✅ Verificar se a API está acessível

Teste a API diretamente:

```bash
curl -X POST http://localhost:3000/api/telegram/fetch-group-info \
  -H "Content-Type: application/json" \
  -d '{"link": "https://t.me/gruponome"}'
```

Deve retornar:
```json
{
  "success": true,
  "imageUrl": "https://...",
  "title": "Nome do Grupo",
  "username": "gruponome"
}
```

#### ✅ Verificar variáveis de ambiente

Certifique-se de que o arquivo `.env.local` existe e contém (pelo menos):

```env
# Obrigatórias
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Opcional (mas recomendado)
TELEGRAM_BOT_TOKEN=...
```

### 🐛 5. Solução de problemas

#### Problema: Foto não aparece

**Possíveis causas**:
1. Link inválido ou grupo privado sem acesso
2. Domínio da imagem não configurado no Next.js (mas já está configurado)
3. Erro na API do Telegram

**Solução**:
- Verifique o console do navegador (F12) para ver erros
- Teste com um link público conhecido: `https://t.me/telegram`
- Verifique se o grupo/canal é público

#### Problema: "Erro ao buscar informações do Telegram"

**Possíveis causas**:
1. Problema de rede/CORS
2. Link inválido
3. API do Telegram temporariamente indisponível

**Solução**:
- A busca é feita no servidor (sem problemas de CORS)
- Tente novamente após alguns segundos
- Verifique se o link está correto

#### Problema: Preview não aparece

**Possíveis causas**:
1. URL da imagem inválida
2. Domínio bloqueado pelo Next.js

**Solução**:
- Verifique o console do navegador
- Se necessário, adicione o domínio ao `next.config.js` (mas já está configurado)

### 📝 6. Resumo rápido

**O que você PRECISA fazer**:
- ✅ Nada! O código já está implementado

**O que é OPCIONAL mas recomendado**:
- ⚙️ Configurar `TELEGRAM_BOT_TOKEN` no `.env.local` (melhora a precisão)

**O que já está configurado**:
- ✅ API Route implementada
- ✅ Componentes integrados
- ✅ Domínios de imagem configurados no Next.js

### 🎯 7. Status atual do sistema

| Item | Status | Observação |
|------|--------|------------|
| API Route | ✅ Implementada | `src/app/api/telegram/fetch-group-info/route.ts` |
| Modal de Envio | ✅ Integrado | `src/components/SubmitGroupModal.tsx` |
| Página de Cadastro | ✅ Integrado | `src/app/dashboard/cadastrar/page.tsx` |
| Next.js Config | ✅ Configurado | Domínios de imagem permitidos |
| Bot Token | ⚠️ Opcional | Melhora precisão, mas não obrigatório |
| Funcionalidade | ✅ Funcionando | Teste com qualquer link do Telegram |

### 🚀 8. Próximos passos

1. **Se ainda não testou**: Teste agora com um link do Telegram
2. **Se quiser melhor precisão**: Configure o `TELEGRAM_BOT_TOKEN`
3. **Se encontrar problemas**: Verifique o console do navegador (F12)

---

## ✅ Conclusão

**O sistema já está 100% funcional!** Você só precisa:

1. ✅ Ter o servidor rodando (`npm run dev`)
2. ⚙️ (Opcional) Configurar `TELEGRAM_BOT_TOKEN` no `.env.local`
3. ✅ Testar com um link do Telegram

**Tudo mais já está implementado e configurado!** 🎉







