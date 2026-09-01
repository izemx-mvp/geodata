import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { ROLE_LABELS, useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/equipes")({
  head: () => ({
    meta: [
      { title: "Équipes — GEODATA" },
      { name: "description", content: "Équipes GEODATA : topographes, opérateurs LIDAR, photogrammètres, cartographes SIG, chefs de projet et leur charge de travail." },
      { property: "og:title", content: "Équipes — GEODATA" },
      { property: "og:description", content: "Disponibilité et spécialités des équipes terrain et bureau." },
    ],
  }),
  component: EquipesPage,
});

function EquipesPage() {
  const { state } = useGeo();
  return (
    <div>
      <PageHeader titre="Équipes" sousTitre={`${state.users.length} collaborateurs GEODATA`} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {state.users.map((u) => {
          const charge = u.chargePct ?? 0;
          const taches = state.taches.filter((t) => t.responsableId === u.id && t.progression < 100).length;
          return (
            <SectionCard key={u.id}>
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">{u.initiales}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{u.nom}</p>
                    <StatusBadge statut={charge >= 90 ? "Saturé" : charge >= 60 ? "Chargé" : "Disponible"} tone={charge >= 90 ? "rouge" : charge >= 60 ? "jaune" : "vert"} />
                  </div>
                  <p className="text-xs text-muted-foreground">{ROLE_LABELS[u.role]}</p>
                  <p className="text-xs text-muted-foreground">{u.specialite ?? "—"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{u.email}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className={`h-full rounded-full ${charge >= 90 ? "bg-destructive" : "bg-primary"}`} style={{ width: `${charge}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Charge {charge}% · {taches} tâches actives</p>
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
