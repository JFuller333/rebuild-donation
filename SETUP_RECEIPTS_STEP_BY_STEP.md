# Step-by-Step Receipt Setup Guide

Follow these steps in order to set up automated receipt generation.

## Step 1: Run Database Migration

### Option A: Using Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Database** → **Migrations**
4. Click **New Migration**
5. Name it: `add_receipt_fields`
6. Copy and paste the contents of: `supabase/migrations/20250117000000_add_receipt_fields.sql`
7. Click **Run migration**

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (get project ref from Supabase Dashboard URL)
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Step 2: Create Storage Bucket

1. Go to Supabase Dashboard → **Storage**
2. Click **New bucket**
3. Name: `receipts`
4. **Important**: Set to **Private** (not public)
5. Click **Create bucket**

### Add Storage Policy

1. Go to **Storage** → **Policies** (or click on `receipts` bucket → **Policies**)
2. Click **New Policy**
3. Choose **For full customization**
4. Name: `Users can read own receipts`
5. Policy definition:

```sql
(bucket_id = 'receipts'::text) AND 
(auth.uid()::text = (storage.foldername(name))[1])
```

6. Allowed operation: **SELECT**
7. Target roles: **authenticated**
8. Click **Review** then **Save policy**

**Alternative simpler policy** (if above doesn't work):
```sql
bucket_id = 'receipts'
```

With operation: **SELECT** and target: **authenticated**

## Step 3: Deploy Edge Functions

### Install Supabase CLI (if not installed)

```bash
npm install -g supabase
```

### Login and Link Project

```bash
# Login
supabase login

# Link project (get project ref from Supabase Dashboard URL)
# Example: https://app.supabase.com/project/abcdefghijklmnop
# Your project ref is: abcdefghijklmnop
supabase link --project-ref YOUR_PROJECT_REF
```

### Deploy Functions

```bash
# Navigate to project directory
cd /Users/jazlynfuller/Desktop/rebuild-kindred-main

# Deploy webhook function
supabase functions deploy shopify-webhook

# Deploy receipt generator function
supabase functions deploy generate-receipt
```

After deployment, you'll get URLs like:
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/shopify-webhook`
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-receipt`

**Save these URLs** - you'll need the webhook URL for Step 4!

## Step 4: Set Environment Variables

1. Go to Supabase Dashboard → **Project Settings** → **Edge Functions** → **Secrets**
2. Add these secrets:

**SHOPIFY_WEBHOOK_SECRET** (Optional but recommended)
- Get this from Shopify when creating webhook
- Or leave empty for testing (less secure)

**Note**: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are usually auto-set, but verify they exist.

## Step 5: Configure Shopify Webhook

1. Go to Shopify Admin: https://admin.shopify.com
2. Navigate to **Settings** → **Notifications** → **Webhooks**
3. Click **Create webhook**
4. Configure:
   - **Event**: Select "Order payment" or "Order creation"
   - **Format**: JSON
   - **URL**: Paste your webhook URL from Step 3
     - Example: `https://abcdefghijklmnop.supabase.co/functions/v1/shopify-webhook`
   - **API version**: Latest
5. Click **Save webhook**

### Get Webhook Secret (Optional)

After creating the webhook, Shopify may show a webhook secret. Copy it and add it to Supabase Edge Function secrets as `SHOPIFY_WEBHOOK_SECRET`.

## Step 6: Update PDF Generation (Important!)

The current implementation generates HTML. For production, you need actual PDFs.

### Option A: Use PDF Service (Recommended - Easiest)

1. Sign up for a service like:
   - **PDFShift** (https://pdfshift.io) - Free tier available
   - **HTMLPDF** (https://htmlpdfapi.com)
   - **API2PDF** (https://www.api2pdf.com)

2. Update `supabase/functions/generate-receipt/index.ts`:

Replace the PDF generation section with a call to your PDF service:

```typescript
// Example with PDFShift
const pdfResponse = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${btoa(`api:${PDFSHIFT_API_KEY}`)}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    source: htmlTemplate,
    format: 'Letter',
  }),
});

const pdfBytes = await pdfResponse.arrayBuffer();
```

### Option B: Use Deno PDF Library

Research Deno-compatible PDF libraries and update the generator function.

## Step 7: Test the Flow

1. **Make a test donation**:
   - Go to your Shopify store
   - Add a product to cart
   - Complete checkout with test payment

2. **Check Supabase**:
   - Go to **Database** → **donations** table
   - Find your test donation
   - Verify `receipt_url` is populated
   - Check `receipt_generated_at` timestamp

3. **Check Storage**:
   - Go to **Storage** → **receipts** bucket
   - Verify PDF file exists

4. **Test Download**:
   - Log into your Donor Dashboard
   - Find your donation
   - Click "Download Receipt"
   - Verify PDF downloads correctly

## Step 8: Customize Receipt Template

Edit `supabase/functions/generate-receipt/index.ts`:

1. Update organization name
2. Update tax ID (currently: `12-3456789`)
3. Add logo (if you have one)
4. Customize styling
5. Add any additional information

## Troubleshooting

### Webhook not receiving orders
- Check Shopify webhook delivery logs (Settings → Notifications → Webhooks → Click webhook → View deliveries)
- Verify webhook URL is correct
- Check Supabase Edge Function logs (Dashboard → Edge Functions → Logs)

### Receipts not generating
- Check Edge Function logs in Supabase Dashboard
- Verify storage bucket exists and is named `receipts`
- Check that `generate-receipt` function is deployed
- Verify environment variables are set

### Users can't download receipts
- Check storage bucket policy allows authenticated reads
- Verify `receipt_url` is populated in donations table
- Check that user is authenticated
- Try opening receipt URL directly in browser (while logged in)

### Function deployment errors
- Make sure you're logged in: `supabase login`
- Verify project is linked: `supabase link --project-ref YOUR_REF`
- Check you're in the correct directory
- Review error messages in terminal

## Quick Command Reference

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy functions
supabase functions deploy shopify-webhook
supabase functions deploy generate-receipt

# View function logs
supabase functions logs shopify-webhook
supabase functions logs generate-receipt

# Test function locally (optional)
supabase functions serve shopify-webhook
```

## Need Help?

If you get stuck:
1. Check Supabase Dashboard → Edge Functions → Logs for errors
2. Check Shopify webhook delivery logs
3. Verify all environment variables are set
4. Make sure storage bucket exists and has correct permissions

