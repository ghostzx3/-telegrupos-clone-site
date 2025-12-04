# 🤖 Backend - Telegram Groups API

Backend completo em Node.js + Express + Prisma para buscar e salvar informações de grupos do Telegram usando a Telegram Bot API.

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 12+
- Bot do Telegram criado (obter token em [@BotFather](https://t.me/BotFather))

## 🚀 Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/telegram_groups?schema=public"
TELEGRAM_BOT_TOKEN="seu_token_aqui"
PORT=3000
BASE_URL="http://localhost:3000"
```

### 3. Configurar banco de dados

#### Criar banco de dados PostgreSQL:

```sql
CREATE DATABASE telegram_groups;
```

#### Executar migrations do Prisma:

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Criar tabelas no banco
npm run prisma:migrate
```

### 4. Criar diretório de uploads

O diretório será criado automaticamente, mas você pode criar manualmente:

```bash
mkdir -p uploads/telegram-photos
```

## 🏃 Como Rodar

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm start
```

## 📡 Endpoints

### POST /buscar-grupo

Busca informações de um grupo do Telegram e salva no banco.

**Request:**
```json
{
  "link": "https://t.me/username"
}
```

**Response (sucesso):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "username",
    "title": "Nome do Grupo",
    "description": "Descrição do grupo",
    "type": "supergroup",
    "photoUrl": "http://localhost:3000/uploads/telegram-photos/123_1234567890.jpg"
  }
}
```

**Response (erro):**
```json
{
  "success": false,
  "error": "bot_not_member",
  "message": "O bot precisa ser membro do grupo para acessar as informações"
}
```

### GET /grupos/:id

Retorna um grupo específico por ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "username",
    "title": "Nome do Grupo",
    "description": "Descrição",
    "type": "supergroup",
    "photoUrl": "http://localhost:3000/uploads/telegram-photos/...",
    "fetchedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /grupos

Lista todos os grupos salvos com paginação.

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "username",
      "title": "Nome do Grupo",
      "description": "Descrição",
      "type": "supergroup",
      "photoUrl": "http://localhost:3000/uploads/telegram-photos/...",
      "fetchedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

## ⚠️ Avisos Importantes do Telegram

### 1. Bot precisa ser membro do grupo

**IMPORTANTE:** O bot precisa ser **adicionado como membro** do grupo/canal antes de poder buscar informações.

- Para grupos: Adicione o bot como membro
- Para canais: Adicione o bot como administrador (ou membro, dependendo das configurações)

**Erro comum:**
```json
{
  "success": false,
  "error": "bot_not_member",
  "message": "O bot precisa ser membro do grupo para acessar as informações"
}
```

**Solução:** Adicione o bot ao grupo/canal antes de fazer a requisição.

### 2. Links de convite não são suportados

Links no formato `t.me/joinchat/...` ou `t.me/+...` não são suportados. Use apenas links públicos com username.

### 3. Rate Limiting

A Telegram Bot API tem limites de requisições:
- **30 requisições por segundo** para métodos gerais
- **20 requisições por segundo** para métodos de envio de mensagens

O backend não implementa rate limiting automático. Em produção, considere adicionar.

## 🔧 Configuração do Bot

### 1. Criar bot no Telegram

1. Abra o Telegram e procure por [@BotFather](https://t.me/BotFather)
2. Envie `/newbot`
3. Siga as instruções para criar o bot
4. Copie o token fornecido
5. Cole no arquivo `.env` como `TELEGRAM_BOT_TOKEN`

### 2. Adicionar bot ao grupo

1. Abra o grupo/canal no Telegram
2. Vá em **Configurações** → **Administradores** (ou **Membros**)
3. Clique em **Adicionar membro**
4. Procure pelo seu bot pelo username
5. Adicione o bot

## 📁 Estrutura de Pastas

```
backend/
├── src/
│   ├── app.js                 # Configuração do Express
│   ├── server.js              # Ponto de entrada
│   ├── config/
│   │   └── database.js        # Configuração Prisma
│   ├── controllers/
│   │   └── groupController.js # Lógica dos endpoints
│   ├── services/
│   │   └── telegramService.js # Integração com Telegram API
│   ├── routes/
│   │   └── groupRoutes.js     # Definição das rotas
│   ├── middlewares/
│   │   └── errorHandler.js    # Tratamento de erros
│   └── utils/
│       └── linkValidator.js   # Validação de links
├── prisma/
│   └── schema.prisma          # Schema do banco
├── uploads/
│   └── telegram-photos/       # Fotos baixadas
├── .env.example
├── package.json
└── README.md
```

## 🧪 Testando

### Exemplo com curl:

```bash
# Buscar grupo
curl -X POST http://localhost:3000/buscar-grupo \
  -H "Content-Type: application/json" \
  -d '{"link": "https://t.me/username"}'

# Listar grupos
curl http://localhost:3000/grupos

# Buscar por ID
curl http://localhost:3000/grupos/1
```

## 🐛 Troubleshooting

### Erro: "TELEGRAM_BOT_TOKEN não configurado"
- Verifique se o arquivo `.env` existe
- Verifique se `TELEGRAM_BOT_TOKEN` está definido no `.env`

### Erro: "bot_not_member"
- Adicione o bot ao grupo/canal antes de fazer a requisição

### Erro: "username_not_found"
- Verifique se o username está correto
- Verifique se o grupo/canal é público

### Erro de conexão com banco
- Verifique se o PostgreSQL está rodando
- Verifique se `DATABASE_URL` está correto
- Execute `npm run prisma:migrate` novamente

## 📝 Próximos Passos

- [ ] Adicionar rate limiting
- [ ] Adicionar autenticação
- [ ] Adicionar cache
- [ ] Adicionar logs estruturados
- [ ] Adicionar testes automatizados

## 📄 Licença

ISC










