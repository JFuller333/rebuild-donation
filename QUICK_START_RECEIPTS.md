# Quick Start: Receipt Setup

Your project ID: `tupesyzjyvjzpibbxyyh`

## Option 1: Use Supabase Dashboard (No CLI Needed!)

You can set everything up through the web interface:

### Step 1: Run Migration via Dashboard

1. Go to: https://supabase.com/dashboard/project/tupesyzjyvjzpibbxyyh
2. Click **Database** → **Migrations**
3. Click **New Migration**
4. Name: `add_receipt_fields`
5. Copy contents from: `supabase/migrations/20250117000000_add_receipt_fields.sql`
6. Paste and click **Run migration**

### Step 2: Create Storage Bucket

1. In same dashboard, go to **Storage**
2. Click **New bucket**
3. Name: `receipts`
4. Set to **Private**
5. Click **Create**

Then add policy:
1. Click on `receipts` bucket
2. Go to **Policies** tab
3. Click **New Policy** → **For full customization**
4. Name: `Users can read receipts`
5. Policy:
```sql
bucket_id = 'receipts'
```
6. Operation: **SELECT**
7. Target: **authenticated**
8. Save

### Step 3: Deploy Functions via Dashboard

1. Go to **Edge Functions** in dashboard
2. Click **Create function**
3. Name: `shopify-webhook`
4. Copy contents from: `supabase/functions/shopify-webhook/index.ts`
5. Paste and click **Deploy**

Repeat for `generate-receipt`:
1. Click **Create function** again
2. Name: `generate-receipt`
3. Copy from: `supabase/functions/generate-receipt/index.ts`
4. Deploy

### Step 4: Set Secrets

1. Go to **Project Settings** → **Edge Functions** → **Secrets**
2. Add: `SHOPIFY_WEBHOOK_SECRET` (optional, can leave empty for testing)

### Step 5: Get Function URLs

After deploying, you'll see URLs like:
- `https://tupesyzjyvjzpibbxyyh.supabase.co/functions/v1/shopify-webhook`
- `https://tupesyzjyvjzpibbxyyh.supabase.co/functions/v1/generate-receipt`

**Copy the shopify-webhook URL** for Step 6!

### Step 6: Configure Shopify Webhook

1. Go to Shopify Admin → **Settings** → **Notifications** → **Webhooks**
2. Click **Create webhook**
3. Event: **Order payment**
4. Format: **JSON**
5. URL: Paste your webhook URL from Step 5
6. Save

## Option 2: Install Supabase CLI (For Command Line)

### macOS Installation:

```bash
# Using Homebrew (recommended)
brew install supabase/tap/supabase

# Or download binary
# Visit: https://github.com/supabase/cli/releases
```

### Then:

```bash
# Login
supabase login

# Link project
supabase link --project-ref tupesyzjyvjzpibbxyyh

# Deploy functions
supabase functions deploy shopify-webhook
supabase functions deploy generate-receipt
```

## Next: Update PDF Generation

The receipt generator currently outputs HTML. For production PDFs, you need to:

1. Sign up for a PDF service (PDFShift, HTMLPDF, etc.)
2. Update `generate-receipt/index.ts` to call the service
3. See `SETUP_RECEIPTS_STEP_BY_STEP.md` for details

## Test It

1. Make a test donation in Shopify
2. Check Supabase → Database → donations table
3. Verify receipt_url is populated
4. Check Storage → receipts bucket
5. Log into Donor Dashboard and download receipt

## Need Help?

- Supabase Dashboard: https://supabase.com/dashboard/project/tupesyzjyvjzpibbxyyh
- Check function logs in dashboard
- Review `SETUP_RECEIPTS_STEP_BY_STEP.md` for detailed instructions

