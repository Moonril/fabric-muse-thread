import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "it";

const dict = {
  en: {
    "app.name": "Thread",
    "app.tagline": "Keep every reference and every fabric in one calm place.",
    "nav.login": "Log in",
    "nav.signup": "Sign up",
    "nav.logout": "Log out",
    "nav.profile": "Profile",
    "nav.projects": "Projects",
    "nav.theme": "Toggle theme",
    "landing.heroTitle": "Track your creative projects, thread by thread.",
    "landing.heroBody":
      "Pair a reference image with the fabric you picked, add up to five extra references, and follow each project from active to completed.",
    "landing.cta": "Get started",
    "landing.f1.title": "Reference + fabric",
    "landing.f1.body": "Every project pairs the look you want with the material you chose.",
    "landing.f2.title": "Calm, organised board",
    "landing.f2.body": "Long cards, clear status, no clutter. Filter by active or completed.",
    "landing.f3.title": "Yours only",
    "landing.f3.body": "Private by default — your projects and images are visible only to you.",
    "auth.title": "Welcome to Thread",
    "auth.subtitle": "Log in or create an account to continue.",
    "auth.login": "Log in",
    "auth.signup": "Sign up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.name": "Display name",
    "auth.google": "Continue with Google",
    "auth.or": "or",
    "auth.loggingIn": "Logging in…",
    "auth.signingUp": "Creating account…",
    "auth.checkEmail": "Check your inbox to confirm your email address.",
    "auth.err.email": "Enter a valid email address.",
    "auth.err.password": "Password must be at least 6 characters.",
    "auth.err.name": "Enter a display name.",
    "home.title": "Your projects",
    "home.new": "New project",
    "home.all": "All",
    "home.active": "Active",
    "home.completed": "Completed",
    "home.empty.title": "No projects yet",
    "home.empty.body": "Create your first project to pair a reference image with its fabric.",
    "home.empty.cta": "Create your first project",
    "home.emptyFilter": "No projects with this status.",
    "status.active": "Active",
    "status.completed": "Completed",
    "form.newTitle": "New project",
    "form.editTitle": "Edit project",
    "form.title": "Title",
    "form.titlePlaceholder": "e.g. Linen summer jacket",
    "form.description": "Description",
    "form.descriptionPlaceholder": "Optional notes about this project",
    "form.reference": "Reference image",
    "form.fabric": "Fabric image",
    "form.extra": "Additional references (up to 5)",
    "form.addImage": "Add image",
    "form.replace": "Replace",
    "form.remove": "Remove",
    "form.save": "Save project",
    "form.saving": "Saving…",
    "form.cancel": "Cancel",
    "form.err.title": "A title is required.",
    "form.err.max": "You can add up to 5 additional images.",
    "detail.back": "Back to projects",
    "detail.edit": "Edit",
    "detail.delete": "Delete",
    "detail.markActive": "Mark as active",
    "detail.markCompleted": "Mark as completed",
    "detail.reference": "Reference",
    "detail.fabric": "Fabric",
    "detail.gallery": "Additional references",
    "detail.noDescription": "No description yet.",
    "detail.created": "Created",
    "detail.updated": "Updated",
    "detail.viewImage": "View image",
    "detail.close": "Close",
    "detail.previous": "Previous image",
    "detail.next": "Next image",
    "detail.deleteTitle": "Delete this project?",
    "detail.deleteBody": "This permanently removes the project and its images. This can't be undone.",
    "detail.deleting": "Deleting…",
    "detail.notFound": "This project doesn't exist or was removed.",
    "toast.added": "Project added",
    "toast.updated": "Project updated",
    "toast.deleted": "Project deleted",
    "toast.status": "Status changed",
    "toast.loggedIn": "Welcome back",
    "toast.loggedOut": "You're logged out",
    "toast.retry": "Retry",
    "error.generic": "Something went wrong. Please try again.",
    "settings.language": "Language",
  },
  it: {
    "app.name": "Thread",
    "app.tagline": "Tutti i riferimenti e i tessuti in un unico posto ordinato.",
    "nav.login": "Accedi",
    "nav.signup": "Registrati",
    "nav.logout": "Esci",
    "nav.profile": "Profilo",
    "nav.projects": "Progetti",
    "nav.theme": "Cambia tema",
    "landing.heroTitle": "Segui i tuoi progetti creativi, filo per filo.",
    "landing.heroBody":
      "Abbina un'immagine di riferimento al tessuto scelto, aggiungi fino a cinque riferimenti extra e segui ogni progetto da attivo a completato.",
    "landing.cta": "Inizia ora",
    "landing.f1.title": "Riferimento + tessuto",
    "landing.f1.body": "Ogni progetto unisce l'ispirazione al materiale scelto.",
    "landing.f2.title": "Una bacheca ordinata",
    "landing.f2.body": "Schede lunghe, stato chiaro, zero confusione. Filtra per attivo o completato.",
    "landing.f3.title": "Solo tuoi",
    "landing.f3.body": "Privati per definizione: progetti e immagini sono visibili solo a te.",
    "auth.title": "Benvenuto su Thread",
    "auth.subtitle": "Accedi o crea un account per continuare.",
    "auth.login": "Accedi",
    "auth.signup": "Registrati",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.name": "Nome visualizzato",
    "auth.google": "Continua con Google",
    "auth.or": "oppure",
    "auth.loggingIn": "Accesso in corso…",
    "auth.signingUp": "Creazione account…",
    "auth.checkEmail": "Controlla la tua casella per confermare l'indirizzo email.",
    "auth.err.email": "Inserisci un indirizzo email valido.",
    "auth.err.password": "La password deve avere almeno 6 caratteri.",
    "auth.err.name": "Inserisci un nome visualizzato.",
    "home.title": "I tuoi progetti",
    "home.new": "Nuovo progetto",
    "home.all": "Tutti",
    "home.active": "Attivi",
    "home.completed": "Completati",
    "home.empty.title": "Ancora nessun progetto",
    "home.empty.body": "Crea il tuo primo progetto per abbinare un riferimento al suo tessuto.",
    "home.empty.cta": "Crea il primo progetto",
    "home.emptyFilter": "Nessun progetto con questo stato.",
    "status.active": "Attivo",
    "status.completed": "Completato",
    "form.newTitle": "Nuovo progetto",
    "form.editTitle": "Modifica progetto",
    "form.title": "Titolo",
    "form.titlePlaceholder": "es. Giacca estiva in lino",
    "form.description": "Descrizione",
    "form.descriptionPlaceholder": "Note facoltative su questo progetto",
    "form.reference": "Immagine di riferimento",
    "form.fabric": "Immagine del tessuto",
    "form.extra": "Riferimenti aggiuntivi (fino a 5)",
    "form.addImage": "Aggiungi immagine",
    "form.replace": "Sostituisci",
    "form.remove": "Rimuovi",
    "form.save": "Salva progetto",
    "form.saving": "Salvataggio…",
    "form.cancel": "Annulla",
    "form.err.title": "Il titolo è obbligatorio.",
    "form.err.max": "Puoi aggiungere fino a 5 immagini aggiuntive.",
    "detail.back": "Torna ai progetti",
    "detail.edit": "Modifica",
    "detail.delete": "Elimina",
    "detail.markActive": "Segna come attivo",
    "detail.markCompleted": "Segna come completato",
    "detail.reference": "Riferimento",
    "detail.fabric": "Tessuto",
    "detail.gallery": "Riferimenti aggiuntivi",
    "detail.noDescription": "Nessuna descrizione.",
    "detail.created": "Creato",
    "detail.updated": "Aggiornato",
    "detail.viewImage": "Visualizza immagine",
    "detail.close": "Chiudi",
    "detail.previous": "Immagine precedente",
    "detail.next": "Immagine successiva",
    "detail.deleteTitle": "Eliminare questo progetto?",
    "detail.deleteBody": "Il progetto e le sue immagini verranno rimossi definitivamente.",
    "detail.deleting": "Eliminazione…",
    "detail.notFound": "Questo progetto non esiste o è stato rimosso.",
    "toast.added": "Progetto aggiunto",
    "toast.updated": "Progetto aggiornato",
    "toast.deleted": "Progetto eliminato",
    "toast.status": "Stato aggiornato",
    "toast.loggedIn": "Bentornato",
    "toast.loggedOut": "Sessione chiusa",
    "toast.retry": "Riprova",
    "error.generic": "Qualcosa è andato storto. Riprova.",
    "settings.language": "Lingua",
  },
} as const;

export type TKey = keyof (typeof dict)["en"];

const STORAGE_KEY = "thread.lang";

type I18nValue = { lang: Lang; setLang: (l: Lang) => void; t: (key: TKey) => string };

const I18nContext = createContext<I18nValue>({ lang: "en", setLang: () => {}, t: (k) => dict.en[k] });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "it") {
      setLangState(stored);
      return;
    }
    if (navigator.language?.toLowerCase().startsWith("it")) setLangState("it");
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback((key: TKey) => dict[lang][key] ?? dict.en[key], [lang]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}