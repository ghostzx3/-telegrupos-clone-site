# 📸 Sistema de Busca Automática de Foto do Telegram

Este sistema busca automaticamente a foto de grupos e canais do Telegram quando o usuário insere o link no formulário.

## ✨ Funcionalidades

- ✅ **Busca automática completa**: Ao digitar ou colar um link do Telegram, o sistema busca automaticamente:
  - **Foto oficial** do grupo/canal
  - **Nome oficial** do grupo/canal
- ✅ **Preenchimento automático**: 
  - Campo de **URL da imagem** preenchido automaticamente
  - Campo de **nome do grupo** preenchido automaticamente
- ✅ **Preview em tempo real**: A imagem é exibida antes de enviar o formulário
- ✅ **Suporte a múltiplos formatos**: 
  - Links públicos: `https://t.me/username`, `t.me/username` ou `@username`
  - Links privados: `https://t.me/+XXXXXXXXXXXX` ou `t.me/+XXXXXXXXXXXX`
- ✅ **Fallback inteligente**: Se não encontrar a foto, usa a logo padrão do Telegram
- ✅ **Zero trabalho manual**: O usuário só precisa colar o link - tudo é preenchido automaticamente!

## 🎯 Como Funciona

1. O usuário digita ou cola um link do Telegram no campo "Link do Grupo"
2. O sistema aguarda 1 segundo após parar de digitar (debounce)
3. A API busca informações do grupo/canal do Telegram:
   - Extrai a **foto oficial** do grupo/canal
   - Extrai o **nome oficial** do grupo/canal
4. Os campos são preenchidos automaticamente:
   - Campo **"Nome do Grupo"** → preenchido com o nome oficial
   - Campo **"URL da Imagem"** → preenchido com a foto oficial
5. Um preview da imagem é exibido abaixo do campo
6. O usuário pode revisar e enviar - **não precisa preencher nada manualmente!**

## 📁 Arquivos Modificados

### 1. API Route
- **Arquivo**: `src/app/api/telegram/fetch-group-info/route.ts`
- **Função**: Busca informações do grupo/canal do Telegram
- **Método**: POST
- **Parâmetros**: `{ link: string }`
- **Retorno**: `{ success: boolean, imageUrl: string, title?: string, username: string }`

### 2. Modal de Envio de Grupo
- **Arquivo**: `src/components/SubmitGroupModal.tsx`
- **Alterações**:
  - Adicionado listener para detectar mudanças no campo de link
  - Função `fetchTelegramImage()` para buscar a foto
  - Preview de imagem com componente `Image` do Next.js
  - Indicador de carregamento durante a busca

### 3. Página de Cadastro
- **Arquivo**: `src/app/dashboard/cadastrar/page.tsx`
- **Alterações**: Mesmas funcionalidades do modal

## 🔧 Configuração (Opcional)

### Bot Token do Telegram (Opcional)

Para melhor precisão na busca, você pode configurar um bot token do Telegram:

