# Deployment Guide for Shopify Headless Storefront

This guide will help you deploy your React + Vite app and connect it to Shopify.

## Prerequisites

- Shopify store with Storefront API access
- Supabase project
- Deployment platform account (Vercel, Netlify, etc.)

## Step 1: Build Your App

First, test the build locally:

```bash
npm run build
```

This creates a `dist/` folder with your production-ready app.

## Step 2: Deploy to a Hosting Platform

### Option A: Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (optional, or use GitHub integration):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   Or connect your GitHub repo at [vercel.com](https://vercel.com)

3. **Configure Environment Variables** in Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add these variables:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
     VITE_SUPABASE_PROJECT_ID=your_project_id
     VITE_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
     VITE_SHOPIFY_STOREFRONT_API_TOKEN=your_storefront_token
     VITE_SHOPIFY_STOREFRONT_API_VERSION=2025-01
     ```

### Option B: Deploy to Netlify

1. **Install Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Create `netlify.toml`** in your project root:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

4. **Set Environment Variables** in Netlify Dashboard:
   - Go to Site settings → Environment variables
   - Add all the same variables as Vercel

## Step 3: Configure Shopify

### Enable Headless Storefront

1. **Go to Shopify Admin** → Settings → Custom storefronts
2. **Add your deployed URL** as a custom storefront
3. **Set as primary storefront** (optional, if you want it to be the main store)

### Alternative: Use Shopify's Storefront API

Your app already uses the Storefront API, so checkout will work automatically. The cart checkout redirects to Shopify's hosted checkout.

## Step 4: Verify Checkout Works

Your checkout is already configured! When users click "Checkout" in the cart:
- They're redirected to `cart.checkoutUrl` from Shopify
- This is Shopify's hosted checkout page
- After payment, they return to your site

**Test the flow:**
1. Add a product to cart
2. Click "Checkout" in the cart sheet
3. You should be redirected to Shopify checkout
4. Complete a test purchase

## Step 5: Set Up Custom Domain (Optional)

1. In your hosting platform, add your custom domain
2. Update Shopify settings to recognize your domain
3. Update CORS settings if needed

## Step 6: Run Database Migrations

Don't forget to run your Supabase migrations:

1. Go to Supabase Dashboard → SQL Editor
2. Run the migration files:
   - `supabase/migrations/20250115000000_add_project_updates.sql`
   - `supabase/migrations/20250116000000_add_project_dynamic_features.sql`

## Environment Variables Reference

Make sure these are set in your deployment platform:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id

# Shopify
VITE_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_API_TOKEN=your_storefront_token
VITE_SHOPIFY_STOREFRONT_API_VERSION=2025-01
```

## Troubleshooting

### Checkout not working?
- Verify `VITE_SHOPIFY_STORE_DOMAIN` is correct (no `https://`)
- Check that Storefront API token has cart permissions
- Ensure products are published in Shopify

### CORS errors?
- Add your deployed URL to Shopify's allowed origins
- Check Supabase RLS policies allow public access where needed

### Build errors?
- Make sure all environment variables are set
- Check that `npm run build` works locally first

## Next Steps

- Set up analytics (Google Analytics, etc.)
- Configure email notifications
- Set up webhooks for order updates (optional)
- Customize the checkout experience (Shopify Plus feature)

