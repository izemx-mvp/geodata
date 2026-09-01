import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, ScoreIA, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtDate, fmtMAD, useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/consultations")({
  head: () => ({
    meta: [
      { title: "Consultations — GEODATA" },
      { name: "description", content: "Consultations restreintes et demandes directes reçues par GEODATA, qualifiées par l'agent IA commercial." },
      { property: "og:title", content: "Consultations — GEODATA" },
      { property: "og:description", content: "Suivi des consultations restreintes et demandes de devis." },
    ],
  }),
  component: ConsultationsPage,
});

function ConsultationsPage() {
  const { state, clientById, userById } = useGeo();
  const list = state.opportunites.filter((o) =>
    ["Consultation restreinte", "Demande de devis", "Demande directe"].includes(o.type),
  );

  return (
    <div>
      <PageHeader titre="Consultations" sousTitre={`${list.length} consultations et demandes de devis en cours de traitement`} />
      <SectionCard>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Objet</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Score IA</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.reference}</TableCell>
                  <TableCell>{clientById(o.clientId)?.nom}</TableCell>
                  <TableCell className="max-w-64 truncate">{o.titre}</TableCell>
                  <TableCell>{o.type}</TableCell>
                  <TableCell>{o.localisation}</TableCell>
                  <TableCell className="tabular-nums">{fmtMAD(o.montantEstime)}</TableCell>
                  <TableCell>{userById(o.responsableId)?.nom}</TableCell>
                  <TableCell>{fmtDate(o.echeance)}</TableCell>
                  <TableCell><ScoreIA score={o.scoreIA} /></TableCell>
                  <TableCell><StatusBadge statut={o.stage} /></TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/opportunites/$id" params={{ id: o.id }}>Ouvrir</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
