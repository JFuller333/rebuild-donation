-- Add receipt fields to donations table
ALTER TABLE public.donations
ADD COLUMN IF NOT EXISTS shopify_order_id TEXT,
ADD COLUMN IF NOT EXISTS shopify_order_name TEXT,
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS receipt_generated_at TIMESTAMPTZ;

-- Create index for faster lookups by Shopify order
CREATE INDEX IF NOT EXISTS idx_donations_shopify_order_id 
ON public.donations(shopify_order_id);

-- Create index for receipt lookups
CREATE INDEX IF NOT EXISTS idx_donations_receipt_url 
ON public.donations(receipt_url) 
WHERE receipt_url IS NOT NULL;

-- Add function to generate receipt number
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  receipt_num TEXT;
  year_num INTEGER;
BEGIN
  year_num := EXTRACT(YEAR FROM NOW());
  receipt_num := 'RT-' || year_num || '-' || LPAD(
    (SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
     FROM public.tax_receipts
     WHERE year = year_num)::TEXT,
    6,
    '0'
  );
  RETURN receipt_num;
END;
$$;

