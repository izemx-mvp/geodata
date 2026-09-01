import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle, ArrowRight, CheckCircle2, Download, FileText, Rocket, Sparkles, ThumbsDown, ThumbsUp, Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Field, PageHeader, ProgressBar, ScoreIA, SectionCard, StatusBadge, Timeline } from "@/components/geodata/ui-bits";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { fmtDate, fmtMAD, joursRestants, useGeo } from "@/lib/geodata/store";
import { AO_STATUTS, type AppelOffre } from "@/lib/geodata/types";

export const Route = createFileRoute("/appels-offres/$id")({
  head: () => ({
    meta: [
      { title: "Dossier appel d'offres — GEODATA" },
      { name: "description", content: "Analyse IA du DCE, critères d'évaluation, checklist administrative, offre technique et financière d'un appel d'offres GEODATA." },
      { property: "og:title", content: "Dossier appel d'offres — GEODATA" },
      { property: "og:description", content: "Préparation complète du dossier de réponse assistée par l'agent IA." },
    ],
  }),
  component: AoDetail,
});

function AoDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { state, updateAo, userById, notify, lancerProjet } = useGeo();
  const ao = state.appelsOffres.find((a) => a.id === id);
  const [note, setNote] = useState("");

  if (!ao) {
    return (
      <SectionCard titre="Appel d'offres introuvable">
        <Button asChild variant="outline"><Link to="/appels-offres">Retour à la liste</Link></Button>
      </SectionCard>
    );
  }

  const prets = ao.checklist.filter((c) => c.fait).length;
  const pct = Math.round((prets / ao.checklist.length) * 100);
  const refs = state.references.filter((r) => ao.referencesIds.includes(r.id));
  const affaire = state.affaires.find((a) => a.id === ao.affaireId);

  function patch(p: Partial<AppelOffre>, msg: string) {
    updateAo(ao!.id, {
      ...p,
      historique: [...ao!.historique, { date: new Date().toISOString().slice(0, 10), evenement: msg }],
    });
    toast.success(msg);
  }

  return (
    <div>
      <PageHeader
        titre={`${ao.reference} — ${ao.objet}`}
        sousTitre={`${ao.organisme} · ${ao.localisation} · Dépôt le ${fmtDate(ao.dateLimite)} (J-${joursRestants(ao.dateLimite)})`}
        actions={
          <>
            <StatusBadge statut={ao.statut} />
            <Select value={ao.statut} onValueChange={(v) => patch({ statut: v as AppelOffre["statut"] }, `Statut : ${v}`)}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>{AO_STATUTS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
            </Select>
            {ao.statut === "Gagné" && !ao.affaireId ? (
              <AlertDialog>
                <AlertDialogTrigger asChild><Button size="sm"><Rocket className="size-4" /> Lancer le projet</Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Transférer cet appel d'offres en affaire ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Une affaire sera créée avec le client {ao.organisme}, un montant de {fmtMAD(ao.budget)} et une commande principale.
                      L'agent IA Lancement & Suivi de projet prend le relais.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        const client = state.clients.find((c) => c.nom === ao.organisme) ?? state.clients[0]!;
                        const cp = state.users.find((u) => u.role === "CHEF_DE_PROJET")!;
                        const aff = lancerProjet({
                          titre: ao.objet,
                          clientId: client.id,
                          source: ao.reference,
                          sourceType: "Appel d'offres",
                          montant: ao.budget,
                          services: [ao.categorie],
                          chefDeProjetId: cp.id,
                        });
                        updateAo(ao.id, { affaireId: aff.id, historique: [...ao.historique, { date: new Date().toISOString().slice(0, 10), evenement: `Projet lancé — affaire ${aff.reference}` }] });
                        toast.success(`Affaire ${aff.reference} créée`);
                        navigate({ to: "/affaires/$id", params: { id: aff.id } });
                      }}
                    >
                      Confirmer le lancement
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
            {affaire ? (
              <Button asChild size="sm" variant="outline"><Link to="/affaires/$id" params={{ id: affaire.id }}>Voir l'affaire {affaire.reference} <ArrowRight className="size-4" /></Link></Button>
            ) : null}
          </>
        }
      />

      <Tabs defaultValue="resume">
        <TabsList className="flex-wrap">
          <TabsTrigger value="resume">Résumé</TabsTrigger>
          <TabsTrigger value="analyse">Analyse IA</TabsTrigger>
          <TabsTrigger value="criteres">Critères</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="equipe">Équipe</TabsTrigger>
          <TabsTrigger value="references">Références</TabsTrigger>
          <TabsTrigger value="technique">Offre technique</TabsTrigger>
          <TabsTrigger value="financiere">Offre financière</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="mt-4 grid gap-4 lg:grid-cols-3">
          <SectionCard titre="Informations du marché" className="lg:col-span-2">
            <dl className="grid gap-4 sm:grid-cols-3">
              <Field label="Référence" value={ao.reference} />
              <Field label="Organisme" value={ao.organisme} />
              <Field label="Catégorie" value={ao.categorie} />
              <Field label="Localisation" value={ao.localisation} />
              <Field label="Budget estimé" value={fmtMAD(ao.budget)} />
              <Field label="Caution provisoire" value={fmtMAD(ao.caution)} />
              <Field label="Publication" value={fmtDate(ao.datePublication)} />
              <Field label="Date limite" value={fmtDate(ao.dateLimite)} />
              <Field label="Responsable AO" value={userById(ao.responsableId)?.nom ?? "Non affecté"} />
            </dl>
            <p className="mt-4 text-sm text-muted-foreground">{ao.objet}</p>
          </SectionCard>
          <SectionCard titre="Décision GO / NO-GO">
            <ScoreIA score={ao.scoreIA} label="Pertinence GEODATA" />
            <p className="mt-3 text-sm text-muted-foreground">
              {ao.scoreIA >= 75
                ? "Marché fortement aligné avec les compétences GEODATA. Réponse recommandée."
                : ao.scoreIA >= 50
                  ? "Marché partiellement aligné. Vérifier la capacité de production et les références exigées."
                  : "Faible alignement : ressources probablement mieux employées ailleurs."}
            </p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => { patch({ decision: "GO", statut: "À préparer" }, "Décision GO"); notify({ type: "AO", message: `GO validé sur ${ao.reference}.`, lien: "/appels-offres" }); }}>
                <ThumbsUp className="size-4" /> GO
              </Button>
              <Button size="sm" variant="outline" onClick={() => patch({ decision: "NO-GO", statut: "Perdu" }, "Décision NO-GO")}>
                <ThumbsDown className="size-4" /> NO-GO
              </Button>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">Avancement du dossier</span><span className="font-medium">{pct}%</span></div>
              <ProgressBar value={pct} />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="analyse" className="mt-4 grid gap-4 lg:grid-cols-2">
          <SectionCard titre="Analyse automatique du DCE" description="Champs extraits par l'agent IA">
            <dl className="grid gap-3 sm:grid-cols-2">
              {ao.extraction.map((e) => (<Field key={e.champ} label={e.champ} value={e.valeur} />))}
            </dl>
            <Button size="sm" variant="outline" className="mt-4" onClick={() => toast.success("Nouvelle analyse du DCE lancée")}>
              <Sparkles className="size-4" /> Relancer l'analyse
            </Button>
          </SectionCard>
          <div className="space-y-4">
            <SectionCard titre="Correspondance avec les compétences GEODATA">
              <ul className="space-y-2">
                {ao.competences.map((c) => (
                  <li key={c.nom} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                    <span>
                      <span className="block text-sm font-medium">{c.nom}</span>
                      <span className="block text-xs text-muted-foreground">{c.note}</span>
                    </span>
                    <StatusBadge statut={c.match === "forte" ? "Forte" : c.match === "moyenne" ? "Moyenne" : "Faible"} tone={c.match === "forte" ? "vert" : c.match === "moyenne" ? "orange" : "rouge"} />
                  </li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard titre="Risques et points de vigilance">
              <ul className="space-y-1.5 text-sm">
                {ao.risques.map((r) => (<li key={r} className="flex gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" /> {r}</li>))}
              </ul>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {ao.vigilance.map((v) => (<li key={v}>• {v}</li>))}
              </ul>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="criteres" className="mt-4">
          <SectionCard titre="Critères d'évaluation du marché">
            <div className="space-y-4">
              {[
                { c: "Valeur technique de l'offre", p: 40, note: 34 },
                { c: "Références et moyens humains", p: 20, note: 18 },
                { c: "Moyens matériels et technologies", p: 15, note: 14 },
                { c: "Délai d'exécution proposé", p: 10, note: 8 },
                { c: "Offre financière", p: 15, note: 11 },
              ].map((x) => (
                <div key={x.c}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{x.c} <span className="text-xs text-muted-foreground">({x.p} points)</span></span>
                    <span className="font-medium tabular-nums">{x.note} / {x.p}</span>
                  </div>
                  <ProgressBar value={(x.note / x.p) * 100} />
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm font-medium">Note estimée par l'IA : 85 / 100</p>
          </SectionCard>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <SectionCard titre="Documents du DCE" actions={<Button size="sm" variant="outline" onClick={() => toast.success("Document téléversé (démo)")}><Upload className="size-4" /> Téléverser</Button>}>
            <ul className="divide-y divide-border">
              {ao.documents.map((d) => (
                <li key={d.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="flex items-center gap-2"><FileText className="size-4 text-primary" /> {d.nom} <span className="text-xs text-muted-foreground">{d.type} · {d.taille}</span></span>
                  <Button size="sm" variant="ghost" onClick={() => toast.success(`Téléchargement de ${d.nom}`)}><Download className="size-4" /></Button>
                </li>
              ))}
              {!ao.documents.length ? <p className="text-sm text-muted-foreground">Aucun document.</p> : null}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="equipe" className="mt-4">
          <SectionCard titre="Équipe proposée" description="Suggestion de l'agent IA selon les compétences requises">
            <ul className="divide-y divide-border">
              {state.users.filter((u) => ["CHEF_DE_PROJET", "TECHNICIEN"].includes(u.role)).slice(0, 6).map((u) => (
                <li key={u.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span>{u.nom} <span className="text-xs text-muted-foreground">· {u.specialite ?? u.role}</span></span>
                  <span className="text-xs text-muted-foreground">Charge {u.chargePct ?? 0}%</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="references" className="mt-4">
          <SectionCard titre="Références proposées automatiquement">
            <div className="grid gap-3 md:grid-cols-2">
              {refs.map((r) => (
                <div key={r.id} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">{r.projet}</p>
                  <p className="text-xs text-muted-foreground">{r.client} · {r.annee} · {fmtMAD(r.montant)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
                </div>
              ))}
              {!refs.length ? <p className="text-sm text-muted-foreground">Aucune référence associée. Consultez la base de références.</p> : null}
            </div>
            <Button asChild size="sm" variant="outline" className="mt-4"><Link to="/references">Ouvrir la base de références</Link></Button>
          </SectionCard>
        </TabsContent>

        <TabsContent value="technique" className="mt-4">
          <SectionCard titre="Mémoire technique" description="Structure générée par l'agent IA — modifiable">
            <Textarea
              rows={14}
              defaultValue={`1. Présentation de GEODATA\n2. Compréhension du besoin — ${ao.objet}\n3. Méthodologie proposée\n   3.1 Reconnaissance et canevas de référence\n   3.2 Acquisition terrain (${ao.categorie})\n   3.3 Traitement et contrôle qualité\n   3.4 Production des livrables\n4. Moyens humains affectés\n5. Moyens matériels et technologies\n6. Planning d'exécution détaillé\n7. Démarche qualité et contrôle interne\n8. Références similaires\n9. Engagements et garanties`}
            />
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => patch({ statut: "En préparation" }, "Mémoire technique enregistré")}>Enregistrer</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Mémoire technique exporté en PDF (démo)")}><Download className="size-4" /> Exporter</Button>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="financiere" className="mt-4">
          <SectionCard titre="Offre financière">
            <dl className="grid gap-4 sm:grid-cols-3">
              <Field label="Budget estimé du marché" value={fmtMAD(ao.budget)} />
              <Field label="Offre GEODATA proposée" value={fmtMAD(Math.round(ao.budget * 0.94))} />
              <Field label="Écart" value="-6 % (positionnement compétitif)" />
              <Field label="Caution provisoire" value={fmtMAD(ao.caution)} />
              <Field label="Caution définitive (3 %)" value={fmtMAD(Math.round(ao.budget * 0.03))} />
              <Field label="Marge estimée" value="22 %" />
            </dl>
            <Button size="sm" className="mt-4" onClick={() => patch({ statut: "Validation interne" }, "Offre financière soumise à validation interne")}>
              <CheckCircle2 className="size-4" /> Soumettre à validation interne
            </Button>
          </SectionCard>
        </TabsContent>

        <TabsContent value="checklist" className="mt-4 space-y-4">
          {(["Administratif", "Technique", "Financier"] as const).map((cat) => (
            <SectionCard key={cat} titre={`Pièces — ${cat}`}>
              <ul className="space-y-2">
                {ao.checklist.filter((c) => c.categorie === cat).map((c) => (
                  <li key={c.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5 text-sm">
                    <Checkbox
                      checked={c.fait}
                      onCheckedChange={(v) => updateAo(ao.id, { checklist: ao.checklist.map((x) => (x.id === c.id ? { ...x, fait: Boolean(v) } : x)) })}
                    />
                    <span className={c.fait ? "text-muted-foreground line-through" : ""}>{c.libelle}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          ))}
          <div className="flex gap-2">
            <Button onClick={() => patch({ statut: "Déposé" }, "Dossier déposé auprès de l'organisme")} disabled={pct < 100}>
              Marquer le dossier comme déposé
            </Button>
            <Button variant="outline" onClick={() => patch({ statut: "Gagné" }, "Marché attribué à GEODATA")}>Marché gagné</Button>
          </div>
        </TabsContent>

        <TabsContent value="historique" className="mt-4 grid gap-4 lg:grid-cols-2">
          <SectionCard titre="Historique du dossier"><Timeline items={ao.historique} /></SectionCard>
          <SectionCard titre="Ajouter une note">
            <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note interne…" />
            <Button size="sm" className="mt-3" disabled={!note} onClick={() => { patch({}, note); setNote(""); }}>Ajouter</Button>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
