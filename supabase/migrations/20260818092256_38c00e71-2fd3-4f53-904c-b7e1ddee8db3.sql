CREATE TABLE public.shopping_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID NULL REFERENCES public.projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity TEXT NULL,
  notes TEXT NULL,
  purchased BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shopping_items TO authenticated;
GRANT ALL ON public.shopping_items TO service_role;

ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own shopping items"
ON public.shopping_items FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX shopping_items_user_idx ON public.shopping_items(user_id);
CREATE INDEX shopping_items_project_idx ON public.shopping_items(project_id);

CREATE TRIGGER update_shopping_items_updated_at
BEFORE UPDATE ON public.shopping_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();