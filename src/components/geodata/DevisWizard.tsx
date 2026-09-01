import { Check, Plus, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fmtMAD, useGeo } from "@/lib/geodata/store";
import type { Devis, LigneDevis, Opportunite } from "@/lib/geodata/types";
import { cn } from "@/lib/utils";

const ETAPES = [
  "Informations client",
  "Prestations",
  "Ressources estimées",
  "Délais",
  "Tarification",
  "Validation",
];

const LIGNES_IA: LigneDevis[] = [
  { id: "w1", designation: "Mission terrain", unite: "jour", quantite: 3, prixUnitaire: 4800 },
  { id: "w2", designation: "Scanner 3D", unite: "jour", quantite: 2, prixUnitaire: 7500 },
  { id: "w3", designation: "Ingénieur topographe", unite: "jour", quantite: 4, prixUnitaire: 3800 },
  { id: "w4", designation: "Techniciens", unite: "journée", quantite: 6, prixUnitaire: 1600 },
  { id: "w5", designation: "Traitement des données", unite: "jour", quantite: 5, prixUnitaire: 3200 },
  { id: "w6", designation: "Production des plans", unite: "jour", quantite: 2, prixUnitaire: 2900 },
];

export function DevisWizard({ opp, trigger }: { opp: Opportunite; trigger: ReactNode }) {
  const { state, setState, clientById, notify, updateOpportunite, currentUser } = useGeo();
  const [open, setOpen] = useState(false);
  const [etape, setEtape] = useState(0);
  const [lignes, setLignes] = useState<LigneDevis[]>(LIGNES_IA.map((l) => ({ ...l })));
  const [delai, setDelai] = useState(3);
  const [conditions, setConditions] = useState("Paiement 30% à la commande, solde à la livraison. Validité 30 jours.");

  const total = lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);

  function enregistrer(statut: Devis["statut"]) {
    const existant = state.devis.find((d) => d.opportuniteId === opp.id);
    const devis: Devis = {
      id: existant?.id ?? `dv${Date.now()}`,
      reference: existant?.reference ?? `DEV-2026-${state.devis.length + 42}`,
      opportuniteId: opp.id,
      clientId: opp.clientId,
      objet: opp.titre,
      lignes,
      delaiSemaines: delai,
      statut,
      dateCreation: existant?.dateCreation ?? new Date().toISOString().slice(0, 10),
      ...(statut === "Envoyé" ? { dateEnvoi: new Date().toISOString().slice(0, 10) } : {}),
      responsableId: currentUser.id,
      conditions,
    };
    setState((s) => ({
      ...s,
      devis: existant ? s.devis.map((d) => (d.id === existant.id ? devis : d)) : [devis, ...s.devis],
    }));
    const stage =
      statut === "En validation" ? "Devis en validation" : statut === "Envoyé" ? "Devis envoyé" : "Devis à préparer";
    updateOpportunite(opp.id, { stage: stage as Opportunite["stage"], montantEstime: total });
    notify({ type: "Commercial", message: `Devis ${devis.reference} — ${statut}.`, lien: "/devis" });
    toast.success(`Devis ${devis.reference} : ${statut.toLowerCase()}`);
    setOpen(false);
    setEtape(0);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Préparer un devis — {opp.titre}</DialogTitle>
        </DialogHeader>

        <ol className="flex flex-wrap gap-1.5">
          {ETAPES.map((e, i) => (
            <li key={e}>
              <button
                onClick={() => setEtape(i)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  i === etape
                    ? "border-primary bg-primary text-primary-foreground"
                    : i < etape
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-border bg-secondary text-muted-foreground",
                )}
              >
                {i < etape ? <Check className="size-3" /> : <span className="tabular-nums">{i + 1}</span>}
                {e}
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-3 min-h-64 rounded-lg border border-border p-4">
          {etape === 0 ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              <Info label="Client" value={clientById(opp.clientId)?.nom ?? "—"} />
              <Info label="Contact" value={opp.contact} />
              <Info label="Type de demande" value={opp.type} />
              <Info label="Service" value={opp.service} />
              <Info label="Localisation" value={opp.localisation} />
              <Info label="Surface" value={opp.surface ?? "Non communiquée"} />
              <Info label="Délai demandé" value={opp.delaiDemande ?? "À préciser"} />
              <Info label="Budget indicatif" value={opp.budgetFourchette ?? fmtMAD(opp.montantEstime)} />
            </dl>
          ) : null}

          {etape === 1 || etape === 2 ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {etape === 1
                  ? "Prestations proposées par l'agent IA à partir du besoin qualifié."
                  : "Ressources estimées : ajustez les quantités de jours-hommes et de matériel."}
              </p>
              {lignes.map((l, i) => (
                <div key={l.id} className="grid grid-cols-12 items-end gap-2">
                  <div className="col-span-5">
                    <Label className="text-xs">Désignation</Label>
                    <Input
                      value={l.designation}
                      onChange={(e) =>
                        setLignes((ls) => ls.map((x, j) => (j === i ? { ...x, designation: e.target.value } : x)))
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Unité</Label>
                    <Input value={l.unite} onChange={(e) => setLignes((ls) => ls.map((x, j) => (j === i ? { ...x, unite: e.target.value } : x)))} />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Quantité</Label>
                    <Input
                      type="number"
                      value={l.quantite}
                      onChange={(e) => setLignes((ls) => ls.map((x, j) => (j === i ? { ...x, quantite: Number(e.target.value) } : x)))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">P.U. (MAD)</Label>
                    <Input
                      type="number"
                      value={l.prixUnitaire}
                      onChange={(e) => setLignes((ls) => ls.map((x, j) => (j === i ? { ...x, prixUnitaire: Number(e.target.value) } : x)))}
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setLignes((ls) => ls.filter((_, j) => j !== i))}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLignes((ls) => [...ls, { id: `w${Date.now()}`, designation: "Nouvelle prestation", unite: "jour", quantite: 1, prixUnitaire: 3000 }])}
              >
                <Plus className="size-4" /> Ajouter une ligne
              </Button>
            </div>
          ) : null}

          {etape === 3 ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="delai">Délai d'exécution (semaines)</Label>
                <Input id="delai" type="number" value={delai} onChange={(e) => setDelai(Number(e.target.value))} className="max-w-40" />
              </div>
              <p className="rounded-lg bg-accent/50 p-3 text-xs text-muted-foreground">
                Suggestion IA : {Math.max(2, Math.round(lignes.reduce((s, l) => s + l.quantite, 0) / 6))} semaines compte tenu
                de la charge terrain et bureau estimée.
              </p>
            </div>
          ) : null}

          {etape === 4 ? (
            <div className="space-y-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
                    <th className="py-2">Prestation</th>
                    <th>Qté</th>
                    <th>P.U.</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((l) => (
                    <tr key={l.id} className="border-b border-border/60">
                      <td className="py-2">{l.designation}</td>
                      <td>{l.quantite} {l.unite}</td>
                      <td className="tabular-nums">{l.prixUnitaire.toLocaleString("fr-FR")}</td>
                      <td className="text-right font-medium tabular-nums">{(l.quantite * l.prixUnitaire).toLocaleString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end gap-6 text-sm">
                <span className="text-muted-foreground">Total HT</span>
                <span className="text-lg font-semibold text-primary tabular-nums">{fmtMAD(total)}</span>
              </div>
              <div>
                <Label htmlFor="cond">Conditions</Label>
                <Textarea id="cond" value={conditions} onChange={(e) => setConditions(e.target.value)} rows={3} />
              </div>
              <p className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-warning-foreground">
                L'IA propose les ressources et une estimation. La tarification finale doit être validée par un
                responsable humain.
              </p>
            </div>
          ) : null}

          {etape === 5 ? (
            <div className="space-y-3">
              <p className="text-sm text-foreground">
                Devis prêt : <strong>{fmtMAD(total)}</strong> — délai {delai} semaines.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => enregistrer("Brouillon")}>Sauvegarder brouillon</Button>
                <Button variant="outline" onClick={() => enregistrer("En validation")}>Demander validation</Button>
                <Button variant="outline" onClick={() => setEtape(1)}>Modifier</Button>
                <Button onClick={() => enregistrer("Validé")}>Valider</Button>
                <Button variant="secondary" onClick={() => toast.success("PDF du devis généré (démo)")}>Générer PDF</Button>
                <Button variant="secondary" onClick={() => enregistrer("Envoyé")}>Envoyer au client</Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between">
          <Button variant="ghost" disabled={etape === 0} onClick={() => setEtape((e) => e - 1)}>Précédent</Button>
          <span className="text-xs text-muted-foreground">Étape {etape + 1} / 6 — Total estimé {fmtMAD(total)}</span>
          <Button disabled={etape === 5} onClick={() => setEtape((e) => Math.min(5, e + 1))}>Suivant</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
