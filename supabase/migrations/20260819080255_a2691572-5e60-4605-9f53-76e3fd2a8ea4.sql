CREATE TABLE public.body_measurements (
  user_id UUID NOT NULL PRIMARY KEY,
  values JSONB NOT NULL DEFAULT '{}'::jsonb,
  type TEXT NOT NULL DEFAULT 'complete',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.body_measurements TO authenticated;
GRANT ALL ON public.body_measurements TO service_role;

ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own measurements"
ON public.body_measurements FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_body_measurements_updated_at
BEFORE UPDATE ON public.body_measurements
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();