-- QUICK FIX: Create donation for jfuller516@gmail.com
-- Copy and paste this into Supabase SQL Editor: https://supabase.com/dashboard/project/tjoieuiijrtdwdmjkcdo/sql/new
-- Then click "Run" (or press Cmd/Ctrl + Enter)

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
  100.00 as amount,  -- Change this to the actual donation amount
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
RETURNING 
  id,
  amount,
  shopify_order_name,
  created_at;

-- This will show you the donation that was created
-- After running, refresh your donor dashboard to see it!

