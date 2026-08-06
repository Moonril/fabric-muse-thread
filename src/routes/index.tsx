import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

const HERO_IMAGE = "https://images.pexels.com/photos/19323406/pexels-photo-19323406.jpeg";

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
      { property: "og:image", content: HERO_IMAGE },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: HERO_IMAGE },
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <img
        src={HERO_IMAGE}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-black/45" />

      <main className="relative z-10 flex flex-col items-center px-4 text-center">
        <h1 className="text-6xl font-semibold tracking-tight text-white sm:text-8xl">
          {t("app.name")}
        </h1>
        <Button asChild size="lg" className="mt-10 text-base">
          <Link to={session ? "/home" : "/auth"}>{t("landing.cta")}</Link>
        </Button>
      </main>
    </div>
  );
}
