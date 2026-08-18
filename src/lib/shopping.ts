import { supabase } from "@/integrations/supabase/client";

export type ShoppingItem = {
  id: string;
  user_id: string;
  project_id: string | null;
  name: string;
  quantity: string | null;
  notes: string | null;
  purchased: boolean;
  created_at: string;
  updated_at: string;
};

export type ShoppingItemInput = {
  name: string;
  quantity: string | null;
  notes: string | null;
  projectId: string | null;
};

export async function fetchShoppingItems(): Promise<ShoppingItem[]> {
  const { data, error } = await supabase
    .from("shopping_items")
    .select("*")
    .order("purchased", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ShoppingItem[];
}

export async function createShoppingItem(input: ShoppingItemInput): Promise<ShoppingItem> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw userError ?? new Error("Not authenticated");
  const { data, error } = await supabase
    .from("shopping_items")
    .insert({
      user_id: userData.user.id,
      name: input.name,
      quantity: input.quantity,
      notes: input.notes,
      project_id: input.projectId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as ShoppingItem;
}

export async function updateShoppingItem(
  id: string,
  patch: Partial<Pick<ShoppingItem, "name" | "quantity" | "notes" | "purchased" | "project_id">>,
) {
  const { error } = await supabase.from("shopping_items").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteShoppingItem(id: string) {
  const { error } = await supabase.from("shopping_items").delete().eq("id", id);
  if (error) throw error;
}
