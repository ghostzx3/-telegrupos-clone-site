# 🔧 INSTRUÇÕES DE ATUALIZAÇÃO

## 1. ATUALIZAR GroupCard.tsx

No arquivo `src/components/GroupCard.tsx`, **ALTERE** a função do botão ENTRAR:

**ANTES:**
```tsx
<Button
  onClick={() => window.open(link, '_blank')}
  className="w-full bg-[#038ede] hover:bg-[#0277c7] text-white"
>
  ENTRAR
</Button>
```

**DEPOIS:**
```tsx
<Button
  onClick={() => window.location.href = link}
  className="w-full bg-[#038ede] hover:bg-[#0277c7] text-white"
>
  ENTRAR
</Button>
```

E no `page.tsx` onde você usa o GroupCard, **MUDE** a prop `link`:

**ANTES:**
```tsx
<GroupCard
  key={group.id}
  title={group.title}
  category={group.categories?.slug || ''}
  image={group.image_url || ''}
  isPremium={group.is_premium}
  link={group.telegram_link}  // ❌ ANTES
/>
```

**DEPOIS:**
```tsx
<GroupCard
  key={group.id}
  title={group.title}
  category={group.categories?.slug || ''}
  image={group.image_url || ''}
  isPremium={group.is_premium}
  link={`/grupo/${group.slug}`}  // ✅ DEPOIS
/>
```

---

## 2. ATUALIZAR FOOTER (page.tsx)

No arquivo `src/app/page.tsx`, **LOCALIZE** a seção do footer (cerca da linha 200+):

**ANTES:**
```tsx
<div className="mt-6 flex justify-center gap-4 text-sm text-[#038ede]">
  <a href="#" className="hover:underline">Política de Privacidade</a>
  <span className="text-gray-500">|</span>
  <a href="#" className="hover:underline">Termos de Uso</a>
  <span className="text-gray-500">|</span>
  <a href="#" className="hover:underline">DMCA</a>
  <span className="text-gray-500">|</span>
  <a href="#" className="hover:underline">Contato</a>
</div>
```

**DEPOIS:**
```tsx
<div className="mt-6 flex justify-center gap-4 text-sm text-[#038ede]">
  <a href="#" className="hover:underline">Política de Privacidade</a>
  <span className="text-gray-500">|</span>
  <a href="#" className="hover:underline">Termos de Uso</a>
  <span className="text-gray-500">|</span>
  <a href="#" className="hover:underline">DMCA</a>
  <span className="text-gray-500">|</span>
  <a href="#" className="hover:underline">Remoção de Links</a>
  <span className="text-gray-500">|</span>
  <Link href="/blog" className="hover:underline">Blog</Link>
  <span className="text-gray-500">|</span>
  <a href="#" className="hover:underline">Contato</a>
</div>
```

**IMPORTANTE:** Adicione o import do Link no topo do arquivo:
```tsx
import Link from "next/link";
```

---

## 3. CRIAR SUPABASE FUNCTION PARA SERVER COMPONENTS

Crie o arquivo `src/lib/supabase/server.ts` se não existir:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ignore errors in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Ignore errors in Server Components
          }
        },
      },
    }
  );
}
```

---

## 4. INSTALAR DEPENDÊNCIAS (se necessário)

Se der erro de pacote faltando, instale:

```bash
npm install @supabase/ssr
```

---

## 5. POPULAR DADOS DE EXEMPLO NO SUPABASE

Execute este SQL no Supabase para criar tags de exemplo:

```sql
-- Inserir tags de exemplo
INSERT INTO tags (name, slug) VALUES
  ('Apostas', 'apostas'),
  ('Bitcoin', 'bitcoin'),
  ('Blockchain', 'blockchain'),
  ('Criação de Sites', 'criacao-de-sites'),
  ('Finanças', 'financas'),
  ('Marketing', 'marketing'),
  ('SEO', 'seo'),
  ('Link Building', 'link-building'),
  ('Afiliados', 'afiliados'),
  ('Dropshipping', 'dropshipping')
ON CONFLICT (slug) DO NOTHING;

-- Criar post de blog de exemplo
INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  content,
  image_url,
  meta_title,
  meta_description,
  is_published,
  published_at
) VALUES (
  'Guest post (becklinks)',
  'guest-post-becklinks',
  'O Guest post, uma estratégia crucial de SEO, desempenha um papel significativo na construção de backlinks e na ampliação da autoridade de um site.',
  '<p>O Guest post, uma estratégia crucial de SEO, desempenha um papel significativo na construção de backlinks e na ampliação da autoridade de um site. Ao publicar conteúdo valioso em sites relevantes, os links inseridos não apenas direcionam tráfego, mas também contribuem para a melhoria do Domain Authority (DA) e do Domain Rating (DR).</p>

<p>Esses indicadores são essenciais para avaliar a credibilidade de um domínio aos olhos dos motores de busca. A colaboração por meio de guest posts não apenas fortalece a presença online, mas também estabelece conexões valiosas entre sites, resultando em uma rede sólida de backlinks que impulsionam a visibilidade e a classificação nos resultados de pesquisa.</p>

<p>Publique artigos de qualidade em sites com relevância. Com credibilidade do Telegrupos, publique seu artigo em nossos sites e tenha mais destaque nos resultados de pesquisa.</p>

<p><strong>Entre em nosso canal oficial.</strong></p>',
  'https://example.com/guest-post-image.jpg',
  'Guest post (becklinks) - Blog Telegrupos',
  'Aprenda tudo sobre guest posts e como construir backlinks de qualidade para melhorar o SEO do seu site.',
  true,
  NOW()
);
```

---

## ✅ CHECKLIST FINAL

- [ ] Atualizou GroupCard.tsx para redirecionar para /grupo/[slug]
- [ ] Atualizou page.tsx para passar link correto ao GroupCard
- [ ] Adicionou link "Blog" no footer
- [ ] Criou arquivo server.ts para Supabase
- [ ] Instalou dependências necessárias
- [ ] Executou SQL para criar tags e post de exemplo
- [ ] Testou navegação no site

---

## 🎯 RESULTADO

Após essas alterações, você terá:

1. ✅ Página `/blog` com listagem de posts
2. ✅ Página `/blog/[slug]` para posts individuais
3. ✅ Página `/grupo/[slug]` para grupos individuais
4. ✅ Sistema de tags funcionando
5. ✅ Link discreto para blog no footer
6. ✅ SEO otimizado com meta tags e URLs amigáveis
7. ✅ Contador de visualizações e cliques
8. ✅ Grupos recomendados
9. ✅ Internal linking automático

**TUDO pronto para ranquear no Google!** 🚀
