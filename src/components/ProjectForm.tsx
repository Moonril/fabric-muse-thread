import { Loader2 } from "lucide-react";
import { useState } from "react";

import { ExtraImagePicker, ImagePicker } from "@/components/ImagePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import type { ProjectInput, ProjectStatus } from "@/lib/projects";

export type ProjectFormValues = ProjectInput;

export function ProjectForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<ProjectFormValues>;
  submitting: boolean;
  onSubmit: (values: ProjectFormValues) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [referencePath, setReferencePath] = useState<string | null>(initial?.referencePath ?? null);
  const [fabricPath, setFabricPath] = useState<string | null>(initial?.fabricPath ?? null);
  const [extraPaths, setExtraPaths] = useState<string[]>(initial?.extraPaths ?? []);
  const [status] = useState<ProjectStatus>(initial?.status ?? "active");
  const [titleError, setTitleError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setTitleError(t("form.err.title"));
      return;
    }
    setTitleError(null);
    onSubmit({
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      referencePath,
      fabricPath,
      extraPaths,
      status,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="project-title">{t("form.title")}</Label>
        <Input
          id="project-title"
          value={title}
          maxLength={120}
          placeholder={t("form.titlePlaceholder")}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={Boolean(titleError)}
        />
        {titleError && <p className="text-sm text-destructive">{titleError}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-description">{t("form.description")}</Label>
        <Textarea
          id="project-description"
          value={description}
          maxLength={1000}
          rows={3}
          placeholder={t("form.descriptionPlaceholder")}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ImagePicker label={t("form.reference")} path={referencePath} onChange={setReferencePath} />
        <ImagePicker label={t("form.fabric")} path={fabricPath} onChange={setFabricPath} />
      </div>

      <ExtraImagePicker paths={extraPaths} onChange={setExtraPaths} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          {t("form.cancel")}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitting ? t("form.saving") : t("form.save")}
        </Button>
      </div>
    </form>
  );
}