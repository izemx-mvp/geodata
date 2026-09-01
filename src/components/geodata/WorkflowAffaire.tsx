import { AlertTriangle, ArrowRight, Check, Loader2, RotateCcw } from "lucide-react";
import type { Affaire, Commande, CommandeInterne, Rejet, Tache } from "@/lib/geodata/types";
import { cn } from "@/lib/utils";

export type EtatEtape = "terminee" | "encours" | "bloquee" | "attente";

export interface EtapeWorkflow {
  cle: string;
  label: string;
  etat: EtatEtape;
  detail: string;
}

export function calculerWorkflow({
  affaire,
  commandes,
  cis,
  taches,
  rejets,
}: {
  affaire: Affaire;
  commandes: Commande[];
  cis: CommandeInterne[];
  taches: Tache[];
  rejets: Rejet[];
}): EtapeWorkflow[] {
  const rejetsOuverts = rejets.filter((r) => !r.resolu);
  const has = (statuts: CommandeInterne["statut"][]) => cis.some((ci) => statuts.includes(ci.statut));

  const planifie = has(["Planifiée", "En exécution", "En validation", "Livraison interne", "Livraison en attente", "Contrôle en cours", "Rejetée", "Livrée client", "Prêt à facturer"]);
  const enExecution = taches.some((t) => t.progression > 0);
  const enValidation = taches.some((t) => ["En attente de validation", "Validée"].includes(t.statut));
  const livraisonInterne = has(["Livraison interne", "Livraison en attente", "Contrôle en cours", "Rejetée", "Livrée client", "Prêt à facturer"]);
  const controle = has(["Contrôle en cours", "Rejetée", "Livrée client", "Prêt à facturer"]);
  const livraisonClient = has(["Livrée client", "Prêt à facturer"]);
  const facturable = has(["Prêt à facturer"]);

  const etat = (fait: boolean, suivantFait: boolean): EtatEtape =>
    fait ? (suivantFait ? "terminee" : "encours") : "attente";

  const etapes: EtapeWorkflow[] = [
    { cle: "affaire", label: "Affaire", etat: etat(true, commandes.length > 0), detail: affaire.reference },
    { cle: "commande", label: "Commande", etat: etat(commandes.length > 0, cis.length > 0), detail: `${commandes.length} commande(s)` },
    { cle: "ci", label: "Commande interne", etat: etat(cis.length > 0, planifie), detail: `${cis.length} CI` },
    { cle: "planif", label: "Planification", etat: etat(planifie, enExecution), detail: `${taches.length} tâches` },
    { cle: "exec", label: "Exécution", etat: etat(enExecution, enValidation), detail: `${taches.filter((t) => t.progression === 100).length}/${taches.length} terminées` },
    { cle: "valid", label: "Validation", etat: etat(enValidation, livraisonInterne), detail: `${taches.filter((t) => t.statut === "Validée").length} validées` },
    { cle: "liv-int", label: "Livraison interne", etat: etat(livraisonInterne, controle), detail: livraisonInterne ? "Dossier consolidé" : "En attente" },
    { cle: "controle", label: "Contrôle", etat: rejetsOuverts.length ? "bloquee" : etat(controle, livraisonClient), detail: rejetsOuverts.length ? `${rejetsOuverts.length} rejet(s) ouvert(s)` : controle ? "Contrôle externe" : "En attente" },
    { cle: "liv-cli", label: "Livraison client", etat: etat(livraisonClient, facturable), detail: livraisonClient ? "Livrée" : "En attente" },
    { cle: "facture", label: "Prêt à facturer", etat: facturable ? "terminee" : "attente", detail: facturable ? "Facturation possible" : "En attente" },
  ];

  return etapes;
}

const STYLES: Record<EtatEtape, string> = {
  terminee: "border-success/40 bg-success/10 text-success",
  encours: "border-primary bg-primary/12 text-primary shadow-sm",
  bloquee: "border-destructive/50 bg-destructive/10 text-destructive",
  attente: "border-border bg-secondary/60 text-muted-foreground",
};

function Icone({ etat }: { etat: EtatEtape }) {
  if (etat === "terminee") return <Check className="size-3.5" />;
  if (etat === "encours") return <Loader2 className="size-3.5 animate-spin" />;
  if (etat === "bloquee") return <AlertTriangle className="size-3.5" />;
  return <span className="size-1.5 rounded-full bg-current" />;
}

export function WorkflowAffaire({ etapes, rejets }: { etapes: EtapeWorkflow[]; rejets: Rejet[] }) {
  const courante = etapes.find((e) => e.etat === "bloquee") ?? etapes.find((e) => e.etat === "encours");
  const suivante = etapes.find((e) => e.etat === "attente");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-1.5">
        {etapes.map((e, i) => (
          <div key={e.cle} className="flex items-center gap-1.5">
            <div className={cn("flex min-w-36 flex-col rounded-lg border px-3 py-2 transition-colors", STYLES[e.etat])}>
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <Icone etat={e.etat} /> {e.label}
              </span>
              <span className="mt-0.5 text-[10px] opacity-80">{e.detail}</span>
            </div>
            {i < etapes.length - 1 ? <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" /> : null}
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-primary/35 bg-accent/50 p-3">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Étape actuelle</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{courante?.label ?? "Affaire clôturée"}</p>
          <p className="text-xs text-muted-foreground">{courante?.detail ?? "Toutes les étapes sont terminées"}</p>
        </div>
        <div className="rounded-lg border border-border bg-secondary/50 p-3">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Prochaine étape</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{suivante?.label ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{suivante?.detail ?? "Aucune action en attente"}</p>
        </div>
        <div className={cn("rounded-lg border p-3", rejets.some((r) => !r.resolu) ? "border-destructive/40 bg-destructive/5" : "border-border bg-secondary/50")}>
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Cycles de rejet</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <RotateCcw className="size-3.5" /> {rejets.length} cycle(s)
          </p>
          <p className="text-xs text-muted-foreground">
            {rejets.length
              ? `${rejets.map((r) => r.ref).join(", ")} — retour en planification/exécution`
              : "Aucun retour client ou administration"}
          </p>
        </div>
      </div>
    </div>
  );
}
