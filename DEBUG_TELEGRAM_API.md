# 🐛 Debug - Sistema de Busca do Telegram

## ✅ Correções Aplicadas

1. **Erro corrigido**: Removida referência a variável `username` inexistente na linha 39
2. **Logs adicionados**: Console logs para facilitar debug
3. **Tratamento de erros melhorado**: Mensagens mais claras

## 🔍 Como Testar

### 1. Abrir o Console do Navegador

1. Abra o formulário de envio de grupo
2. Pressione `F12` para abrir DevTools
3. Vá na aba **Console**

### 2. Testar com um Link

1. Cole um link do Telegram no campo "Link do Grupo"
2. Aguarde 1 segundo
3. Veja os logs no console:

```
[Telegram] Buscando informações para: https://t.me/+-OLvgVKNHH4xYzVh
[Telegram] Resposta recebida: 200 OK
[Telegram] Dados recebidos: { success: true, imageUrl: "...", title: "..." }
[Telegram] Preenchendo imagem: ...
[Telegram] Preenchendo nome: ...
```

### 3. Verificar Logs do Servidor

No terminal onde o servidor está rodando, você verá:

```
[Telegram API] Buscando informações para: +-OLvgVKNHH4xYzVh Privado: true
```

## 🚨 Problemas Comuns

### Problema 1: Nada acontece quando cola o link

**Solução:**
1. Verifique o console do navegador (F12)
2. Veja se há erros em vermelho
3. Verifique se o link está no formato correto

### Problema 2: Erro 404 ou 500 na API

**Solução:**
1. Verifique se o arquivo existe: `src/app/api/telegram/fetch-group-info/route.ts`
2. Reinicie o servidor: `npm run dev` ou `bun run dev`
3. Limpe o cache: delete a pasta `.next` e reinicie

### Problema 3: Foto não aparece

**Solução:**
1. Verifique se a URL da imagem está sendo retornada (veja console)
2. Verifique se o domínio está permitido no `next.config.js`
3. Tente acessar a URL da imagem diretamente no navegador

### Problema 4: Nome não é preenchido

**Solução:**
1. Verifique se `data.title` está sendo retornado (veja console)
2. Verifique se o grupo/canal tem nome público
3. Links privados podem não ter nome disponível

## 🧪 Testar a API Diretamente

Você pode testar a API diretamente usando curl ou Postman:

```bash
curl -X POST http://localhost:3000/api/telegram/fetch-group-info \
  -H "Content-Type: application/json" \
  -d '{"link": "https://t.me/+-OLvgVKNHH4xYzVh"}'
```

**Resposta esperada:**
```json
{
  "success": true,
  "imageUrl": "https://...",
  "title": "Nome do Grupo",
  "username": "+-OLvgVKNHH4xYzVh",
  "isPrivate": true
}
```

## 📝 Checklist de Verificação

- [ ] Servidor está rodando (`npm run dev`)
- [ ] Console do navegador está aberto (F12)
- [ ] Link do Telegram está no formato correto
- [ ] Não há erros no console
- [ ] API route existe e está acessível
- [ ] Logs aparecem no console quando cola o link

## 🔧 Próximos Passos se Não Funcionar

1. **Copie os logs do console** (tanto do navegador quanto do servidor)
2. **Teste a API diretamente** usando curl
3. **Verifique a rede** na aba Network do DevTools:
   - Veja se a requisição está sendo feita
   - Veja o status da resposta
   - Veja o conteúdo da resposta

## 💡 Dicas

- Os logs começam com `[Telegram]` no frontend
- Os logs começam com `[Telegram API]` no backend
- Se não ver nenhum log, o código não está sendo executado
- Se ver erro 404, a rota não está sendo encontrada
- Se ver erro 500, há um problema no servidor











