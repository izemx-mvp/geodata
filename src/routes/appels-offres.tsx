import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, ScoreIA, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtDate, fmtMAD, joursRestants, useGeo } from "@/lib/geodata/store";
import { AO_STATUTS, SERVICES } from "@/lib/geodata/types";

export const Route = createFileRoute("/appels-offres")({
  head: () => ({
    meta: [
      { title: "Appels d'offres — GEODATA" },
      { name: "description", content: "Gestion intelligente des appels d'offres publics : détection, scoring IA, GO/NO-GO et préparation des dossiers." },
      { property: "og:title", content: "Appels d'offres — GEODATA" },
      { property: "og:description", content: "L'agent IA analyse les DCE et évalue la pertinence de chaque marché pour GEODATA." },
    ],
  }),
  component: AppelsOffresPage,
});

function AppelsOffresPage() {
  const { state, userById } = useGeo();
  const [q, setQ] = useState("");
  const [service, setService] = useState("all");
  const [statut, setStatut] = useState("all");
  const [organisme, setOrganisme] = useState("all");
  const [scoreMin, setScoreMin] = useState([0]);

  const organismes = [...new Set(state.appelsOffres.map((a) => a.organisme))];

  const list = useMemo(
    () =>
      state.appelsOffres.filter((a) => {
        if (q && !`${a.reference} ${a.objet} ${a.organisme} ${a.localisation}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (service !== "all" && a.categorie !== service) return false;
        if (statut !== "all" && a.statut !== statut) return false;
        if (organisme !== "all" && a.organisme !== organisme) return false;
        if (a.scoreIA < (scoreMin[0] ?? 0)) return false;
        return true;
      }),
    [state.appelsOffres, q, service, statut, organisme, scoreMin],
  );

  return (
    <div>
      <PageHeader titre="Appels d'offres" sousTitre="Agent IA Appels d'offres — détection, analyse et préparation des dossiers" />

      <SectionCard className="mb-5">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          <Input placeholder="Mot-clé…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={service} onValueChange={setService}>
            <SelectTrigger><SelectValue placeholder="Service GEODATA" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les services</SelectItem>
              {SERVICES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={organisme} onValueChange={setOrganisme}>
            <SelectTrigger><SelectValue placeholder="Organisme" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les organismes</SelectItem>
              {organismes.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={statut} onValueChange={setStatut}>
            <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {AO_STATUTS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Score IA minimum : {scoreMin[0]}%</p>
            <Slider value={scoreMin} onValueChange={setScoreMin} max={100} step={5} />
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Organisme</TableHead>
                <TableHead>Objet</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Caution</TableHead>
                <TableHead>Publication</TableHead>
                <TableHead>Date limite</TableHead>
                <TableHead>Jours</TableHead>
                <TableHead>Score IA</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((a) => {
                const j = joursRestants(a.dateLimite);
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.reference}</TableCell>
                    <TableCell className="max-w-48 truncate">{a.organisme}</TableCell>
                    <TableCell className="max-w-64 truncate">{a.objet}</TableCell>
                    <TableCell>{a.localisation}</TableCell>
                    <TableCell>{a.categorie}</TableCell>
                    <TableCell className="tabular-nums">{fmtMAD(a.budget)}</TableCell>
                    <TableCell className="tabular-nums">{fmtMAD(a.caution)}</TableCell>
                    <TableCell>{fmtDate(a.datePublication)}</TableCell>
                    <TableCell>{fmtDate(a.dateLimite)}</TableCell>
                    <TableCell>
                      <span className={j < 0 ? "text-muted-foreground" : j <= 7 ? "font-semibold text-destructive" : "text-foreground"}>
                        {j < 0 ? "Clôturé" : `J-${j}`}
                      </span>
                    </TableCell>
                    <TableCell><ScoreIA score={a.scoreIA} /></TableCell>
                    <TableCell>{userById(a.responsableId)?.nom ?? "—"}</TableCell>
                    <TableCell><StatusBadge statut={a.statut} /></TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/appels-offres/$id" params={{ id: a.id }}>Ouvrir</Link>
                      </Button>
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
