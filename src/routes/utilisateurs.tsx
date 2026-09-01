import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ROLE_LABELS, useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/utilisateurs")({
  head: () => ({
    meta: [
      { title: "Utilisateurs — GEODATA" },
      { name: "description", content: "Gestion des utilisateurs de la plateforme GEODATA : rôles, spécialités et accès aux modules." },
      { property: "og:title", content: "Utilisateurs — GEODATA" },
      { property: "og:description", content: "Administration des comptes internes GEODATA." },
    ],
  }),
  component: UtilisateursPage,
});

function UtilisateursPage() {
  const { state, setCurrentUserId, currentUser } = useGeo();
  return (
    <div>
      <PageHeader titre="Utilisateurs" sousTitre={`${state.users.length} comptes — connecté en tant que ${currentUser.nom}`} />
      <SectionCard>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Nom</TableHead><TableHead>Rôle</TableHead><TableHead>Spécialité</TableHead><TableHead>Email</TableHead><TableHead>Charge</TableHead><TableHead /></TableRow>
          </TableHeader>
          <TableBody>
            {state.users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.nom}</TableCell>
                <TableCell>{ROLE_LABELS[u.role]}</TableCell>
                <TableCell>{u.specialite ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell className="tabular-nums">{u.chargePct ?? 0}%</TableCell>
                <TableCell>
                  <Button size="sm" variant={u.id === currentUser.id ? "secondary" : "ghost"} onClick={() => { setCurrentUserId(u.id); toast.success(`Connecté en tant que ${u.nom}`); }}>
                    {u.id === currentUser.id ? "Session active" : "Se connecter"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
    </div>
  );
}
