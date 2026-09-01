import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, FileSpreadsheet, History, Plus } from "lucide-react";
import { toast } from "sonner";
import { AssistantIA } from "@/components/geodata/AssistantIA";
import { DevisWizard } from "@/components/geodata/DevisWizard";
import { EmptyState, Field, PageHeader, ScoreIA, SectionCard, StatusBadge, Timeline } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fmtDate, fmtMAD, useGeo } from "@/lib/geodata/store";
import type { Opportunite } from "@/lib/geodata/types";

export const Route = createFileRoute("/clients/$id")({
  head: () => ({
    meta: [
      { title: "Fiche client 360° — GEODATA" },
      { name: "description", content: "Vue 360° d'un compte GEODATA : consultations & besoins, opportunités, devis, interactions, documents et tâches." },
      { property: "og:title", content: "Fiche client 360° — GEODATA" },
      { property: "og:description", content: "Toute la relation commerciale d'un compte GEODATA au même endroit." },
    ],
  }),
  component: ClientDetail,
});

const TYPES_CONSULTATION = ["Consultation restreinte", "Demande de devis", "Demande directe"];

function ClientDetail() {
  const { id } = Route.useParams();
  const { state, userById, updateOpportunite, notify } = useGeo();
  const navigate = useNavigate();
  const client = state.clients.find((c) => c.id === id);

  if (!client) {
    return (
      <SectionCard titre="Client introuvable">
        <Button asChild variant="outline"><Link to="/clients">Retour aux clients</Link></Button>
      </SectionCard>
    );
  }

  const opps = state.opportunites.filter((o) => o.clientId === client.id);
  const consultations = opps.filter((o) => TYPES_CONSULTATION.includes(o.type));
  const devis = state.devis.filter((d) => d.clientId === client.id);
  const affaires = state.affaires.filter((a) => a.clientId === client.id);
  const interactions = opps
    .flatMap((o) => o.interactions.map((it) => ({ ...it, opp: o.titre })))
    .sort((a, b) => b.date.localeCompare(a.date));
  const documents = opps.flatMap((o) => o.documents.map((d) => ({ ...d, opp: o.titre })));
  const taches = opps.flatMap((o) => (o.tachesCommerciales ?? []).map((t) => ({ ...t, opp: o.titre })));
  const oppDevis: Opportunite | undefined = opps.find((o) => !["Gagné", "Perdu"].includes(o.stage)) ?? opps[0];
  const pipeline = opps.filter((o) => !["Gagné", "Perdu"].includes(o.stage)).reduce((s, o) => s + o.montantEstime, 0);

  function planifierRelance() {
    if (!oppDevis) {
      toast("Aucune opportunité active à relancer");
      return;
    }
    updateOpportunite(oppDevis.id, { stage: "Relance", prochaineAction: `Relance commerciale de ${client!.contact}` });
    notify({ type: "Commercial", message: `Relance planifiée pour ${client!.nom}.`, lien: "/opportunites" });
    toast.success("Relance planifiée");
  }

  return (
    <div>
      <PageHeader
        titre={client.nom}
        sousTitre={`${client.type} · ${client.secteur} · ${client.ville} — ${client.contact} (${client.fonction})`}
        actions={
          <>
            <Button asChild variant="ghost" size="sm"><Link to="/clients"><ArrowLeft className="size-4" /> Clients</Link></Button>
            {oppDevis ? (
              <DevisWizard opp={oppDevis} trigger={<Button size="sm"><FileSpreadsheet className="size-4" /> Générer un devis</Button>} />
            ) : null}
            <Button size="sm" variant="outline" onClick={() => navigate({ to: "/opportunites" })}>
              <Plus className="size-4" /> Ajouter une opportunité
            </Button>
            <Button size="sm" variant="outline" onClick={planifierRelance}>
              <CalendarClock className="size-4" /> Planifier une relance
            </Button>
          </>
        }
      />

      <Tabs defaultValue="resume">
        <TabsList className="flex-wrap">
          <TabsTrigger value="resume">Résumé</TabsTrigger>
          <TabsTrigger value="opps">Opportunités</TabsTrigger>
          <TabsTrigger value="consult">Consultations & besoins</TabsTrigger>
          <TabsTrigger value="devis">Devis</TabsTrigger>
          <TabsTrigger value="inter">Interactions</TabsTrigger>
          <TabsTrigger value="docs">Documents</TabsTrigger>
          <TabsTrigger value="taches">Tâches</TabsTrigger>
          <TabsTrigger value="ia">Assistant IA</TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="mt-4 grid gap-4 lg:grid-cols-3">
          <SectionCard titre="Fiche du compte" className="lg:col-span-2">
            <dl className="grid gap-4 sm:grid-cols-3">
              <Field label="Type" value={client.type} />
              <Field label="Secteur" value={client.secteur} />
              <Field label="Ville" value={client.ville} />
              <Field label="Contact" value={client.contact} />
              <Field label="Fonction" value={client.fonction} />
              <Field label="Email" value={client.email} />
              <Field label="Téléphone" value={client.telephone} />
              <Field label="CA historique" value={fmtMAD(client.ca)} />
              <Field label="Pipeline actif" value={fmtMAD(pipeline)} />
            </dl>
          </SectionCard>
          <SectionCard titre="Activité">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Opportunités</dt><dd className="font-medium">{opps.length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Consultations</dt><dd className="font-medium">{consultations.length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Devis</dt><dd className="font-medium">{devis.length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Affaires</dt><dd className="font-medium">{affaires.length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Interactions</dt><dd className="font-medium">{interactions.length}</dd></div>
            </dl>
            {affaires.length ? (
              <div className="mt-4 space-y-1.5">
                {affaires.map((a) => (
                  <Link key={a.id} to="/affaires/$id" params={{ id: a.id }} className="block text-sm text-primary hover:underline">
                    {a.reference} — {a.titre}
                  </Link>
                ))}
              </div>
            ) : null}
          </SectionCard>
        </TabsContent>

        <TabsContent value="opps" className="mt-4">
          <SectionCard>
            {opps.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead><TableHead>Objet</TableHead><TableHead>Service</TableHead>
                      <TableHead>Montant</TableHead><TableHead>Échéance</TableHead><TableHead>Score IA</TableHead>
                      <TableHead>Étape</TableHead><TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opps.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">{o.reference}</TableCell>
                        <TableCell className="max-w-64 truncate">{o.titre}</TableCell>
                        <TableCell>{o.service}</TableCell>
                        <TableCell className="tabular-nums">{fmtMAD(o.montantEstime)}</TableCell>
                        <TableCell>{fmtDate(o.echeance)}</TableCell>
                        <TableCell><ScoreIA score={o.scoreIA} /></TableCell>
                        <TableCell><StatusBadge statut={o.stage} /></TableCell>
                        <TableCell>
                          <Button asChild size="sm" variant="ghost"><Link to="/opportunites/$id" params={{ id: o.id }}>Ouvrir</Link></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState titre="Aucune opportunité" description="Créez une opportunité pour démarrer le workflow commercial." />
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="consult" className="mt-4 space-y-3">
          {consultations.length ? (
            consultations.map((o) => (
              <SectionCard
                key={o.id}
                titre={`${o.reference} — ${o.titre}`}
                actions={<><ScoreIA score={o.scoreIA} /><StatusBadge statut={o.stage} /></>}
              >
                <dl className="grid gap-4 sm:grid-cols-4">
                  <Field label="Type de consultation" value={o.type} />
                  <Field label="Service concerné" value={o.serviceSecondaire ? `${o.service} + ${o.serviceSecondaire}` : o.service} />
                  <Field label="Budget estimatif" value={o.budgetFourchette ?? fmtMAD(o.montantEstime)} />
                  <Field label="Délai souhaité" value={o.delaiDemande ?? "À préciser"} />
                  <Field label="Localisation" value={o.localisation} />
                  <Field label="Surface" value={o.surface ?? "—"} />
                  <Field label="Responsable" value={userById(o.responsableId)?.nom ?? "—"} />
                  <Field label="Statut" value={o.stage} />
                </dl>
                <p className="mt-3 text-sm text-muted-foreground">
                  <strong className="text-foreground">Description du besoin : </strong>{o.besoin}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <strong className="text-foreground">Documents transmis : </strong>
                  {o.documents.length ? o.documents.map((d) => d.nom).join(", ") : "Aucun document transmis"}
                </p>
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Historique des échanges</p>
                  <Timeline items={o.interactions.map((it) => ({ date: it.date, evenement: `${it.canal} · ${it.auteur} — ${it.contenu}` }))} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <DevisWizard opp={o} trigger={<Button size="sm"><FileSpreadsheet className="size-4" /> Générer un devis</Button>} />
                  <Button asChild size="sm" variant="outline"><Link to="/opportunites/$id" params={{ id: o.id }}>Ouvrir l'opportunité</Link></Button>
                </div>
              </SectionCard>
            ))
          ) : (
            <EmptyState titre="Aucune consultation" description="Les consultations restreintes et demandes de devis de ce compte apparaîtront ici." />
          )}
        </TabsContent>

        <TabsContent value="devis" className="mt-4">
          <SectionCard>
            {devis.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead><TableHead>Objet</TableHead><TableHead>Montant</TableHead>
                      <TableHead>Délai</TableHead><TableHead>Création</TableHead><TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {devis.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.reference}</TableCell>
                        <TableCell className="max-w-64 truncate">{d.objet}</TableCell>
                        <TableCell className="tabular-nums">{fmtMAD(d.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0))}</TableCell>
                        <TableCell>{d.delaiSemaines} sem.</TableCell>
                        <TableCell>{fmtDate(d.dateCreation)}</TableCell>
                        <TableCell><StatusBadge statut={d.statut} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState
                titre="Aucun devis"
                description="Générez un devis pré-rempli à partir des informations connues du client."
                {...(oppDevis ? { action: <DevisWizard opp={oppDevis} trigger={<Button size="sm">Générer un devis</Button>} /> } : {})}
              />
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="inter" className="mt-4">
          <SectionCard titre="Historique des interactions">
            {interactions.length ? (
              <Timeline items={interactions.map((it) => ({ date: it.date, evenement: `${it.canal} · ${it.auteur} — ${it.contenu} (${it.opp})` }))} />
            ) : (
              <EmptyState titre="Aucune interaction enregistrée" />
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="docs" className="mt-4">
          <SectionCard titre="Documents transmis">
            {documents.length ? (
              <ul className="divide-y divide-border">
                {documents.map((d) => (
                  <li key={d.id} className="flex items-center justify-between py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{d.nom}</span>
                      <span className="block text-xs text-muted-foreground">{d.type} · {d.taille} · {fmtDate(d.date)} · {d.opp}</span>
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => toast.success("Document téléchargé (démo)")}>Télécharger</Button>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState titre="Aucun document" description="Les pièces transmises par le client apparaîtront ici." />
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="taches" className="mt-4">
          <SectionCard titre="Tâches commerciales">
            {taches.length ? (
              <ul className="divide-y divide-border">
                {taches.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{t.libelle}</span>
                      <span className="block text-xs text-muted-foreground">Échéance {fmtDate(t.echeance)} · {t.opp}</span>
                    </span>
                    <StatusBadge statut={t.fait ? "Terminé" : "À faire"} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState titre="Aucune tâche commerciale" />
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="ia" className="mt-4">
          <SectionCard titre="Assistant IA commercial" description={`Analyse du compte ${client.nom}`}>
            <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
              <History className="size-3.5" /> {interactions.length} échanges analysés · pipeline {fmtMAD(pipeline)}
            </div>
            <AssistantIA contexte={client.nom} />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
