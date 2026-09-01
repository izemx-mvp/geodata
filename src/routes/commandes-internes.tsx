import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtDate, useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/commandes-internes")({
  head: () => ({
    meta: [
      { title: "Commandes internes — GEODATA" },
      { name: "description", content: "Commandes internes GEODATA : lots d'exécution planifiés, priorités, chefs de projet et état d'avancement." },
      { property: "og:title", content: "Commandes internes — GEODATA" },
      { property: "og:description", content: "Le cœur opérationnel du workflow MAESTRO de GEODATA." },
    ],
  }),
  component: CiPage,
});

function CiPage() {
  const { state, userById } = useGeo();
  return (
    <div>
      <PageHeader titre="Commandes internes" sousTitre={`${state.commandesInternes.length} commandes internes en circulation`} />
      <SectionCard>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead><TableHead>Désignation</TableHead><TableHead>Commande</TableHead>
                <TableHead>Priorité</TableHead><TableHead>Délai</TableHead><TableHead>Chef de projet</TableHead>
                <TableHead>Tâches</TableHead><TableHead>Statut</TableHead><TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.commandesInternes.map((ci) => {
                const cmd = state.commandes.find((c) => c.id === ci.commandeId);
                const aff = state.affaires.find((a) => a.id === cmd?.affaireId);
                const taches = state.taches.filter((t) => t.commandeInterneId === ci.id);
                return (
                  <TableRow key={ci.id}>
                    <TableCell className="font-medium">{ci.reference}</TableCell>
                    <TableCell className="max-w-64 truncate">{ci.designation}</TableCell>
                    <TableCell>{cmd?.reference ?? "—"}</TableCell>
                    <TableCell><StatusBadge statut={ci.priorite} /></TableCell>
                    <TableCell>{fmtDate(ci.dateLimite)}</TableCell>
                    <TableCell>{userById(ci.chefDeProjetId)?.nom}</TableCell>
                    <TableCell className="tabular-nums">{taches.filter((t) => t.progression === 100).length} / {taches.length}</TableCell>
                    <TableCell><StatusBadge statut={ci.statut} /></TableCell>
                    <TableCell>
                      {aff ? <Button asChild size="sm" variant="ghost"><Link to="/affaires/$id" params={{ id: aff.id }}>Ouvrir</Link></Button> : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
