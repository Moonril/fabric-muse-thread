import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Images, Layers, Palette } from "lucide-react";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Thread — Track your design projects" },
      {
        name: "description",
        content:
          "Thread keeps every design project in one calm place: reference images, fabrics, galleries and status, on any device.",
      },
      { property: "og:title", content: "Thread — Track your design projects" },
      {
        property: "og:description",
        content: "A calm, mobile-first tracker for design projects, references and fabrics.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useI18n();
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => (await supabase.auth.getSession()).data.session,
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-24">
        <section className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {t("app.name")}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            {t("landing.heroTitle")}
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">{t("landing.heroBody")}</p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link to={session ? "/home" : "/auth"}>
                {session ? t("nav.projects") : t("landing.cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Layers, key: "form.reference" as const },
            { icon: Palette, key: "form.fabric" as const },
            { icon: Images, key: "detail.gallery" as const },
          ].map(({ icon: Icon, key }) => (
            <div key={key} className="card-surface p-6">
              <Icon className="h-5 w-5 text-primary" />
              <h2 className="mt-3 text-base font-semibold">{t(key)}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("app.tagline")}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
