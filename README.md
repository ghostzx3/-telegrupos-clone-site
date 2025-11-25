# Telegrupos Clone

A complete full-stack clone of telegrupos.com.br - a Brazilian Telegram groups directory platform.

## Features

✅ **Full-Stack Platform**
- 🗄️ **Supabase Database** - Real-time PostgreSQL database
- 🔐 **Authentication** - User registration and login with Supabase Auth
- 💳 **Stripe Payments** - Premium group listings and boosts
- 👨‍💼 **Admin Dashboard** - Approve, reject, and moderate groups
- 🔍 **Advanced Search** - Real-time search and filtering
- 📊 **Smart Sorting** - By date, popularity, or member count
- 📱 **Responsive Design** - Works on all devices

✅ **User Features**
- Submit Telegram groups for approval
- Upgrade groups to premium
- Featured listings for maximum visibility
- Quick boost options for promotions
- User profiles and favorites (expandable)

✅ **Admin Features**
- Review pending submissions
- Approve or reject groups
- Delete inappropriate content
- View submission details and user info
- Manage all groups from one dashboard

## Backend Architecture

### Database (Supabase)

The app uses PostgreSQL with these main tables:

- **profiles** - User accounts (extends Supabase auth)
- **categories** - Group categories
- **groups** - Telegram groups with status (pending/approved/rejected)
- **payments** - Stripe payment records
- **favorites** - User favorites (future feature)

### Authentication

- Email/password signup and login
- Email verification
- **Password recovery via email** (sem exigir senha atual)
- Session management
- Admin role system

**📖 [Documentação Completa do Sistema de Recuperação de Senha](./SISTEMA_RECUPERACAO_SENHA.md)**

### Payments (PushInPay - PIX)

Three upgrade plans via PIX:
- **Premium** - Badge and better positioning (R$19.99-119.99)
- **Featured** - Top of page placement (R$29.99-79.99)
- **Boost** - Quick visibility boost (R$9.99-24.99)

**PIX Features:**
- QR Code para escanear
- Código copia e cola
- Aprovação instantânea
- Timer de expiração (1 hora)
- Verificação automática de pagamento

### API Routes

- `GET /api/groups` - Fetch groups with filters
- `POST /api/groups` - Submit new group
- `GET /api/categories` - Fetch categories
- `GET /api/admin/groups` - Admin: View all groups
- `POST /api/admin/groups/[id]/approve` - Admin: Approve group
- `POST /api/payments/create-intent` - Create Stripe payment
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

## Managing Content

### Adding/Editing Groups (Now via Database!)

Groups are now stored in Supabase. To add groups:

1. **Via UI**: Users submit through the "+ Enviar grupo" form
2. **Via Admin**: Approve submissions in `/admin` dashboard
3. **Via Database**: Insert directly in Supabase Table Editor

Old JSON method (`src/data/groups.json`) is deprecated.

```json
{
  "groups": [
    {
      "id": 1,
      "title": "Your Group Name",
      "category": "apostas",
      "image": "https://your-image-url.com/image.jpg",
      "isPremium": true,
      "link": "https://t.me/yourgroup"
    }
  ]
}
```

**Group Properties:**
- `id` - Unique number for each group
- `title` - Group name
- `category` - Must match a category ID from categories array
- `image` - Full URL to group image
- `isPremium` - `true` shows "Plus" badge, `false` hides it
- `link` - Telegram group link

### Adding/Editing Categories

In the same `src/data/groups.json` file, edit the categories array:

```json
{
  "categories": [
    {
      "id": "your-category-id",
      "name": "Category Display Name",
      "color": "#1796a6"
    }
  ]
}
```

**Category Colors:**
- `#1796a6` - Teal (default for most categories)
- `#d97706` - Orange (for special actions like submit/boost)
- `#334155` - Dark gray
- `#78716c` - Gray

### Customizing Colors

Main colors are defined in `src/app/globals.css`:

```css
--primary: 186 74% 37%;  /* Main teal color */
```

To change colors throughout the app, edit this file.

### Customizing Text

**Header:**
Edit `src/components/Header.tsx` - change logo text, search placeholder

**Footer:**
Edit `src/app/page.tsx` - scroll to footer section (~line 165)

**Modals:**
- Login/Register: `src/components/LoginModal.tsx`
- Submit Group: `src/components/SubmitGroupModal.tsx`
- Promotion: `src/components/PromotionModal.tsx`

## Quick Start

### 1. Install Dependencies

```bash
npm install
# ou
bun install
```

### 2. Setup Backend (Required!)

**This app needs Supabase and PushInPay to work.** Follow the detailed setup guides:

📖 **[READ SETUP.md FOR SUPABASE](./SETUP.md)**
💰 **[READ SETUP_PUSHINPAY.md FOR PAYMENTS](./SETUP_PUSHINPAY.md)**

