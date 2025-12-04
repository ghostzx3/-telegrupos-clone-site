# Sistema de Atualização Automática de Imagens do Telegram

Este sistema preenche automaticamente as imagens dos grupos do Telegram, tanto para grupos já existentes quanto para novos grupos adicionados.

## 📋 Funcionalidades

### 1. Atualização de Grupos Existentes

O sistema busca automaticamente todos os grupos cadastrados que estão sem imagem e atualiza com a imagem oficial do Telegram.

**Como usar:**
1. Acesse o painel administrativo (`/admin`)
2. Clique no botão **"Atualizar Imagens dos Grupos"**
3. O sistema processará até 100 grupos por vez
4. Você verá o progresso e resultado da atualização

**API Endpoint:**
```
POST /api/admin/groups/update-images
```

**Parâmetros (opcionais):**
```json
{
  "limit": 50,    // Número máximo de grupos para processar (padrão: 50)
  "force": false  // Se true, atualiza mesmo grupos que já têm imagem (padrão: false)
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Processamento concluído: 45 atualizados, 5 falharam",
  "updated": 45,
  "failed": 5,
  "total": 50,
  "errors": [...]
}
```

### 2. Preenchimento Automático em Novos Grupos

Quando um novo grupo é adicionado ao sistema, o sistema automaticamente:
- Extrai o username do link do Telegram
- Consulta a API oficial do Telegram (getChat)
- Obtém a foto do grupo (getFile)
- Preenche automaticamente o nome e a imagem
- Salva no banco de dados

**Não é necessário fazer nada!** O sistema funciona automaticamente quando um grupo é criado via:
- `/api/groups` (POST)
- Formulário de cadastro de grupos
- Modal de envio de grupos

## 🔧 Como Funciona

### Fluxo de Atualização

1. **Extração do Identificador**
   - O sistema extrai o username ou ID do link do Telegram
   - Suporta formatos: `t.me/username`, `@username`, links privados `t.me/+XXXXXXXXXXXX`

2. **Consulta à API do Telegram**
   - Se houver `TELEGRAM_BOT_TOKEN` configurado, usa a API oficial
   - Chama `getChat` para obter informações do grupo
   - Se o grupo tiver foto, chama `getFile` para obter o caminho do arquivo
   - Gera a URL final da imagem: `https://api.telegram.org/file/bot{TOKEN}/{file_path}`

3. **Fallback (Scraping)**
   - Se não houver bot token ou a API falhar, usa scraping da página pública
   - Extrai `og:image` e `og:title` da página do Telegram
   - Funciona para grupos públicos mesmo sem bot token

4. **Atualização no Banco**
   - Atualiza o campo `image_url` na tabela `groups`
   - Atualiza o campo `title` se o grupo não tiver título

### Tratamento de Erros

- **Grupo não encontrado**: Registra erro e continua com próximo grupo
- **Bot não está no grupo**: Usa fallback de scraping
- **Sem foto no grupo**: Salva apenas o título, sem imagem
- **Erro de rede**: Registra erro e continua processamento
- **Rate limiting**: Delay de 500ms entre requisições para não sobrecarregar API

## 📁 Arquivos Criados

### 1. `src/lib/telegram/image-fetcher.ts`
Função utilitária que busca imagens do Telegram:
- `extractTelegramIdentifier()`: Extrai username/ID do link
- `fetchTelegramGroupImage()`: Busca imagem usando API oficial ou scraping

### 2. `src/app/api/admin/groups/update-images/route.ts`
API route para atualizar grupos existentes:
- `POST`: Processa e atualiza grupos sem imagem
- `GET`: Retorna quantos grupos precisam de atualização

### 3. Modificações em `src/app/api/groups/route.ts`
Adicionado preenchimento automático ao criar novos grupos

### 4. Modificações em `src/app/admin/page.tsx`
Adicionado botão para atualizar imagens dos grupos existentes

