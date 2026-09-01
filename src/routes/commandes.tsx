import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtDate, useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/commandes")({
  head: () => ({
    meta: [
      { title: "Commandes — GEODATA" },
      { name: "description", content: "Commandes rattachées aux affaires GEODATA : désignation, quantité, délai et chef de projet responsable." },
      { property: "og:title", content: "Commandes — GEODATA" },
      { property: "og:description", content: "Chaque affaire gagnée génère automatiquement sa commande principale." },
    ],
  }),
  component: CommandesPage,
});

function CommandesPage() {
  const { state, userById, updateCommande } = useGeo();
  return (
    <div>
      <PageHeader titre="Commandes" sousTitre={`${state.commandes.length} commandes rattachées aux affaires`} />
      <SectionCard>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead><TableHead>Affaire</TableHead><TableHead>Désignation</TableHead>
                <TableHead>Quantité</TableHead><TableHead>Délai</TableHead><TableHead>Chef de projet</TableHead>
                <TableHead>Statut</TableHead><TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.commandes.map((c) => {
                const aff = state.affaires.find((a) => a.id === c.affaireId);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.reference}</TableCell>
                    <TableCell>{aff?.reference ?? "—"}</TableCell>
                    <TableCell className="max-w-72 truncate">{c.designation}</TableCell>
                    <TableCell className="tabular-nums">{c.quantite}</TableCell>
                    <TableCell>{fmtDate(c.dateLimite)}</TableCell>
                    <TableCell>{userById(c.chefDeProjetId)?.nom}</TableCell>
                    <TableCell><StatusBadge statut={c.statut} /></TableCell>
                    <TableCell className="space-x-1 whitespace-nowrap">
                      {aff ? <Button asChild size="sm" variant="ghost"><Link to="/affaires/$id" params={{ id: aff.id }}>Affaire</Link></Button> : null}
                      {c.statut === "À planifier" ? (
                        <Button size="sm" variant="outline" onClick={() => { updateCommande(c.id, { statut: "Planifiée" }); toast.success("Commande planifiée"); }}>Planifier</Button>
                      ) : null}
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
