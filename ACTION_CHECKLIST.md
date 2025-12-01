# ✅ Receipt Setup Action Checklist

Follow these steps in order to get receipt generation working.

## Step 1: Run Database Migration ⏱️ 2 minutes

1. Go to: https://supabase.com/dashboard/project/tupesyzjyvjzpibbxyyh
2. Click **Database** → **Migrations**
3. Click **New Migration**
4. Name it: `add_receipt_fields`
5. Open file: `supabase/migrations/20250117000000_add_receipt_fields.sql`
6. Copy ALL the contents
7. Paste into the migration editor
8. Click **Run migration**

✅ **Check**: You should see success message

---

## Step 2: Create Storage Bucket ⏱️ 3 minutes

1. In Supabase Dashboard, go to **Storage**
2. Click **New bucket**
3. Name: `receipts` (exactly this name)
4. **Important**: Set to **Private** (not public)
5. Click **Create bucket**

### Add Storage Policy:

1. Click on the `receipts` bucket you just created
2. Go to **Policies** tab
3. Click **New Policy** → **For full customization**
4. Name: `Users can read own receipts`
5. Policy definition:
```sql
bucket_id = 'receipts'
```
6. Allowed operation: **SELECT**
7. Target roles: **authenticated**
8. Click **Review** → **Save policy**

✅ **Check**: Bucket exists and has a policy

---

## Step 3: Deploy Edge Functions ⏱️ 5 minutes

### Option A: Using Supabase Dashboard (Easiest)

1. Go to **Edge Functions** in dashboard
2. Click **Create function**

#### Deploy `shopify-webhook`:
1. Name: `shopify-webhook`
2. Open file: `supabase/functions/shopify-webhook/index.ts`
3. Copy ALL contents
4. Paste into function editor
5. Click **Deploy**

#### Deploy `generate-receipt`:
1. Click **Create function** again
2. Name: `generate-receipt`
3. Open file: `supabase/functions/generate-receipt/index.ts`
4. Copy ALL contents
5. Paste into function editor
6. Click **Deploy**

✅ **Check**: Both functions show as "Active"

### Option B: Using CLI (If you have it installed)

```bash
# Login
supabase login

# Link project
supabase link --project-ref tupesyzjyvjzpibbxyyh

# Deploy functions
supabase functions deploy shopify-webhook
supabase functions deploy generate-receipt
```

---

## Step 4: Get Webhook URL ⏱️ 1 minute

After deploying `shopify-webhook` function:

1. In Supabase Dashboard → **Edge Functions**
2. Click on `shopify-webhook` function
3. Copy the **Function URL**
   - Should look like: `https://tupesyzjyvjzpibbxyyh.supabase.co/functions/v1/shopify-webhook`
4. **Save this URL** - you'll need it for Step 5

✅ **Check**: You have the webhook URL copied

---

## Step 5: Configure Shopify Webhook ⏱️ 3 minutes

1. Go to Shopify Admin: https://admin.shopify.com
2. Navigate to **Settings** → **Notifications** → **Webhooks**
3. Click **Create webhook**
4. Configure:
   - **Event**: Select "Order payment" (or "Order creation")
   - **Format**: JSON
   - **URL**: Paste the URL from Step 4
   - **API version**: Latest
5. Click **Save webhook**

✅ **Check**: Webhook appears in your webhooks list

---

## Step 6: Set Environment Variables (Optional) ⏱️ 2 minutes

1. In Supabase Dashboard → **Project Settings** → **Edge Functions** → **Secrets**
2. Add secret (optional but recommended):
   - **Name**: `SHOPIFY_WEBHOOK_SECRET`
   - **Value**: (Leave empty for now, or get from Shopify if available)

**Note**: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are usually auto-set, but verify they exist.

✅ **Check**: Secrets are set (or at least verified)

---

## Step 7: Test It! ⏱️ 5 minutes

1. **Make a test donation**:
   - Go to your Shopify store
   - Add a product to cart
   - Complete checkout (use test mode if available)

2. **Check Supabase**:
   - Go to **Database** → **Table Editor** → **donations**
   - Find your test donation
   - Verify:
     - `shopify_order_id` is populated
     - `receipt_url` is populated (may take a few seconds)
     - `receipt_generated_at` has a timestamp

3. **Check Storage**:
   - Go to **Storage** → **receipts** bucket
   - Verify PDF file exists

4. **Test Download**:
   - Log into your app's Donor Dashboard
   - Find your donation
   - Click **"Download Receipt"**
   - Verify PDF downloads correctly

✅ **Check**: Receipt downloads as a proper PDF

---

## Troubleshooting

### If webhook doesn't work:
- Check Shopify webhook delivery logs (click on webhook → View deliveries)
- Check Supabase Edge Function logs (Dashboard → Edge Functions → Logs)
- Verify webhook URL is correct

### If receipt doesn't generate:
- Check Edge Function logs for errors
- Verify storage bucket exists and is named `receipts`
- Check that `generate-receipt` function is deployed
- Make sure donation record was created

### If receipt doesn't download:
- Check storage bucket policy allows authenticated reads
- Verify `receipt_url` is populated in donations table
- Try opening receipt URL directly in browser (while logged in)

---

## Quick Reference

- **Supabase Dashboard**: https://supabase.com/dashboard/project/tupesyzjyvjzpibbxyyh
- **Shopify Admin**: https://admin.shopify.com
- **Project ID**: `tupesyzjyvjzpibbxyyh`

---

## What's Next After Setup?

1. Customize receipt template (edit `generate-receipt/index.ts`)
2. Update tax ID in receipt (currently: `12-3456789`)
3. Add your logo (if you want)
4. Test with real donations
5. Monitor Edge Function logs for any issues

---

## Summary

✅ Run migration  
✅ Create storage bucket  
✅ Deploy functions  
✅ Configure Shopify webhook  
✅ Test the flow  

**Total time**: ~15-20 minutes

Once done, receipts will automatically generate for every donation!

