# Correção de Avisos de Segurança do Supabase

Este documento explica como corrigir os avisos de segurança exibidos no Consultor de Segurança do Supabase.

## Avisos Identificados

### 1. Caminho de busca de função mutável (4 avisos)

As seguintes funções precisam ter o `search_path` definido explicitamente:
- `public.handle_new_user`
- `public.handle_updated_at`
- `public.generate_slug`
- `public.set_group_slug`

### 2. Proteção de senha vazada desativada

A proteção contra vazamento de senhas está temporariamente desativada.

## Como Corrigir

### Passo 1: Executar o Script SQL de Correção

1. Acesse o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Abra o arquivo `supabase/fix_security_warnings.sql`
4. Copie todo o conteúdo
5. Cole no SQL Editor
6. Clique em **Run** para executar

### Passo 2: Ativar Proteção de Senha Vazada

1. No **Supabase Dashboard**, vá para **Authentication** → **Settings**
2. Procure pela seção **Password Protection** ou **Leaked Password Protection**
3. Ative a opção **"Enable leaked password protection"** ou similar
4. Salve as alterações

**Nota:** Se a opção não estiver disponível na interface, você pode ativá-la via SQL:

```sql
-- Ativar proteção de senha vazada (se disponível via configuração)
-- Nota: Esta configuração pode variar dependendo da versão do Supabase
-- Verifique a documentação oficial do Supabase para o comando exato
```

## Verificação

Após executar as correções:

1. Acesse **Security Advisor** no Supabase Dashboard
2. Verifique se os avisos foram resolvidos
3. Os avisos de "Caminho de busca de função mutável" devem desaparecer
4. O aviso de "Proteção de senha vazada desativada" deve desaparecer após ativar a proteção

## Explicação Técnica

### Por que definir `search_path = ''`?

Quando uma função usa `SECURITY DEFINER`, ela executa com os privilégios do criador da função. Se o `search_path` não estiver definido, um atacante poderia potencialmente manipular o `search_path` da sessão para fazer a função executar código malicioso de um schema diferente.

Ao definir `SET search_path = ''`, garantimos que:
- A função sempre usa referências totalmente qualificadas (com `public.` prefix)
- Não há risco de injeção via manipulação do search_path
- A função é mais segura e previsível

### Funções Criadas/Corrigidas

1. **`handle_new_user()`**: Cria perfil automaticamente quando um usuário se registra
2. **`handle_updated_at()`**: Atualiza o campo `updated_at` automaticamente
3. **`generate_slug()`**: Gera slugs amigáveis a partir de texto
4. **`set_group_slug()`**: Define o slug de grupos automaticamente (se usado como trigger)

## Troubleshooting

### Erro ao executar o script

Se você receber erros ao executar o script:

1. Verifique se as funções existem no banco de dados
2. Se `generate_slug` ou `set_group_slug` não existirem, o script as criará automaticamente
3. Se houver conflitos, você pode precisar fazer `DROP FUNCTION` antes de criar novamente

### Função não encontrada

Se o Supabase ainda reportar avisos sobre funções que não existem no código:

1. Essas funções podem ter sido criadas diretamente no Supabase Dashboard
2. Execute o script de correção mesmo assim - ele criará/corrigirá as funções
3. Se não precisar de uma função específica, você pode removê-la:

```sql
DROP FUNCTION IF EXISTS public.nome_da_funcao;
```








