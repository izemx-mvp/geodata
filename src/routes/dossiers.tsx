import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, ProgressBar, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { fmtDate, fmtMAD, joursRestants, useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/dossiers")({
  head: () => ({
    meta: [
      { title: "Dossiers en cours — GEODATA" },
      { name: "description", content: "Dossiers de réponse aux appels d'offres en préparation : avancement des pièces administratives, techniques et financières." },
      { property: "og:title", content: "Dossiers en cours — GEODATA" },
      { property: "og:description", content: "Suivi de la constitution des dossiers de candidature." },
    ],
  }),
  component: DossiersPage,
});

function DossiersPage() {
  const { state, userById } = useGeo();
  const list = state.appelsOffres.filter((a) => ["À préparer", "En préparation", "Validation interne", "Déposé"].includes(a.statut));

  return (
    <div>
      <PageHeader titre="Dossiers en cours" sousTitre={`${list.length} dossiers de réponse en préparation`} />
      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((a) => {
          const prets = a.checklist.filter((c) => c.fait).length;
          const pct = Math.round((prets / a.checklist.length) * 100);
          return (
            <SectionCard key={a.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{a.reference} — {a.objet}</p>
                  <p className="text-xs text-muted-foreground">{a.organisme} · Responsable {userById(a.responsableId)?.nom ?? "non affecté"}</p>
                </div>
                <StatusBadge statut={a.statut} />
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span>Budget {fmtMAD(a.budget)}</span>
                <span>Dépôt {fmtDate(a.dateLimite)}</span>
                <span className={joursRestants(a.dateLimite) <= 7 ? "font-semibold text-destructive" : ""}>J-{joursRestants(a.dateLimite)}</span>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Checklist du dossier</span>
                  <span className="font-medium">{prets} / {a.checklist.length} documents prêts — {pct}%</span>
                </div>
                <ProgressBar value={pct} />
              </div>
              <Button asChild size="sm" variant="outline" className="mt-4">
                <Link to="/appels-offres/$id" params={{ id: a.id }}>Ouvrir le dossier</Link>
              </Button>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
