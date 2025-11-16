-- Add shopify_product_handle to projects table to link with Shopify products
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS shopify_product_handle TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_shopify_handle 
ON public.projects(shopify_product_handle);

-- Create project_updates table for dynamic project updates
CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_product_handle TEXT NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' 
    CHECK (status IN ('completed', 'in-progress', 'upcoming')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups by product handle
CREATE INDEX IF NOT EXISTS idx_project_updates_shopify_handle 
ON public.project_updates(shopify_product_handle);

-- Enable RLS on project_updates
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view project updates (public)
CREATE POLICY "Anyone can view project updates"
  ON public.project_updates
  FOR SELECT
  USING (true);

-- Policy: Admins can insert project updates
CREATE POLICY "Admins can insert project updates"
  ON public.project_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can update project updates
CREATE POLICY "Admins can update project updates"
  ON public.project_updates
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can delete project updates
CREATE POLICY "Admins can delete project updates"
  ON public.project_updates
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add shopify_product_handle to donations table to link with Shopify orders
ALTER TABLE public.donations 
ADD COLUMN IF NOT EXISTS shopify_product_handle TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_donations_shopify_handle 
ON public.donations(shopify_product_handle);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on project_updates
CREATE TRIGGER update_project_updates_updated_at
  BEFORE UPDATE ON public.project_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

