import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { fmtDate, useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/validation")({
  head: () => ({
    meta: [
      { title: "Validation — GEODATA" },
      { name: "description", content: "Contrôle qualité GEODATA : validation des tâches terminées par les chefs de projet avant livraison interne." },
      { property: "og:title", content: "Validation — GEODATA" },
      { property: "og:description", content: "Chaque livrable passe par un contrôle interne avant transmission au client." },
    ],
  }),
  component: ValidationPage,
});

function ValidationPage() {
  const { state, updateTache, userById, notify } = useGeo();
  const list = state.taches.filter((t) => t.statut === "En attente de validation");

  return (
    <div>
      <PageHeader titre="Validation" sousTitre={`${list.length} tâches en attente de contrôle qualité`} />
      {!list.length ? (
        <EmptyState titre="Aucune tâche en attente" description="Les techniciens n'ont soumis aucun livrable pour le moment." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {list.map((t) => {
            const ci = state.commandesInternes.find((c) => c.id === t.commandeInterneId);
            return (
              <SectionCard key={t.id} titre={t.libelle} actions={<StatusBadge statut={t.statut} />}>
                <p className="text-xs text-muted-foreground">{ci?.reference} · {t.type} · Réalisée par {userById(t.responsableId)?.nom} · {fmtDate(t.dateDebut)}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => { updateTache(t.id, { statut: "Validée" }); toast.success("Livrable validé"); }}><CheckCircle2 className="size-4" /> Valider</Button>
                  <Button size="sm" variant="outline" onClick={() => { updateTache(t.id, { statut: "Correction demandée", progression: 75 }); notify({ type: "Rejet", message: `Correction demandée : ${t.libelle}`, lien: "/execution" }); toast("Correction demandée au technicien"); }}>
                    <RotateCcw className="size-4" /> Demander une correction
                  </Button>
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
