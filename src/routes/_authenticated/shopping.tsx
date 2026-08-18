import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Loader2, Plus, Trash2, Undo2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import { fetchProjects } from "@/lib/projects";
import {
  createShoppingItem,
  deleteShoppingItem,
  fetchShoppingItems,
  updateShoppingItem,
  type ShoppingItem,
} from "@/lib/shopping";

export const Route = createFileRoute("/_authenticated/shopping")({
  component: ShoppingPage,
  head: () => ({
    meta: [
      { title: "Shopping list — Thread" },
      { name: "description", content: "Track fabrics, notions and supplies to buy, linked to each Thread project." },
      { property: "og:title", content: "Shopping list — Thread" },
      { property: "og:description", content: "Track fabrics, notions and supplies to buy, linked to each Thread project." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const NO_PROJECT = "none";

function ShoppingPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "todo" | "done">("todo");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [projectId, setProjectId] = useState<string>(NO_PROJECT);
  const [nameError, setNameError] = useState<string | null>(null);

  const items = useQuery({ queryKey: ["shopping-items"], queryFn: fetchShoppingItems });
  const projects = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });

  const projectTitle = (id: string | null) =>
    (id && projects.data?.find((p) => p.id === id)?.title) || null;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["shopping-items"] });
  const onError = (error: unknown) =>
    toast.error(error instanceof Error ? error.message : t("error.generic"));

  const addMutation = useMutation({
    mutationFn: createShoppingItem,
    onSuccess: () => {
      invalidate();
      setName("");
      setQuantity("");
      setNotes("");
      toast.success(t("shopping.added"));
    },
    onError,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, purchased }: { id: string; purchased: boolean }) =>
      updateShoppingItem(id, { purchased }),
    onSuccess: () => {
      invalidate();
      toast.success(t("shopping.updated"));
    },
    onError,
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, project_id }: { id: string; project_id: string | null }) =>
      updateShoppingItem(id, { project_id }),
    onSuccess: () => {
      invalidate();
      toast.success(t("shopping.updated"));
    },
    onError,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteShoppingItem,
    onSuccess: () => {
      invalidate();
      toast.success(t("shopping.deleted"));
    },
    onError,
  });

  function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setNameError(t("shopping.err.name"));
      return;
    }
    setNameError(null);
    addMutation.mutate({
      name: name.trim(),
      quantity: quantity.trim() ? quantity.trim() : null,
      notes: notes.trim() ? notes.trim() : null,
      projectId: projectId === NO_PROJECT ? null : projectId,
    });
  }

  const visible = (items.data ?? []).filter((item) => {
    const statusOk =
      filter === "all" || (filter === "todo" ? !item.purchased : item.purchased);
    const projectOk =
      projectFilter === "all" ||
      (projectFilter === NO_PROJECT ? item.project_id === null : item.project_id === projectFilter);
    return statusOk && projectOk;
  });

  return (
    <div className="min-h-screen pb-16">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold">{t("shopping.title")}</h1>

        <form onSubmit={handleAdd} className="card-surface mt-6 space-y-4 p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="item-name">{t("shopping.name")}</Label>
              <Input
                id="item-name"
                value={name}
                maxLength={120}
                placeholder={t("shopping.namePlaceholder")}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={Boolean(nameError)}
              />
              {nameError && <p className="text-sm text-destructive">{nameError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-quantity">{t("shopping.quantity")}</Label>
              <Input
                id="item-quantity"
                value={quantity}
                maxLength={40}
                placeholder={t("shopping.quantityPlaceholder")}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-notes">{t("shopping.notes")}</Label>
              <Input
                id="item-notes"
                value={notes}
                maxLength={300}
                placeholder={t("shopping.notesPlaceholder")}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("shopping.project")}</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PROJECT}>{t("shopping.noProject")}</SelectItem>
                  {(projects.data ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {addMutation.isPending ? t("shopping.adding") : t("shopping.add")}
            </Button>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "todo" | "done")}>
            <TabsList>
              <TabsTrigger value="all">{t("home.all")}</TabsTrigger>
              <TabsTrigger value="todo">{t("shopping.toBuy")}</TabsTrigger>
              <TabsTrigger value="done">{t("shopping.bought")}</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("shopping.allProjects")}</SelectItem>
              <SelectItem value={NO_PROJECT}>{t("shopping.noProject")}</SelectItem>
              {(projects.data ?? []).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 space-y-3">
          {items.isPending && [0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}

          {items.isError && (
            <div className="card-surface flex flex-col items-start gap-3 p-6">
              <p className="text-sm text-destructive">{t("error.generic")}</p>
              <Button variant="outline" size="sm" onClick={() => items.refetch()}>
                {t("toast.retry")}
              </Button>
            </div>
          )}

          {!items.isPending && !items.isError && visible.length === 0 && (
            <div className="card-surface px-6 py-12 text-center text-sm text-muted-foreground">
              {(items.data ?? []).length === 0 ? t("shopping.empty") : t("shopping.emptyFilter")}
            </div>
          )}

          {visible.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              projectName={projectTitle(item.project_id)}
              projectOptions={(projects.data ?? []).map((p) => ({ id: p.id, title: p.title }))}
              onToggle={() => toggleMutation.mutate({ id: item.id, purchased: !item.purchased })}
              onAssign={(value) =>
                assignMutation.mutate({ id: item.id, project_id: value === NO_PROJECT ? null : value })
              }
              onDelete={() => deleteMutation.mutate(item.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function ItemRow({
  item,
  projectName,
  projectOptions,
  onToggle,
  onAssign,
  onDelete,
}: {
  item: ShoppingItem;
  projectName: string | null;
  projectOptions: { id: string; title: string }[];
  onToggle: () => void;
  onAssign: (value: string) => void;
  onDelete: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`font-medium ${item.purchased ? "text-muted-foreground line-through" : ""}`}>
            {item.name}
          </span>
          {item.quantity && <Badge variant="secondary">{item.quantity}</Badge>}
          {projectName && <Badge variant="outline">{projectName}</Badge>}
        </div>
        {item.notes && <p className="mt-1 text-sm text-muted-foreground">{item.notes}</p>}
      </div>

      <div className="flex items-center gap-2">
        <Select value={item.project_id ?? NO_PROJECT} onValueChange={onAssign}>
          <SelectTrigger className="w-44" aria-label={t("shopping.project")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_PROJECT}>{t("shopping.noProject")}</SelectItem>
            {projectOptions.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={onToggle}
          aria-label={item.purchased ? t("shopping.markToBuy") : t("shopping.markBought")}
          title={item.purchased ? t("shopping.markToBuy") : t("shopping.markBought")}
        >
          {item.purchased ? <Undo2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete} aria-label={t("shopping.delete")}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
