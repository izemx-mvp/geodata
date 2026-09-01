import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtDate, useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Documents — GEODATA" },
      { name: "description", content: "Bibliothèque documentaire GEODATA : DCE, plans, notes techniques, livrables et pièces administratives." },
      { property: "og:title", content: "Documents — GEODATA" },
      { property: "og:description", content: "Tous les documents rattachés aux opportunités, appels d'offres et projets." },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { state } = useGeo();
  const [q, setQ] = useState("");

  const docs = [
    ...state.opportunites.flatMap((o) => o.documents.map((d) => ({ ...d, source: o.reference, module: "Commercial" }))),
    ...state.appelsOffres.flatMap((a) => a.documents.map((d) => ({ ...d, source: a.reference, module: "Appel d'offres" }))),
    ...state.taches.flatMap((t) => t.livrables.map((d) => ({ ...d, source: t.libelle, module: "Exécution" }))),
  ].filter((d) => `${d.nom} ${d.source}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader
        titre="Documents"
        sousTitre={`${docs.length} documents dans la bibliothèque`}
        actions={
          <>
            <Input className="w-56" placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} />
            <Button size="sm" onClick={() => toast.success("Document téléversé (démo)")}><Upload className="size-4" /> Téléverser</Button>
          </>
        }
      />
      <SectionCard>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Document</TableHead><TableHead>Type</TableHead><TableHead>Module</TableHead><TableHead>Source</TableHead><TableHead>Taille</TableHead><TableHead>Date</TableHead><TableHead /></TableRow>
          </TableHeader>
          <TableBody>
            {docs.map((d, i) => (
              <TableRow key={`${d.id}-${i}`}>
                <TableCell className="flex items-center gap-2 font-medium"><FileText className="size-4 text-primary" /> {d.nom}</TableCell>
                <TableCell>{d.type}</TableCell>
                <TableCell>{d.module}</TableCell>
                <TableCell>{d.source}</TableCell>
                <TableCell>{d.taille}</TableCell>
                <TableCell>{fmtDate(d.date)}</TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => toast.success(`Téléchargement de ${d.nom}`)}><Download className="size-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
    </div>
  );
}
