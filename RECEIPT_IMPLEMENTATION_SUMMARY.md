# Receipt Generation Implementation Summary

## ✅ What's Been Implemented

### 1. Database Schema
- **Migration file**: `supabase/migrations/20250117000000_add_receipt_fields.sql`
- Added fields to `donations` table:
  - `shopify_order_id` - Links donation to Shopify order
  - `shopify_order_name` - Order name/number
  - `receipt_url` - URL to stored PDF receipt
  - `receipt_generated_at` - Timestamp when receipt was created
- Added indexes for faster lookups

### 2. Supabase Edge Functions

#### `shopify-webhook` Function
- **Location**: `supabase/functions/shopify-webhook/index.ts`
- **Purpose**: Receives Shopify order webhooks
- **What it does**:
  - Validates webhook signature
  - Creates donation records from Shopify orders
  - Links orders to projects via product handles
  - Triggers receipt generation
  - Updates donation with receipt URL

#### `generate-receipt` Function
- **Location**: `supabase/functions/generate-receipt/index.ts`
- **Purpose**: Generates PDF receipts
- **What it does**:
  - Creates receipt PDF from donation data
  - Uploads PDF to Supabase Storage
  - Returns receipt URL
- **Note**: Currently uses HTML template. For production, you'll need to convert to actual PDF (see setup guide)

### 3. Donor Dashboard Updates
- **File**: `src/pages/DonorDashboard.tsx`
- **Added**:
  - "Download Receipt" button for each donation
  - Status indicators (processing, available soon)
  - Opens receipt in new tab when clicked

## 📋 Setup Checklist

### Required Steps:

1. **Run Database Migration**
   ```bash
   # In Supabase Dashboard: Database → Migrations
   # Or use Supabase CLI: supabase db push
   ```

2. **Create Storage Bucket**
   - Go to Supabase Dashboard → Storage
   - Create bucket: `receipts`
   - Set to **Private**
   - Add RLS policy (see RECEIPT_SETUP.md)

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy shopify-webhook
   supabase functions deploy generate-receipt
   ```

4. **Set Environment Variables**
   - In Supabase Dashboard → Edge Functions → Secrets
   - Add: `SHOPIFY_WEBHOOK_SECRET` (optional but recommended)

5. **Configure Shopify Webhook**
   - Shopify Admin → Settings → Notifications → Webhooks
   - Event: "Order payment"
   - URL: `https://your-project.supabase.co/functions/v1/shopify-webhook`

6. **Update PDF Generation** (Important!)
   - Current implementation uses HTML
   - For production, integrate a PDF service or library
   - See RECEIPT_SETUP.md for options

## 🔄 How It Works

```
User completes Shopify checkout
    ↓
Shopify sends webhook to shopify-webhook function
    ↓
Function creates donation record in Supabase
    ↓
Function calls generate-receipt function
    ↓
Receipt PDF generated and stored in Supabase Storage
    ↓
Donation record updated with receipt_url
    ↓
User logs into Donor Dashboard
    ↓
Sees "Download Receipt" button
    ↓
Clicks to download PDF
```

## 🎨 Receipt Template

The receipt includes:
- Organization name: "Rebuild Together"
- Tax ID: 12-3456789 (update this!)
- Receipt number
- Donation date
- Donor information
- Donation amount
- Project name
- Tax-deductible disclaimer

**Customize**: Edit HTML template in `supabase/functions/generate-receipt/index.ts`

## ⚠️ Important Notes

1. **PDF Generation**: The current implementation returns HTML. You need to:
   - Use a PDF service (PDFShift, HTMLPDF, etc.)
   - Or set up Puppeteer in a separate service
   - Or use a Deno-compatible PDF library

2. **TypeScript Types**: After running the migration, regenerate Supabase types:
   ```bash
   supabase gen types typescript --project-id your-project-id > src/integrations/supabase/types.ts
   ```

3. **Webhook Security**: In production, always verify webhook signatures

4. **Storage Permissions**: Ensure receipts bucket has proper RLS policies

5. **Testing**: Test with a real Shopify order to verify the full flow

## 🚀 Next Steps

1. Run the database migration
2. Set up Supabase Storage bucket
3. Deploy Edge Functions
4. Configure Shopify webhook
5. Implement proper PDF generation (replace HTML with PDF)
6. Test with a real donation
7. Customize receipt template with your branding
8. Update tax ID in receipt template

## 📚 Files Created/Modified

### New Files:
- `supabase/migrations/20250117000000_add_receipt_fields.sql`
- `supabase/functions/shopify-webhook/index.ts`
- `supabase/functions/generate-receipt/index.ts`
- `RECEIPT_SETUP.md`
- `RECEIPT_IMPLEMENTATION_SUMMARY.md`

### Modified Files:
- `src/pages/DonorDashboard.tsx` - Added receipt download functionality

## 🔍 Testing

To test the receipt generation:
1. Make a test donation through Shopify
2. Check Supabase Dashboard → Database → donations
3. Verify `receipt_url` is populated
4. Check Storage → receipts bucket for PDF
5. Log into Donor Dashboard and click "Download Receipt"

## 💡 Tips

- Start with test mode (disable webhook signature verification)
- Monitor Edge Function logs in Supabase Dashboard
- Use Shopify's webhook delivery logs to debug
- Test receipt download with different browsers
- Consider adding receipt email notifications (optional)

