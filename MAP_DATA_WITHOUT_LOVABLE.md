# Map Shopify Data to Donor Dashboard (Without Lovable Access)

Since Lovable is down, here's how to check and fix the data mapping using your app directly.

## Step 1: Check Current Status (No Login Required)

1. **Start your app** (if not running):
   ```bash
   npm run dev
   ```

2. **Open Diagnostics Page**:
   - Go to: `http://localhost:5173/diagnostics`
   - This will show you:
     - ✅ All donations from Shopify orders
     - ✅ Which products are linked to projects
     - ✅ What's missing or broken

3. **Look for these issues**:
   - ❌ Donations with `shopify_product_handle` but no `project_id` → Product not linked to project
   - ❌ Projects without `shopify_product_handle` → Need to link them
   - ❌ Donations missing `shopify_order_id` → Webhook didn't process

---

## Step 2: Link Products to Projects (Using Admin Dashboard)

If you can log into your app as admin:

1. **Log into your app**
   - Go to: `http://localhost:5173/auth`
   - Sign in with your admin account

2. **Go to Admin Dashboard**
   - Click "Admin" button in header
   - Or go to: `http://localhost:5173/admin-dashboard`

3. **Link Products to Projects**:
   - Scroll to "All Projects" section
   - Find a project that needs linking
   - Click the edit button (pencil icon)
   - Find "Shopify Product Handle" field
   - Enter the product handle (see below how to find it)
   - Save

4. **How to Find Product Handles**:
   - Go to your Shopify store
   - Click on a product
   - Look at the URL: `/products/maple-street-housing`
   - The handle is: `maple-street-housing`
   - Or check your app's product pages - the URL shows the handle

---

## Step 3: Check Donor Dashboard

1. **Log into your app** with the email you used for the test purchase
2. **Go to Donor Dashboard**: `http://localhost:5173/donor-dashboard`
3. **Check if your donation appears**:
   - If YES → Everything is working! ✅
   - If NO → Continue to Step 4

---

## Step 4: Manual Check via App (If Needed)

If diagnostics shows issues, you can check the data directly:

### Check Donations Table

The diagnostics page already shows this, but you can also:

1. Go to Admin Dashboard
2. Look at the projects list
3. Check if donations are being created

### Check if Webhook Processed

The diagnostics page will show:
- Donations with `shopify_order_id` → Webhook worked ✅
- Donations without `shopify_order_id` → Webhook didn't process ❌

---

## Step 5: Fix Common Issues

### Issue: "Product not linked to project"

**Fix**:
1. Find the product handle from Shopify (check product URL)
2. Go to Admin Dashboard → Edit Project
3. Set "Shopify Product Handle" to match exactly
4. Save

### Issue: "Donation exists but not showing in dashboard"

**Check**:
1. Make sure you're logged in with the SAME email used for purchase
2. Check diagnostics page - does donation have `donor_id`?
3. If `donor_id` is null, the webhook couldn't match the email

### Issue: "No donations at all"

**Possible causes**:
1. Webhook not configured in Shopify
2. Webhook URL incorrect
3. Webhook function not deployed
4. Admin API credentials not set

**Quick check**:
- Go to diagnostics page
- If it shows 0 donations, the webhook hasn't processed any orders yet

---

## Quick Reference

**Your App URLs**:
- Diagnostics: `http://localhost:5173/diagnostics`
- Admin Dashboard: `http://localhost:5173/admin-dashboard`
- Donor Dashboard: `http://localhost:5173/donor-dashboard`

**What to Check**:
1. Diagnostics page → See all issues
2. Admin Dashboard → Link products to projects
3. Donor Dashboard → Verify donations appear

---

## If You Still Can't Access

If you can't log into the app either, you can:

1. **Check Shopify Orders**:
   - Go to Shopify Admin → Orders
   - Find your test order
   - Note the order number and product

2. **Wait for Lovable to Come Back**:
   - Once Lovable is back, use the diagnostics page
   - Or access Supabase directly through Lovable

3. **Check Webhook Logs** (when Lovable is back):
   - Supabase Dashboard → Edge Functions → shopify-webhook → Logs
   - See if webhook was called and any errors

---

## Next Steps After Lovable is Back

1. ✅ Check diagnostics page
2. ✅ Link any unlinked products
3. ✅ Verify donations appear in donor dashboard
4. ✅ Set up Admin API credentials if not done
5. ✅ Test with a new purchase

