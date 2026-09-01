import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { fmtDate, useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/planning")({
  head: () => ({
    meta: [
      { title: "Planning — GEODATA" },
      { name: "description", content: "Planning global des tâches GEODATA : charge des équipes terrain et bureau, durées et avancement par commande interne." },
      { property: "og:title", content: "Planning — GEODATA" },
      { property: "og:description", content: "Vue Gantt simplifiée de l'ensemble des tâches en cours." },
    ],
  }),
  component: PlanningPage,
});

function PlanningPage() {
  const { state, userById } = useGeo();
  const techs = state.users.filter((u) => ["TECHNICIEN", "CHEF_DE_PROJET"].includes(u.role));

  return (
    <div className="space-y-5">
      <PageHeader titre="Planning" sousTitre={`${state.taches.length} tâches planifiées sur l'ensemble des affaires`} />

      <SectionCard titre="Charge des ressources">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {techs.map((u) => {
            const n = state.taches.filter((t) => t.responsableId === u.id && t.progression < 100).length;
            const charge = u.chargePct ?? 0;
            return (
              <div key={u.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{u.nom}</span>
                  <StatusBadge statut={charge >= 90 ? "Saturé" : charge >= 60 ? "Chargé" : "Disponible"} tone={charge >= 90 ? "rouge" : charge >= 60 ? "jaune" : "vert"} />
                </div>
                <p className="text-xs text-muted-foreground">{u.specialite ?? "—"} · {n} tâches actives</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className={`h-full rounded-full ${charge >= 90 ? "bg-destructive" : "bg-primary"}`} style={{ width: `${charge}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard titre="Tâches planifiées">
        <div className="space-y-4">
          {state.commandesInternes.map((ci) => {
            const list = state.taches.filter((t) => t.commandeInterneId === ci.id);
            if (!list.length) return null;
            const cmd = state.commandes.find((c) => c.id === ci.commandeId);
            const aff = state.affaires.find((a) => a.id === cmd?.affaireId);
            return (
              <div key={ci.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{ci.reference} — {ci.designation}</p>
                  {aff ? <Button asChild size="sm" variant="ghost"><Link to="/affaires/$id" params={{ id: aff.id }}>{aff.reference}</Link></Button> : null}
                </div>
                <div className="mt-2 space-y-1.5">
                  {list.map((t) => (
                    <div key={t.id} className="grid items-center gap-3 sm:grid-cols-[18rem_1fr_10rem]">
                      <span className="truncate text-sm">{t.libelle}</span>
                      <div className="h-3 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${t.progression}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{userById(t.responsableId)?.nom} · {fmtDate(t.dateDebut)} · {t.dureeJours} j</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
