import { createFileRoute } from "@tanstack/react-router";
import { Bot, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/configuration-ia")({
  head: () => ({
    meta: [
      { title: "Configuration des agents IA — GEODATA" },
      { name: "description", content: "Paramétrage des trois agents IA GEODATA : commercial & réseaux sociaux, appels d'offres, lancement & suivi de projet." },
      { property: "og:title", content: "Configuration des agents IA — GEODATA" },
      { property: "og:description", content: "Seuils de scoring, automatisations et ton de communication." },
    ],
  }),
  component: ConfigIaPage,
});

const AGENTS = [
  { nom: "Agent IA Commercial & Réseaux sociaux", desc: "Qualifie les leads, prépare les devis, rédige les relances et le contenu social." },
  { nom: "Agent IA Appels d'offres", desc: "Détecte les marchés, analyse les DCE, calcule la pertinence et prépare les dossiers." },
  { nom: "Agent IA Lancement & Suivi de projet", desc: "Transforme les offres gagnées en affaires, planifie et surveille les délais." },
];

function ConfigIaPage() {
  const { reset } = useGeo();
  return (
    <div className="space-y-5">
      <PageHeader
        titre="Configuration des agents IA"
        sousTitre="Paramètres de fonctionnement des trois agents GEODATA"
        actions={<Button size="sm" variant="outline" onClick={() => { reset(); toast.success("Données de démonstration réinitialisées"); }}><RefreshCw className="size-4" /> Réinitialiser la démo</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {AGENTS.map((a) => (
          <SectionCard key={a.nom}>
            <p className="flex items-center gap-2 text-sm font-semibold"><Bot className="size-4 text-primary" /> {a.nom}</p>
            <p className="mt-1 text-xs text-muted-foreground">{a.desc}</p>
            <div className="mt-4 flex items-center justify-between">
              <Label className="text-sm">Agent actif</Label>
              <Switch defaultChecked onCheckedChange={(v) => toast.success(v ? "Agent activé" : "Agent désactivé")} />
            </div>
          </SectionCard>
        ))}
      </div>

      <SectionCard titre="Seuils de scoring">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label className="text-sm">Score minimum pour recommander un GO sur appel d'offres</Label>
            <Slider defaultValue={[70]} max={100} step={5} className="mt-3" />
          </div>
          <div>
            <Label className="text-sm">Score minimum pour prioriser une opportunité commerciale</Label>
            <Slider defaultValue={[75]} max={100} step={5} className="mt-3" />
          </div>
        </div>
      </SectionCard>

      <SectionCard titre="Automatisations">
        <ul className="space-y-3 text-sm">
          {[
            "Alerte 7 jours avant la date limite d'un appel d'offres",
            "Relance automatique proposée 7 jours après l'envoi d'un devis",
            "Création automatique de l'affaire lorsqu'une offre est gagnée",
            "Alerte au chef de projet en cas de retard sur une tâche",
            "Notification au commercial lors d'un rejet client",
          ].map((x) => (
            <li key={x} className="flex items-center justify-between rounded-lg border border-border p-3">
              <span>{x}</span>
              <Switch defaultChecked onCheckedChange={() => toast.success("Automatisation mise à jour")} />
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard titre="Ton de communication GEODATA">
        <Textarea rows={4} defaultValue="Professionnel, technique et pédagogique. Vocabulaire métier de la géomatique marocaine. Français soutenu, phrases courtes, aucune exagération commerciale." />
        <Button size="sm" className="mt-3" onClick={() => toast.success("Configuration enregistrée")}><Save className="size-4" /> Enregistrer</Button>
      </SectionCard>
    </div>
  );
}
