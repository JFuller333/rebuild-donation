# Quick Setup Checklist - Shopify Admin API

## ✅ Step-by-Step Checklist

### 1. Get Shopify Admin API Token
- [ ] Go to Shopify Admin → Settings → Apps and sales channels → Develop apps
- [ ] Click "Create an app"
- [ ] Name it "Donation Webhook Handler"
- [ ] Configure Admin API scopes:
  - [ ] Enable `read_products`
  - [ ] Enable `read_orders` (optional)
- [ ] Install the app
- [ ] Copy the Admin API access token
- [ ] Save token securely (you won't see it again!)

### 2. Add Secrets to Supabase
- [ ] Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
- [ ] Add `SHOPIFY_STORE_DOMAIN` = `rebuild-investor-software.myshopify.com`
- [ ] Add `SHOPIFY_ADMIN_API_TOKEN` = (your token from step 1)
- [ ] Verify `SUPABASE_URL` exists
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` exists

### 3. Redeploy Webhook
- [ ] Go to Supabase Dashboard → Edge Functions
- [ ] Find `shopify-webhook` function
- [ ] Click "Redeploy" (or deploy if not deployed)

### 4. Verify Shopify Webhook
- [ ] Go to Shopify Admin → Settings → Notifications → Webhooks
- [ ] Verify webhook exists pointing to: `https://tupesyzjyvjzpibbxyyh.supabase.co/functions/v1/shopify-webhook`
- [ ] If not, create it with event "Order payment"

### 5. Test
- [ ] Make a test purchase with your email
- [ ] Wait 1-2 minutes
- [ ] Check Supabase → Database → donations table
- [ ] Verify donation record exists with:
  - [ ] `shopify_order_id` populated
  - [ ] `shopify_product_handle` populated
  - [ ] `donor_id` matches your user ID
- [ ] Log into Donor Dashboard
- [ ] Verify donation appears

---

## 🚨 Common Issues

**"Could not fetch product handle"**
→ Check secrets are set correctly in Supabase

**"Project not found for product handle"**
→ Make sure `projects` table has `shopify_product_handle` set for each product

**"User not found or created"**
→ Check that email in order matches email in Supabase profiles

---

## 📝 Your Store Info

- **Store Domain**: `rebuild-investor-software.myshopify.com`
- **Supabase Project**: `tupesyzjyvjzpibbxyyh`
- **Webhook URL**: `https://tupesyzjyvjzpibbxyyh.supabase.co/functions/v1/shopify-webhook`

