import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { initialState } from "./seed";
import type {
  Affaire,
  AppelOffre,
  Commande,
  CommandeInterne,
  DataState,
  Devis,
  Notification,
  Opportunite,
  Rejet,
  Role,
  SocialPost,
  Tache,
  User,
} from "./types";

const STORAGE_KEY = "geodata-mvp-state-v1";

interface Ctx {
  state: DataState;
  setState: React.Dispatch<React.SetStateAction<DataState>>;
  currentUser: User;
  setCurrentUserId: (id: string) => void;
  can: (section: string) => boolean;
  reset: () => void;
  // helpers
  userById: (id?: string) => User | undefined;
  clientById: (id?: string) => { nom: string } | undefined;
  updateOpportunite: (id: string, patch: Partial<Opportunite>) => void;
  updateDevis: (id: string, patch: Partial<Devis>) => void;
  updateAo: (id: string, patch: Partial<AppelOffre>) => void;
  updateTache: (id: string, patch: Partial<Tache>) => void;
  updateCi: (id: string, patch: Partial<CommandeInterne>) => void;
  updateCommande: (id: string, patch: Partial<Commande>) => void;
  updateAffaire: (id: string, patch: Partial<Affaire>) => void;
  updatePost: (id: string, patch: Partial<SocialPost>) => void;
  addPost: (p: SocialPost) => void;
  removePost: (id: string) => void;
  addTache: (t: Tache) => void;
  removeTache: (id: string) => void;
  addInteraction: (oppId: string, canal: string, contenu: string) => void;
  notify: (n: Omit<Notification, "id" | "date" | "lue">) => void;
  markNotifRead: (id: string) => void;
  markAllRead: () => void;
  lancerProjet: (args: { titre: string; clientId: string; source: string; sourceType: Affaire["sourceType"]; montant: number; services: Affaire["services"]; chefDeProjetId: string }) => Affaire;
  creerRejet: (ciId: string, data: Omit<Rejet, "id" | "ref" | "commandeInterneId" | "resolu">) => Rejet;
}

const GeoContext = createContext<Ctx | null>(null);

const ROLE_ACCESS: Record<Role, string[]> = {
  ADMINISTRATION: ["*"],
  DIRECTION: ["global", "commercial", "ao", "projets", "ressources", "parametres"],
  COMMERCIAL: ["global", "commercial", "ressources"],
  MARKETING: ["global", "social", "ressources"],
  RESPONSABLE_AO: ["global", "ao", "ressources"],
  CHEF_DE_PROJET: ["global", "projets", "ressources"],
  TECHNICIEN: ["global", "execution", "ressources"],
};

