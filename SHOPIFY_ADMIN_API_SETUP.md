# Shopify Admin API Setup Guide

This guide will help you set up the Shopify Admin API token so that orders can be properly linked to donor accounts.

## Step 1: Get Shopify Admin API Token ⏱️ 5 minutes

### Option A: Create a Private App (Recommended)

1. **Go to Shopify Admin**
   - Navigate to: https://admin.shopify.com
   - Select your store

2. **Create a Private App**
   - Go to **Settings** → **Apps and sales channels**
   - Click **Develop apps** (at the bottom)
   - Click **Create an app**
   - Name it: `Donation Webhook Handler` (or any name you prefer)
   - Click **Create app**

3. **Configure Admin API Access**
   - Click **Configure Admin API scopes**
   - Under **Products**, enable:
     - ✅ `read_products` (to fetch product handles)
   - Under **Orders**, enable:
     - ✅ `read_orders` (if you want to read orders)
   - Click **Save**

4. **Install the App**
   - Click **Install app**
   - Confirm installation

5. **Get the Admin API Access Token**
   - After installation, you'll see **Admin API access token**
   - Click **Reveal token once**
   - **Copy this token** - you'll need it in Step 2
   - ⚠️ **Important**: Save this token securely. You won't be able to see it again!

### Option B: Use Existing App

If you already have a private app:
1. Go to **Settings** → **Apps and sales channels** → **Develop apps**
2. Click on your existing app
3. Go to **API credentials**
4. If token is hidden, you'll need to create a new app (Option A)

---

## Step 2: Add Token to Supabase Edge Functions Secrets ⏱️ 2 minutes

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/tupesyzjyvjzpibbxyyh
   - Or your project dashboard

2. **Navigate to Edge Functions Secrets**
   - Click **Project Settings** (gear icon in sidebar)
   - Click **Edge Functions** in the left menu
   - Click **Secrets** tab

3. **Add Required Secrets**

   Add these secrets (click **Add secret** for each):

   **Secret 1: SHOPIFY_STORE_DOMAIN**
   - **Name**: `SHOPIFY_STORE_DOMAIN`
   - **Value**: Your store domain (e.g., `rebuild-investor-software.myshopify.com`)
     - ⚠️ **Important**: Don't include `https://` - just the domain name

   **Secret 2: SHOPIFY_ADMIN_API_TOKEN**
   - **Name**: `SHOPIFY_ADMIN_API_TOKEN`
   - **Value**: The Admin API access token you copied in Step 1

   **Secret 3: SHOPIFY_WEBHOOK_SECRET** (Optional but recommended)
   - **Name**: `SHOPIFY_WEBHOOK_SECRET`
   - **Value**: (Leave empty for now, or get from Shopify webhook settings)

4. **Verify Existing Secrets**
   - Make sure these exist (they're usually auto-set):
     - ✅ `SUPABASE_URL`
     - ✅ `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 3: Redeploy the Webhook Function ⏱️ 3 minutes

### Option A: Using Supabase Dashboard

1. Go to **Edge Functions** in Supabase Dashboard
2. Find `shopify-webhook` function
3. Click on it to open
4. Click **Deploy** (or **Redeploy** if already deployed)
   - The function will use the new secrets automatically

### Option B: Using CLI

```bash
# Make sure you're in the project directory
cd /Users/jazlynfuller/Desktop/rebuild-kindred-main

# Deploy the updated function
supabase functions deploy shopify-webhook
```

---

## Step 4: Verify Webhook is Configured in Shopify ⏱️ 2 minutes

1. **Go to Shopify Admin**
   - Navigate to: https://admin.shopify.com
   - Go to **Settings** → **Notifications** → **Webhooks**

2. **Check Webhook Exists**
   - You should see a webhook pointing to your Supabase function
   - URL should look like: `https://tupesyzjyvjzpibbxyyh.supabase.co/functions/v1/shopify-webhook`
   - Event should be: **Order payment** or **Order creation**

3. **If Webhook Doesn't Exist, Create It**
   - Click **Create webhook**
   - **Event**: Select "Order payment"
   - **Format**: JSON
   - **URL**: `https://tupesyzjyvjzpibbxyyh.supabase.co/functions/v1/shopify-webhook`
   - Click **Save webhook**

---

## Step 5: Test the Integration ⏱️ 5 minutes

### Test 1: Make a Test Purchase

1. **Go to your store** (or use Shopify's test mode)
2. **Add a product to cart**
3. **Complete checkout** with your email address
4. **Wait 1-2 minutes** for the webhook to process

### Test 2: Check Supabase

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/tupesyzjyvjzpibbxyyh

2. **Check Donations Table**
   - Go to **Database** → **Table Editor** → **donations**
   - Look for your test order
   - Verify:
     - ✅ `shopify_order_id` is populated
     - ✅ `shopify_order_name` is populated (e.g., "#1001")
     - ✅ `shopify_product_handle` is populated
     - ✅ `donor_id` matches your user ID
     - ✅ `amount` is correct

3. **Check Profiles Table**
   - Go to **Database** → **Table Editor** → **profiles**
   - Find your email
   - Verify profile exists and has correct email

### Test 3: Check Donor Dashboard

1. **Log into your app** with the email you used for checkout
2. **Go to Donor Dashboard**
3. **Verify**:
   - ✅ Your donation appears in the list
   - ✅ Amount is correct
   - ✅ Project name is shown
   - ✅ Receipt is available (if receipt generation is working)

---

## Step 6: Check Function Logs (If Issues) ⏱️ 2 minutes

If the donation doesn't appear:

1. **Go to Supabase Dashboard**
   - Navigate to **Edge Functions** → **shopify-webhook**

2. **Check Logs**
   - Click **Logs** tab
   - Look for recent invocations
   - Check for any error messages

3. **Common Issues**:
   - ❌ "Shopify Admin API credentials not set" → Check Step 2
   - ❌ "Project not found for product handle" → Make sure products are linked in `projects` table
   - ❌ "User not found or created" → Check email matching

---

## Troubleshooting

### Issue: "Could not fetch product handle"

**Solution**: 
- Verify `SHOPIFY_STORE_DOMAIN` is correct (no `https://`, just domain)
- Verify `SHOPIFY_ADMIN_API_TOKEN` is correct
- Check that the app has `read_products` permission

### Issue: "Project not found for product handle"

**Solution**:
- Go to **Database** → **Table Editor** → **projects**
- Make sure each project has `shopify_product_handle` set
- The handle should match the Shopify product handle exactly

### Issue: Donation created but not showing in dashboard

**Solution**:
- Check that you're logged in with the same email used for checkout
- Verify `donor_id` in donations table matches your user ID
- Check RLS policies allow you to view your donations

---

## Next Steps

Once everything is working:

1. ✅ New orders will automatically create donation records
2. ✅ Users will see their donations in the Donor Dashboard
3. ✅ Receipts will be generated automatically (if receipt function is set up)

---

## Quick Reference

**Supabase Project**: `tupesyzjyvjzpibbxyyh`
**Webhook URL**: `https://tupesyzjyvjzpibbxyyh.supabase.co/functions/v1/shopify-webhook`

**Required Secrets**:
- `SHOPIFY_STORE_DOMAIN` (e.g., `rebuild-investor-software.myshopify.com`)
- `SHOPIFY_ADMIN_API_TOKEN` (from Shopify private app)
- `SHOPIFY_WEBHOOK_SECRET` (optional)

