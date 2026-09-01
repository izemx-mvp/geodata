import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  Radar,
  Route as RouteIcon,
  Target,
  Truck,
} from "lucide-react";
import { AssistantIA } from "@/components/geodata/AssistantIA";
import { KpiCard, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { fmtMAD, joursRestants, useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vue globale — GEODATA Plateforme IA" },
      {
        name: "description",
        content:
          "Pilotage opérationnel GEODATA : opportunités commerciales, appels d'offres, affaires, validations et livraisons dans une seule plateforme intelligente.",
      },
      { property: "og:title", content: "Vue globale — GEODATA Plateforme IA" },
      {
        property: "og:description",
        content: "Le tableau de bord opérationnel de GEODATA : commercial, appels d'offres et projets pilotés par l'IA.",
      },
    ],
  }),
  component: VueGlobale,
});

function VueGlobale() {
  const { state, userById, clientById } = useGeo();

  const oppActives = state.opportunites.filter((o) => !["Gagné", "Perdu"].includes(o.stage));
  const devisAPreparer = state.opportunites.filter((o) => o.stage === "Devis à préparer");
  const aoAAnalyser = state.appelsOffres.filter((a) => ["Détecté", "À analyser", "Go / No-Go"].includes(a.statut));
  const aoUrgents = state.appelsOffres.filter((a) => {
    const j = joursRestants(a.dateLimite);
    return j >= 0 && j <= 7;
  });
  const affairesActives = state.affaires.filter((a) => a.statut !== "Clôturée");
  const enRetard = state.affaires.filter((a) => a.statut === "En exécution" && a.progression < 50);
  const aValider = state.taches.filter((t) => t.statut === "En attente de validation");
  const livraisons = state.commandesInternes.filter((c) =>
    ["Livraison interne", "Livraison en attente", "Contrôle en cours"].includes(c.statut),
  );

  return (
    <div className="space-y-8">
      <div className="topo-surface -mx-5 -mt-6 border-b border-border px-5 py-8 lg:-mx-8 lg:px-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">Plateforme intelligente GEODATA</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Vue globale opérationnelle</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Le commercial, les appels d'offres et l'exécution des projets connectés par trois agents IA sur une base de
          données unique.
        </p>
        <div className="mt-6 max-w-4xl">
          <AssistantIA />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Opportunités commerciales" value={oppActives.length} icon={<Target className="size-4" />} tone="orange" />
        <KpiCard label="Devis à préparer" value={devisAPreparer.length} icon={<FileSpreadsheet className="size-4" />} />
        <KpiCard label="AO à analyser" value={aoAAnalyser.length} icon={<Radar className="size-4" />} />
        <KpiCard label="AO proches de la limite" value={aoUrgents.length} tone="rouge" icon={<AlertTriangle className="size-4" />} />
        <KpiCard label="Affaires actives" value={affairesActives.length} icon={<Boxes className="size-4" />} />
        <KpiCard label="Projets en retard" value={enRetard.length} tone="rouge" icon={<AlertTriangle className="size-4" />} />
        <KpiCard label="Tâches à valider" value={aValider.length} icon={<CheckCircle2 className="size-4" />} />
        <KpiCard label="Livraisons en attente" value={livraisons.length} icon={<Truck className="size-4" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <QuickAction
          to="/opportunites"
          titre="Traiter une opportunité commerciale"
          description="Qualification IA, préparation de devis et relances recommandées."
          icon={<Target className="size-5" />}
        />
        <QuickAction
          to="/appels-offres"
          titre="Analyser un appel d'offres"
          description="Score de pertinence, extraction du DCE, décision GO / NO-GO."
          icon={<ClipboardList className="size-5" />}
        />
        <QuickAction
          to="/affaires"
          titre="Suivre un projet"
          description="Commandes, planification, exécution, validation et livraison."
          icon={<Boxes className="size-5" />}
        />
      </div>

      <Link
        to="/affaires"
        className="card-elev flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/40 bg-accent/60 px-6 py-5 transition-colors hover:bg-accent"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <RouteIcon className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Suivre le workflow complet d'une affaire</p>
            <p className="text-xs text-muted-foreground">
              Opportunité → Offre → Validation → Affaire → Commande → Planification → Exécution → Livraison → Facturation
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          Ouvrir les affaires <ArrowRight className="size-4" />
        </span>
      </Link>


      <SectionCard titre="À traiter aujourd'hui" description="Actions prioritaires détectées par les agents IA">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {aoUrgents.slice(0, 1).map((ao) => (
            <ActionCard
              key={ao.id}
              tag="URGENT"
              tagTone="rouge"
              titre={`AO – ${ao.organisme}`}
              lignes={[`Échéance : ${ao.dateLimite} (J-${joursRestants(ao.dateLimite)})`, "Action : Finaliser l'offre financière"]}
              to="/appels-offres"
            />
          ))}
          {state.devis
            .filter((d) => d.statut === "En validation")
            .slice(0, 1)
            .map((d) => (
              <ActionCard
                key={d.id}
                tag="DEVIS"
                titre={d.objet}
                lignes={[
                  "Devis en attente de validation",
                  `Montant : ${fmtMAD(d.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0))}`,
                ]}
                to="/devis"
              />
            ))}
          {state.affaires.slice(0, 1).map((a) => (
            <ActionCard
              key={a.id}
              tag="PROJET"
              titre={`Affaire ${a.reference}`}
              lignes={[
                `${state.taches.filter((t) => t.statut === "En attente de validation").length} tâches terrain terminées`,
                `Validation ${userById(a.chefDeProjetId)?.nom} requise`,
              ]}
              to="/validation"
            />
          ))}
          {livraisons.slice(0, 1).map((c) => (
            <ActionCard
              key={c.id}
              tag="LIVRAISON"
              titre={c.designation}
              lignes={["Contrôle administration en attente", `Réf. ${c.reference}`]}
              to="/livraisons"
            />
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          titre="Opportunités à fort potentiel"
          actions={
            <Button asChild size="sm" variant="ghost">
              <Link to="/opportunites">Tout voir</Link>
            </Button>
          }
        >
          <ul className="divide-y divide-border">
            {[...oppActives]
              .sort((a, b) => b.scoreIA - a.scoreIA)
              .slice(0, 5)
              .map((o) => (
                <li key={o.id}>
                  <Link
                    to="/opportunites/$id"
                    params={{ id: o.id }}
                    className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:text-primary"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{o.titre}</span>
                      <span className="block text-xs text-muted-foreground">
                        {clientById(o.clientId)?.nom} · {fmtMAD(o.montantEstime)}
                      </span>
                    </span>
                    <StatusBadge statut={o.stage} />
                  </Link>
                </li>
              ))}
          </ul>
        </SectionCard>

        <SectionCard
          titre="Appels d'offres prioritaires"
          actions={
            <Button asChild size="sm" variant="ghost">
              <Link to="/appels-offres">Tout voir</Link>
            </Button>
          }
        >
          <ul className="divide-y divide-border">
            {[...state.appelsOffres]
              .filter((a) => !["Gagné", "Perdu"].includes(a.statut))
              .sort((a, b) => joursRestants(a.dateLimite) - joursRestants(b.dateLimite))
              .slice(0, 5)
              .map((a) => (
                <li key={a.id}>
                  <Link
                    to="/appels-offres/$id"
                    params={{ id: a.id }}
                    className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:text-primary"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{a.reference} — {a.objet}</span>
                      <span className="block text-xs text-muted-foreground">
                        {a.organisme} · J-{joursRestants(a.dateLimite)} · score {a.scoreIA}%
                      </span>
                    </span>
                    <StatusBadge statut={a.statut} />
                  </Link>
                </li>
              ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}

function QuickAction({ to, titre, description, icon }: { to: string; titre: string; description: string; icon: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="card-elev group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent text-primary">{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{titre}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{description}</span>
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
          Ouvrir <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </span>
    </Link>
  );
}

function ActionCard({
  tag,
  tagTone,
  titre,
  lignes,
  to,
}: {
  tag: string;
  tagTone?: "rouge";
  titre: string;
  lignes: string[];
  to: string;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col rounded-lg border border-border bg-secondary/40 p-4 transition-colors hover:border-primary/50 hover:bg-accent/40"
    >
      <StatusBadge statut={tag} tone={tagTone ?? "orange"} />
      <p className="mt-2.5 text-sm font-semibold text-foreground">{titre}</p>
      {lignes.map((l, i) => (
        <p key={i} className="mt-1 text-xs text-muted-foreground">
          {l}
        </p>
      ))}
    </Link>
  );
}
