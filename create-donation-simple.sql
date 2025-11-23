-- SIMPLER VERSION: Run this if the user profile already exists
-- This assumes you've already signed up with jfuller516@gmail.com

-- First, check if profile exists and get the user ID
SELECT id, email, full_name FROM profiles WHERE email = 'jfuller516@gmail.com';

-- If profile exists, run this (replace USER_ID_HERE with the actual ID from above):
/*
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
  p.id as donor_id,
  pr.id as project_id,
  100.00 as amount,
  'investment-tier-1' as shopify_product_handle,
  '6948564140213' as shopify_order_id,
  '#1001' as shopify_order_name,
  'completed' as status,
  'shopify' as payment_method,
  '6948564140213' as transaction_id
FROM profiles p
CROSS JOIN projects pr
WHERE p.email = 'jfuller516@gmail.com'
  AND pr.shopify_product_handle = 'investment-tier-1'
  AND NOT EXISTS (
    SELECT 1 FROM donations 
    WHERE shopify_order_id = '6948564140213' 
      AND project_id = pr.id
  )
RETURNING *;
*/

