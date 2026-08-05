import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Languages, LogOut, Moon, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 18c4-10 12-10 16 0" strokeLinecap="round" />
          <path d="M4 12c4-8 12-8 16 0" strokeLinecap="round" opacity="0.5" />
        </svg>
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">Thread</span>
    </span>
  );
}

export function Header() {
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setEmail(data.user?.email ?? null);
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success(t("toast.loggedOut"));
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
        <Link to={email ? "/home" : "/"} className="shrink-0">
          <Logo />
        </Link>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === "en" ? "it" : "en")}
            aria-label={t("settings.language")}
          >
            <Languages className="h-4 w-4" aria-hidden />
            <span className="text-xs font-semibold uppercase">{lang}</span>
          </Button>

          <Button variant="ghost" size="icon" onClick={toggle} aria-label={t("nav.theme")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {email ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t("nav.profile")}>
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                  {email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/home">{t("nav.projects")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2 pl-1">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">{t("nav.login")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  {t("nav.signup")}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}