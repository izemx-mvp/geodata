import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtMAD, useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "Prospects & Clients — GEODATA" },
      { name: "description", content: "Base clients et prospects GEODATA : administrations, collectivités et industriels marocains." },
      { property: "og:title", content: "Prospects & Clients — GEODATA" },
      { property: "og:description", content: "Fiches clients, contacts et chiffre d'affaires historique." },
    ],
  }),
  component: ClientsPage,
});

function ClientsPage() {
  const { state, setState } = useGeo();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const list = state.clients.filter((c) =>
    `${c.nom} ${c.ville} ${c.secteur} ${c.contact}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        titre="Prospects & Clients"
        sousTitre={`${state.clients.length} comptes suivis par l'équipe commerciale`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="size-4" /> Nouveau client</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouveau compte client</DialogTitle></DialogHeader>
              <form
                id="fc"
                className="grid gap-3 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  setState((s) => ({
                    ...s,
                    clients: [
                      {
                        id: `c${Date.now()}`,
                        nom: String(f.get("nom")),
                        secteur: String(f.get("secteur")),
                        ville: String(f.get("ville")),
                        contact: String(f.get("contact")),
                        fonction: String(f.get("fonction")),
                        email: String(f.get("email")),
                        telephone: String(f.get("tel")),
                        type: "Privé",
                        ca: 0,
                      },
                      ...s.clients,
                    ],
                  }));
                  setOpen(false);
                  toast.success("Client créé");
                }}
              >
                {[["nom", "Raison sociale"], ["secteur", "Secteur"], ["ville", "Ville"], ["contact", "Contact"], ["fonction", "Fonction"], ["email", "Email"], ["tel", "Téléphone"]].map(([n, l]) => (
                  <div key={n}>
                    <Label htmlFor={n}>{l}</Label>
                    <Input id={n} name={n} required={n === "nom"} />
                  </div>
                ))}
              </form>
              <DialogFooter><Button type="submit" form="fc">Enregistrer</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <SectionCard className="mb-5">
        <Input placeholder="Rechercher un client…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />
      </SectionCard>
      <SectionCard>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Secteur</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>CA historique</TableHead>
                <TableHead>Opportunités</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((c) => {
                const opps = state.opportunites.filter((o) => o.clientId === c.id);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nom}</TableCell>
                    <TableCell><StatusBadge statut={c.type} tone="neutre" /></TableCell>
                    <TableCell>{c.secteur}</TableCell>
                    <TableCell>{c.ville}</TableCell>
                    <TableCell>
                      <span className="block text-sm">{c.contact}</span>
                      <span className="block text-xs text-muted-foreground">{c.email}</span>
                    </TableCell>
                    <TableCell className="tabular-nums">{fmtMAD(c.ca)}</TableCell>
                    <TableCell>
                      {opps.length ? (
                        <Link to="/opportunites" className="text-sm text-primary hover:underline">{opps.length} en cours</Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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
