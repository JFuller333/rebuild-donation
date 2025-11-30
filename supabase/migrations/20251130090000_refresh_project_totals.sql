-- Keep project raised_amount / donor_count in sync with donations
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
    ), 0)
  WHERE id = target_project_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_project_totals_from_donation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.refresh_project_totals(OLD.project_id);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.project_id IS DISTINCT FROM OLD.project_id THEN
      PERFORM public.refresh_project_totals(OLD.project_id);
    END IF;
    PERFORM public.refresh_project_totals(NEW.project_id);
    RETURN NEW;
  ELSE
    PERFORM public.refresh_project_totals(NEW.project_id);
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS donations_refresh_project_totals ON public.donations;

CREATE TRIGGER donations_refresh_project_totals
AFTER INSERT OR UPDATE OR DELETE ON public.donations
FOR EACH ROW EXECUTE FUNCTION public.refresh_project_totals_from_donation();

-- Backfill existing data
DO $$
DECLARE
  project_record RECORD;
BEGIN
  FOR project_record IN SELECT id FROM public.projects LOOP
    PERFORM public.refresh_project_totals(project_record.id);
  END LOOP;
END;
$$;

