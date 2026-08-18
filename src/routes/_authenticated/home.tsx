import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Header } from "@/components/Header";
import { ProjectForm, type ProjectFormValues } from "@/components/ProjectForm";
import { StoredImage } from "@/components/StoredImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import { createProject, fetchProjects, type Project, type ProjectStatus } from "@/lib/projects";

export const Route = createFileRoute("/_authenticated/home")({
  component: HomePage,
});

function HomePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | ProjectStatus>("active");
  const [open, setOpen] = useState(false);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const createMutation = useMutation({
    mutationFn: (values: ProjectFormValues) => createProject(values),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      toast.success(t("toast.added"));
      navigate({ to: "/projects/$projectId", params: { projectId: project.id } });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("error.generic"));
    },
  });

  const projects = (data ?? []).filter((p) => filter === "all" || p.status === filter);

  return (
    <div className="min-h-screen pb-24">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">{t("home.title")}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/shopping">
                <ShoppingBag className="mr-2 h-4 w-4" />
                {t("shopping.nav")}
              </Link>
            </Button>
            <Button className="hidden sm:inline-flex" onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("home.new")}
            </Button>
          </div>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | ProjectStatus)} className="mt-6">
          <TabsList>
            <TabsTrigger value="all">{t("home.all")}</TabsTrigger>
            <TabsTrigger value="active">{t("home.active")}</TabsTrigger>
            <TabsTrigger value="completed">{t("home.completed")}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-6 space-y-3">
          {isPending && [0, 1, 2].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}

          {isError && (
            <div className="card-surface flex flex-col items-start gap-3 p-6">
              <p className="text-sm text-destructive">{t("error.generic")}</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                {t("toast.retry")}
              </Button>
            </div>
          )}

          {!isPending && !isError && projects.length === 0 && (
            <div className="card-surface flex flex-col items-center gap-3 px-6 py-14 text-center">
              {data && data.length === 0 ? (
                <>
                  <h2 className="text-lg font-semibold">{t("home.empty.title")}</h2>
                  <p className="max-w-sm text-sm text-muted-foreground">{t("home.empty.body")}</p>
                  <Button className="mt-2" onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("home.empty.cta")}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{t("home.emptyFilter")}</p>
              )}
            </div>
          )}

          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </main>

      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg sm:hidden"
        onClick={() => setOpen(true)}
        aria-label={t("home.new")}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={(v) => !createMutation.isPending && setOpen(v)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("form.newTitle")}</DialogTitle>
            <DialogDescription>{t("app.tagline")}</DialogDescription>
          </DialogHeader>
          <ProjectForm
            submitting={createMutation.isPending}
            onSubmit={(values) => createMutation.mutate(values)}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const { t } = useI18n();
  return (
    <Link
      to="/projects/$projectId"
      params={{ projectId: project.id }}
      className="card-surface flex flex-col overflow-hidden transition-shadow hover:shadow-lg sm:flex-row"
    >
      <StoredImage
        path={project.reference_image_url}
        alt={project.title}
        className="h-40 w-full shrink-0 sm:h-32 sm:w-44"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="truncate text-base font-semibold">{project.title}</h2>
          <Badge variant={project.status === "completed" ? "secondary" : "default"}>
            {project.status === "completed" ? t("status.completed") : t("status.active")}
          </Badge>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.description || t("detail.noDescription")}
        </p>
        <div className="mt-auto flex items-center gap-3">
          <StoredImage
            path={project.fabric_image_url}
            alt={t("detail.fabric")}
            className="h-9 w-9 rounded-md border border-border"
          />
          <span className="text-xs text-muted-foreground">
            {t("detail.updated")} {new Date(project.updated_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}