# Complete Setup Checklist

## ✅ Everything You Need to Set Up

### 1. Shopify Admin API Setup
- [ ] Created Shopify private app
- [ ] Enabled `read_products` permission
- [ ] Copied Admin API access token
- [ ] Added `SHOPIFY_STORE_DOMAIN` to Supabase secrets
- [ ] Added `SHOPIFY_ADMIN_API_TOKEN` to Supabase secrets
- [ ] Redeployed `shopify-webhook` function

### 2. Link Products to Projects
- [ ] Found product handles for all Shopify products
- [ ] Linked each product to a project in database
- [ ] Verified `shopify_product_handle` matches exactly

### 3. Shopify Webhook Configuration
- [ ] Created webhook in Shopify Admin
- [ ] Set event to "Order payment"
- [ ] Set URL to: `https://tupesyzjyvjzpibbxyyh.supabase.co/functions/v1/shopify-webhook`
- [ ] Verified webhook is active

### 4. Database Setup
- [ ] Migrations have been run (receipt fields, etc.)
- [ ] Storage bucket `receipts` exists
- [ ] RLS policies are set correctly

### 5. Test Everything
- [ ] Made a test purchase with your email
- [ ] Checked Supabase → donations table for the order
- [ ] Verified donation appears in Donor Dashboard
- [ ] Verified receipt is generated (if receipt function is set up)

---

## 📋 Quick Reference

**Your Store**: `rebuild-investor-software.myshopify.com`
**Supabase Project**: `tupesyzjyvjzpibbxyyh`
**Webhook URL**: `https://tupesyzjyvjzpibbxyyh.supabase.co/functions/v1/shopify-webhook`

**Required Supabase Secrets**:
- `SHOPIFY_STORE_DOMAIN` = `rebuild-investor-software.myshopify.com`
- `SHOPIFY_ADMIN_API_TOKEN` = (your token)
- `SUPABASE_URL` = (auto-set)
- `SUPABASE_SERVICE_ROLE_KEY` = (auto-set)

---

## 🎯 What Happens After Setup

1. **Customer makes purchase** → Shopify sends webhook
2. **Webhook finds/creates user** by email in `profiles` table
3. **Webhook fetches product handle** from Shopify Admin API
4. **Webhook finds project** by matching `shopify_product_handle`
5. **Webhook creates donation** record linked to user and project
6. **Receipt is generated** (if receipt function is set up)
7. **Donation appears** in Donor Dashboard automatically

---

## 🚨 Common Issues

**Orders not showing in dashboard**
→ Check that products are linked to projects
→ Check webhook logs in Supabase
→ Verify email matches between order and user account

**"Project not found" error**
→ Product handle doesn't match in database
→ Check for typos in `shopify_product_handle` field

**"Could not fetch product handle" error**
→ Admin API credentials not set correctly
→ Check Supabase secrets

