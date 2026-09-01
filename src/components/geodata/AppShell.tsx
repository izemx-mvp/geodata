import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Boxes,
  Building2,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Cog,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  Gauge,
  Hammer,
  LayoutGrid,
  Library,
  ListChecks,
  MessageSquareShare,
  PackageCheck,
  Radar,
  RotateCcw,
  Share2,
  ShieldCheck,
  Target,
  Truck,
  Users,
  UsersRound,
  Route as Route2,
} from "lucide-react";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, useGeo } from "@/lib/geodata/store";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  section: string;
}

const NAV: { groupe: string | null; items: NavItem[] }[] = [
  {
    groupe: null,
    items: [{ to: "/", label: "Vue globale", icon: <Gauge className="size-4" />, section: "global" }],
  },
  {
    groupe: "Commercial",
    items: [
      { to: "/opportunites", label: "Opportunités", icon: <Target className="size-4" />, section: "commercial" },
      { to: "/clients", label: "Prospects & Clients", icon: <Building2 className="size-4" />, section: "commercial" },
      { to: "/consultations", label: "Consultations", icon: <MessageSquareShare className="size-4" />, section: "commercial" },
      { to: "/devis", label: "Devis", icon: <FileSpreadsheet className="size-4" />, section: "commercial" },
      { to: "/reseaux-sociaux", label: "Réseaux sociaux", icon: <Share2 className="size-4" />, section: "social" },
      { to: "/calendrier-editorial", label: "Calendrier éditorial", icon: <CalendarDays className="size-4" />, section: "social" },
    ],
  },
  {
    groupe: "Appels d'offres",
    items: [
      { to: "/opportunites-detectees", label: "Opportunités détectées", icon: <Radar className="size-4" />, section: "ao" },
      { to: "/appels-offres", label: "Appels d'offres", icon: <ClipboardList className="size-4" />, section: "ao" },
      { to: "/dossiers", label: "Dossiers en cours", icon: <FolderKanban className="size-4" />, section: "ao" },
      { to: "/calendrier-ao", label: "Calendrier AO", icon: <CalendarRange className="size-4" />, section: "ao" },
      { to: "/references", label: "Références GEODATA", icon: <Library className="size-4" />, section: "ao" },
    ],
  },
  {
    groupe: "Projets",
    items: [
      { to: "/affaires", label: "Affaires", icon: <Boxes className="size-4" />, section: "projets" },
      { to: "/commandes", label: "Commandes", icon: <PackageCheck className="size-4" />, section: "projets" },
      { to: "/commandes-internes", label: "Commandes internes", icon: <ListChecks className="size-4" />, section: "projets" },
      { to: "/planning", label: "Planning", icon: <CalendarDays className="size-4" />, section: "projets" },
      { to: "/execution", label: "Exécution", icon: <Hammer className="size-4" />, section: "execution" },
      { to: "/validation", label: "Validation", icon: <CheckCircle2 className="size-4" />, section: "projets" },
      { to: "/livraisons", label: "Livraisons", icon: <Truck className="size-4" />, section: "projets" },
      { to: "/rejets", label: "Rejets", icon: <RotateCcw className="size-4" />, section: "projets" },
    ],
  },
  {
    groupe: "Ressources",
    items: [
      { to: "/equipes", label: "Équipes", icon: <UsersRound className="size-4" />, section: "ressources" },
      { to: "/documents", label: "Documents", icon: <FileText className="size-4" />, section: "ressources" },
      { to: "/notifications", label: "Notifications", icon: <Bell className="size-4" />, section: "ressources" },
      { to: "/parcours", label: "Parcours démo", icon: <Route2 className="size-4" />, section: "global" },
    ],
  },
  {
    groupe: "Paramètres",
    items: [
      { to: "/utilisateurs", label: "Utilisateurs", icon: <Users className="size-4" />, section: "parametres" },
      { to: "/roles", label: "Rôles & permissions", icon: <ShieldCheck className="size-4" />, section: "parametres" },
      { to: "/configuration-ia", label: "Configuration des agents IA", icon: <Cog className="size-4" />, section: "parametres" },
    ],
  },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 px-4 py-5">
      <BrandLogo className="h-10" />
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { currentUser, setCurrentUserId, state, can } = useGeo();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const nonLues = state.notifications.filter((n) => !n.lue).length;
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    setAuthed(window.localStorage.getItem("geodata-auth") === "ok");
  }, []);

  if (authed === null) {
    return <div className="min-h-screen bg-anthracite" />;
  }

  if (!authed) {
    return (
      <LoginScreen
        onSuccess={() => {
          window.localStorage.setItem("geodata-auth", "ok");
          setAuthed(true);
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="pointer-events-none absolute inset-0 opacity-40 geo-grid-live" />
        <div className="relative flex min-h-0 flex-1 flex-col">
        <Logo />
        <ScrollArea className="flex-1">

          <nav className="space-y-5 px-3 pb-8">
            {NAV.map((groupe) => {
              const items = groupe.items.filter((i) => can(i.section) || can("*"));
              if (!items.length) return null;
              return (
                <div key={groupe.groupe ?? "root"}>
                  {groupe.groupe ? (
                    <p className="px-3 pb-1.5 text-[10px] font-semibold tracking-[0.15em] text-sidebar-foreground/45 uppercase">
                      {groupe.groupe}
                    </p>
                  ) : null}
                  <ul className="space-y-0.5">
                    {items.map((item) => {
                      const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                      return (
                        <li key={item.to}>
                          <Link
                            to={item.to}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                              active
                                ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground"
                                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            )}
                          >
                            {item.icon}
                            <span className="truncate">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/85 px-5 backdrop-blur">
          <div className="flex items-center gap-3 lg:hidden">
            <span className="text-sm font-bold tracking-[0.18em] text-foreground">GEODATA</span>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
            <span className="inline-flex size-1.5 rounded-full bg-success" />
            3 agents IA actifs — Commercial · Appels d'offres · Projets
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="relative">
              <Link to="/notifications">
                <Bell className="size-4" />
                {nonLues > 0 ? (
                  <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {nonLues}
                  </span>
                ) : null}
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 rounded-lg border border-border px-2.5 py-1.5 text-left transition-colors hover:bg-secondary">
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      {currentUser.initiales}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden leading-tight sm:block">
                    <span className="block text-xs font-medium text-foreground">{currentUser.nom}</span>
                    <span className="block text-[10px] text-muted-foreground">{ROLE_LABELS[currentUser.role]}</span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Changer d'utilisateur (démo rôles)</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-80">
                  {state.users.map((u) => (
                    <DropdownMenuItem key={u.id} onClick={() => setCurrentUserId(u.id)}>
                      <span className="flex-1">
                        <span className="block text-sm">{u.nom}</span>
                        <span className="block text-xs text-muted-foreground">{ROLE_LABELS[u.role]}</span>
                      </span>
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-5 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
