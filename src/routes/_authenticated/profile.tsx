import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Link, Loader2, Ruler, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import {
  MEASUREMENT_FIELDS,
  MEASUREMENT_GROUPS,
  fetchMeasurements,
  fromMm,
  saveMeasurements,
  toMm,
  type LengthUnit,
  type MeasurementValues,
} from "@/lib/measurements";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Profile & measurements — Thread" },
      { property: "og:title", content: "Profile & measurements — Thread" },
      {
        property: "og:description",
        content: "Store and update your own body measurements so every Thread project starts from the right numbers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ProfilePage() {
  const { t, lang } = useI18n();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [unit, setUnit] = useState<LengthUnit>(() => {
    if (typeof window === "undefined") return "cm";
    return (window.localStorage.getItem("thread.lengthUnit") as LengthUnit) ?? "cm";
  });

  function switchUnit(next: LengthUnit) {
    setUnit((prev) => {
      if (prev === next) return prev;
      setDraft((d) => {
        const converted: Record<string, string> = { ...d };
        for (const field of MEASUREMENT_FIELDS) {
          if (field.unit !== "mm") continue;
          const raw = d[field.key]?.trim();
          if (!raw) continue;
          const parsed = Number(raw.replace(",", "."));
          if (Number.isNaN(parsed)) continue;
          converted[field.key] = String(fromMm(toMm(parsed, prev), next));
        }
        return converted;
      });
      if (typeof window !== "undefined") window.localStorage.setItem("thread.lengthUnit", next);
      return next;
    });
  }

  const record = useQuery({ queryKey: ["measurements"], queryFn: fetchMeasurements });

  useEffect(() => {
    if (loaded || record.isLoading) return;
    const values = record.data?.values ?? {};
    const next: Record<string, string> = {};
    for (const field of MEASUREMENT_FIELDS) {
      const value = values[field.key];
      next[field.key] =
        value === null || value === undefined
          ? ""
          : String(field.unit === "mm" ? fromMm(value, unit) : value);
    }
    setDraft(next);
    setLoaded(true);
  }, [loaded, record.isLoading, record.data, unit]);

  const saveMutation = useMutation({
    mutationFn: (values: MeasurementValues) => saveMeasurements(values, record.data?.type ?? "complete"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
      toast.success(t("measure.saved"));
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : t("error.generic")),
  });

  const filledCount = useMemo(
    () => MEASUREMENT_FIELDS.filter((f) => draft[f.key]?.trim()).length,
    [draft],
  );

  function handleSave() {
    const values: MeasurementValues = {};
    for (const field of MEASUREMENT_FIELDS) {
      const raw = draft[field.key]?.trim();
      if (!raw) continue;
      const parsed = Number(raw.replace(",", "."));
      if (Number.isNaN(parsed)) {
        toast.error(t("measure.err.number"));
        return;
      }
      values[field.key] = field.unit === "mm" ? toMm(parsed, unit) : parsed;
    }
    saveMutation.mutate(values);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("measure.title")}
            </h1>
            
          </div>
          <div className="flex items-center gap-3">
            <div
              className="inline-flex rounded-lg border border-border bg-card p-0.5"
              role="group"
              aria-label={t("measure.unitToggle")}
            >
              {(["cm", "in"] as LengthUnit[]).map((u) => (
                <Button
                  key={u}
                  type="button"
                  size="sm"
                  variant={unit === u ? "secondary" : "ghost"}
                  className="h-8 px-3 text-xs"
                  aria-pressed={unit === u}
                  onClick={() => switchUnit(u)}
                >
                  {u === "cm" ? t("measure.unitCm") : t("measure.unitIn")}
                </Button>
              ))}
            </div>
            <Button onClick={handleSave} disabled={saveMutation.isPending || !loaded}>
            {saveMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
              {saveMutation.isPending ? t("form.saving") : t("measure.save")}
            </Button>
          </div>
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Ruler className="h-3.5 w-3.5" aria-hidden />
          {filledCount}/{MEASUREMENT_FIELDS.length} · <a href="https://www.dressdeveloper.com/measure-set/complete/">measurements reference</a> <Link className="h-3.5 w-3.5" />
        </p>

        {record.isLoading ? (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {MEASUREMENT_GROUPS.map((group) => (
              <section key={group.en} className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  {lang === "it" ? group.it : group.en}
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.fields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <Label htmlFor={field.key} className="text-xs text-muted-foreground">
                        {lang === "it" ? field.it : field.en} (
                        {field.unit === "mm" ? (unit === "cm" ? t("measure.unitCm") : t("measure.unitIn")) : field.unit}
                        )
                      </Label>
                      <Input
                        id={field.key}
                        inputMode="decimal"
                        value={draft[field.key] ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, [field.key]: e.target.value }))}
                        placeholder="—"
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
