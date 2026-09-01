import { createFileRoute, Link } from "@tanstack/react-router";
import { Radar, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, ScoreIA, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { fmtDate, fmtMAD, joursRestants, useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/opportunites-detectees")({
  head: () => ({
    meta: [
      { title: "Opportunités détectées — GEODATA" },
      { name: "description", content: "Appels d'offres publics détectés automatiquement par l'agent IA et évalués selon la pertinence GEODATA." },
      { property: "og:title", content: "Opportunités détectées — GEODATA" },
      { property: "og:description", content: "Veille automatisée des marchés publics pertinents pour GEODATA." },
    ],
  }),
  component: DetecteesPage,
});

function DetecteesPage() {
  const { state, updateAo, notify } = useGeo();
  const list = state.appelsOffres.filter((a) => ["Détecté", "À analyser", "Go / No-Go"].includes(a.statut));

  return (
    <div>
      <PageHeader titre="Opportunités détectées" sousTitre="Veille automatisée de l'agent IA Appels d'offres" />
      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((a) => (
          <SectionCard key={a.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
                  <Radar className="size-3.5" /> {a.reference}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">{a.objet}</p>
                <p className="text-xs text-muted-foreground">{a.organisme} · {a.localisation}</p>
              </div>
              <StatusBadge statut={a.statut} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div><dt className="text-xs text-muted-foreground uppercase">Budget</dt><dd className="font-medium tabular-nums">{fmtMAD(a.budget)}</dd></div>
              <div><dt className="text-xs text-muted-foreground uppercase">Caution</dt><dd className="font-medium tabular-nums">{fmtMAD(a.caution)}</dd></div>
              <div><dt className="text-xs text-muted-foreground uppercase">Date limite</dt><dd className="font-medium">{fmtDate(a.dateLimite)}</dd></div>
              <div><dt className="text-xs text-muted-foreground uppercase">Jours restants</dt><dd className="font-medium">J-{joursRestants(a.dateLimite)}</dd></div>
            </dl>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Pertinence GEODATA</span>
              <ScoreIA score={a.scoreIA} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline"><Link to="/appels-offres/$id" params={{ id: a.id }}>Analyser le DCE</Link></Button>
              <Button size="sm" onClick={() => { updateAo(a.id, { statut: "À préparer", decision: "GO" }); notify({ type: "AO", message: `Décision GO sur ${a.reference}.`, lien: "/appels-offres" }); toast.success("Décision GO enregistrée"); }}>
                <ThumbsUp className="size-3.5" /> GO
              </Button>
              <Button size="sm" variant="outline" onClick={() => { updateAo(a.id, { statut: "Perdu", decision: "NO-GO" }); toast("Décision NO-GO enregistrée"); }}>
                <ThumbsDown className="size-3.5" /> NO-GO
              </Button>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
