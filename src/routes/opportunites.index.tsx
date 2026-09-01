import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { KanbanSquare, Plus, Table2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader, ScoreIA, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtDate, fmtMAD, useGeo } from "@/lib/geodata/store";
import { OPP_STAGES, OPP_TYPES, SERVICES, type OppStage, type Opportunite } from "@/lib/geodata/types";

export const Route = createFileRoute("/opportunites/")({
  head: () => ({
    meta: [
      { title: "Workflow commercial — GEODATA" },
      {
        name: "description",
        content: "Pilotage intelligent des opportunités, prospects, devis et relances GEODATA avec scoring IA.",
      },
      { property: "og:title", content: "Workflow commercial — GEODATA" },
      { property: "og:description", content: "Kanban stratégique et tableau du workflow commercial GEODATA." },
    ],
  }),
  component: OpportunitesPage,
});

function OpportunitesPage() {
  const { state, clientById, userById, updateOpportunite, setState, notify } = useGeo();
  const navigate = useNavigate();
  const [vue, setVue] = useState<"kanban" | "table">("kanban");
  const [recherche, setRecherche] = useState("");
  const [filtreService, setFiltreService] = useState("all");
  const [filtreResp, setFiltreResp] = useState("all");
  const [tri, setTri] = useState("score");
  const [open, setOpen] = useState(false);

  const commerciaux = state.users.filter((u) => ["COMMERCIAL", "ADMINISTRATION", "DIRECTION"].includes(u.role));

  const filtrees = useMemo(() => {
    let list = state.opportunites.filter((o) => {
      const hay = `${o.titre} ${clientById(o.clientId)?.nom} ${o.reference} ${o.localisation}`.toLowerCase();
      if (recherche && !hay.includes(recherche.toLowerCase())) return false;
      if (filtreService !== "all" && o.service !== filtreService) return false;
      if (filtreResp !== "all" && o.responsableId !== filtreResp) return false;
      return true;
    });
    list = [...list].sort((a, b) =>
      tri === "score" ? b.scoreIA - a.scoreIA : tri === "montant" ? b.montantEstime - a.montantEstime : a.echeance.localeCompare(b.echeance),
    );
    return list;
  }, [state.opportunites, recherche, filtreService, filtreResp, tri, clientById]);

  function deplacer(id: string, stage: OppStage) {
    updateOpportunite(id, { stage });
    toast.success(`Opportunité déplacée vers « ${stage} »`);
    if (stage === "Gagné") notify({ type: "Commercial", message: "Une opportunité est passée en Gagné : lancez le projet.", lien: "/opportunites" });
  }

  function creer(form: FormData) {
    const clientId = String(form.get("clientId"));
    const opp: Opportunite = {
      id: `o${Date.now()}`,
      reference: `OPP-2026-${state.opportunites.length + 101}`,
      titre: String(form.get("titre")),
      clientId,
      contact: clientById(clientId) ? state.clients.find((c) => c.id === clientId)!.contact : "—",
      type: String(form.get("type")) as Opportunite["type"],
      service: String(form.get("service")) as Opportunite["service"],
      localisation: String(form.get("localisation")),
      montantEstime: Number(form.get("montant")),
      responsableId: String(form.get("responsableId")),
      stage: "À qualifier",
      prochaineAction: "Qualifier la demande",
      echeance: String(form.get("echeance")),
      scoreIA: 60 + Math.round(Math.random() * 35),
      besoin: String(form.get("besoin") || "Besoin à qualifier."),
      infosDisponibles: ["Localisation", "Service demandé"],
      infosManquantes: ["Budget confirmé", "Délai souhaité", "Niveau de précision"],
      recommandationIA: "Qualifier le besoin par un échange technique avant chiffrage.",
      documents: [],
      interactions: [
        { id: `it${Date.now()}`, date: new Date().toISOString().slice(0, 10), canal: "Système", auteur: "Agent IA Commercial", contenu: "Opportunité créée automatiquement à réception de la demande." },
      ],
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setState((s) => ({ ...s, opportunites: [opp, ...s.opportunites] }));
    notify({ type: "Commercial", message: `Nouvelle opportunité créée : ${opp.titre}.`, lien: "/opportunites" });
    setOpen(false);
    toast.success("Opportunité créée — l'agent IA a lancé la qualification");
    navigate({ to: "/opportunites/$id", params: { id: opp.id } });
  }

  return (
    <div>
      <PageHeader
        titre="Opportunités commerciales"
        sousTitre="Agent IA Commercial — qualification, chiffrage et relances"
        actions={
          <>
            <div className="flex overflow-hidden rounded-lg border border-border">
              <button
                onClick={() => setVue("kanban")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${vue === "kanban" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
              >
                <KanbanSquare className="size-3.5" /> Kanban
              </button>
              <button
                onClick={() => setVue("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${vue === "table" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
              >
                <Table2 className="size-3.5" /> Tableau
              </button>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="size-4" /> Nouvelle opportunité
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Nouvelle demande commerciale</DialogTitle>
                  <DialogDescription>
                    L'agent IA créera l'opportunité et proposera immédiatement une action de qualification.
                  </DialogDescription>
                </DialogHeader>
                <form
                  id="form-opp"
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    creer(new FormData(e.currentTarget));
                  }}
                >
                  <div>
                    <Label htmlFor="titre">Intitulé</Label>
                    <Input id="titre" name="titre" required placeholder="Consultation – Relevé topographique…" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Client</Label>
                      <Select name="clientId" defaultValue={state.clients[0]!.id}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {state.clients.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select name="type" defaultValue={OPP_TYPES[0]}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {OPP_TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Service</Label>
                      <Select name="service" defaultValue={SERVICES[0]}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {SERVICES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Responsable</Label>
                      <Select name="responsableId" defaultValue="u3">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {commerciaux.map((u) => (<SelectItem key={u.id} value={u.id}>{u.nom}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="localisation">Localisation</Label>
                      <Input id="localisation" name="localisation" defaultValue="Casablanca" />
                    </div>
                    <div>
                      <Label htmlFor="montant">Montant estimé (MAD)</Label>
                      <Input id="montant" name="montant" type="number" defaultValue={100000} />
                    </div>
                    <div>
                      <Label htmlFor="echeance">Échéance</Label>
                      <Input id="echeance" name="echeance" type="date" defaultValue="2026-09-15" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="besoin">Besoin exprimé</Label>
                    <Input id="besoin" name="besoin" placeholder="Description courte du besoin client" />
                  </div>
                </form>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                  <Button type="submit" form="form-opp">Créer l'opportunité</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <SectionCard className="mb-5">
        <div className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Rechercher un client, une référence…" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          <Select value={filtreService} onValueChange={setFiltreService}>
            <SelectTrigger><SelectValue placeholder="Service" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les services</SelectItem>
              {SERVICES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={filtreResp} onValueChange={setFiltreResp}>
            <SelectTrigger><SelectValue placeholder="Responsable" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les responsables</SelectItem>
              {commerciaux.map((u) => (<SelectItem key={u.id} value={u.id}>{u.nom}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={tri} onValueChange={setTri}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Trier par score IA</SelectItem>
              <SelectItem value="montant">Trier par montant</SelectItem>
              <SelectItem value="echeance">Trier par échéance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      {vue === "kanban" ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {OPP_STAGES.map((stage) => {
            const items = filtrees.filter((o) => o.stage === stage);
            return (
              <div
                key={stage}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const id = e.dataTransfer.getData("text/plain");
                  if (id) deplacer(id, stage);
                }}
                className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-secondary/50"
              >
                <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                  <span className="text-xs font-semibold tracking-wide text-foreground uppercase">{stage}</span>
                  <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground">{items.length}</span>
                </div>
                <div className="flex-1 space-y-2 p-2">
                  {items.map((o) => (
                    <Link
                      key={o.id}
                      to="/opportunites/$id"
                      params={{ id: o.id }}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", o.id)}
                      className="block cursor-grab rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/50 active:cursor-grabbing"
                    >
                      <p className="text-xs font-semibold text-foreground">{clientById(o.clientId)?.nom}</p>
                      <p className="mt-0.5 text-sm text-foreground">{o.titre}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{o.contact} · {o.type}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{o.service}</p>
                      <p className="mt-1.5 text-sm font-semibold text-primary">{fmtMAD(o.montantEstime)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Prochaine action : {o.prochaineAction}</p>
                      <p className="text-xs text-muted-foreground">Échéance : {fmtDate(o.echeance)}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{userById(o.responsableId)?.initiales}</span>
                        <ScoreIA score={o.scoreIA} />
                      </div>
                    </Link>
                  ))}
                  {!items.length ? <p className="px-2 py-6 text-center text-xs text-muted-foreground">Aucune opportunité</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <SectionCard>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Objet</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Score IA</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrees.map((o) => (
                  <TableRow key={o.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <Link to="/opportunites/$id" params={{ id: o.id }} className="hover:text-primary">{o.reference}</Link>
                    </TableCell>
                    <TableCell>{clientById(o.clientId)?.nom}</TableCell>
                    <TableCell className="max-w-72 truncate">{o.titre}</TableCell>
                    <TableCell>{o.service}</TableCell>
                    <TableCell className="tabular-nums">{fmtMAD(o.montantEstime)}</TableCell>
                    <TableCell>{userById(o.responsableId)?.nom}</TableCell>
                    <TableCell>{fmtDate(o.echeance)}</TableCell>
                    <TableCell><ScoreIA score={o.scoreIA} /></TableCell>
                    <TableCell><StatusBadge statut={o.stage} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
