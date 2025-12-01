# Receipt Generation Setup Guide

This guide explains how to set up automated receipt generation for donations.

## Overview

When a user completes a donation through Shopify checkout:
1. Shopify sends a webhook to your Supabase Edge Function
2. The webhook creates a donation record in Supabase
3. A receipt PDF is generated and stored in Supabase Storage
4. Users can download receipts from their Donor Dashboard

## Setup Steps

### 1. Run Database Migration

Run the migration to add receipt fields to the donations table:

```bash
# If using Supabase CLI locally
supabase db push

# Or apply the migration manually in Supabase Dashboard
# Go to: Database → Migrations → New Migration
# Copy contents of: supabase/migrations/20250117000000_add_receipt_fields.sql
```

### 2. Create Supabase Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `receipts`
3. Set bucket to **Private** (receipts should be secure)
4. Add policy to allow authenticated users to read their own receipts:

```sql
-- Policy: Users can read receipts for their own donations
CREATE POLICY "Users can read own receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### 3. Deploy Supabase Edge Functions

Deploy the Edge Functions to handle webhooks and receipt generation:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy shopify-webhook
supabase functions deploy generate-receipt
```

### 4. Set Environment Variables

In Supabase Dashboard → Project Settings → Edge Functions → Secrets:

Add these secrets:
- `SHOPIFY_WEBHOOK_SECRET` - Your Shopify webhook secret (optional but recommended)
- `SUPABASE_URL` - Your Supabase project URL (usually auto-set)
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### 5. Configure Shopify Webhook

1. Go to Shopify Admin → Settings → Notifications → Webhooks
2. Click "Create webhook"
3. Configure:
   - **Event**: Order payment
   - **Format**: JSON
   - **URL**: `https://your-project-ref.supabase.co/functions/v1/shopify-webhook`
   - **API version**: Latest
4. Save the webhook

### 6. Update Receipt Generator (Important)

The current receipt generator uses HTML. For production, you need to convert HTML to PDF. Options:

**Option A: Use a PDF service (Recommended)**
- Use a service like PDFShift, HTMLPDF, or similar
- Update `generate-receipt/index.ts` to call the service

**Option B: Use Puppeteer in a separate service**
- Set up a Node.js service with Puppeteer
- Call it from the Edge Function

**Option C: Use a Deno-compatible PDF library**
- Research Deno-compatible PDF libraries
- Update the generator function

### 7. Test the Flow

1. Make a test donation through Shopify checkout
2. Check Supabase Dashboard → Database → donations table
3. Verify receipt_url is populated
4. Check Supabase Storage → receipts bucket
5. Log into Donor Dashboard and verify receipt download works

## Receipt Template Customization

Edit the HTML template in `supabase/functions/generate-receipt/index.ts` to customize:
- Organization name and logo
- Tax ID number
- Receipt styling
- Additional information

## Troubleshooting

### Webhook not receiving orders
- Check Shopify webhook delivery logs
- Verify webhook URL is correct
- Check Supabase Edge Function logs

### Receipts not generating
- Check Edge Function logs in Supabase Dashboard
- Verify Supabase Storage bucket exists and has correct permissions
- Check that generate-receipt function is deployed

### Users can't download receipts
- Verify storage bucket policy allows authenticated reads
- Check that receipt_url is populated in donations table
- Verify user is authenticated when accessing dashboard

## Security Notes

- Receipts contain sensitive information - keep storage bucket private
- Use signed URLs for receipt downloads (time-limited access)
- Verify webhook signatures in production
- Only allow users to download their own receipts

## Next Steps

1. Customize receipt template with your branding
2. Set up proper PDF generation (replace HTML with PDF)
3. Test with real donations
4. Monitor Edge Function logs for errors

