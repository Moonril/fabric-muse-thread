import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Header } from "@/components/Header";
import { ImageLightbox } from "@/components/ImageLightbox";
import { ProjectForm, type ProjectFormValues } from "@/components/ProjectForm";
import { StoredImage } from "@/components/StoredImage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { deleteProject, fetchProject, setProjectStatus, updateProject } from "@/lib/projects";

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId),
  });

  const allImagePaths = [
    data?.project?.reference_image_url,
    data?.project?.fabric_image_url,
    ...(data?.images?.map((i) => i.image_url) ?? []),
  ].filter((p): p is string => Boolean(p));

  const allImageLabels = [
    t("detail.reference"),
    t("detail.fabric"),
    ...(data?.images?.map(() => t("detail.gallery")) ?? []),
  ].filter((_, i) => Boolean(allImagePaths[i]));

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  const updateMutation = useMutation({
    mutationFn: (values: ProjectFormValues) => updateProject(projectId, values),
    onSuccess: () => {
      invalidate();
      setEditing(false);
      toast.success(t("toast.updated"));
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : t("error.generic")),
  });

  const statusMutation = useMutation({
    mutationFn: (status: "active" | "completed") => setProjectStatus(projectId, status),
    onSuccess: () => {
      invalidate();
      toast.success(t("toast.status"));
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : t("error.generic")),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!data?.project) return;
      await deleteProject(data.project, images);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(t("toast.deleted"));
      navigate({ to: "/home", replace: true });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : t("error.generic")),
  });

  const project = data?.project ?? null;
  const images = data?.images ?? [];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("detail.back")}
        </Link>

        {isPending && (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-56 w-full rounded-xl" />
              <Skeleton className="h-56 w-full rounded-xl" />
            </div>
          </div>
        )}

        {isError && (
          <div className="card-surface mt-6 flex flex-col items-start gap-3 p-6">
            <p className="text-sm text-destructive">{t("error.generic")}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              {t("toast.retry")}
            </Button>
          </div>
        )}

        {!isPending && !isError && !project && (
          <p className="card-surface mt-6 p-6 text-sm text-muted-foreground">{t("detail.notFound")}</p>
        )}

        {project && (
          <>
            <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold">{project.title}</h1>
                  <Badge variant={project.status === "completed" ? "secondary" : "default"}>
                    {project.status === "completed" ? t("status.completed") : t("status.active")}
                  </Badge>
                </div>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  {project.description || t("detail.noDescription")}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={statusMutation.isPending}
                  onClick={() =>
                    statusMutation.mutate(project.status === "completed" ? "active" : "completed")
                  }
                >
                  {statusMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : project.status === "completed" ? (
                    <RotateCcw className="mr-2 h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  {project.status === "completed" ? t("detail.markActive") : t("detail.markCompleted")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t("detail.edit")}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("detail.delete")}
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <figure
                className="card-surface group cursor-pointer overflow-hidden"
                onClick={() => setLightboxIndex(0)}
                role="button"
                aria-label={t("detail.viewImage")}
              >
                <StoredImage
                  path={project.reference_image_url}
                  alt={t("detail.reference")}
                  className="h-64 w-full transition-transform duration-300 group-hover:scale-105"
                />
                <figcaption className="px-4 py-3 text-sm font-medium">{t("detail.reference")}</figcaption>
              </figure>
              <figure
                className="card-surface group cursor-pointer overflow-hidden"
                onClick={() => setLightboxIndex(project.reference_image_url ? 1 : 0)}
                role="button"
                aria-label={t("detail.viewImage")}
              >
                <StoredImage
                  path={project.fabric_image_url}
                  alt={t("detail.fabric")}
                  className="h-64 w-full transition-transform duration-300 group-hover:scale-105"
                />
                <figcaption className="px-4 py-3 text-sm font-medium">{t("detail.fabric")}</figcaption>
              </figure>
            </div>

            {images.length > 0 && (
              <section className="mt-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("detail.gallery")}
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {images.map((image, index) => {
                    const offset =
                      (project.reference_image_url ? 1 : 0) + (project.fabric_image_url ? 1 : 0);
                    return (
                      <button
                        key={image.id}
                        onClick={() => setLightboxIndex(offset + index)}
                        className="group relative aspect-square w-full overflow-hidden rounded-lg border border-border text-left"
                        aria-label={t("detail.viewImage")}
                      >
                        <StoredImage
                          path={image.image_url}
                          alt={t("detail.gallery")}
                          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                        />
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <p className="mt-8 text-xs text-muted-foreground">
              {t("detail.created")} {new Date(project.created_at).toLocaleString()} · {t("detail.updated")}{" "}
              {new Date(project.updated_at).toLocaleString()}
            </p>

            {lightboxIndex !== null && (
              <ImageLightbox
                paths={allImagePaths}
                labels={allImageLabels}
                currentIndex={lightboxIndex}
                onClose={() => setLightboxIndex(null)}
                onChangeIndex={setLightboxIndex}
              />
            )}

            <Dialog open={editing} onOpenChange={(v) => !updateMutation.isPending && setEditing(v)}>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{t("form.editTitle")}</DialogTitle>
                </DialogHeader>
                <ProjectForm
                  initial={{
                    title: project.title,
                    description: project.description,
                    referencePath: project.reference_image_url,
                    fabricPath: project.fabric_image_url,
                    extraPaths: images.map((i) => i.image_url),
                    status: project.status,
                  }}
                  submitting={updateMutation.isPending}
                  onSubmit={(values) => updateMutation.mutate(values)}
                  onCancel={() => setEditing(false)}
                />
              </DialogContent>
            </Dialog>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("detail.deleteTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("detail.deleteBody")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteMutation.isPending}>{t("form.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      deleteMutation.mutate();
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {deleteMutation.isPending ? t("detail.deleting") : t("detail.delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </main>
    </div>
  );
}