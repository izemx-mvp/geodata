import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/geodata/ui-bits";
import { ROLE_DESCRIPTIONS, ROLE_LABELS, useGeo } from "@/lib/geodata/store";
import type { Role } from "@/lib/geodata/types";

export const Route = createFileRoute("/roles")({
  head: () => ({
    meta: [
      { title: "Rôles & accès — GEODATA" },
      { name: "description", content: "Matrice des rôles GEODATA : administration, direction, commercial, marketing, responsable AO, chef de projet et technicien." },
      { property: "og:title", content: "Rôles & accès — GEODATA" },
      { property: "og:description", content: "Chaque profil accède uniquement aux modules dont il a besoin." },
    ],
  }),
  component: RolesPage,
});

const MODULES = ["Vue globale", "Commercial", "Réseaux sociaux", "Appels d'offres", "Projets", "Exécution", "Ressources", "Paramètres"];

const MATRICE: Record<Role, string[]> = {
  ADMINISTRATION: MODULES,
  DIRECTION: ["Vue globale", "Commercial", "Appels d'offres", "Projets", "Ressources", "Paramètres"],
  COMMERCIAL: ["Vue globale", "Commercial", "Ressources"],
  MARKETING: ["Vue globale", "Réseaux sociaux", "Ressources"],
  RESPONSABLE_AO: ["Vue globale", "Appels d'offres", "Ressources"],
  CHEF_DE_PROJET: ["Vue globale", "Projets", "Exécution", "Ressources"],
  TECHNICIEN: ["Vue globale", "Exécution", "Ressources"],
};

function RolesPage() {
  const { state } = useGeo();
  return (
    <div className="space-y-5">
      <PageHeader titre="Rôles & accès" sousTitre="Matrice d'habilitation par profil GEODATA" />
      <SectionCard titre="Matrice des accès">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-4 font-semibold">Rôle</th>
                {MODULES.map((m) => (<th key={m} className="px-2 py-2 text-center text-xs font-semibold">{m}</th>))}
              </tr>
            </thead>
            <tbody>
              {(Object.keys(MATRICE) as Role[]).map((r) => (
                <tr key={r} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-4">
                    <span className="block font-medium">{ROLE_LABELS[r]}</span>
                    <span className="block text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[r]}</span>
                    <span className="block text-xs text-muted-foreground">{state.users.filter((u) => u.role === r).length} utilisateurs</span>
                  </td>
                  {MODULES.map((m) => (
                    <td key={m} className="px-2 py-2.5 text-center">
                      {MATRICE[r].includes(m) ? <span className="text-success">●</span> : <span className="text-muted-foreground/40">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
