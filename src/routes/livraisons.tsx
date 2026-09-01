import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Receipt, Truck } from "lucide-react";
import { toast } from "sonner";
import { Field, PageHeader, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { fmtDate, useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/livraisons")({
  head: () => ({
    meta: [
      { title: "Livraisons — GEODATA" },
      { name: "description", content: "Livraisons internes et clients GEODATA : contrôle administration, bordereaux, versions livrées et dossiers prêts à facturer." },
      { property: "og:title", content: "Livraisons — GEODATA" },
      { property: "og:description", content: "Dernière étape du workflow avant la facturation." },
    ],
  }),
  component: LivraisonsPage,
});

function LivraisonsPage() {
  const { state, updateCi, userById } = useGeo();
  const list = state.commandesInternes.filter((ci) =>
    ["Livraison interne", "Livraison en attente", "Contrôle en cours", "Livrée client", "Prêt à facturer"].includes(ci.statut),
  );

  return (
    <div>
      <PageHeader titre="Livraisons" sousTitre={`${list.length} dossiers en phase de livraison ou de contrôle`} />
      <div className="grid gap-3 lg:grid-cols-2">
        {list.map((ci) => {
          const cmd = state.commandes.find((c) => c.id === ci.commandeId);
          const aff = state.affaires.find((a) => a.id === cmd?.affaireId);
          return (
            <SectionCard key={ci.id} titre={`${ci.reference} — ${ci.designation}`} actions={<StatusBadge statut={ci.statut} />}>
              <dl className="grid gap-4 sm:grid-cols-3">
                <Field label="Affaire" value={aff?.reference ?? "—"} />
                <Field label="Chef de projet" value={userById(ci.chefDeProjetId)?.nom ?? "—"} />
                <Field label="Délai" value={fmtDate(ci.dateLimite)} />
              </dl>
              {ci.controle ? (
                <div className="mt-3 rounded-lg border border-border bg-secondary/40 p-3 text-sm">
                  <p className="font-medium">{ci.controle.type} — envoyé le {fmtDate(ci.controle.dateEnvoi)}</p>
                  <p className="text-xs text-muted-foreground">Responsable : {ci.controle.responsable}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{ci.controle.commentaires}</p>
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {ci.statut === "Contrôle en cours" ? (
                  <>
                    <Button size="sm" onClick={() => { updateCi(ci.id, { statut: "Livrée client", ...(ci.controle ? { controle: { ...ci.controle, resultat: "VALIDÉ" as const } } : {}), historique: [...ci.historique, { date: new Date().toISOString().slice(0, 10), evenement: "Contrôle validé" }] }); toast.success("Contrôle validé"); }}>Contrôle validé</Button>
                    <Button size="sm" variant="outline" onClick={() => { updateCi(ci.id, { statut: "Rejetée", ...(ci.controle ? { controle: { ...ci.controle, resultat: "REJETÉ" as const } } : {}) }); toast.error("Contrôle rejeté"); }}>Contrôle rejeté</Button>
                  </>
                ) : null}
                {ci.statut === "Livrée client" ? (
                  <Button size="sm" onClick={() => { updateCi(ci.id, { statut: "Prêt à facturer", historique: [...ci.historique, { date: new Date().toISOString().slice(0, 10), evenement: "Dossier prêt à facturer" }] }); toast.success("Dossier prêt à facturer"); }}>
                    <Receipt className="size-4" /> Marquer prêt à facturer
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" onClick={() => toast.success("Bordereau de livraison généré (démo)")}><Download className="size-4" /> Bordereau</Button>
                {aff ? <Button asChild size="sm" variant="ghost"><Link to="/affaires/$id" params={{ id: aff.id }}><Truck className="size-4" /> Ouvrir l'affaire</Link></Button> : null}
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
