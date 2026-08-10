import { Link2, Loader2, Plus, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { StoredImage } from "@/components/StoredImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { uploadImage } from "@/lib/projects";

function isValidImageUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ImagePicker({
  label,
  path,
  onChange,
}: {
  label: string;
  path: string | null;
  onChange: (path: string | null) => void;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlOpen, setUrlOpen] = useState(false);
  const [url, setUrl] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadImage(file));
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : t("error.generic"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function submitUrl() {
    if (!isValidImageUrl(url)) {
      toast.error(t("form.err.url"));
      return;
    }
    onChange(url.trim());
    setUrl("");
    setUrlOpen(false);
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="relative overflow-hidden rounded-lg border border-dashed border-border bg-muted/40">
        {path ? (
          <StoredImage path={path} alt={label} className="h-40 w-full" />
        ) : (
          <div className="flex h-40 w-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            <span>{uploading ? t("form.saving") : t("form.addImage")}</span>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                {t("form.upload")}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setUrlOpen((v) => !v)}>
                <Link2 className="mr-1.5 h-3.5 w-3.5" />
                {t("form.fromUrl")}
              </Button>
            </div>
          </div>
        )}
        {path && (
          <div className="absolute right-2 top-2 flex gap-1">
            <Button type="button" size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t("form.replace")}
            </Button>
            <Button type="button" size="icon" variant="secondary" onClick={() => setUrlOpen((v) => !v)}>
              <Link2 className="h-3.5 w-3.5" />
              <span className="sr-only">{t("form.fromUrl")}</span>
            </Button>
            <Button type="button" size="icon" variant="secondary" onClick={() => onChange(null)}>
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">{t("form.remove")}</span>
            </Button>
          </div>
        )}
      </div>
      {urlOpen && (
        <div className="flex gap-2">
          <Input
            value={url}
            placeholder={t("form.urlPlaceholder")}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitUrl();
              }
            }}
          />
          <Button type="button" size="sm" onClick={submitUrl}>
            {t("form.addUrl")}
          </Button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

export function ExtraImagePicker({
  paths,
  onChange,
}: {
  paths: string[];
  onChange: (paths: string[]) => void;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlOpen, setUrlOpen] = useState(false);
  const [url, setUrl] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = 5 - paths.length;
    if (room <= 0) {
      toast.error(t("form.err.max"));
      return;
    }
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files).slice(0, room)) {
        uploaded.push(await uploadImage(file));
      }
      onChange([...paths, ...uploaded]);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : t("error.generic"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function submitUrl() {
    if (paths.length >= 5) {
      toast.error(t("form.err.max"));
      return;
    }
    if (!isValidImageUrl(url)) {
      toast.error(t("form.err.url"));
      return;
    }
    onChange([...paths, url.trim()]);
    setUrl("");
    setUrlOpen(false);
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">{t("form.extra")}</span>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {paths.map((p) => (
          <div key={p} className="relative overflow-hidden rounded-md border border-border">
            <StoredImage path={p} alt={t("form.extra")} className="aspect-square w-full" />
            <button
              type="button"
              onClick={() => onChange(paths.filter((x) => x !== p))}
              className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-foreground"
              aria-label={t("form.remove")}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {paths.length < 5 && (
          <div className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-muted-foreground">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded p-1 transition-colors hover:bg-muted"
              aria-label={t("form.upload")}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setUrlOpen((v) => !v)}
              className="rounded p-1 transition-colors hover:bg-muted"
              aria-label={t("form.fromUrl")}
            >
              <Link2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {urlOpen && paths.length < 5 && (
        <div className="flex gap-2">
          <Input
            value={url}
            placeholder={t("form.urlPlaceholder")}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitUrl();
              }
            }}
          />
          <Button type="button" size="sm" onClick={submitUrl}>
            {t("form.addUrl")}
          </Button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}