-- ============================================
-- SIMPLE FIX: Copy and paste this ENTIRE script
-- into Supabase SQL Editor and run it
-- ============================================

-- This creates a function that bypasses RLS to create the donation
-- Then calls it to create your donation

CREATE OR REPLACE FUNCTION create_donation_for_user(
  p_email TEXT,
  p_amount DECIMAL,
  p_order_id TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_project_id TEXT;
  v_donation_id UUID;
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found: %. Please sign up first at /auth', p_email;
  END IF;

  -- Ensure profile exists
  INSERT INTO profiles (id, email, full_name)
  VALUES (v_user_id, p_email, COALESCE((SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = v_user_id), p_email))
  ON CONFLICT (id) DO NOTHING;

  -- Get project ID
  SELECT id INTO v_project_id 
  FROM projects 
  WHERE shopify_product_handle = 'investment-tier-1';
  
  IF v_project_id IS NULL THEN
    RAISE EXCEPTION 'Project not found for handle: investment-tier-1';
  END IF;

  -- Check if donation already exists
  SELECT id INTO v_donation_id 
  FROM donations 
  WHERE shopify_order_id = p_order_id 
    AND project_id = v_project_id;
  
  IF v_donation_id IS NOT NULL THEN
    RAISE NOTICE 'Donation already exists with ID: %', v_donation_id;
    RETURN v_donation_id;
  END IF;

  -- Create donation (bypasses RLS because function is SECURITY DEFINER)
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

  RETURN v_donation_id;
END;
$$;

-- ============================================
-- NOW CALL THE FUNCTION TO CREATE YOUR DONATION
-- ============================================
-- Update the amount below to match your actual donation amount
SELECT create_donation_for_user(
  'jfuller516@gmail.com',  -- Your email
  100.00,                   -- ⚠️ UPDATE THIS TO YOUR ACTUAL AMOUNT
  '6948564140213'          -- Order ID
) as donation_id;

-- ============================================
-- VERIFY IT WAS CREATED
-- ============================================
SELECT 
  d.id as donation_id,
  d.amount,
  d.shopify_order_name,
  d.created_at,
  p.email as donor_email,
  p.id as donor_user_id,
  pr.title as project_title
FROM donations d
JOIN profiles p ON d.donor_id = p.id
JOIN projects pr ON d.project_id = pr.id
WHERE p.email = 'jfuller516@gmail.com'
ORDER BY d.created_at DESC;

