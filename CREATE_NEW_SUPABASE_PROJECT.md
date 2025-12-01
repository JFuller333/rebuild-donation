# Create New Supabase Project - Step by Step

## Step 1: Create Supabase Account & Project

1. **Go to Supabase**: https://supabase.com
2. **Sign Up / Sign In**
   - Click "Start your project"
   - Sign in with GitHub, Google, or email
3. **Create New Project**
   - Click "New Project"
   - Fill in:
     - **Name**: `rebuild-together` (or any name you want)
     - **Database Password**: Create a strong password (SAVE THIS!)
     - **Region**: Choose closest to you (e.g., US East)
   - Click "Create new project"
   - Wait 2-3 minutes for setup

## Step 2: Get Your Project Credentials

Once the project is created:

1. **Go to Project Settings**
   - Click the gear icon (⚙️) in left sidebar
   - Click "API" in the settings menu

2. **Copy These Values**:
   - **Project URL**: Looks like `https://xxxxx.supabase.co`
   - **Project ID**: The part before `.supabase.co` (e.g., `abcdefghijklmnop`)
   - **anon/public key**: The `anon` `public` key (starts with `eyJ...`)
   - **service_role key**: The `service_role` `secret` key (starts with `eyJ...`) - KEEP THIS SECRET!

## Step 3: Update Your Environment Variables

1. **Find your `.env` file** in the project root
2. **Update these values**:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR-ANON-KEY
VITE_SUPABASE_PROJECT_ID=YOUR-PROJECT-ID
```

3. **Save the file**

## Step 4: Run Database Migrations

Now you need to create all the database tables:

1. **In Supabase Dashboard** → Click "SQL Editor" → "New Query"

2. **Run Migration 1: User Roles**
   - Open file: `supabase/migrations/20251113063120_62d26e32-22ed-4faa-bd4e-7e9a8af17688.sql`
   - Copy ALL the contents
   - Paste into SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - Should see "Success. No rows returned"

3. **Run Migration 2: Project Updates**
   - Open file: `supabase/migrations/20250115000000_add_project_updates.sql`
   - Copy ALL the contents
   - Paste into SQL Editor
   - Click "Run"
   - Should see "Success. No rows returned"

4. **Run Migration 3: Dynamic Features**
   - Open file: `supabase/migrations/20250116000000_add_project_dynamic_features.sql`
   - Copy ALL the contents
   - Paste into SQL Editor
   - Click "Run"
   - Should see "Success. No rows returned"

5. **Run Migration 4: Receipt Fields**
   - Open file: `supabase/migrations/20250117000000_add_receipt_fields.sql`
   - Copy ALL the contents
   - Paste into SQL Editor
   - Click "Run"
   - Should see "Success. No rows returned"

## Step 5: Verify Tables Were Created

1. **Go to Table Editor** in Supabase Dashboard
2. **You should see these tables**:
   - ✅ `profiles`
   - ✅ `projects`
   - ✅ `donations`
   - ✅ `user_roles`
   - ✅ `project_updates`
   - ✅ `project_progress_gallery`
   - ✅ `project_impact_items`
   - ✅ `project_team_members`
   - ✅ `project_partners`
   - ✅ `tax_receipts`

## Step 6: Create Storage Bucket for Receipts

1. **Go to Storage** in Supabase Dashboard
2. **Click "Create bucket"**
3. **Name**: `receipts`
4. **Public**: Unchecked (private)
5. **Click "Create bucket"**

## Step 7: Create Your First Admin User

1. **Sign up in your app** (or use existing account)
2. **Go to Supabase Dashboard** → Table Editor → `user_roles`
3. **Click "Insert row"**
4. **Fill in**:
   - `user_id`: Your user ID (from `profiles` table or `auth.users`)
   - `role`: `admin`
5. **Save**

## Step 8: Test Your Connection

1. **Restart your dev server** (if running):
   ```bash
   # Stop the server (Ctrl+C)
   # Start it again
   npm run dev
   ```

2. **Go to your app** → Sign in
3. **Try accessing Admin Dashboard** → Should work now!

## Step 9: Update Supabase Edge Functions (If Using Webhooks)

If you're using the Shopify webhook:

1. **Go to Edge Functions** in Supabase Dashboard
2. **Update the secrets**:
   - Go to Settings → Edge Functions → Secrets
   - Add:
     - `SHOPIFY_STORE_DOMAIN` = `rebuild-investor-software.myshopify.com`
     - `SHOPIFY_ADMIN_API_TOKEN` = (your Shopify admin token)
     - `SHOPIFY_WEBHOOK_SECRET` = (your webhook secret, if you have one)

## Troubleshooting

### "Table doesn't exist" errors
- Make sure you ran ALL migrations
- Check Table Editor to verify tables exist

### "Permission denied" errors
- Check RLS policies were created (they're in the migrations)
- Make sure you're signed in

### Can't connect to Supabase
- Double-check your `.env` file has correct values
- Make sure you restarted your dev server after updating `.env`

## Next Steps

After setup:
1. Create some test projects in the `projects` table
2. Link them to Shopify products (set `shopify_product_handle`)
3. Test the donor dashboard
4. Test the admin dashboard

