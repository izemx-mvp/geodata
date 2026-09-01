import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/parcours")({
  head: () => ({
    meta: [
      { title: "Parcours complet d'une affaire — GEODATA" },
      { name: "description", content: "Démonstration du flux GEODATA de bout en bout : du lead ou de l'appel d'offres jusqu'à la livraison client et la facturation." },
      { property: "og:title", content: "Parcours complet d'une affaire — GEODATA" },
      { property: "og:description", content: "Chaque étape du workflow est cliquable et connectée aux trois agents IA." },
    ],
  }),
  component: ParcoursPage,
});

function ParcoursPage() {
  const { state } = useGeo();
  const opp = state.opportunites.find((o) => o.affaireId) ?? state.opportunites[0];
  const affaire = state.affaires.find((a) => a.id === opp?.affaireId) ?? state.affaires[0];
  const ao = state.appelsOffres.find((a) => a.statut === "Gagné") ?? state.appelsOffres[0];
  const cmd = affaire ? state.commandes.find((c) => c.affaireId === affaire.id) : undefined;
  const ci = cmd ? state.commandesInternes.find((c) => c.commandeId === cmd.id) : undefined;

  const etapes: { titre: string; desc: string; agent: string; lien?: { to: string; params?: Record<string, string>; label: string } | undefined }[] = [
    { titre: "1. Lead / Consultation", desc: "Réception d'une demande client ou détection d'une consultation restreinte.", agent: "Agent Commercial", lien: { to: "/consultations", label: "Voir les consultations" } },
    { titre: "2. Qualification", desc: "L'agent IA analyse le besoin, calcule un score et liste les informations manquantes.", agent: "Agent Commercial", lien: opp ? { to: "/opportunites/$id", params: { id: opp.id }, label: `Ouvrir ${opp.reference}` } : undefined },
    { titre: "3. Opportunité", desc: "L'opportunité entre dans le pipeline commercial et suit ses étapes.", agent: "Agent Commercial", lien: { to: "/opportunites", label: "Voir le pipeline" } },
    { titre: "4. Devis / Proposition", desc: "Assistant de préparation du devis en 6 étapes avec prestations, ressources et délais.", agent: "Agent Commercial", lien: { to: "/devis", label: "Voir les devis" } },
    { titre: "5. Appel d'offres public", desc: "En parallèle, l'agent AO détecte les marchés, analyse le DCE et prépare le dossier.", agent: "Agent Appels d'offres", lien: ao ? { to: "/appels-offres/$id", params: { id: ao.id }, label: `Ouvrir ${ao.reference}` } : undefined },
    { titre: "6. Validation interne", desc: "La direction valide l'offre technique et financière avant envoi ou dépôt.", agent: "Direction", lien: { to: "/dossiers", label: "Dossiers en cours" } },
    { titre: "7. Offre gagnée", desc: "Le devis est accepté ou le marché est attribué à GEODATA.", agent: "Agent Commercial / AO" },
    { titre: "8. Affaire créée automatiquement", desc: "L'agent projet crée l'affaire, transfère toutes les données et notifie le chef de projet.", agent: "Agent Projet", lien: affaire ? { to: "/affaires/$id", params: { id: affaire.id }, label: `Ouvrir ${affaire.reference}` } : undefined },
    { titre: "9. Commande & commande interne", desc: "Génération de la commande client puis découpage en commandes internes.", agent: "Agent Projet", lien: { to: "/commandes-internes", label: `Voir ${ci?.reference ?? "les commandes internes"}` } },
    { titre: "10. Planning", desc: "Affectation des techniciens, durées, dépendances et charge des équipes.", agent: "Agent Projet", lien: { to: "/planning", label: "Voir le planning" } },
    { titre: "11. Exécution", desc: "Les techniciens avancent leurs tâches terrain et bureau et déposent les livrables.", agent: "Techniciens", lien: { to: "/execution", label: "Espace exécution" } },
    { titre: "12. Validation interne", desc: "Le chef de projet contrôle la qualité et valide ou demande une correction.", agent: "Chef de projet", lien: { to: "/validation", label: "Contrôle qualité" } },
    { titre: "13. Livraison interne", desc: "Consolidation du dossier avant transmission au client ou à l'administration.", agent: "Agent Projet", lien: { to: "/livraisons", label: "Voir les livraisons" } },
    { titre: "14. Contrôle client / administration", desc: "Le dossier est soumis au contrôle externe : validation ou rejet.", agent: "Client / Administration", lien: { to: "/livraisons", label: "Suivi du contrôle" } },
    { titre: "15. Rejets R1 / R2", desc: "En cas de rejet, les corrections sont tracées et renvoyées en exécution.", agent: "Agent Projet", lien: { to: "/rejets", label: "Historique des rejets" } },
    { titre: "16. Livraison client & facturation", desc: "Livraison finale, bordereau généré, dossier marqué prêt à facturer.", agent: "Agent Projet", lien: { to: "/livraisons", label: "Finaliser la livraison" } },
  ];

  return (
    <div>
      <PageHeader
        titre="Parcours complet d'une affaire"
        sousTitre="Du lead ou de l'appel d'offres jusqu'à la facturation — démonstration de bout en bout"
      />
      <SectionCard>
        <ol className="relative space-y-5 border-l border-border pl-6">
          {etapes.map((e) => (
            <li key={e.titre} className="relative">
              <span className="absolute top-1.5 -left-[27px] flex size-3 items-center justify-center rounded-full border-2 border-card bg-primary" />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground"><CheckCircle2 className="size-4 text-success" /> {e.titre}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{e.desc}</p>
                  <p className="mt-0.5 text-xs font-medium tracking-wide text-primary uppercase">{e.agent}</p>
                </div>
                {e.lien ? (
                  <Button asChild size="sm" variant="outline">
                    {e.lien.params ? (
                      <Link to={e.lien.to as never} params={e.lien.params as never}>{e.lien.label} <ArrowRight className="size-4" /></Link>
                    ) : (
                      <Link to={e.lien.to as never}>{e.lien.label} <ArrowRight className="size-4" /></Link>
                    )}
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </SectionCard>
    </div>
  );
}
