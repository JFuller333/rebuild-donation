# Run Database Migrations

The errors you're seeing indicate that some database tables haven't been created yet. You need to run the migrations in Supabase.

## Quick Fix: Run Migrations in Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/tupesyzjyvjzpibbxyyh
   - Or go to: https://supabase.com/dashboard → Select your project

2. **Go to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Each Migration File**

   Copy and paste each migration file content into the SQL Editor and run them in this order:

   **Migration 1: User Roles** (if not already run)
   - File: `supabase/migrations/20251113063120_62d26e32-22ed-4faa-bd4e-7e9a8af17688.sql`
   - This creates the `user_roles` table

   **Migration 2: Project Updates**
   - File: `supabase/migrations/20250115000000_add_project_updates.sql`
   - This creates the `project_updates` table

   **Migration 3: Dynamic Features**
   - File: `supabase/migrations/20250116000000_add_project_dynamic_features.sql`
   - This creates tables for progress gallery, impact items, team members, and partners

   **Migration 4: Receipt Fields**
   - File: `supabase/migrations/20250117000000_add_receipt_fields.sql`
   - This adds receipt fields to donations table

4. **Verify Tables Exist**
   - Go to "Table Editor" in Supabase Dashboard
   - You should see these tables:
     - `user_roles`
     - `project_updates`
     - `project_progress_gallery`
     - `project_impact_items`
     - `project_team_members`
     - `project_partners`

## Alternative: Use Supabase CLI (If Installed)

If you have Supabase CLI installed:

```bash
# Make sure you're logged in
supabase login

# Link to your project
supabase link --project-ref tupesyzjyvjzpibbxyyh

# Push all migrations
supabase db push
```

## After Running Migrations

1. **Refresh your app** - The errors should disappear
2. **Create an Admin User** (if needed):
   - Go to Supabase Dashboard → Table Editor → `user_roles`
   - Click "Insert row"
   - Add:
     - `user_id`: Your user ID (from `auth.users` table)
     - `role`: `admin`
   - Save

3. **Test the Admin Dashboard** - It should now load without errors

## Troubleshooting

If you still see errors after running migrations:

1. **Check RLS Policies**: Make sure RLS policies are created correctly
2. **Check User Permissions**: Make sure your user has the correct role
3. **Check Console**: Look at the browser console for specific error messages

