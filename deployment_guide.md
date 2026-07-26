# Vercel Deployment Guide — Medical Store ERP

Follow this guide to deploy the pharmacy application to Vercel (free tier) and connect it securely to your Supabase project.

---

## Prerequisites

1. A **GitHub** repository containing this codebase.
2. A **Vercel** account (free Hobby tier).
3. A **Supabase** account with an initialized project database.

---

## Step 1: Push Codebase to GitHub

Initialize git and push your project to a new private GitHub repository:
```bash
git init
git add .
git commit -m "feat: complete POS billing, visual design system, and storefront"
# Connect to your GitHub repository and push
git remote add origin https://github.com/yourusername/medical-app.git
git branch -M main
git push -u origin main
```

---

## Step 2: Create a Vercel Project

1. Log in to the [Vercel Dashboard](https://vercel.com).
2. Click **Add New** → **Project**.
3. Import your `medical-app` GitHub repository.

---

## Step 3: Configure Environment Variables

Under **Environment Variables** in Vercel, copy and paste the key-value pairs from your `.env.local` or `.env.example` file:

| Variable Name | Description / Example Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (e.g. `https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase project public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase project secret service role key (keep private) |

---

## Step 4: Configure Build Command

1. Vercel automatically detects Next.js configurations.
2. Ensure **Build Command** is set to `next build` (default).
3. Click **Deploy**. Vercel will build the application, compile the TypeScript static routes, and host it on a public `vercel.app` subdomain!

---

## Step 5: Configure Supabase Authentication Redirects

Since you are running production auth on a live URL, you must add the Vercel deployment URL to your Supabase project Redirect URLs:

1. Navigate to the **Supabase Dashboard** → **Authentication** → **URL Configuration**.
2. Under **Redirect URLs**, add your Vercel project URL:
   - `https://your-project-name.vercel.app/**`
   - `https://your-project-name.vercel.app/auth/callback`
3. Click **Save**.

---

## Step 6: Setup Supabase Database Schema

To apply migrations and seed data in your live Supabase database:
1. Copy the contents of the migration files under `supabase/migrations/` in order:
   - `20260727000000_phase1_schema.sql`
   - `20260727000100_finalize_bill_rpc.sql`
   - `20260727000200_demo_seeds.sql`
2. Go to **Supabase Dashboard** → **SQL Editor** → **New Query**.
3. Paste the code and click **Run**.
