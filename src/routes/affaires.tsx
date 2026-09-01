import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, ProgressBar, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmtDate, fmtMAD, joursRestants, useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/affaires")({
  head: () => ({
    meta: [
      { title: "Affaires — GEODATA" },
      { name: "description", content: "Portefeuille des affaires GEODATA : avancement, chefs de projet, délais et montants des projets en cours." },
      { property: "og:title", content: "Affaires — GEODATA" },
      { property: "og:description", content: "Pilotage des projets issus des devis gagnés et des marchés attribués." },
    ],
  }),
  component: AffairesPage,
});

function AffairesPage() {
  const { state, userById, clientById } = useGeo();
  const [q, setQ] = useState("");
  const [statut, setStatut] = useState("all");

  const list = state.affaires.filter(
    (a) => (statut === "all" || a.statut === statut) && `${a.reference} ${a.titre}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        titre="Affaires"
        sousTitre={`${state.affaires.length} affaires — Agent IA Lancement & Suivi de projet`}
        actions={
          <>
            <Input className="w-56" placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} />
            <Select value={statut} onValueChange={setStatut}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {["En lancement", "En planification", "En exécution", "En validation", "En livraison", "Clôturée"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((a) => {
          const j = joursRestants(a.dateLimite);
          return (
            <SectionCard key={a.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wide text-primary uppercase">{a.reference}</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{a.titre}</p>
                  <p className="text-xs text-muted-foreground">{clientById(a.clientId)?.nom}</p>
                </div>
                <StatusBadge statut={a.statut} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div><dt className="text-muted-foreground">Chef de projet</dt><dd className="font-medium">{userById(a.chefDeProjetId)?.nom}</dd></div>
                <div><dt className="text-muted-foreground">Montant</dt><dd className="font-medium tabular-nums">{fmtMAD(a.montant)}</dd></div>
                <div><dt className="text-muted-foreground">Échéance</dt><dd className="font-medium">{fmtDate(a.dateLimite)}</dd></div>
                <div><dt className="text-muted-foreground">Reste</dt><dd className={j < 0 ? "font-medium text-destructive" : "font-medium"}>{j < 0 ? `${-j} j de retard` : `J-${j}`}</dd></div>
              </dl>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">Avancement</span><span className="font-medium">{a.progression}%</span></div>
                <ProgressBar value={a.progression} />
              </div>
              <Button asChild size="sm" variant="outline" className="mt-4"><Link to="/affaires/$id" params={{ id: a.id }}>Ouvrir l'affaire</Link></Button>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
