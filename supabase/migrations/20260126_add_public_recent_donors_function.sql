-- Expose recent donors (sanitized) for public display while keeping
-- underlying tables protected by RLS.

CREATE OR REPLACE FUNCTION public.get_recent_donors(
  product_handle text,
  limit_rows integer DEFAULT 10
)
RETURNS TABLE (
  name text,
  amount numeric,
  created_at timestamptz
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(NULLIF(p.full_name, ''), split_part(p.email, '@', 1), 'Anonymous') AS name,
    d.amount,
    d.created_at
  FROM public.donations d
  LEFT JOIN public.profiles p ON p.id = d.donor_id
  WHERE d.shopify_product_handle = product_handle
    AND d.status = 'completed'
  ORDER BY d.created_at DESC
  LIMIT COALESCE(limit_rows, 10);
END;
$$ LANGUAGE plpgsql;

-- Allow unauthenticated and authenticated clients to execute
GRANT EXECUTE ON FUNCTION public.get_recent_donors(text, integer) TO anon, authenticated;
