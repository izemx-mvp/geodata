import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCheck } from "lucide-react";
import { EmptyState, PageHeader, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { fmtDate, useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — GEODATA" },
      { name: "description", content: "Alertes GEODATA : échéances d'appels d'offres, devis à relancer, validations en attente, retards et rejets." },
      { property: "og:title", content: "Notifications — GEODATA" },
      { property: "og:description", content: "Les agents IA alertent les bonnes personnes au bon moment." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { state, markNotifRead, markAllRead } = useGeo();
  return (
    <div>
      <PageHeader
        titre="Notifications"
        sousTitre={`${state.notifications.filter((n) => !n.lue).length} notifications non lues`}
        actions={<Button size="sm" variant="outline" onClick={markAllRead}><CheckCheck className="size-4" /> Tout marquer comme lu</Button>}
      />
      {!state.notifications.length ? (
        <EmptyState titre="Aucune notification" />
      ) : (
        <SectionCard>
          <ul className="divide-y divide-border">
            {state.notifications.map((n) => (
              <li key={n.id} className={`flex flex-wrap items-center justify-between gap-3 py-3 ${n.lue ? "opacity-60" : ""}`}>
                <span className="flex min-w-0 items-center gap-3">
                  <StatusBadge statut={n.type} />
                  <span className="min-w-0">
                    <span className="block text-sm">{n.message}</span>
                    <span className="block text-xs text-muted-foreground">{fmtDate(n.date)}</span>
                  </span>
                </span>
                <span className="flex gap-2">
                  {n.lien ? <Button asChild size="sm" variant="outline"><Link to={n.lien}>Ouvrir</Link></Button> : null}
                  {!n.lue ? <Button size="sm" variant="ghost" onClick={() => markNotifRead(n.id)}>Marquer lu</Button> : null}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
