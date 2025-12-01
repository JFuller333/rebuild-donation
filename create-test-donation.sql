-- SQL script to manually create a donation for jfuller516@gmail.com
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/tjoieuiijrtdwdmjkcdo/sql

-- Step 1: Find or create the user profile
DO $$
DECLARE
  v_user_id UUID;
  v_project_id UUID;
  v_profile_exists BOOLEAN;
BEGIN
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE email = 'jfuller516@gmail.com') INTO v_profile_exists;
  
  IF NOT v_profile_exists THEN
    -- Create auth user first (this requires admin access)
    -- Note: You may need to create the user via Supabase Auth UI first
    -- Then create the profile
    INSERT INTO profiles (id, email, full_name)
    VALUES (
      gen_random_uuid(), -- This will be replaced with actual user ID if user exists
      'jfuller516@gmail.com',
      'Jazlyn Fuller'
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_user_id;
  ELSE
    SELECT id INTO v_user_id FROM profiles WHERE email = 'jfuller516@gmail.com';
  END IF;

  -- Get project ID
  SELECT id INTO v_project_id FROM projects WHERE shopify_product_handle = 'investment-tier-1';
  
  IF v_project_id IS NULL THEN
    RAISE EXCEPTION 'Project not found for handle: investment-tier-1';
  END IF;

  -- Check if donation already exists
  IF EXISTS(SELECT 1 FROM donations WHERE shopify_order_id = '6948564140213' AND project_id = v_project_id) THEN
    RAISE NOTICE 'Donation already exists for this order';
  ELSE
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
      100.00, -- Update this amount if needed
      'investment-tier-1',
      '6948564140213',
      '#1001',
      'completed',
      'shopify',
      '6948564140213'
    );
    
    RAISE NOTICE 'Donation created successfully!';
  END IF;
END $$;

-- Verify the donation was created
SELECT 
  d.id,
  d.amount,
  d.shopify_order_name,
  d.created_at,
  p.email,
  p.full_name,
  pr.title as project_title
FROM donations d
JOIN profiles p ON d.donor_id = p.id
JOIN projects pr ON d.project_id = pr.id
WHERE p.email = 'jfuller516@gmail.com'
ORDER BY d.created_at DESC;

