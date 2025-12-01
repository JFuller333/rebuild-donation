-- Track actual donation counts per project
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS donation_count INTEGER DEFAULT 0;

-- Extend refresh function to update donation_count too
CREATE OR REPLACE FUNCTION public.refresh_project_totals(target_project_id text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.projects
  SET
    raised_amount = COALESCE((
      SELECT SUM(amount)
      FROM public.donations
      WHERE project_id = target_project_id
    ), 0),
    donor_count = COALESCE((
      SELECT COUNT(DISTINCT donor_id)
      FROM public.donations
      WHERE project_id = target_project_id
    ), 0),
    donation_count = COALESCE((
      SELECT COUNT(*)
      FROM public.donations
      WHERE project_id = target_project_id
    ), 0)
  WHERE id = target_project_id;
END;
$$;

-- Backfill donation counts for all projects
DO $$
DECLARE
  project_record RECORD;
BEGIN
  FOR project_record IN SELECT id FROM public.projects LOOP
    PERFORM public.refresh_project_totals(project_record.id);
  END LOOP;
END;
$$;

