import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MessageCircle, Send, CalendarClock, CheckCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { fmtDate, fmtMAD, useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/devis")({
  head: () => ({
    meta: [
      { title: "Devis — GEODATA" },
      { name: "description", content: "Devis GEODATA : préparation, validation interne, envoi client et relances recommandées par l'IA." },
      { property: "og:title", content: "Devis — GEODATA" },
      { property: "og:description", content: "Pilotage des devis et des relances commerciales." },
    ],
  }),
  component: DevisPage,
});

const total = (l: { quantite: number; prixUnitaire: number }[]) => l.reduce((s, x) => s + x.quantite * x.prixUnitaire, 0);

function DevisPage() {
  const { state, clientById, userById, updateDevis, updateOpportunite, notify } = useGeo();
  const [filtre, setFiltre] = useState("all");
  const [q, setQ] = useState("");
  const [message, setMessage] = useState<{ titre: string; contenu: string } | null>(null);

  const list = state.devis.filter(
    (d) => (filtre === "all" || d.statut === filtre) && `${d.reference} ${d.objet}`.toLowerCase().includes(q.toLowerCase()),
  );
  const aRelancer = state.devis.filter((d) => d.statut === "Envoyé");

  return (
    <div className="space-y-5">
      <PageHeader titre="Devis" sousTitre="Préparation, validation interne et suivi des offres commerciales" />

      <SectionCard titre="Relances recommandées" description="Agent IA Commercial">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {aRelancer.map((d) => (
            <div key={d.id} className="rounded-lg border border-primary/25 bg-accent/40 p-4">
              <p className="text-sm font-semibold text-foreground">{clientById(d.clientId)?.nom}</p>
              <p className="text-xs text-muted-foreground">Devis {d.reference} envoyé le {fmtDate(d.dateEnvoi ?? "")}</p>
              <p className="mt-1 text-sm font-semibold text-primary">{fmtMAD(total(d.lignes))}</p>
              <p className="mt-2 rounded-md bg-card p-2 text-xs text-muted-foreground">
                Recommandation IA : relance recommandée aujourd'hui.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Button size="sm" variant="outline" onClick={() => setMessage({
                  titre: `Email de relance — ${d.reference}`,
                  contenu: `Bonjour ${clientById(d.clientId)?.nom ? state.clients.find((c) => c.id === d.clientId)!.contact : ""},\n\nSauf erreur de notre part, notre offre ${d.reference} relative à « ${d.objet} » (${fmtMAD(total(d.lignes))}) reste en attente de retour.\n\nNous restons disponibles pour tout ajustement technique ou de planning.\n\nCordialement,\nÉquipe commerciale GEODATA`,
                })}><Mail className="size-3.5" /> Email</Button>
                <Button size="sm" variant="outline" onClick={() => setMessage({
                  titre: `WhatsApp — ${d.reference}`,
                  contenu: `Bonjour, GEODATA. Petit rappel concernant notre devis ${d.reference} (${fmtMAD(total(d.lignes))}). Avez-vous besoin d'un complément d'information ? Merci !`,
                })}><MessageCircle className="size-3.5" /> WhatsApp</Button>
                <Button size="sm" variant="outline" onClick={() => { notify({ type: "Commercial", message: `Relance programmée pour ${d.reference}.`, lien: "/devis" }); toast.success("Relance programmée"); }}>
                  <CalendarClock className="size-3.5" /> Programmer
                </Button>
                <Button size="sm" variant="secondary" onClick={() => { updateDevis(d.id, { statut: "Envoyé" }); toast.success("Marqué comme relancé"); notify({ type: "Commercial", message: `${d.reference} marqué comme relancé.`, lien: "/devis" }); }}>
                  <CheckCheck className="size-3.5" /> Relancé
                </Button>
              </div>
            </div>
          ))}
          {!aRelancer.length ? <p className="text-sm text-muted-foreground">Aucune relance recommandée aujourd'hui.</p> : null}
        </div>
      </SectionCard>

      <SectionCard>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <Input placeholder="Rechercher un devis…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={filtre} onValueChange={setFiltre}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {["Brouillon", "En validation", "Validé", "Envoyé", "Accepté", "Refusé"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Objet</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Délai</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.reference}</TableCell>
                  <TableCell>{clientById(d.clientId)?.nom}</TableCell>
                  <TableCell className="max-w-72 truncate">{d.objet}</TableCell>
                  <TableCell className="tabular-nums">{fmtMAD(total(d.lignes))}</TableCell>
                  <TableCell>{d.delaiSemaines} sem.</TableCell>
                  <TableCell>{userById(d.responsableId)?.nom}</TableCell>
                  <TableCell><StatusBadge statut={d.statut} /></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {d.statut === "En validation" ? (
                        <Button size="sm" onClick={() => { updateDevis(d.id, { statut: "Validé" }); toast.success("Devis validé"); }}>Valider</Button>
                      ) : null}
                      {d.statut === "Validé" ? (
                        <Button size="sm" onClick={() => { updateDevis(d.id, { statut: "Envoyé", dateEnvoi: "2026-09-01" }); updateOpportunite(d.opportuniteId, { stage: "Devis envoyé" }); toast.success("Devis envoyé au client"); }}>
                          <Send className="size-3.5" /> Envoyer
                        </Button>
                      ) : null}
                      {d.statut === "Envoyé" ? (
                        <Button size="sm" variant="secondary" onClick={() => { updateDevis(d.id, { statut: "Accepté" }); updateOpportunite(d.opportuniteId, { stage: "Gagné" }); notify({ type: "Commercial", message: `Devis ${d.reference} accepté — lancez le projet.`, lien: "/opportunites" }); toast.success("Devis accepté — opportunité gagnée"); }}>
                          Marquer accepté
                        </Button>
                      ) : null}
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/opportunites/$id" params={{ id: d.opportuniteId }}>Opportunité</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <Dialog open={!!message} onOpenChange={(o) => !o && setMessage(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>{message?.titre}</DialogTitle></DialogHeader>
          <Textarea value={message?.contenu ?? ""} rows={10} readOnly />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMessage(null)}>Fermer</Button>
            <Button onClick={() => { setMessage(null); toast.success("Message envoyé (démo)"); }}>Envoyer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
