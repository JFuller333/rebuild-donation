-- COMPLETE FIX: Run this in Supabase SQL Editor
-- This will:
-- 1. Check if donations exist
-- 2. Show your user ID
-- 3. Create the donation with the correct donor_id
-- 4. Verify RLS policies

-- Step 1: Check current state
SELECT 'Current donations count:' as info, COUNT(*) as count FROM donations;
SELECT 'Your user ID from auth:' as info, id, email FROM auth.users WHERE email = 'jfuller516@gmail.com';
SELECT 'Your profile ID:' as info, id, email FROM profiles WHERE email = 'jfuller516@gmail.com';

-- Step 2: Check RLS policies on donations
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'donations';

-- Step 3: Create donation using auth.uid() (this will work when you're logged in)
-- NOTE: This must be run while you're authenticated in Supabase SQL Editor
-- OR use the service role key

-- First, let's create a function that can bypass RLS for testing
CREATE OR REPLACE FUNCTION create_test_donation(
  p_email TEXT,
  p_amount DECIMAL,
  p_order_id TEXT
)
RETURNS TABLE(
  donation_id UUID,
  donor_id UUID,
  amount DECIMAL,
  created BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_project_id TEXT;
  v_donation_id UUID;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found: %', p_email;
  END IF;

  -- Get project ID
  SELECT id INTO v_project_id FROM projects WHERE shopify_product_handle = 'investment-tier-1';
  
  IF v_project_id IS NULL THEN
    RAISE EXCEPTION 'Project not found for handle: investment-tier-1';
  END IF;

  -- Check if donation exists
  IF EXISTS (
    SELECT 1 FROM donations 
    WHERE shopify_order_id = p_order_id 
      AND project_id = v_project_id
  ) THEN
    SELECT id INTO v_donation_id FROM donations 
    WHERE shopify_order_id = p_order_id AND project_id = v_project_id;
    
    RETURN QUERY SELECT v_donation_id, v_user_id, p_amount, false;
    RETURN;
  END IF;

  -- Create donation
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
  VALUES (
    v_user_id,
    v_project_id,
    p_amount,
    'investment-tier-1',
    p_order_id,
    '#1001',
    'completed',
    'shopify',
    p_order_id
  )
  RETURNING id INTO v_donation_id;

  RETURN QUERY SELECT v_donation_id, v_user_id, p_amount, true;
END;
$$;

-- Step 4: Call the function to create the donation
-- This bypasses RLS because it's SECURITY DEFINER
SELECT * FROM create_test_donation(
  'jfuller516@gmail.com',
  100.00,  -- Update this to your actual amount
  '6948564140213'
);

-- Step 5: Verify the donation was created and is visible
SELECT 
  d.id,
  d.amount,
  d.donor_id,
  d.shopify_order_name,
  d.created_at,
  p.email as donor_email,
  pr.title as project_title
FROM donations d
JOIN profiles p ON d.donor_id = p.id
JOIN projects pr ON d.project_id = pr.id
WHERE p.email = 'jfuller516@gmail.com'
ORDER BY d.created_at DESC;

-- Step 6: Test RLS - this should return rows if RLS allows
-- (Run this while logged in as the user in Supabase)
SELECT 
  d.id,
  d.amount,
  d.donor_id,
  auth.uid() as current_auth_uid,
  CASE 
    WHEN d.donor_id = auth.uid() THEN '✅ Visible (RLS allows)'
    ELSE '❌ Hidden (RLS blocks - donor_id mismatch)'
  END as rls_status
FROM donations d
WHERE d.shopify_order_id = '6948564140213';

