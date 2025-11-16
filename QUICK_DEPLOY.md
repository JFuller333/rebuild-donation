# Quick Deployment Checklist

## ✅ Your Checkout is Already Working!

Your app uses Shopify's Storefront API, so **checkout works automatically**. When users click "Proceed to Checkout" in the cart, they're redirected to Shopify's hosted checkout page.

## 🚀 Deploy in 3 Steps

### 1. Choose a Hosting Platform

**Option A: Vercel (Easiest)**
- Go to [vercel.com](https://vercel.com)
- Click "Import Project" → Connect your GitHub repo
- Vercel auto-detects Vite and configures it

**Option B: Netlify**
- Go to [netlify.com](https://netlify.com)
- Drag & drop your `dist` folder after running `npm run build`
- Or connect GitHub for auto-deploy

### 2. Set Environment Variables

In your hosting platform's dashboard, add these:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SHOPIFY_STORE_DOMAIN=rebuild-investor-software.myshopify.com
VITE_SHOPIFY_STOREFRONT_API_TOKEN=f7db27cb7ebb0ecb2cd30968aec66627
VITE_SHOPIFY_STOREFRONT_API_VERSION=2025-01
```

### 3. Deploy & Test

1. **Build locally first** (to catch any errors):
   ```bash
   npm run build
   ```

2. **Deploy** via your platform

3. **Test checkout**:
   - Visit your deployed site
   - Add a product to cart
   - Click "Proceed to Checkout"
   - Should redirect to Shopify checkout ✅

## 📋 Post-Deployment Checklist

- [ ] Run Supabase migrations (if not done already)
- [ ] Test add to cart functionality
- [ ] Test checkout flow
- [ ] Verify admin dashboard works
- [ ] Test product pages load correctly

## 🔧 Managing in Shopify

You **don't need to configure anything special in Shopify** for checkout to work. Your app:
- ✅ Fetches products from Shopify
- ✅ Creates carts via Storefront API
- ✅ Redirects to Shopify checkout automatically
- ✅ Uses Shopify's payment processing

**To manage products:**
- Go to Shopify Admin → Products
- Add/edit products normally
- They'll appear on your site automatically

**To manage dynamic content:**
- Use your Admin Dashboard (the "Admin" button in header)
- Select a product → Manage Updates, Gallery, Impact, Team, Partners

## 🆘 Troubleshooting

**Checkout not working?**
- Check browser console for errors
- Verify `VITE_SHOPIFY_STORE_DOMAIN` is correct (no `https://`)
- Ensure products are published in Shopify

**Products not showing?**
- Verify Storefront API token has read permissions
- Check that products are published
- Verify environment variables are set correctly

**Build fails?**
- Run `npm install` to ensure dependencies are installed
- Check that all environment variables are set
- Review build logs in your hosting platform

## 📚 Full Documentation

See `DEPLOYMENT.md` for detailed instructions.

