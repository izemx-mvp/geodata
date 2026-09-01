import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmtMAD, useGeo } from "@/lib/geodata/store";
import { SERVICES, type ReferenceProjet } from "@/lib/geodata/types";

export const Route = createFileRoute("/references")({
  head: () => ({
    meta: [
      { title: "Références GEODATA — Base de projets" },
      { name: "description", content: "Base de références GEODATA : projets réalisés, clients, montants, technologies et attestations pour les dossiers d'appel d'offres." },
      { property: "og:title", content: "Références GEODATA — Base de projets" },
      { property: "og:description", content: "Les références mobilisables automatiquement par l'agent IA pour chaque appel d'offres." },
    ],
  }),
  component: ReferencesPage,
});

function ReferencesPage() {
  const { state, setState } = useGeo();
  const [q, setQ] = useState("");
  const [service, setService] = useState("all");
  const [open, setOpen] = useState(false);

  const list = state.references.filter(
    (r) => (service === "all" || r.service === service) && `${r.projet} ${r.client} ${r.localisation}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        titre="Références GEODATA"
        sousTitre={`${state.references.length} projets réalisés mobilisables dans les dossiers d'appel d'offres`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="size-4" /> Ajouter une référence</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouvelle référence</DialogTitle></DialogHeader>
              <form
                id="fr"
                className="grid gap-3 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  const ref: ReferenceProjet = {
                    id: `r${Date.now()}`,
                    projet: String(f.get("projet")),
                    client: String(f.get("client")),
                    annee: Number(f.get("annee")),
                    service: String(f.get("service")) as ReferenceProjet["service"],
                    montant: Number(f.get("montant")),
                    localisation: String(f.get("localisation")),
                    description: String(f.get("description")),
                    equipe: ["Équipe GEODATA"],
                    technologies: ["GPS RTK", "Station totale"],
                    documents: [],
                  };
                  setState((s) => ({ ...s, references: [ref, ...s.references] }));
                  setOpen(false);
                  toast.success("Référence ajoutée");
                }}
              >
                <div><Label htmlFor="projet">Projet</Label><Input id="projet" name="projet" required /></div>
                <div><Label htmlFor="client">Client</Label><Input id="client" name="client" required /></div>
                <div><Label htmlFor="annee">Année</Label><Input id="annee" name="annee" type="number" defaultValue={2026} /></div>
                <div>
                  <Label>Service</Label>
                  <Select name="service" defaultValue={SERVICES[0]}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SERVICES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor="montant">Montant (MAD)</Label><Input id="montant" name="montant" type="number" defaultValue={500000} /></div>
                <div><Label htmlFor="localisation">Localisation</Label><Input id="localisation" name="localisation" /></div>
                <div className="sm:col-span-2"><Label htmlFor="description">Description</Label><Input id="description" name="description" /></div>
              </form>
              <DialogFooter><Button type="submit" form="fr">Enregistrer</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <SectionCard className="mb-5">
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Rechercher une référence…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={service} onValueChange={setService}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les services</SelectItem>
              {SERVICES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((r) => (
          <SectionCard key={r.id}>
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">{r.service} · {r.annee}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{r.projet}</p>
            <p className="text-xs text-muted-foreground">{r.client} · {r.localisation}</p>
            <p className="mt-2 text-sm font-semibold tabular-nums">{fmtMAD(r.montant)}</p>
            <p className="mt-2 text-xs text-muted-foreground">{r.description}</p>
            <p className="mt-2 text-xs text-muted-foreground"><strong>Technologies :</strong> {r.technologies.join(", ")}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success("Référence ajoutée à l'offre en cours")}>Ajouter à l'offre</Button>
              <Button size="sm" variant="ghost" onClick={() => toast(`${r.projet} — ${r.equipe.join(", ")}`)}>Voir le projet</Button>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