export function GeoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>(initialState);
  const [currentUserId, setCurrentUserId] = useState("u1");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { state: DataState; currentUserId: string };
        if (parsed.state) setState(parsed.state);
        if (parsed.currentUserId) setCurrentUserId(parsed.currentUserId);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, currentUserId }));
    } catch {
      /* ignore */
    }
  }, [state, currentUserId, hydrated]);

  const currentUser = state.users.find((u) => u.id === currentUserId) ?? state.users[0]!;

  const can = useCallback(
    (section: string) => {
      const allowed = ROLE_ACCESS[currentUser.role];
      return allowed.includes("*") || allowed.includes(section);
    },
    [currentUser.role],
  );

  const patch = useCallback(
    <K extends keyof DataState>(key: K, id: string, p: Partial<DataState[K][number]>) => {
      setState((s) => ({
        ...s,
        [key]: (s[key] as Array<{ id: string }>).map((item) => (item.id === id ? { ...item, ...p } : item)),
      }));
    },
    [],
  );

  const notify = useCallback((n: Omit<Notification, "id" | "date" | "lue">) => {
    setState((s) => ({
      ...s,
      notifications: [
        { ...n, id: `n${Date.now()}${Math.round(Math.random() * 999)}`, date: new Date().toISOString().slice(0, 10), lue: false },
        ...s.notifications,
      ],
    }));
  }, []);

  const value: Ctx = useMemo(
    () => ({
      state,
      setState,
      currentUser,
      setCurrentUserId,
      can,
      reset: () => {
        localStorage.removeItem(STORAGE_KEY);
        setState(initialState);
        setCurrentUserId("u1");
        toast.success("Données de démonstration réinitialisées");
      },
      userById: (id?: string) => state.users.find((u) => u.id === id),
      clientById: (id?: string) => state.clients.find((c) => c.id === id),
      updateOpportunite: (id, p) => patch("opportunites", id, p),
      updateDevis: (id, p) => patch("devis", id, p),
      updateAo: (id, p) => patch("appelsOffres", id, p),
      updateTache: (id, p) => patch("taches", id, p),
      updateCi: (id, p) => patch("commandesInternes", id, p),
      updateCommande: (id, p) => patch("commandes", id, p),
      updateAffaire: (id, p) => patch("affaires", id, p),
      updatePost: (id, p) => patch("posts", id, p),
      addPost: (p) => setState((s) => ({ ...s, posts: [p, ...s.posts] })),
      removePost: (id) => setState((s) => ({ ...s, posts: s.posts.filter((x) => x.id !== id) })),
      addTache: (t) => setState((s) => ({ ...s, taches: [...s.taches, t] })),
      removeTache: (id) => setState((s) => ({ ...s, taches: s.taches.filter((x) => x.id !== id) })),
      addInteraction: (oppId, canal, contenu) =>
        setState((s) => ({
          ...s,
          opportunites: s.opportunites.map((o) =>
            o.id === oppId
              ? {
                  ...o,
                  interactions: [
                    ...o.interactions,
                    {
                      id: `it${Date.now()}`,
                      date: new Date().toISOString().slice(0, 10),
                      canal: canal as never,
                      auteur: currentUser.nom,
                      contenu,
                    },
                  ],
                }
              : o,
          ),
        })),
      notify,
      markNotifRead: (id) => patch("notifications", id, { lue: true }),
      markAllRead: () => setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, lue: true })) })),
      lancerProjet: ({ titre, clientId, source, sourceType, montant, services, chefDeProjetId }) => {
        const num = 42 + state.affaires.filter((a) => a.reference.startsWith("AFF-2026")).length - 11;
        const reference = `AFF-2026-${String(Math.max(num, 42)).padStart(3, "0")}`;
        const affaire: Affaire = {
          id: reference,
          reference,
          titre,
          clientId,
          source,
          sourceType,
          chefDeProjetId,
          dateDebut: new Date().toISOString().slice(0, 10),
          dateLimite: "2026-12-31",
          montant,
          progression: 0,
          statut: "En lancement",
          services,
          livrables: ["Plans DWG", "Rapport technique PDF", "Données SIG (SHP)"],
          conditions: "Transféré automatiquement depuis le module commercial / AO – aucune ressaisie.",
        };
        const cmd: Commande = {
          id: `${reference}-C01`,
          reference: `C-${String(state.commandes.length + 1).padStart(2, "0")}`,
          affaireId: reference,
          designation: services[0] ? `Prestation ${services[0]}` : "Prestation principale",
          quantite: 1,
          dateLimite: "2026-12-15",
          chefDeProjetId,
          statut: "À planifier",
        };
        const ci: CommandeInterne = {
          id: `${cmd.id}-CI`,
          reference: `CI-${String(state.commandesInternes.length + 1).padStart(3, "0")}`,
          commandeId: cmd.id,
          designation: cmd.designation,
          quantite: 1,
          dateLimite: cmd.dateLimite,
          chefDeProjetId,
          description: `Commande interne générée automatiquement au lancement de l'affaire ${reference}.`,
          priorite: "Normale",
          statut: "À planifier",
          historique: [{ date: affaire.dateDebut, evenement: "Créée automatiquement au lancement du projet" }],
        };
        setState((s) => ({
          ...s,
          affaires: [affaire, ...s.affaires],
          commandes: [cmd, ...s.commandes],
          commandesInternes: [ci, ...s.commandesInternes],
          notifications: [
            {
              id: `n${Date.now()}`,
              type: "Projet",
              message: `Affaire ${reference} créée automatiquement depuis ${source}.`,
              date: affaire.dateDebut,
              lue: false,
              lien: "/affaires",
            },
            ...s.notifications,
          ],
        }));
        return affaire;
      },
      creerRejet: (ciId, data) => {
        const existants = state.rejets.filter((r) => r.commandeInterneId === ciId).length;
        const rejet: Rejet = {
          ...data,
          id: `rj${Date.now()}`,
          ref: `R${existants + 1}`,
          commandeInterneId: ciId,
          resolu: false,
        };
        setState((s) => ({
          ...s,
          rejets: [rejet, ...s.rejets],
          commandesInternes: s.commandesInternes.map((ci) =>
            ci.id === ciId
              ? {
                  ...ci,
                  statut: "Rejetée",
                  historique: [...ci.historique, { date: rejet.date, evenement: `Rejet ${rejet.ref} – ${rejet.motif}` }],
                }
              : ci,
          ),
          notifications: [
            {
              id: `n${Date.now()}`,
              type: "Rejet",
              message: `Rejet ${rejet.ref} enregistré – ${rejet.motif}.`,
              date: rejet.date,
              lue: false,
              lien: "/affaires",
            },
            ...s.notifications,
          ],
        }));
        return rejet;
      },
    }),
    [state, currentUser, can, patch, notify],
  );

  return <GeoContext.Provider value={value}>{children}</GeoContext.Provider>;
}

export function useGeo() {
  const ctx = useContext(GeoContext);
  if (!ctx) throw new Error("useGeo doit être utilisé dans GeoProvider");
  return ctx;
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMINISTRATION: "Administration",
  DIRECTION: "Direction",
  COMMERCIAL: "Commercial",
  MARKETING: "Marketing / Communication",
  RESPONSABLE_AO: "Responsable Appels d'offres",
  CHEF_DE_PROJET: "Chef de projet",
  TECHNICIEN: "Technicien",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMINISTRATION: "Accès à l'ensemble de la plateforme.",
  DIRECTION: "Vue globale, pilotage et rapports.",
  COMMERCIAL: "CRM, clients, consultations et devis.",
  MARKETING: "Module réseaux sociaux et contenus.",
  RESPONSABLE_AO: "Gestion des appels d'offres et dossiers.",
  CHEF_DE_PROJET: "Projets, planification, exécution et validation.",
  TECHNICIEN: "Tâches affectées et documents d'exécution.",
};

export function fmtMAD(n: number) {
  return `${n.toLocaleString("fr-FR")} MAD`;
}

export function fmtDate(d: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return day ? `${day}/${m}/${y}` : d;
}

export function joursRestants(dateLimite: string) {
  const today = new Date("2026-09-01T00:00:00Z").getTime();
  const t = new Date(`${dateLimite}T00:00:00Z`).getTime();
  return Math.round((t - today) / 86400000);
}
