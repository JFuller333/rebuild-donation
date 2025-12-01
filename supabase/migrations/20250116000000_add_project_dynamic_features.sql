-- Create project_progress_gallery table for progress images
CREATE TABLE IF NOT EXISTS public.project_progress_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_product_handle TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  date DATE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_progress_gallery_shopify_handle 
ON public.project_progress_gallery(shopify_product_handle);

-- Create project_impact_items table for impact statements
CREATE TABLE IF NOT EXISTS public.project_impact_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_product_handle TEXT NOT NULL,
  text TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_impact_items_shopify_handle 
ON public.project_impact_items(shopify_product_handle);

-- Create project_team_members table
CREATE TABLE IF NOT EXISTS public.project_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_product_handle TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_members_shopify_handle 
ON public.project_team_members(shopify_product_handle);

-- Create project_partners table
CREATE TABLE IF NOT EXISTS public.project_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_product_handle TEXT NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_partners_shopify_handle 
ON public.project_partners(shopify_product_handle);

-- Enable RLS on all new tables
ALTER TABLE public.project_progress_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_impact_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view progress gallery" ON public.project_progress_gallery;
CREATE POLICY "Anyone can view progress gallery"
  ON public.project_progress_gallery FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage progress gallery" ON public.project_progress_gallery;
CREATE POLICY "Admins can manage progress gallery"
  ON public.project_progress_gallery FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policies for project_impact_items
DROP POLICY IF EXISTS "Anyone can view impact items" ON public.project_impact_items;
CREATE POLICY "Anyone can view impact items"
  ON public.project_impact_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage impact items" ON public.project_impact_items;
CREATE POLICY "Admins can manage impact items"
  ON public.project_impact_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policies for project_team_members
DROP POLICY IF EXISTS "Anyone can view team members" ON public.project_team_members;
CREATE POLICY "Anyone can view team members"
  ON public.project_team_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage team members" ON public.project_team_members;
CREATE POLICY "Admins can manage team members"
  ON public.project_team_members FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policies for project_partners
DROP POLICY IF EXISTS "Anyone can view partners" ON public.project_partners;
CREATE POLICY "Anyone can view partners"
  ON public.project_partners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage partners" ON public.project_partners;
CREATE POLICY "Admins can manage partners"
  ON public.project_partners FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Triggers to update updated_at
DROP TRIGGER IF EXISTS update_progress_gallery_updated_at ON public.project_progress_gallery;
CREATE TRIGGER update_progress_gallery_updated_at
  BEFORE UPDATE ON public.project_progress_gallery
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_impact_items_updated_at ON public.project_impact_items;
CREATE TRIGGER update_impact_items_updated_at
  BEFORE UPDATE ON public.project_impact_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.project_team_members;
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.project_team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_partners_updated_at ON public.project_partners;
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.project_partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