Quick summary:
1. Create Supabase project
2. Run database schema (`supabase/schema.sql`)
3. Create PushInPay account (PIX payments)
4. Configure environment variables
5. Setup webhook (ngrok for development)
6. Start development server

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your credentials
# Required variables:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - NEXT_PUBLIC_APP_URL
```

### 4. Run Development Server

```bash
npm run dev
# ou
bun run dev
```

### 5. Run Tests

```bash
# Run all tests
npm test

# Watch mode (development)
npm run test:watch

# With coverage
npm run test:coverage
```

### 5. Run Stripe Webhook (separate terminal)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Production Build

```bash
# Build for production
npm run build
# ou
bun run build

# Run production build
npm run start
# ou
bun run start
```

## Testing

O projeto inclui testes automatizados usando Jest e Testing Library.

### Executar Testes

```bash
# Todos os testes
npm test

# Modo watch (desenvolvimento)
npm run test:watch

# Com cobertura de código
npm run test:coverage
```

### Cobertura Mínima

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### CI/CD

O projeto inclui GitHub Actions (`.github/workflows/ci.yml`) que executa:
- Linting
- Testes automatizados
- Build de produção
- Verificação de cobertura de código

## Password Recovery System

O sistema de recuperação de senha está totalmente implementado e funcional:

- ✅ Página `/forgot-password` para solicitar reset
- ✅ Página `/reset-password` para definir nova senha
- ✅ Rate limiting (5/hora por IP, 3/hora por email)
- ✅ Validação forte de senha (mínimo 10 caracteres)
- ✅ Logs estruturados
- ✅ Testes automatizados
- ✅ Integração completa com Supabase Auth

**📖 [Documentação Completa](./SISTEMA_RECUPERACAO_SENHA.md)**

## File Structure

```
telegrupos-clone/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main page with grid and pagination
│   │   ├── globals.css       # Global styles and colors
│   │   └── layout.tsx        # App layout
│   ├── components/
│   │   ├── Header.tsx        # Top header with search
│   │   ├── CategorySidebar.tsx   # Left sidebar with categories
│   │   ├── GroupCard.tsx     # Individual group card
│   │   ├── LoginModal.tsx    # Login/register modal
│   │   ├── SubmitGroupModal.tsx  # Submit group modal
│   │   ├── PromotionModal.tsx    # Promotion popup
│   │   └── ui/               # Reusable UI components
│   ├── data/
│   │   └── groups.json       # **MAIN DATA FILE** - Edit this!
│   └── lib/
│       └── utils.ts          # Utility functions
└── package.json
```

## Key Features Explained

### Search Functionality
Type in the search bar to filter groups by name. The search is case-insensitive and works in real-time.

### Category Filtering
Click any category button in the sidebar to filter groups. Click again to clear the filter.

### Pagination
Shows 24 groups per page. Navigation buttons appear automatically when needed.

### Modals
- **Promotion Modal**: Shows 2 seconds after first page load
- **Login Modal**: Click "Entrar / Cadastrar" button
- **Submit Group Modal**: Click "+ Enviar grupo" button

### Responsive Design
The layout adapts to mobile, tablet, and desktop screens automatically.

## Adding More Groups

1. Open `src/data/groups.json`
2. Copy an existing group object
3. Change the `id` to a new unique number
4. Update all other properties
5. Save the file - changes appear immediately in development mode!

## Admin Dashboard

Access at `/admin` (requires admin privileges)

Features:
- View all groups (pending, approved, rejected)
- Approve/reject submissions
- Delete groups
- See submitter information
- Filter by status

To make a user admin:
1. User must sign up first
2. Go to Supabase Table Editor > profiles
3. Find the user and set `is_admin = true`

## Customization Tips

**Change pricing:**
Edit `src/app/api/payments/create-intent/route.ts`:
```typescript
const PRICING = {
  premium: { 7: 1999, 30: 4999, 90: 11999 },
  // Change prices here (in cents)
}
```

**Add new categories:**
Insert into Supabase categories table:
```sql
INSERT INTO categories (name, slug, color)
VALUES ('New Category', 'new-category', '#1796a6');
```

**Change the logo:**
Edit `src/components/Header.tsx` and replace the SVG

**Modify items per page:**
Change `ITEMS_PER_PAGE` in `src/app/page.tsx`

**Customize colors:**
Edit `src/app/globals.css`:
```css
--primary: 186 74% 37%; /* Main color */
```

**Disable promotion modal:**
Remove the useEffect in `src/app/page.tsx` that shows PromotionModal

## Support

For issues or questions, check the code comments or modify the components directly. All files are well-organized and commented for easy understanding.

---

**Built with:** Next.js 15, React 18, shadcn/ui, Tailwind CSS, TypeScript

**License:** Free to use and modify
