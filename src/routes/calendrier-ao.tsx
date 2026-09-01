import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, ScoreIA, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { fmtDate, fmtMAD, joursRestants, useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/calendrier-ao")({
  head: () => ({
    meta: [
      { title: "Calendrier AO — GEODATA" },
      { name: "description", content: "Échéancier des appels d'offres GEODATA : dates de publication, visites de lieux et dates limites de dépôt." },
      { property: "og:title", content: "Calendrier AO — GEODATA" },
      { property: "og:description", content: "Toutes les échéances de dépôt des marchés publics suivis." },
    ],
  }),
  component: CalendrierAoPage,
});

function CalendrierAoPage() {
  const { state } = useGeo();
  const list = [...state.appelsOffres].sort((a, b) => a.dateLimite.localeCompare(b.dateLimite));

  return (
    <div>
      <PageHeader titre="Calendrier AO" sousTitre="Échéancier des dépôts et des visites obligatoires" />
      <SectionCard>
        <ol className="relative space-y-5 border-l border-border pl-6">
          {list.map((a) => {
            const j = joursRestants(a.dateLimite);
            return (
              <li key={a.id} className="relative">
                <span className={`absolute top-1.5 -left-[27px] size-3 rounded-full border-2 border-card ${j < 0 ? "bg-muted-foreground" : j <= 7 ? "bg-destructive" : "bg-primary"}`} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{fmtDate(a.dateLimite)} — {a.reference}</p>
                    <p className="text-xs text-muted-foreground">{a.objet} · {a.organisme}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Budget {fmtMAD(a.budget)} · Visite des lieux : 08/09/2026</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ScoreIA score={a.scoreIA} />
                    <StatusBadge statut={j < 0 ? "Clôturé" : `J-${j}`} tone={j < 0 ? "neutre" : j <= 7 ? "rouge" : "bleu"} />
                    <Button asChild size="sm" variant="ghost"><Link to="/appels-offres/$id" params={{ id: a.id }}>Ouvrir</Link></Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </SectionCard>
    </div>
  );
}
