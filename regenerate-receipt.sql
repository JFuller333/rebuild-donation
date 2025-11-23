-- Regenerate receipt for existing donation
-- This will call the generate-receipt function for donations that don't have receipts

-- First, check which donations need receipts
SELECT 
  d.id,
  d.amount,
  d.shopify_order_name,
  d.receipt_url,
  p.email,
  pr.title as project_title
FROM donations d
JOIN profiles p ON d.donor_id = p.id
JOIN projects pr ON d.project_id = pr.id
WHERE p.email = 'jfuller516@gmail.com'
  AND (d.receipt_url IS NULL OR d.receipt_url = '')
ORDER BY d.created_at DESC;

-- Note: To actually generate the receipt, you'll need to call the Edge Function
-- Or create a new test order in Shopify which will automatically generate it

