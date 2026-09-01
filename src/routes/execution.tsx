import { createFileRoute } from "@tanstack/react-router";
import { Send, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmtDate, useGeo } from "@/lib/geodata/store";
import type { Tache } from "@/lib/geodata/types";

export const Route = createFileRoute("/execution")({
  head: () => ({
    meta: [
      { title: "Exécution — GEODATA" },
      { name: "description", content: "Espace technicien GEODATA : tâches affectées, avancement, livrables et soumission au contrôle du chef de projet." },
      { property: "og:title", content: "Exécution — GEODATA" },
      { property: "og:description", content: "Suivi terrain et bureau des tâches d'exécution." },
    ],
  }),
  component: ExecutionPage,
});

function ExecutionPage() {
  const { state, currentUser, updateTache, userById, notify } = useGeo();
  const mesTaches = state.taches.filter((t) => (currentUser.role === "TECHNICIEN" ? t.responsableId === currentUser.id : true));

  return (
    <div>
      <PageHeader
        titre="Exécution"
        sousTitre={currentUser.role === "TECHNICIEN" ? `Vos tâches affectées, ${currentUser.nom}` : `${mesTaches.length} tâches d'exécution en cours`}
      />
      <div className="grid gap-3 lg:grid-cols-2">
        {mesTaches.map((t) => {
          const ci = state.commandesInternes.find((c) => c.id === t.commandeInterneId);
          return (
            <SectionCard key={t.id} titre={t.libelle} actions={<StatusBadge statut={t.statut} />}>
              <p className="text-xs text-muted-foreground">{ci?.reference} · {t.type} · Début {fmtDate(t.dateDebut)} · {t.dureeJours} jours</p>
              <p className="mt-1 text-xs text-muted-foreground">Technicien : {userById(t.responsableId)?.nom}</p>
              {t.rejetRef ? <p className="mt-2 text-xs font-medium text-destructive">Correction suite au rejet {t.rejetRef}</p> : null}
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${t.progression}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Select value={String(t.progression)} onValueChange={(v) => { updateTache(t.id, { progression: Number(v) as Tache["progression"], statut: Number(v) === 0 ? "À faire" : Number(v) === 100 ? "En attente de validation" : "En cours" }); toast.success(`Avancement mis à jour : ${v}%`); }}>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>{[0, 25, 50, 75, 100].map((p) => (<SelectItem key={p} value={String(p)}>{p}%</SelectItem>))}</SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={() => toast.success("Livrable ajouté (démo)")}><Upload className="size-4" /> Livrable</Button>
                <Button size="sm" onClick={() => { updateTache(t.id, { statut: "En attente de validation", progression: 100 }); notify({ type: "Validation", message: `« ${t.libelle} » soumise à validation.`, lien: "/validation" }); toast.success("Envoyée au chef de projet"); }}>
                  <Send className="size-4" /> Soumettre
                </Button>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
