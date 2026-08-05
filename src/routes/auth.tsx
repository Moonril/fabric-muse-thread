import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Log in or sign up — Thread" },
      {
        name: "description",
        content: "Access your Thread account to track creative projects, references and fabrics.",
      },
      { property: "og:title", content: "Log in or sign up — Thread" },
      {
        property: "og:description",
        content: "Access your Thread account to track creative projects, references and fabrics.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/home", replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-md px-4 py-12">
        <h1 className="text-2xl font-semibold">{t("auth.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("auth.subtitle")}</p>

        <div className="card-surface mt-6 p-5">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
              <TabsTrigger value="signup">{t("auth.signup")}</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="pt-4">
              <AuthForm mode="login" />
            </TabsContent>
            <TabsContent value="signup" className="pt-4">
              <AuthForm mode="signup" />
            </TabsContent>
          </Tabs>

          <div className="my-5 flex items-center gap-3 text-xs uppercase text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {t("auth.or")}
            <span className="h-px flex-1 bg-border" />
          </div>

          <GoogleButton />
        </div>
      </main>
    </div>
  );
}

function GoogleButton() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/home` },
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
    }
  }

  return (
    <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M21.35 11.1h-9.17v2.96h5.27c-.23 1.36-1.6 3.99-5.27 3.99-3.17 0-5.76-2.62-5.76-5.85s2.59-5.85 5.76-5.85c1.8 0 3.01.77 3.7 1.43l2.52-2.43C16.73 3.86 14.7 3 12.18 3 7.03 3 2.86 7.16 2.86 12.3s4.17 9.3 9.32 9.3c5.38 0 8.93-3.78 8.93-9.1 0-.61-.07-1.08-.16-1.4Z"
          />
        </svg>
      )}
      {t("auth.google")}
    </Button>
  );
}

function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = t("auth.err.email");
    if (password.length < 6) next.password = t("auth.err.password");
    if (mode === "signup" && !name.trim()) next.name = t("auth.err.name");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setNotice(null);
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success(t("toast.loggedIn"));
        navigate({ to: "/home", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name.trim() },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success(t("toast.loggedIn"));
          navigate({ to: "/home", replace: true });
        } else {
          setNotice(t("auth.checkEmail"));
        }
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t("error.generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor={`${mode}-name`}>{t("auth.name")}</Label>
          <Input
            id={`${mode}-name`}
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`${mode}-email`}>{t("auth.email")}</Label>
        <Input
          id={`${mode}-email`}
          type="email"
          autoComplete="email"
          value={email}
          maxLength={255}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${mode}-password`}>{t("auth.password")}</Label>
        <Input
          id={`${mode}-password`}
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
      </div>

      {formError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
      )}
      {notice && <p className="rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground">{notice}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading
          ? mode === "login"
            ? t("auth.loggingIn")
            : t("auth.signingUp")
          : mode === "login"
            ? t("auth.login")
            : t("auth.signup")}
      </Button>
    </form>
  );
}