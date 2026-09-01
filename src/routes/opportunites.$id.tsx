import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  Mail,
  MessageCircle,
  Plus,
  Rocket,
  Sparkles,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AssistantIA } from "@/components/geodata/AssistantIA";
import { DevisWizard } from "@/components/geodata/DevisWizard";
import { Field, PageHeader, SectionCard, StatusBadge, Timeline } from "@/components/geodata/ui-bits";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { fmtDate, fmtMAD, useGeo } from "@/lib/geodata/store";
import { OPP_STAGES } from "@/lib/geodata/types";

export const Route = createFileRoute("/opportunites/$id")({
  head: () => ({
    meta: [
      { title: "Détail opportunité — GEODATA" },
      { name: "description", content: "Analyse IA, besoin client, devis et interactions d'une opportunité commerciale GEODATA." },
      { property: "og:title", content: "Détail opportunité — GEODATA" },
      { property: "og:description", content: "Qualification IA et préparation du devis d'une opportunité commerciale." },
    ],
  }),
  component: OpportuniteDetail,
});

function OpportuniteDetail() {
  const { id } = useParams({ from: "/opportunites/$id" });
  const navigate = useNavigate();
  const { state, clientById, userById, updateOpportunite, addInteraction, setState, lancerProjet, notify } = useGeo();
  const opp = state.opportunites.find((o) => o.id === id);
  const [message, setMessage] = useState<{ titre: string; contenu: string } | null>(null);
  const [nouvelleTache, setNouvelleTache] = useState("");

  if (!opp) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-muted-foreground">Opportunité introuvable.</p>
        <Button asChild className="mt-4"><Link to="/opportunites">Retour aux opportunités</Link></Button>
      </div>
    );
  }

  const client = state.clients.find((c) => c.id === opp.clientId)!;
  const devisLies = state.devis.filter((d) => d.opportuniteId === opp.id);
  const taches = opp.tachesCommerciales ?? [];

  function genererQuestions() {
    setMessage({
      titre: "Questions client générées par l'IA",
      contenu: opp!.infosManquantes
        .map((q, i) => `${i + 1}. Pourriez-vous préciser : ${q.toLowerCase()} ?`)
        .join("\n"),
    });
  }

  function preparerEmail() {
    setMessage({
      titre: "Email préparé par l'IA",
      contenu: `Objet : ${opp!.titre} — demande de précisions\n\nBonjour ${opp!.contact},\n\nNous vous remercions pour votre consultation relative à ${opp!.titre.toLowerCase()}.\nAfin d'établir une proposition précise, pourriez-vous nous confirmer les éléments suivants :\n${opp!.infosManquantes.map((m) => `• ${m}`).join("\n")}\n\nDès réception, nous vous transmettrons notre offre technique et financière sous 48 heures.\n\nCordialement,\nÉquipe commerciale GEODATA`,
    });
  }

  function preparerWhatsApp() {
    setMessage({
      titre: "Message WhatsApp préparé par l'IA",
      contenu: `Bonjour ${opp!.contact}, GEODATA à l'appareil. Concernant votre demande « ${opp!.titre} », il nous manque ${opp!.infosManquantes.length} informations pour finaliser le devis : ${opp!.infosManquantes.join(", ")}. Merci d'avance !`,
    });
  }

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/opportunites"><ArrowLeft className="size-4" /> Opportunités</Link>
      </Button>

      <PageHeader
        titre={opp.titre}
        sousTitre={`${opp.reference} · ${client.nom}`}
        actions={
          <>
            <Select value={opp.stage} onValueChange={(v) => { updateOpportunite(opp.id, { stage: v as never }); toast.success(`Statut : ${v}`); }}>
              <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
              <SelectContent>
                {OPP_STAGES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
              </SelectContent>
            </Select>
            {opp.stage === "Gagné" && !opp.affaireId ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button><Rocket className="size-4" /> Lancer le projet</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Lancer le projet à partir de cette offre ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Le client, l'offre, les services, les montants, les délais, les documents et les livrables seront
                      transférés automatiquement vers le module Projet. Aucune ressaisie ne sera nécessaire.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        const aff = lancerProjet({
                          titre: opp.titre,
                          clientId: opp.clientId,
                          source: `Devis ${devisLies[0]?.reference ?? opp.reference}`,
                          sourceType: "Devis",
                          montant: opp.montantEstime,
                          services: [opp.service],
                          chefDeProjetId: "u7",
                        });
                        updateOpportunite(opp.id, { affaireId: aff.id });
                        toast.success(`Affaire ${aff.reference} créée`);
                        navigate({ to: "/affaires/$id", params: { id: aff.id } });
                      }}
                    >
                      Créer l'affaire
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
            {opp.affaireId ? (
              <Button asChild variant="outline">
                <Link to="/affaires/$id" params={{ id: opp.affaireId }}>Voir l'affaire</Link>
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <SectionCard titre="En-tête de la consultation">
            <dl className="grid gap-4 sm:grid-cols-3">
              <Field label="Client" value={client.nom} />
              <Field label="Contact" value={`${opp.contact} — ${client.fonction}`} />
              <Field label="Type" value={opp.type} />
              <Field label="Service" value={opp.serviceSecondaire ? `${opp.service} + ${opp.serviceSecondaire}` : opp.service} />
              <Field label="Localisation" value={opp.localisation} />
              <Field label="Surface" value={opp.surface ?? "—"} />
              <Field label="Délai demandé" value={opp.delaiDemande ?? "—"} />
              <Field label="Budget estimatif" value={opp.budgetFourchette ?? fmtMAD(opp.montantEstime)} />
              <Field label="Responsable" value={userById(opp.responsableId)?.nom ?? "—"} />
              <Field label="Statut" value={<StatusBadge statut={opp.stage} />} />
              <Field label="Échéance" value={fmtDate(opp.echeance)} />
              <Field label="Prochaine action" value={opp.prochaineAction} />
            </dl>
          </SectionCard>

          <Tabs defaultValue="resume">
            <TabsList className="flex-wrap">
              <TabsTrigger value="resume">Résumé</TabsTrigger>
              <TabsTrigger value="besoin">Besoin client</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="devis">Devis</TabsTrigger>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
              <TabsTrigger value="taches">Tâches</TabsTrigger>
              <TabsTrigger value="ia">Assistant IA</TabsTrigger>
            </TabsList>

            <TabsContent value="resume" className="mt-4">
              <SectionCard>
                <p className="text-sm text-foreground">{opp.besoin}</p>
                <dl className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Field label="Montant estimé" value={fmtMAD(opp.montantEstime)} />
                  <Field label="Créée le" value={fmtDate(opp.createdAt)} />
                  <Field label="Score IA" value={`${opp.scoreIA}%`} />
                </dl>
              </SectionCard>
            </TabsContent>

            <TabsContent value="besoin" className="mt-4">
              <SectionCard titre="Besoin exprimé par le client">
                <Textarea
                  defaultValue={opp.besoin}
                  rows={6}
                  onBlur={(e) => updateOpportunite(opp.id, { besoin: e.target.value })}
                />
                <p className="mt-2 text-xs text-muted-foreground">Les modifications sont enregistrées automatiquement.</p>
              </SectionCard>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <SectionCard
                titre="Documents"
                actions={
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      updateOpportunite(opp.id, {
                        documents: [
                          ...opp.documents,
                          { id: `d${Date.now()}`, nom: `document_client_${opp.documents.length + 1}.pdf`, type: "PDF", taille: "1,4 Mo", date: new Date().toISOString().slice(0, 10) },
                        ],
                      });
                      toast.success("Document ajouté (démo)");
                    }}
                  >
                    <Upload className="size-4" /> Téléverser
                  </Button>
                }
              >
                {opp.documents.length ? (
                  <ul className="divide-y divide-border">
                    {opp.documents.map((d) => (
                      <li key={d.id} className="flex items-center justify-between py-2 text-sm">
                        <span>{d.nom} <span className="text-xs text-muted-foreground">· {d.type} · {d.taille}</span></span>
                        <span className="text-xs text-muted-foreground">{fmtDate(d.date)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun document pour le moment.</p>
                )}
              </SectionCard>
            </TabsContent>

            <TabsContent value="devis" className="mt-4">
              <SectionCard
                titre="Devis liés"
                actions={
                  <DevisWizard opp={opp} trigger={<Button size="sm"><FileSpreadsheet className="size-4" /> Préparer le devis</Button>} />
                }
              >
                {devisLies.length ? (
                  <ul className="divide-y divide-border">
                    {devisLies.map((d) => (
                      <li key={d.id} className="flex items-center justify-between py-2.5">
                        <span>
                          <span className="block text-sm font-medium">{d.reference}</span>
                          <span className="block text-xs text-muted-foreground">
                            {fmtMAD(d.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0))} · {d.delaiSemaines} semaines
                          </span>
                        </span>
                        <StatusBadge statut={d.statut} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun devis. Utilisez l'assistant de préparation en 6 étapes.</p>
                )}
              </SectionCard>
            </TabsContent>

            <TabsContent value="interactions" className="mt-4">
              <SectionCard titre="Historique des interactions">
                <Timeline items={opp.interactions.map((i) => ({ date: `${fmtDate(i.date)} · ${i.canal} · ${i.auteur}`, evenement: i.contenu }))} />
                <form
                  className="mt-4 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const txt = String(fd.get("txt"));
                    if (!txt.trim()) return;
                    addInteraction(opp.id, "Email", txt);
                    e.currentTarget.reset();
                    toast.success("Interaction ajoutée");
                  }}
                >
                  <Input name="txt" placeholder="Ajouter un échange, un compte-rendu…" />
                  <Button type="submit">Ajouter</Button>
                </form>
              </SectionCard>
            </TabsContent>

            <TabsContent value="taches" className="mt-4">
              <SectionCard titre="Tâches commerciales">
                <ul className="space-y-2">
                  {taches.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                      <Checkbox
                        checked={t.fait}
                        onCheckedChange={(v) =>
                          updateOpportunite(opp.id, {
                            tachesCommerciales: taches.map((x) => (x.id === t.id ? { ...x, fait: Boolean(v) } : x)),
                          })
                        }
                      />
                      <span className={`flex-1 text-sm ${t.fait ? "text-muted-foreground line-through" : ""}`}>{t.libelle}</span>
                      <span className="text-xs text-muted-foreground">{fmtDate(t.echeance)}</span>
                    </li>
                  ))}
                  {!taches.length ? <p className="text-sm text-muted-foreground">Aucune tâche.</p> : null}
                </ul>
                <form
                  className="mt-4 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!nouvelleTache.trim()) return;
                    updateOpportunite(opp.id, {
                      tachesCommerciales: [
                        ...taches,
                        { id: `t${Date.now()}`, libelle: nouvelleTache, echeance: opp.echeance, fait: false },
                      ],
                    });
                    setNouvelleTache("");
                    toast.success("Tâche créée");
                  }}
                >
                  <Input value={nouvelleTache} onChange={(e) => setNouvelleTache(e.target.value)} placeholder="Nouvelle tâche commerciale" />
                  <Button type="submit"><Plus className="size-4" /> Créer</Button>
                </form>
              </SectionCard>
            </TabsContent>

            <TabsContent value="ia" className="mt-4">
              <AssistantIA contexte={opp.reference} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-5">
          <SectionCard titre="Analyse IA" description="Agent IA Commercial & Réseaux sociaux">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold text-primary tabular-nums">{opp.scoreIA}%</span>
              <span className="text-xs text-muted-foreground">Pertinence GEODATA</span>
            </div>
            <p className="mt-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Besoin identifié</p>
            <p className="mt-1 text-sm text-foreground">{opp.besoin}</p>

            <p className="mt-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Informations disponibles</p>
            <ul className="mt-1 space-y-1">
              {opp.infosDisponibles.map((i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />{i}</li>
              ))}
            </ul>

            <p className="mt-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Informations manquantes</p>
            <ul className="mt-1 space-y-1">
              {opp.infosManquantes.map((i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground"><span className="mt-0.5 font-bold text-warning">!</span>{i}</li>
              ))}
            </ul>

            <div className="mt-4 rounded-lg border border-primary/30 bg-accent/50 p-3">
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">Action recommandée</p>
              <p className="mt-1 text-sm text-foreground">{opp.recommandationIA}</p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={genererQuestions}><Sparkles className="size-4" /> Générer les questions client</Button>
              <Button variant="outline" size="sm" onClick={preparerEmail}><Mail className="size-4" /> Préparer un email</Button>
              <Button variant="outline" size="sm" onClick={preparerWhatsApp}><MessageCircle className="size-4" /> Préparer un message WhatsApp</Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  updateOpportunite(opp.id, {
                    tachesCommerciales: [
                      ...taches,
                      { id: `t${Date.now()}`, libelle: opp.recommandationIA, echeance: opp.echeance, fait: false },
                    ],
                  });
                  notify({ type: "Commercial", message: `Nouvelle tâche créée sur ${opp.reference}.`, lien: "/opportunites" });
                  toast.success("Tâche créée depuis la recommandation IA");
                }}
              >
                <Plus className="size-4" /> Créer une tâche
              </Button>
              <DevisWizard opp={opp} trigger={<Button size="sm"><FileSpreadsheet className="size-4" /> Préparer le devis</Button>} />
            </div>
          </SectionCard>

          <SectionCard titre="Fiche client">
            <dl className="space-y-3">
              <Field label="Société" value={client.nom} />
              <Field label="Secteur" value={client.secteur} />
              <Field label="Ville" value={client.ville} />
              <Field label="Contact" value={`${client.contact} · ${client.telephone}`} />
              <Field label="Email" value={client.email} />
              <Field label="CA historique" value={fmtMAD(client.ca)} />
            </dl>
          </SectionCard>
        </div>
      </div>

      <Dialog open={!!message} onOpenChange={(o) => !o && setMessage(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>{message?.titre}</DialogTitle></DialogHeader>
          <Textarea value={message?.contenu ?? ""} rows={12} readOnly />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMessage(null)}>Fermer</Button>
            <Button
              onClick={() => {
                addInteraction(opp.id, "Email", `${message?.titre} — envoyé au client.`);
                setState((s) => s);
                setMessage(null);
                toast.success("Message envoyé et tracé dans les interactions");
              }}
            >
              Envoyer au client
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="hidden"><Label /></div>
    </div>
  );
}