1. Crie um bot no Telegram:
   - Fale com [@BotFather](https://t.me/BotFather)
   - Use o comando `/newbot`
   - Siga as instruções para criar o bot
   - Copie o token fornecido

2. Adicione ao `.env.local`:
```env
TELEGRAM_BOT_TOKEN=7673997316:AAH-MYNThox9gnH_LP3sWPEAxa48Q5v_G5E
```

**Nota**: O sistema funciona sem o bot token, usando um método alternativo de scraping da página pública do Telegram. O bot token melhora a precisão, mas não é obrigatório.

## 🚀 Como Usar

1. Acesse o formulário de envio de grupo (modal ou página de cadastro)
2. Digite ou cole o link do Telegram no campo "Link do Grupo"
   - **Links públicos** (exemplos):
     - `https://t.me/gruponome`
     - `t.me/gruponome`
     - `@gruponome`
   - **Links privados** (exemplos):
     - `https://t.me/+-OLvgVKNHH4xYzVh`
     - `t.me/+-OLvgVKNHH4xYzVh`
3. Aguarde 1 segundo - o sistema buscará automaticamente a foto
4. A foto será preenchida automaticamente e um preview será exibido
5. Se necessário, você pode editar manualmente a URL da imagem

## 🎨 Interface

### Indicadores Visuais

- **Ícone de carregamento**: Aparece no campo de link durante a busca
- **Texto "Buscando foto do grupo..."**: Indica que a busca está em andamento
- **Badge "(Preenchida automaticamente)"**: Aparece ao lado do label quando a foto é encontrada
- **Preview da imagem**: Exibido abaixo do campo de URL da imagem
- **Campos preenchidos**: Nome e imagem são preenchidos automaticamente sem intervenção do usuário

### Estados

1. **Idle**: Nenhuma busca em andamento
2. **Loading**: Buscando foto do Telegram (ícone de spinner)
3. **Success**: Foto encontrada e preenchida (preview exibido)
4. **Error**: Erro na busca (usa foto padrão do Telegram)

## 🔍 Detalhes Técnicos

### Regex de Validação

O sistema usa a seguinte regex para validar links do Telegram (públicos e privados):
```javascript
/(?:https?:\/\/)?(?:t\.me\/|@)(\+?[a-zA-Z0-9_-]+)/
```

Esta regex suporta:
- **Links públicos**: `username`, `gruponome`, `canal123`
- **Links privados**: `+-OLvgVKNHH4xYzVh`, `+ABCD1234EFGH`

### Métodos de Busca

1. **Links Privados** (formato `+XXXXXXXXXXXX`):
   - Sempre usa scraping da página pública do Telegram
   - Busca a meta tag `og:image` e `og:title` no HTML
   - Funciona para grupos/canais privados e públicos
   - Extrai o título do grupo da meta tag `og:title`

2. **Links Públicos com Bot Token** (se configurado):
   - Usa a API oficial do Telegram Bot
   - Mais preciso e confiável
   - Retorna informações completas do grupo/canal

3. **Links Públicos sem Bot Token** (método alternativo):
   - Faz scraping da página pública do Telegram
   - Busca a meta tag `og:image` no HTML
   - Funciona para grupos/canais públicos

4. **Fallback**:
   - Se nenhum método funcionar, usa a logo padrão do Telegram
   - Garante que sempre haverá uma imagem

### Debounce

O sistema usa um debounce de 1 segundo para evitar múltiplas requisições enquanto o usuário digita.

## 🐛 Troubleshooting

### Foto não é encontrada

- Verifique se o link do Telegram está correto
- Certifique-se de que o grupo/canal é público
- Tente usar o formato completo: `https://t.me/username`

### Preview não aparece

- Verifique se a URL da imagem é válida
- O componente `Image` do Next.js pode bloquear imagens de domínios não configurados
- Adicione o domínio ao `next.config.js` se necessário

### Erro de CORS

- A API do Telegram pode bloquear requisições diretas do navegador
- A busca é feita no servidor (API route), então não há problemas de CORS

## 📝 Exemplos de Uso

### Link Público
```typescript
// O usuário digita: https://t.me/gruponome
// Após 1 segundo, o sistema:
// 1. Extrai o identificador: "gruponome"
// 2. Busca informações do Telegram
// 3. Preenche automaticamente:
//    - Campo "Nome do Grupo" → "Nome Oficial do Grupo"
//    - Campo "URL da Imagem" → "https://..."
// 4. Exibe o preview da imagem abaixo do campo
// 5. Usuário pode revisar e enviar - tudo pronto!
```

### Link Privado
```typescript
// O usuário digita: https://t.me/+-OLvgVKNHH4xYzVh
// Após 1 segundo, o sistema:
// 1. Detecta que é um link privado (começa com +)
// 2. Usa scraping da página pública do Telegram
// 3. Extrai a foto da meta tag og:image
// 4. Extrai o nome da meta tag og:title
// 5. Preenche automaticamente:
//    - Campo "Nome do Grupo" → "Nome Oficial do Grupo"
//    - Campo "URL da Imagem" → "https://..."
// 6. Exibe o preview da imagem abaixo do campo
// 7. Usuário pode revisar e enviar - tudo pronto!
```

## ✅ Testado

- ✅ Modal de envio de grupo (`/components/SubmitGroupModal.tsx`)
- ✅ Página de cadastro (`/dashboard/cadastrar`)
- ✅ Suporte a diferentes formatos de link
- ✅ Preview de imagem
- ✅ Indicadores de carregamento
- ✅ Tratamento de erros

## 🎉 Pronto!

O sistema está totalmente funcional e pronto para uso. Basta inserir um link do Telegram e a foto será buscada automaticamente!