## ⚙️ Configuração

### Variável de Ambiente

Adicione no `.env.local`:
```env
TELEGRAM_BOT_TOKEN=seu_token_aqui
```

**Opcional:** O sistema funciona sem bot token usando scraping, mas a API oficial é mais confiável.

### Como Obter o Token do Bot

1. Fale com [@BotFather](https://t.me/BotFather) no Telegram
2. Use `/newbot` para criar um novo bot
3. Copie o token fornecido
4. Adicione o bot ao grupo/canal que deseja buscar imagens

## 🚀 Uso

### Atualizar Grupos Existentes

**Via Interface:**
1. Acesse `/admin`
2. Clique em "Atualizar Imagens dos Grupos"
3. Aguarde o processamento

**Via API:**
```bash
curl -X POST https://seu-site.com/api/admin/groups/update-images \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"limit": 100, "force": false}'
```

### Novos Grupos

**Automático!** Basta criar um grupo normalmente:
- O sistema detecta automaticamente se não há imagem/título
- Busca do Telegram automaticamente
- Preenche e salva

## 📊 Monitoramento

### Logs

O sistema gera logs detalhados:
- `[Update Images]`: Logs da atualização em massa
- `[Telegram API]`: Logs das chamadas à API do Telegram
- `[API Groups]`: Logs do preenchimento automático

### Verificar Status

```bash
GET /api/admin/groups/update-images
```

Retorna quantos grupos precisam de atualização.

## ⚠️ Limitações

1. **Rate Limiting**: A API do Telegram tem limites de requisições
   - Solução: Delay de 500ms entre requisições
   - Processa até 100 grupos por vez

2. **Bot Precisa Estar no Grupo**: Para usar API oficial, o bot precisa ser membro
   - Solução: Fallback automático para scraping

3. **Grupos Privados**: Links privados podem não funcionar com API oficial
   - Solução: Usa scraping que funciona para links privados

4. **Grupos Sem Foto**: Alguns grupos não têm foto
   - Solução: Salva apenas o título, sem imagem

## 🔒 Segurança

- Apenas administradores podem atualizar imagens em massa
- Validação de autenticação em todas as rotas
- Tratamento seguro de erros
- Não expõe tokens ou informações sensíveis

## 📝 Exemplos

### Exemplo de Resposta da API

```json
{
  "success": true,
  "message": "Processamento concluído: 45 atualizados, 5 falharam",
  "updated": 45,
  "failed": 5,
  "total": 50,
  "errors": [
    {
      "id": "uuid-123",
      "title": "Grupo Exemplo",
      "error": "Bot não está no grupo"
    }
  ]
}
```

### Exemplo de URL de Imagem Gerada

```
https://api.telegram.org/file/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/photos/file_123.jpg
```

## 🎯 Próximos Passos

1. **Agendamento Automático**: Configurar cron job para atualizar automaticamente
2. **Notificações**: Enviar email quando atualização for concluída
3. **Relatórios**: Dashboard com estatísticas de atualizações
4. **Retry Logic**: Tentar novamente grupos que falharam

## 🐛 Troubleshooting

### Imagens não aparecem após atualização

1. Verifique se o bot token está configurado corretamente
2. Verifique se o bot está no grupo
3. Verifique os logs do servidor para erros
4. Tente usar `force: true` para forçar atualização

### Erro "Bot não está no grupo"

- Adicione o bot ao grupo manualmente
- Ou use o modo scraping (sem bot token)

### Processamento muito lento

- Reduza o `limit` para processar menos grupos por vez
- Aumente o delay entre requisições (modificar código)

## 📞 Suporte

Para problemas ou dúvidas, verifique:
1. Logs do servidor
2. Console do navegador (F12)
3. Resposta da API `/api/admin/groups/update-images`

---

**Sistema desenvolvido para garantir que todos os grupos tenham suas imagens oficiais do Telegram!** 🚀



