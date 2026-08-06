import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";

import { StoredImage } from "@/components/StoredImage";
import { useI18n } from "@/lib/i18n";

export function ImageLightbox({
  paths,
  currentIndex,
  onClose,
  onChangeIndex,
  labels,
}: {
  paths: string[];
  currentIndex: number;
  onClose: () => void;
  onChangeIndex?: (index: number) => void;
  labels?: string[];
}) {
  const { t } = useI18n();
  const path = paths[currentIndex];
  const label = labels?.[currentIndex];
  const hasPrev = onChangeIndex && currentIndex > 0;
  const hasNext = onChangeIndex && currentIndex < paths.length - 1;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onChangeIndex(currentIndex - 1);
      if (e.key === "ArrowRight" && hasNext) onChangeIndex(currentIndex + 1);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [currentIndex, hasNext, hasPrev, onChangeIndex, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={label ?? t("detail.viewImage")}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
        aria-label={t("detail.close")}
      >
        <X className="h-5 w-5" />
      </button>

      <div
        className="relative flex max-h-[85vh] w-full max-w-5xl items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {hasPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChangeIndex(currentIndex - 1);
            }}
            className="absolute left-0 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 sm:-left-14"
            aria-label={t("detail.previous")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {path && (
          <StoredImage
            path={path}
            alt={label ?? t("detail.viewImage")}
            className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
          />
        )}

        {hasNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChangeIndex(currentIndex + 1);
            }}
            className="absolute right-0 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 sm:-right-14"
            aria-label={t("detail.next")}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {paths.length > 1 && (
        <p className="mt-4 text-sm text-white/80">
          {currentIndex + 1} / {paths.length}
        </p>
      )}
    </div>
  );
}
