# Backend Setup Guide

This guide will help you set up Supabase (database + auth) and Stripe (payments) for your Telegrupos clone.

## 🗄️ Part 1: Supabase Setup (Database + Authentication)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project
4. Save your project credentials:
   - Project URL
   - Anon/Public key
   - Service role key (keep this secret!)

### Step 2: Run Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Copy the entire contents of `supabase/schema.sql`
3. Paste and click **Run**
4. This creates all tables, policies, and default categories

### Step 3: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

### Step 4: Configure Auth Settings

1. In Supabase dashboard, go to **Authentication > Settings**
2. Enable **Email** provider
3. Set **Site URL** to `http://localhost:3000` (or your domain)
4. Add redirect URLs:
   - `http://localhost:3000`
   - Your production URL when ready

### Step 5: Create First Admin User

1. Sign up through your app
2. Go to Supabase **Table Editor > profiles**
3. Find your user and set `is_admin = true`
4. Now you can access `/admin` dashboard!

---

## 💳 Part 2: Stripe Setup (Payments)

### Step 1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Create an account
3. Stay in **Test Mode** for development

### Step 2: Get API Keys

1. In Stripe Dashboard, go to **Developers > API Keys**
2. Copy your keys:
   - Publishable key (starts with `pk_test_`)
   - Secret key (starts with `sk_test_`)

3. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   ```

### Step 3: Setup Webhook (Important!)

Webhooks let Stripe notify your app when payments succeed.

**For Local Development:**

1. Install Stripe CLI: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Copy the webhook secret (starts with `whsec_`) and add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

**For Production:**

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Enter your URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events: `payment_intent.succeeded`
5. Copy the signing secret and add to production environment variables

### Step 4: Configure Pricing (Optional)

Edit `src/app/api/payments/create-intent/route.ts` to customize pricing:

```typescript
const PRICING = {
  premium: {
    7: 1999,   // R$ 19.99 for 7 days
    30: 4999,  // R$ 49.99 for 30 days
    90: 11999, // R$ 119.99 for 90 days
  },
  featured: {
    7: 2999,   // R$ 29.99 for 7 days
    30: 7999,  // R$ 79.99 for 30 days
  },
  boost: {
    1: 999,    // R$ 9.99 for 1 day
    3: 2499,   // R$ 24.99 for 3 days
  },
}
```

---

## 🚀 Part 3: Running the Application

### Install Dependencies

```bash
bun install
```

### Start Development Server

```bash
bun run dev
```

### Run Stripe Webhook Listener (in separate terminal)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Now your app is running with:
- ✅ Database (Supabase)
- ✅ Authentication (Supabase Auth)
- ✅ Payments (Stripe)
- ✅ Admin Dashboard

---

## 📋 Testing the Features

### Test User Registration

1. Go to `http://localhost:3000`
2. Click "Entrar / Cadastrar"
3. Create an account
4. Check your email for confirmation

### Test Admin Dashboard

1. Make your user an admin (see Step 5 of Supabase setup)
2. Go to `http://localhost:3000/admin`
3. You'll see pending groups to approve

### Test Group Submission

1. Login to the app
2. Click "+ Enviar grupo"
3. Fill in the form
4. Submit
5. Check admin dashboard to approve it

### Test Payments (Test Mode)

1. Use Stripe test cards: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)
2. Card number: `4242 4242 4242 4242`
3. Expiry: Any future date
4. CVC: Any 3 digits
5. ZIP: Any 5 digits

---

## 🔧 Troubleshooting

### "Module not found: @supabase/..."

Run: `bun install`

### "Invalid API key" error

Check your `.env.local` file has correct Supabase keys

### Webhook not working

Make sure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Can't access admin dashboard

1. Check if your user has `is_admin = true` in profiles table
2. Make sure you're logged in

### Payments not updating groups

1. Check Stripe webhook is running
2. Check Stripe webhook secret is correct in `.env.local`
3. Look at server logs for errors

---

## 🎯 Next Steps

After setup is complete:

1. **Customize branding** - Update colors, logo, etc.
2. **Add more categories** - Insert into `categories` table
3. **Configure email templates** - In Supabase Auth settings
4. **Set up production** - Deploy to Vercel/Netlify
5. **Go live** - Switch Stripe to live mode

---

## 📊 Database Schema Overview

**profiles** - User accounts
- Extends Supabase auth.users
- Includes admin flag

**categories** - Group categories
- Pre-populated with default categories
- Customizable colors

**groups** - Telegram groups
- Status: pending → approved/rejected
- Premium and featured flags
- Linked to categories and users

**payments** - Payment records
- Tracks Stripe transactions
- Links to groups and users
- Automatically updates groups on success

**favorites** - User favorites (future feature)
- Many-to-many relationship

---

## 🔐 Security Notes

1. **Never commit `.env.local`** - It's in .gitignore
2. **Use service role key only in API routes** - Never expose to client
3. **Row Level Security is enabled** - Users can only see approved groups
4. **Admins are verified** - All admin routes check is_admin flag

---

## 💰 Stripe Best Practices

1. **Test mode first** - Don't go live until thoroughly tested
2. **Monitor webhooks** - Check Stripe dashboard for webhook status
3. **Handle failed payments** - Add retry logic if needed
4. **Secure webhook endpoint** - Verify signatures (already implemented)

---

## 📧 Support

If you encounter issues:

1. Check this guide first
2. Read error messages in browser console
3. Check server logs (`bun run dev` output)
4. Verify all environment variables are set

For Supabase issues: [https://supabase.com/docs](https://supabase.com/docs)
For Stripe issues: [https://stripe.com/docs](https://stripe.com/docs)

---

**Your app is now a full-stack platform with:**
- Real-time database
- User authentication
- Payment processing
- Admin moderation
- Advanced filtering

Enjoy building! 🎉
