import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Download, FileText, Plus, Send, ShieldAlert, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Field, PageHeader, ProgressBar, SectionCard, StatusBadge, Timeline } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { fmtDate, fmtMAD, useGeo } from "@/lib/geodata/store";
import type { CommandeInterne, Tache } from "@/lib/geodata/types";

export const Route = createFileRoute("/affaires/$id")({
  head: () => ({
    meta: [
      { title: "Suivi d'affaire — GEODATA" },
      { name: "description", content: "Suivi complet d'une affaire GEODATA : commandes internes, planning, exécution, validation, livraisons et rejets." },
      { property: "og:title", content: "Suivi d'affaire — GEODATA" },
      { property: "og:description", content: "Workflow MAESTRO du lancement jusqu'à la facturation." },
    ],
  }),
  component: AffaireDetail,
});

const TYPES_TACHE: Tache["type"][] = ["Terrain", "Bureau", "Traitement", "Contrôle", "SIG", "DAO", "Photogrammétrie", "LIDAR", "Autre"];

function AffaireDetail() {
  const { id } = Route.useParams();
  const { state, userById, clientById, updateAffaire, updateCi, updateTache, addTache, notify, creerRejet } = useGeo();
  const affaire = state.affaires.find((a) => a.id === id);

  if (!affaire) {
    return (
      <SectionCard titre="Affaire introuvable">
        <Button asChild variant="outline"><Link to="/affaires">Retour aux affaires</Link></Button>
      </SectionCard>
    );
  }

  const commandes = state.commandes.filter((c) => c.affaireId === affaire.id);
  const cis = state.commandesInternes.filter((ci) => commandes.some((c) => c.id === ci.commandeId));
  const taches = state.taches.filter((t) => cis.some((ci) => ci.id === t.commandeInterneId));
  const rejets = state.rejets.filter((r) => cis.some((ci) => ci.id === r.commandeInterneId));

  function histo(ci: CommandeInterne, evenement: string, patch: Partial<CommandeInterne> = {}) {
    updateCi(ci.id, { ...patch, historique: [...ci.historique, { date: new Date().toISOString().slice(0, 10), evenement }] });
    toast.success(evenement);
  }

  return (
    <div>
      <PageHeader
        titre={`${affaire.reference} — ${affaire.titre}`}
        sousTitre={`${clientById(affaire.clientId)?.nom} · Chef de projet ${userById(affaire.chefDeProjetId)?.nom} · Origine : ${affaire.source}`}
        actions={
          <>
            <StatusBadge statut={affaire.statut} />
            <Select value={affaire.statut} onValueChange={(v) => { updateAffaire(affaire.id, { statut: v as typeof affaire.statut }); toast.success(`Affaire : ${v}`); }}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["En lancement", "En planification", "En exécution", "En validation", "En livraison", "Clôturée"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      <Tabs defaultValue="resume">
        <TabsList className="flex-wrap">
          <TabsTrigger value="resume">Résumé</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="commandes">Commandes</TabsTrigger>
          <TabsTrigger value="internes">Commandes internes</TabsTrigger>
          <TabsTrigger value="planning">Planification</TabsTrigger>
          <TabsTrigger value="execution">Exécution</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="livraison">Livraisons</TabsTrigger>
          <TabsTrigger value="rejets">Rejets</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
          <TabsTrigger value="ia">Assistant IA</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="mt-4 space-y-4">
          <SectionCard titre="Workflow de l'affaire" description="Affaire → Commande → Commande interne → Planification → Exécution → Validation → Livraison interne → Contrôle → Livraison client → Prêt à facturer">
            <div className="overflow-x-auto pb-2">
              <WorkflowAffaire etapes={etapes} rejets={rejets} />
            </div>
          </SectionCard>
          <SectionCard titre="Avancement par commande interne">
            <div className="space-y-3">
              {cis.map((ci) => (
                <div key={ci.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{ci.reference} — {ci.designation}</p>
                    <p className="text-xs text-muted-foreground">
                      Chef de projet {userById(ci.chefDeProjetId)?.nom} · échéance {fmtDate(ci.dateLimite)}
                    </p>
                  </div>
                  <StatusBadge statut={ci.statut} />
                </div>
              ))}
              {!cis.length ? <p className="text-sm text-muted-foreground">Aucune commande interne créée.</p> : null}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <SectionCard titre="Documents et livrables de l'affaire">
            {livrablesDocs.length ? (
              <ul className="divide-y divide-border">
                {livrablesDocs.map((d) => (
                  <li key={d.id} className="flex items-center justify-between py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{d.nom}</span>
                      <span className="block text-xs text-muted-foreground">{d.type} · {d.taille} · {fmtDate(d.date)}</span>
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => toast.success("Document téléchargé (démo)")}>
                      <Download className="size-4" /> Télécharger
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Livrables attendus : {affaire.livrables.join(", ")}. Aucun fichier déposé pour le moment.
              </p>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="historique" className="mt-4">
          <SectionCard titre="Historique complet de l'affaire">
            <Timeline items={historique} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="ia" className="mt-4">
          <SectionCard titre="Assistant IA projet" description={`Analyse de l'affaire ${affaire.reference}`}>
            <AssistantIA contexte={affaire.reference} />
          </SectionCard>
        </TabsContent>


        <TabsContent value="resume" className="mt-4 grid gap-4 lg:grid-cols-3">
          <SectionCard titre="Informations de l'affaire" className="lg:col-span-2">
            <dl className="grid gap-4 sm:grid-cols-3">
              <Field label="Client" value={clientById(affaire.clientId)?.nom ?? "—"} />
              <Field label="Montant" value={fmtMAD(affaire.montant)} />
              <Field label="Date de début" value={fmtDate(affaire.dateDebut)} />
              <Field label="Date limite" value={fmtDate(affaire.dateLimite)} />
              <Field label="Services" value={affaire.services.join(", ")} />
              <Field label="Origine" value={affaire.source} />
            </dl>
            <p className="mt-4 text-sm text-muted-foreground"><strong className="text-foreground">Livrables attendus :</strong> {affaire.livrables.join(", ")}</p>
            <p className="mt-1 text-sm text-muted-foreground"><strong className="text-foreground">Conditions :</strong> {affaire.conditions}</p>
          </SectionCard>
          <SectionCard titre="Avancement">
            <ProgressBar value={affaire.progression} />
            <p className="mt-2 text-sm font-medium">{affaire.progression}% réalisé</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Commandes</dt><dd className="font-medium">{commandes.length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Commandes internes</dt><dd className="font-medium">{cis.length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Tâches</dt><dd className="font-medium">{taches.filter((t) => t.progression === 100).length} / {taches.length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Rejets</dt><dd className="font-medium">{rejets.length}</dd></div>
            </dl>
          </SectionCard>
        </TabsContent>

        <TabsContent value="commandes" className="mt-4 space-y-3">
          {commandes.map((c) => (
            <SectionCard key={c.id} titre={`${c.reference} — ${c.designation}`} actions={<StatusBadge statut={c.statut} />}>
              <dl className="grid gap-4 sm:grid-cols-4">
                <Field label="Quantité" value={c.quantite} />
                <Field label="Délai" value={fmtDate(c.dateLimite)} />
                <Field label="Chef de projet" value={userById(c.chefDeProjetId)?.nom ?? "—"} />
                <Field label="Commandes internes" value={cis.filter((ci) => ci.commandeId === c.id).length} />
              </dl>
            </SectionCard>
          ))}
        </TabsContent>

        <TabsContent value="internes" className="mt-4 space-y-3">
          {cis.map((ci) => (
            <SectionCard key={ci.id} titre={`${ci.reference} — ${ci.designation}`} actions={<StatusBadge statut={ci.statut} />}>
              <dl className="grid gap-4 sm:grid-cols-4">
                <Field label="Priorité" value={ci.priorite} />
                <Field label="Délai" value={fmtDate(ci.dateLimite)} />
                <Field label="Chef de projet" value={userById(ci.chefDeProjetId)?.nom ?? "—"} />
                <Field label="Tâches" value={state.taches.filter((t) => t.commandeInterneId === ci.id).length} />
              </dl>
              <p className="mt-3 text-sm text-muted-foreground">{ci.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ci.statut === "À planifier" ? (
                  <Button size="sm" onClick={() => histo(ci, "Commande interne planifiée", { statut: "Planifiée" })}>Planifier</Button>
                ) : null}
                {ci.statut === "Planifiée" ? (
                  <Button size="sm" onClick={() => histo(ci, "Exécution démarrée", { statut: "En exécution" })}>Démarrer l'exécution</Button>
                ) : null}
                <NouvelleTache ciId={ci.id} onAdd={addTache} />
              </div>
              <div className="mt-4"><Timeline items={ci.historique} /></div>
            </SectionCard>
          ))}
        </TabsContent>

        <TabsContent value="planning" className="mt-4">
          <SectionCard titre="Planning des tâches" description="Vue Gantt simplifiée par commande interne">
            <div className="space-y-4">
              {cis.map((ci) => (
                <div key={ci.id}>
                  <p className="mb-2 text-sm font-semibold">{ci.reference} — {ci.designation}</p>
                  <div className="space-y-1.5">
                    {state.taches.filter((t) => t.commandeInterneId === ci.id).map((t) => (
                      <div key={t.id} className="grid items-center gap-3 sm:grid-cols-[16rem_1fr_9rem]">
                        <span className="truncate text-sm">{t.libelle}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-3 flex-1 overflow-hidden rounded-full bg-secondary">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${t.progression}%` }} />
                          </div>
                          <span className="w-10 text-right text-xs tabular-nums">{t.progression}%</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{userById(t.responsableId)?.nom} · {t.dureeJours} j</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="execution" className="mt-4 space-y-3">
          {taches.map((t) => (
            <SectionCard key={t.id} titre={t.libelle} actions={<StatusBadge statut={t.statut} />}>
              <dl className="grid gap-4 sm:grid-cols-4">
                <Field label="Type" value={t.type} />
                <Field label="Technicien" value={userById(t.responsableId)?.nom ?? "—"} />
                <Field label="Début" value={fmtDate(t.dateDebut)} />
                <Field label="Durée" value={`${t.dureeJours} jours`} />
              </dl>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Select value={String(t.progression)} onValueChange={(v) => { updateTache(t.id, { progression: Number(v) as Tache["progression"], statut: Number(v) === 100 ? "En attente de validation" : "En cours" }); toast.success(`Avancement : ${v}%`); }}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>{[0, 25, 50, 75, 100].map((p) => (<SelectItem key={p} value={String(p)}>{p}%</SelectItem>))}</SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={() => toast.success("Livrable téléversé (démo)")}>Ajouter un livrable</Button>
                <Button size="sm" variant="outline" onClick={() => { updateTache(t.id, { statut: "En attente de validation", progression: 100 }); notify({ type: "Validation", message: `Tâche « ${t.libelle} » soumise à validation.`, lien: "/affaires" }); toast.success("Tâche envoyée en validation"); }}>
                  <Send className="size-4" /> Soumettre
                </Button>
              </div>
            </SectionCard>
          ))}
        </TabsContent>

        <TabsContent value="validation" className="mt-4 space-y-3">
          {taches.filter((t) => t.statut === "En attente de validation").map((t) => (
            <SectionCard key={t.id} titre={t.libelle} actions={<StatusBadge statut={t.statut} />}>
              <p className="text-sm text-muted-foreground">Réalisée par {userById(t.responsableId)?.nom}. Contrôle qualité du chef de projet requis.</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => { updateTache(t.id, { statut: "Validée" }); toast.success("Tâche validée"); }}><CheckCircle2 className="size-4" /> Valider</Button>
                <Button size="sm" variant="outline" onClick={() => { updateTache(t.id, { statut: "Correction demandée", progression: 75 }); notify({ type: "Rejet", message: `Correction demandée sur « ${t.libelle} ».`, lien: "/affaires" }); toast("Correction demandée"); }}>Demander une correction</Button>
              </div>
            </SectionCard>
          ))}
          {!taches.some((t) => t.statut === "En attente de validation") ? (
            <SectionCard titre="Aucune tâche en attente"><p className="text-sm text-muted-foreground">Toutes les tâches soumises ont été traitées.</p></SectionCard>
          ) : null}
        </TabsContent>

        <TabsContent value="livraison" className="mt-4 space-y-3">
          {cis.map((ci) => (
            <SectionCard key={ci.id} titre={`${ci.reference} — ${ci.designation}`} actions={<StatusBadge statut={ci.statut} />}>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => histo(ci, "Livraison interne effectuée", { statut: "Livraison interne" })}><FileText className="size-4" /> Livraison interne</Button>
                <Button size="sm" variant="outline" onClick={() => histo(ci, "Dossier envoyé au contrôle client / administration", { statut: "Contrôle en cours", controle: { type: "Contrôle client", dateEnvoi: new Date().toISOString().slice(0, 10), responsable: userById(ci.chefDeProjetId)?.nom ?? "GEODATA", documents: ["Plan topographique", "Note technique"], commentaires: "Envoi pour contrôle." } })}>
                  <ShieldAlert className="size-4" /> Envoyer au contrôle
                </Button>
                <Button size="sm" onClick={() => histo(ci, "Livraison client effectuée — prêt à facturer", { statut: "Prêt à facturer", livraisonClient: { date: new Date().toISOString().slice(0, 10), version: "V1", responsable: userById(ci.chefDeProjetId)?.nom ?? "GEODATA", livrables: affaire.livrables, factureProposee: true } })}>
                  <Truck className="size-4" /> Livrer au client
                </Button>
                <RejetDialog ciId={ci.id} creerRejet={creerRejet} />
              </div>
              {ci.livraisonClient ? (
                <dl className="mt-4 grid gap-4 sm:grid-cols-4">
                  <Field label="Date de livraison" value={fmtDate(ci.livraisonClient.date)} />
                  <Field label="Version" value={ci.livraisonClient.version} />
                  <Field label="Responsable" value={ci.livraisonClient.responsable} />
                  <Field label="Facturation" value={ci.livraisonClient.factureProposee ? "Proposée" : "En attente"} />
                </dl>
              ) : null}
              <Button size="sm" variant="ghost" className="mt-3" onClick={() => toast.success("Bordereau de livraison généré (démo)")}><Download className="size-4" /> Bordereau de livraison</Button>
            </SectionCard>
          ))}
        </TabsContent>

        <TabsContent value="rejets" className="mt-4 space-y-3">
          {rejets.map((r) => (
            <SectionCard key={r.id} titre={`${r.ref} — ${r.motif}`} actions={<StatusBadge statut={r.resolu ? "Résolu" : "En cours"} />}>
              <dl className="grid gap-4 sm:grid-cols-3">
                <Field label="Date" value={fmtDate(r.date)} />
                <Field label="Origine" value={r.origine} />
                <Field label="Commande interne" value={state.commandesInternes.find((c) => c.id === r.commandeInterneId)?.reference ?? "—"} />
              </dl>
              <p className="mt-3 text-sm text-muted-foreground">{r.commentaires}</p>
              <ul className="mt-2 space-y-1 text-sm">{r.corrections.map((c) => (<li key={c}>• {c}</li>))}</ul>
            </SectionCard>
          ))}
          {!rejets.length ? <SectionCard titre="Aucun rejet"><p className="text-sm text-muted-foreground">Aucun rejet enregistré sur cette affaire.</p></SectionCard> : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NouvelleTache({ ciId, onAdd }: { ciId: string; onAdd: (t: Tache) => void }) {
  const { state } = useGeo();
  const [open, setOpen] = useState(false);
  const techs = state.users.filter((u) => u.role === "TECHNICIEN");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="size-4" /> Ajouter une tâche</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Nouvelle tâche d'exécution</DialogTitle></DialogHeader>
        <form
          id="ft"
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            onAdd({
              id: `t${Date.now()}`,
              libelle: String(f.get("libelle")),
              type: String(f.get("type")) as Tache["type"],
              responsableId: String(f.get("responsable")),
              dateDebut: String(f.get("debut")),
              dureeJours: Number(f.get("duree")),
              progression: 0,
              statut: "À faire",
              livrables: [],
              commandeInterneId: ciId,
            });
            setOpen(false);
            toast.success("Tâche créée et affectée");
          }}
        >
          <div className="sm:col-span-2"><Label htmlFor="libelle">Libellé</Label><Input id="libelle" name="libelle" required /></div>
          <div>
            <Label>Type</Label>
            <Select name="type" defaultValue="Terrain">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES_TACHE.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Technicien</Label>
            <Select name="responsable" defaultValue={techs[0]?.id ?? ""}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{techs.map((t) => (<SelectItem key={t.id} value={t.id}>{t.nom} — {t.chargePct ?? 0}%</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div><Label htmlFor="debut">Début</Label><Input id="debut" name="debut" type="date" defaultValue="2026-09-15" /></div>
          <div><Label htmlFor="duree">Durée (jours)</Label><Input id="duree" name="duree" type="number" defaultValue={3} /></div>
        </form>
        <DialogFooter><Button type="submit" form="ft">Créer la tâche</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RejetDialog({ ciId, creerRejet }: { ciId: string; creerRejet: ReturnType<typeof useGeo>["creerRejet"] }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">Enregistrer un rejet</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Rejet du livrable</DialogTitle></DialogHeader>
        <form
          id="frj"
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const r = creerRejet(ciId, {
              date: new Date().toISOString().slice(0, 10),
              origine: String(f.get("origine")) as "Client" | "Administration",
              motif: String(f.get("motif")),
              commentaires: String(f.get("commentaires")),
              corrections: String(f.get("corrections")).split("\n").filter(Boolean),
            });
            setOpen(false);
            toast.error(`Rejet ${r.ref} enregistré — corrections demandées`);
          }}
        >
          <div>
            <Label>Origine du rejet</Label>
            <Select name="origine" defaultValue="Client">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Client">Client</SelectItem><SelectItem value="Administration">Administration</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label htmlFor="motif">Motif</Label><Input id="motif" name="motif" required defaultValue="Plan non conforme au cahier des charges" /></div>
          <div><Label htmlFor="commentaires">Commentaires</Label><Textarea id="commentaires" name="commentaires" rows={3} defaultValue="Le contrôle relève des écarts sur le système de référence et la symbologie." /></div>
          <div><Label htmlFor="corrections">Corrections demandées (une par ligne)</Label><Textarea id="corrections" name="corrections" rows={3} defaultValue={"Recaler le plan en Lambert Nord Maroc\nCorriger la symbologie des réseaux\nCompléter le carnet de points"} /></div>
        </form>
        <DialogFooter><Button type="submit" form="frj" variant="destructive">Enregistrer le rejet</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
