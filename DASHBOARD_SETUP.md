# 📊 Painel de Usuário - Guia de Instalação

## ✅ O que foi criado

### 1. **Layout do Dashboard**
- Sidebar de navegação com todos os itens do menu
- Design responsivo e moderno
- Navegação intuitiva

### 2. **Páginas Criadas**

#### `/dashboard` - Meus Grupos
- Listagem de todos os grupos do usuário
- Tabela com: miniatura, título, views, status e ações
- Botões: Visualizar, Impulsionar (com contador se ativo), Editar, Excluir
- Seção de promoção com bot do Telegram
- Links informativos

#### `/dashboard/cadastrar` - Cadastrar Grupo
- Formulário completo para cadastrar novo grupo
- Campos: nome, link, imagem, categoria, descrição
- Validação e feedback

#### `/dashboard/planos` - Planos de Impulsionamento
- 3 planos disponíveis:
  - **Premium** (R$ 29,90/30 dias)
  - **Destaque** (R$ 49,90/30 dias)
  - **Impulsionar** (R$ 19,90/7 dias)
- Cards visuais com features
- Redirecionamento para pagamento

#### `/dashboard/dados` - Meus Dados
- Editar nome completo
- Visualizar email (não editável)
- Salvar alterações

#### `/dashboard/senha` - Senha de Acesso
- Alterar senha (usuário logado)
- Redefinir senha (via link de recuperação)
- Validação de senhas
- Envio de link de recuperação por email

### 3. **Funcionalidades de Login**
- **Recuperação de Senha**: Botão "Esqueci a senha" no modal de login
- Envio de link de recuperação por email
- Redirecionamento automático para dashboard após login

### 4. **APIs Criadas**
- `GET /api/user/groups` - Buscar grupos do usuário
- Inclui informações de pagamentos ativos
- Filtra apenas grupos do usuário logado

## 🎯 Como Funciona

### **Fluxo de Recuperação de Senha**

1. Usuário clica em "Esqueci a senha" no modal de login
2. Digita o email
3. Recebe link de recuperação por email
4. Clica no link e é redirecionado para `/dashboard/senha`
5. Define nova senha
6. É redirecionado automaticamente

### **Gerenciamento de Grupos**

1. Usuário acessa `/dashboard`
2. Vê todos os seus grupos em uma tabela
3. Pode:
   - **Visualizar**: Ver o grupo no site
   - **Impulsionar**: Comprar plano para destacar
   - **Editar**: Modificar informações do grupo
   - **Excluir**: Remover grupo

### **Sistema de Planos**

1. Usuário clica em "Impulsionar" em um grupo
2. É redirecionado para `/dashboard/planos?group=ID`
3. Escolhe um plano
4. É redirecionado para página de pagamento (a implementar)

## 🔒 Segurança

- Todas as páginas verificam autenticação
- Apenas grupos do próprio usuário são exibidos
- Validação de senhas
- Tokens de recuperação seguros

## 📝 Estrutura de Arquivos

```
src/
├── app/
│   └── dashboard/
│       ├── page.tsx (Meus Grupos)
│       ├── cadastrar/
│       │   └── page.tsx
│       ├── planos/
│       │   └── page.tsx
│       ├── dados/
│       │   └── page.tsx
│       └── senha/
│           └── page.tsx
├── components/
│   ├── DashboardSidebar.tsx
│   └── LoginModal.tsx (atualizado)
└── app/api/
    └── user/
        └── groups/
            └── route.ts
```

## 🚀 Próximos Passos (Opcional)

1. **Página de Pagamento**: Criar `/dashboard/pagamento` para processar pagamentos
2. **Edição de Grupos**: Criar `/dashboard/editar/[id]` para editar grupos
3. **Estatísticas**: Adicionar gráficos e métricas para cada grupo
4. **Notificações**: Sistema de notificações para aprovações/rejeições
5. **Upload de Imagens**: Permitir upload direto de imagens

## 📞 Uso

1. **Acessar Dashboard**: Faça login e será redirecionado para `/dashboard`
2. **Navegação**: Use a sidebar para navegar entre as páginas
3. **Gerenciar Grupos**: Use os botões na tabela para ações
4. **Alterar Senha**: Acesse "Senha de Acesso" na sidebar
5. **Recuperar Senha**: Use "Esqueci a senha" no modal de login

## ⚠️ Notas Importantes

- O botão "Suporte" redireciona para URL externa (configurar no código)
- A página de pagamento ainda precisa ser criada
- A edição de grupos precisa ser implementada
- O sistema de upload de imagens pode ser melhorado






