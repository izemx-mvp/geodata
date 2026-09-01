import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ChevronLeft, ChevronRight, List } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader, ScoreIA, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmtDate, fmtMAD, joursRestants, useGeo } from "@/lib/geodata/store";
import type { AppelOffre } from "@/lib/geodata/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendrier-ao")({
  head: () => ({
    meta: [
      { title: "Calendrier AO — GEODATA" },
      { name: "description", content: "Calendrier des appels d'offres GEODATA : publications, visites obligatoires, réunions, deadlines internes et dates de dépôt." },
      { property: "og:title", content: "Calendrier AO — GEODATA" },
      { property: "og:description", content: "Vue mois, semaine et liste de toutes les échéances des marchés publics suivis." },
    ],
  }),
  component: CalendrierAoPage,
});

type TypeEvenement =
  | "Publication"
  | "Visite obligatoire"
  | "Réunion d'information"
  | "Deadline interne"
  | "Date de validation"
  | "Date limite / dépôt";

interface Evenement {
  id: string;
  date: string;
  type: TypeEvenement;
  ao: AppelOffre;
}

const COULEURS: Record<TypeEvenement, string> = {
  "Publication": "bg-info/15 text-info border-info/30",
  "Visite obligatoire": "bg-destructive/10 text-destructive border-destructive/30",
  "Réunion d'information": "bg-info/15 text-info border-info/30",
  "Deadline interne": "bg-info/15 text-info border-info/30",
  "Date de validation": "bg-success/15 text-success border-success/30",
  "Date limite / dépôt": "bg-primary/15 text-primary border-primary/35",
};

const POINTS: Record<TypeEvenement, string> = {
  "Publication": "bg-info",
  "Visite obligatoire": "bg-destructive",
  "Réunion d'information": "bg-info",
  "Deadline interne": "bg-info",
  "Date de validation": "bg-success",
  "Date limite / dépôt": "bg-primary",
};

const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}
function decale(dateStr: string, jours: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + jours);
  return iso(d);
}

function evenementsDe(ao: AppelOffre): Evenement[] {
  return [
    { id: `${ao.id}-pub`, date: ao.datePublication, type: "Publication", ao },
    { id: `${ao.id}-vis`, date: decale(ao.dateLimite, -14), type: "Visite obligatoire", ao },
    { id: `${ao.id}-reu`, date: decale(ao.dateLimite, -10), type: "Réunion d'information", ao },
    { id: `${ao.id}-int`, date: decale(ao.dateLimite, -5), type: "Deadline interne", ao },
    { id: `${ao.id}-val`, date: decale(ao.dateLimite, -2), type: "Date de validation", ao },
    { id: `${ao.id}-lim`, date: ao.dateLimite, type: "Date limite / dépôt", ao },
  ];
}

