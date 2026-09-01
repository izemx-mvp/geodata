import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import type { SocialPost } from "@/lib/geodata/types";

const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function CalendrierPosts({ posts }: { posts: SocialPost[] }) {
  const [mois, setMois] = useState(8); // septembre 2026
  const annee = 2026;
  const premier = new Date(Date.UTC(annee, mois, 1));
  const decalage = (premier.getUTCDay() + 6) % 7;
  const nbJours = new Date(Date.UTC(annee, mois + 1, 0)).getUTCDate();

  const cellules: (number | null)[] = [
    ...Array.from({ length: decalage }, () => null),
    ...Array.from({ length: nbJours }, (_, i) => i + 1),
  ];

  return (
    <SectionCard
      titre={`${MOIS[mois]} ${annee}`}
      description="Calendrier de contenu — cliquez sur une publication pour voir son statut"
      actions={
        <div className="flex gap-1">
          <Button size="icon" variant="outline" onClick={() => setMois((m) => Math.max(0, m - 1))}><ChevronLeft className="size-4" /></Button>
          <Button size="icon" variant="outline" onClick={() => setMois((m) => Math.min(11, m + 1))}><ChevronRight className="size-4" /></Button>
        </div>
      }
    >
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
        {JOURS.map((j) => (
          <div key={j} className="bg-secondary px-2 py-1.5 text-center text-xs font-semibold text-muted-foreground uppercase">{j}</div>
        ))}
        {cellules.map((jour, i) => {
          const iso = jour ? `${annee}-${String(mois + 1).padStart(2, "0")}-${String(jour).padStart(2, "0")}` : "";
          const dupJour = posts.filter((p) => p.date === iso);
          return (
            <div key={i} className="min-h-28 bg-card p-1.5">
              {jour ? <p className="text-xs font-medium text-muted-foreground tabular-nums">{jour}</p> : null}
              <div className="mt-1 space-y-1">
                {dupJour.map((p) => (
                  <div key={p.id} className="rounded-md border border-primary/25 bg-accent/50 p-1.5">
                    <p className="text-[10px] font-semibold tracking-wide text-primary uppercase">{p.plateforme}</p>
                    <p className="line-clamp-2 text-[11px] leading-tight text-foreground">{p.sujet}</p>
                    <div className="mt-1 scale-90 origin-left"><StatusBadge statut={p.statut} /></div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
