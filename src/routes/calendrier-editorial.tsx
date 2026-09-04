import { createFileRoute } from "@tanstack/react-router";
import { CalendrierPosts } from "@/components/geodata/CalendrierPosts";
import { PageHeader, SectionCard } from "@/components/geodata/ui-bits";
import { useGeo } from "@/lib/geodata/store";

export const Route = createFileRoute("/calendrier-editorial")({
  head: () => ({
    meta: [
      { title: "Calendrier éditorial — GEODATA" },
      { name: "description", content: "Calendrier éditorial mensuel GEODATA : planification des publications LinkedIn, Facebook et Instagram." },
      { property: "og:title", content: "Calendrier éditorial — GEODATA" },
      { property: "og:description", content: "Vue mensuelle des contenus programmés par l'agent IA." },
    ],
  }),
  component: CalendrierEditorialPage,
});

function CalendrierEditorialPage() {
  const { state } = useGeo();
  return (
    <div className="space-y-5">
      <PageHeader titre="Calendrier éditorial" sousTitre="Planification mensuelle des contenus GEODATA" />
      <CalendrierPosts posts={state.posts} />
      <SectionCard titre="Répartition par plateforme">
        <div className="grid gap-3 sm:grid-cols-3">
          {["LinkedIn", "Facebook", "Instagram"].map((p) => (
            <div key={p} className="rounded-lg border border-border bg-secondary/50 p-4">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">{p}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{state.posts.filter((x) => x.plateforme === p).length}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