function CalendrierAoPage() {
  const { state, userById } = useGeo();
  const [vue, setVue] = useState<"mois" | "semaine" | "liste">("mois");
  const [curseur, setCurseur] = useState(() => new Date("2026-09-01"));
  const [organisme, setOrganisme] = useState("all");
  const [responsable, setResponsable] = useState("all");
  const [statut, setStatut] = useState("all");
  const [categorie, setCategorie] = useState("all");
  const [typeFiltre, setTypeFiltre] = useState("all");

  const organismes = [...new Set(state.appelsOffres.map((a) => a.organisme))];
  const categories = [...new Set(state.appelsOffres.map((a) => a.categorie))];
  const statuts = [...new Set(state.appelsOffres.map((a) => a.statut))];

  const evenements = useMemo(() => {
    return state.appelsOffres
      .filter((a) => organisme === "all" || a.organisme === organisme)
      .filter((a) => responsable === "all" || a.responsableId === responsable)
      .filter((a) => statut === "all" || a.statut === statut)
      .filter((a) => categorie === "all" || a.categorie === categorie)
      .flatMap(evenementsDe)
      .filter((e) => typeFiltre === "all" || e.type === typeFiltre)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [state.appelsOffres, organisme, responsable, statut, categorie, typeFiltre]);

  const parJour = useMemo(() => {
    const m = new Map<string, Evenement[]>();
    for (const e of evenements) m.set(e.date, [...(m.get(e.date) ?? []), e]);
    return m;
  }, [evenements]);

  // Grille du mois (démarre le lundi)
  const grilleMois = useMemo(() => {
    const debut = new Date(curseur.getFullYear(), curseur.getMonth(), 1);
    const offset = (debut.getDay() + 6) % 7;
    debut.setDate(debut.getDate() - offset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(debut);
      d.setDate(debut.getDate() + i);
      return d;
    });
  }, [curseur]);

  const grilleSemaine = useMemo(() => {
    const debut = new Date(curseur);
    debut.setDate(debut.getDate() - ((debut.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(debut);
      d.setDate(debut.getDate() + i);
      return d;
    });
  }, [curseur]);

  function naviguer(sens: number) {
    const d = new Date(curseur);
    if (vue === "semaine") d.setDate(d.getDate() + sens * 7);
    else d.setMonth(d.getMonth() + sens);
    setCurseur(d);
  }

  const titrePeriode =
    vue === "semaine"
      ? `Semaine du ${grilleSemaine[0]!.toLocaleDateString("fr-FR")} au ${grilleSemaine[6]!.toLocaleDateString("fr-FR")}`
      : `${MOIS[curseur.getMonth()]} ${curseur.getFullYear()}`;

  return (
    <div>
      <PageHeader
        titre="Calendrier AO"
        sousTitre="Publications, visites obligatoires, réunions, deadlines internes et dates de dépôt"
        actions={
          <div className="flex overflow-hidden rounded-lg border border-border">
            {([["mois", "Mois"], ["semaine", "Semaine"], ["liste", "Liste"]] as const).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setVue(v)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                  vue === v ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary",
                )}
              >
                {v === "liste" ? <List className="size-3.5" /> : <CalendarDays className="size-3.5" />} {l}
              </button>
            ))}
          </div>
        }
      />

      <SectionCard className="mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={organisme} onValueChange={setOrganisme}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Organisme" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les organismes</SelectItem>
              {organismes.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={responsable} onValueChange={setResponsable}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Responsable" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les responsables</SelectItem>
              {state.users.map((u) => (<SelectItem key={u.id} value={u.id}>{u.nom}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={statut} onValueChange={setStatut}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {statuts.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={categorie} onValueChange={setCategorie}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Catégorie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={typeFiltre} onValueChange={setTypeFiltre}>
            <SelectTrigger className="w-52"><SelectValue placeholder="Type d'échéance" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {Object.keys(COULEURS).map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3">
          {Object.entries(POINTS).map(([t, c]) => (
            <span key={t} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className={cn("size-2 rounded-full", c)} /> {t}
            </span>
          ))}
        </div>
      </SectionCard>

      {vue !== "liste" ? (
        <SectionCard>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">{titrePeriode}</p>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" onClick={() => naviguer(-1)}><ChevronLeft className="size-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => setCurseur(new Date("2026-09-01"))}>Aujourd'hui</Button>
              <Button size="sm" variant="outline" onClick={() => naviguer(1)}><ChevronRight className="size-4" /></Button>
            </div>
          </div>

          <div className={cn("grid gap-px overflow-hidden rounded-lg border border-border bg-border", vue === "mois" ? "grid-cols-7" : "grid-cols-7")}>
            {JOURS.map((j) => (
              <div key={j} className="bg-secondary px-2 py-1.5 text-center text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {j}
              </div>
            ))}
            {(vue === "mois" ? grilleMois : grilleSemaine).map((d) => {
              const key = iso(d);
              const evts = parJour.get(key) ?? [];
              const horsMois = vue === "mois" && d.getMonth() !== curseur.getMonth();
              return (
                <div
                  key={key}
                  className={cn(
                    "min-h-28 bg-card p-1.5 align-top",
                    vue === "semaine" && "min-h-64",
                    horsMois && "bg-secondary/40",
                  )}
                >
                  <p className={cn("mb-1 text-right text-[11px] font-medium tabular-nums", horsMois ? "text-muted-foreground/60" : "text-foreground")}>
                    {d.getDate()}
                  </p>
                  <div className="space-y-1">
                    {evts.map((e) => (
                      <Link
                        key={e.id}
                        to="/appels-offres/$id"
                        params={{ id: e.ao.id }}
                        className={cn("block truncate rounded border px-1.5 py-1 text-[10px] font-medium transition-opacity hover:opacity-80", COULEURS[e.type])}
                        title={`${e.type} · ${e.ao.reference} — ${e.ao.objet}`}
                      >
                        {e.type === "Date limite / dépôt" ? "⏳ " : ""}{e.ao.reference}
                        <span className="block truncate font-normal opacity-80">{e.type}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      ) : (
        <SectionCard titre="Toutes les échéances" description={`${evenements.length} échéances planifiées`}>
          <ol className="relative space-y-5 border-l border-border pl-6">
            {evenements.map((e) => {
              const j = joursRestants(e.date);
              return (
                <li key={e.id} className="relative">
                  <span className={cn("absolute top-1.5 -left-[27px] size-3 rounded-full border-2 border-card", POINTS[e.type])} />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {fmtDate(e.date)} — {e.ao.reference}
                        <span className={cn("ml-2 rounded border px-1.5 py-0.5 text-[10px] font-medium", COULEURS[e.type])}>{e.type}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{e.ao.objet} · {e.ao.organisme}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Budget {fmtMAD(e.ao.budget)} · Responsable {e.ao.responsableId ? userById(e.ao.responsableId)?.nom : "non affecté"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <ScoreIA score={e.ao.scoreIA} />
                      <StatusBadge statut={j < 0 ? "Passé" : `J-${j}`} tone={j < 0 ? "neutre" : j <= 7 ? "rouge" : "bleu"} />
                      <Button asChild size="sm" variant="ghost"><Link to="/appels-offres/$id" params={{ id: e.ao.id }}>Ouvrir</Link></Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </SectionCard>
      )}
    </div>
  );
}
