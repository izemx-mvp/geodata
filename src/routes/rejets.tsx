import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Field, PageHeader, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { fmtDate, useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/rejets")({
  head: () => ({
    meta: [
      { title: "Rejets & corrections — GEODATA" },
      { name: "description", content: "Historique des rejets R1, R2 et suivants sur les livrables GEODATA, motifs, corrections demandées et résolution." },
      { property: "og:title", content: "Rejets & corrections — GEODATA" },
      { property: "og:description", content: "Traçabilité complète des cycles de correction client et administration." },
    ],
  }),
  component: RejetsPage,
});

function RejetsPage() {
  const { state, setState, updateCi } = useGeo();
  return (
    <div>
      <PageHeader titre="Rejets & corrections" sousTitre={`${state.rejets.length} rejets enregistrés — cycles R1 / R2 / R3`} />
      <div className="grid gap-3 lg:grid-cols-2">
        {state.rejets.map((r) => {
          const ci = state.commandesInternes.find((c) => c.id === r.commandeInterneId);
          const cmd = state.commandes.find((c) => c.id === ci?.commandeId);
          const aff = state.affaires.find((a) => a.id === cmd?.affaireId);
          return (
            <SectionCard key={r.id} titre={`${r.ref} — ${r.motif}`} actions={<StatusBadge statut={r.resolu ? "Résolu" : "Correction demandée"} />}>
              <dl className="grid gap-4 sm:grid-cols-3">
                <Field label="Date" value={fmtDate(r.date)} />
                <Field label="Origine" value={r.origine} />
                <Field label="Commande interne" value={ci?.reference ?? "—"} />
              </dl>
              <p className="mt-3 text-sm text-muted-foreground">{r.commentaires}</p>
              <p className="mt-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Corrections demandées</p>
              <ul className="mt-1 space-y-1 text-sm">{r.corrections.map((c) => (<li key={c}>• {c}</li>))}</ul>
              <div className="mt-3 flex flex-wrap gap-2">
                {!r.resolu ? (
                  <Button size="sm" onClick={() => {
                    setState((s) => ({ ...s, rejets: s.rejets.map((x) => (x.id === r.id ? { ...x, resolu: true } : x)) }));
                    if (ci) updateCi(ci.id, { statut: "Livraison interne", historique: [...ci.historique, { date: new Date().toISOString().slice(0, 10), evenement: `Corrections ${r.ref} appliquées` }] });
                    toast.success(`Corrections ${r.ref} appliquées`);
                  }}>Marquer les corrections faites</Button>
                ) : null}
                {aff ? <Button asChild size="sm" variant="outline"><Link to="/affaires/$id" params={{ id: aff.id }}>Ouvrir l'affaire</Link></Button> : null}
              </div>
            </SectionCard>
          );
        })}
        {!state.rejets.length ? <SectionCard titre="Aucun rejet"><p className="text-sm text-muted-foreground">Aucun cycle de correction en cours.</p></SectionCard> : null}
      </div>
    </div>
  );
}
