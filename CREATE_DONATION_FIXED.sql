-- FIXED VERSION: This will find your user ID and create the donation correctly
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/tjoieuiijrtdwdmjkcdo/sql/new

-- Step 1: Find the user ID for jfuller516@gmail.com
-- This shows you what user ID to use
SELECT 
  u.id as auth_user_id,
  u.email,
  p.id as profile_id,
  p.email as profile_email
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'jfuller516@gmail.com';

-- Step 2: Create the donation using the correct user ID
-- Replace YOUR_USER_ID_HERE with the auth_user_id from Step 1
-- OR just run this version that finds it automatically:

INSERT INTO donations (
  donor_id,
  project_id,
  amount,
  shopify_product_handle,
  shopify_order_id,
  shopify_order_name,
  status,
  payment_method,
  transaction_id
)
SELECT 
  u.id as donor_id,  -- This uses the auth.users ID directly
  pr.id as project_id,
  100.00 as amount,  -- ⚠️ UPDATE THIS TO YOUR ACTUAL DONATION AMOUNT
  'investment-tier-1' as shopify_product_handle,
  '6948564140213' as shopify_order_id,
  '#1001' as shopify_order_name,
  'completed' as status,
  'shopify' as payment_method,
  '6948564140213' as transaction_id
FROM auth.users u
CROSS JOIN projects pr
WHERE u.email = 'jfuller516@gmail.com'
  AND pr.shopify_product_handle = 'investment-tier-1'
  AND NOT EXISTS (
    SELECT 1 FROM donations 
    WHERE shopify_order_id = '6948564140213' 
      AND project_id = pr.id
  )
RETURNING 
  id,
  donor_id,
  amount,
  shopify_order_name,
  created_at;

-- Step 3: Verify it was created and you can see it
-- This query should return the donation if RLS allows it
SELECT 
  d.id,
  d.amount,
  d.shopify_order_name,
  d.created_at,
  d.donor_id,
  auth.uid() as current_user_id,
  CASE 
    WHEN d.donor_id = auth.uid() THEN '✅ You can see this donation'
    ELSE '❌ RLS will block this - donor_id mismatch'
  END as visibility_status
FROM donations d
WHERE d.shopify_order_id = '6948564140213';

