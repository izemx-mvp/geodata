import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus, Check, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, SectionCard, StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { fmtDate, useGeo } from "@/lib/geodata/store";
import { POST_STATUTS, type SocialPost } from "@/lib/geodata/types";
import { CalendrierPosts } from "@/components/geodata/CalendrierPosts";

export const Route = createFileRoute("/reseaux-sociaux")({
  head: () => ({
    meta: [
      { title: "Réseaux sociaux — GEODATA" },
      { name: "description", content: "Module réseaux sociaux GEODATA : calendrier de contenu, idées IA, brouillons, publications et performances." },
      { property: "og:title", content: "Réseaux sociaux — GEODATA" },
      { property: "og:description", content: "L'agent IA commercial assiste la communication LinkedIn, Facebook et Instagram." },
    ],
  }),
  component: ReseauxPage,
});

const OBJECTIFS = ["Notoriété", "Expertise", "Génération de leads", "Projet réalisé", "Technologie", "Recrutement"];
const SERVICES_SOC = ["Topographie", "SIG", "LIDAR", "Photogrammétrie", "Mobile Mapping", "BIM"];
const TONS = ["Professionnel", "Technique", "Pédagogique"];

export function GenerateurIA({ trigger }: { trigger: React.ReactNode }) {
  const { addPost } = useGeo();
  const [open, setOpen] = useState(false);
  const [genere, setGenere] = useState<SocialPost | null>(null);
  const [form, setForm] = useState({ objectif: OBJECTIFS[1]!, service: SERVICES_SOC[0]!, plateforme: "LinkedIn", ton: TONS[0]!, date: "2026-09-15" });

  function generer() {
    const p: SocialPost = {
      id: `p${Date.now()}`,
      date: form.date,
      plateforme: form.plateforme as SocialPost["plateforme"],
      sujet: `${form.service} : ce que ${form.objectif.toLowerCase()} change pour vos projets`,
      objectif: form.objectif,
      service: form.service,
      ton: form.ton,
      hook: `Saviez-vous qu'une erreur de ${form.service.toLowerCase()} peut coûter plusieurs semaines de chantier ?`,
      corps: `Chez GEODATA, la ${form.service.toLowerCase()} n'est pas qu'une prestation technique : c'est la base de décisions d'aménagement fiables.\n\nNos équipes interviennent avec du matériel de dernière génération et une méthodologie de contrôle qualité à chaque étape : acquisition terrain, traitement, contrôle, livraison.\n\nRésultat : des livrables exploitables immédiatement par les bureaux d'études et les maîtres d'ouvrage.`,
      cta: form.objectif === "Recrutement" ? "Envie de rejoindre nos équipes ? Envoyez-nous votre CV." : "Un projet en cours ? Écrivez-nous en message privé.",
      hashtags: ["#GEODATA", `#${form.service.replace(/[^a-zA-Z]/g, "")}`, "#Géomatique", "#Maroc", "#Topographie"],
      visuel: `Photo terrain illustrant une intervention ${form.service.toLowerCase()}, cadrage large, lumière naturelle, logo GEODATA discret.`,
      statut: "Brouillon",
    };
    setGenere(p);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setGenere(null); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>Créer une publication avec l'IA</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Objectif</Label>
            <Select value={form.objectif} onValueChange={(v) => setForm({ ...form, objectif: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{OBJECTIFS.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Service</Label>
            <Select value={form.service} onValueChange={(v) => setForm({ ...form, service: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SERVICES_SOC.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Plateforme</Label>
            <Select value={form.plateforme} onValueChange={(v) => setForm({ ...form, plateforme: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["LinkedIn", "Facebook", "Instagram"].map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Ton</Label>
            <Select value={form.ton} onValueChange={(v) => setForm({ ...form, ton: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TONS.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dt">Date de publication</Label>
            <Input id="dt" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
        </div>
        <Button onClick={generer}><Sparkles className="size-4" /> Générer le contenu</Button>

        {genere ? (
          <div className="space-y-3 rounded-lg border border-border p-4">
            <div>
              <Label>Hook</Label>
              <Input value={genere.hook} onChange={(e) => setGenere({ ...genere, hook: e.target.value })} />
            </div>
            <div>
              <Label>Publication</Label>
              <Textarea rows={7} value={genere.corps} onChange={(e) => setGenere({ ...genere, corps: e.target.value })} />
            </div>
            <div>
              <Label>CTA</Label>
              <Input value={genere.cta} onChange={(e) => setGenere({ ...genere, cta: e.target.value })} />
            </div>
            <div>
              <Label>Hashtags</Label>
              <Input value={genere.hashtags.join(" ")} onChange={(e) => setGenere({ ...genere, hashtags: e.target.value.split(" ") })} />
            </div>
            <div>
              <Label>Idée visuelle</Label>
              <Textarea rows={2} value={genere.visuel} onChange={(e) => setGenere({ ...genere, visuel: e.target.value })} />
            </div>
            <DialogFooter className="flex-wrap gap-2">
              <Button variant="outline" onClick={generer}><RefreshCw className="size-4" /> Regénérer</Button>
              <Button variant="outline" onClick={() => { addPost({ ...genere, statut: "À valider" }); setOpen(false); toast.success("Publication envoyée en validation"); }}>Modifier plus tard</Button>
              <Button variant="secondary" onClick={() => { addPost({ ...genere, statut: "Validé" }); setOpen(false); toast.success("Publication validée"); }}><Check className="size-4" /> Valider</Button>
              <Button onClick={() => { addPost({ ...genere, statut: "Planifié" }); setOpen(false); toast.success(`Publication planifiée le ${fmtDate(genere.date)}`); }}><CalendarPlus className="size-4" /> Planifier</Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ReseauxPage() {
  const { state, updatePost, removePost } = useGeo();
  const [plat, setPlat] = useState("all");

  const posts = state.posts.filter((p) => plat === "all" || p.plateforme === plat);
  const parStatut = (s: string) => posts.filter((p) => p.statut === s);

  return (
    <div>
      <PageHeader
        titre="Réseaux sociaux"
        sousTitre="Agent IA Commercial — LinkedIn, Facebook, Instagram"
        actions={
          <>
            <Select value={plat} onValueChange={setPlat}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes plateformes</SelectItem>
                {["LinkedIn", "Facebook", "Instagram"].map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
              </SelectContent>
            </Select>
            <GenerateurIA trigger={<Button size="sm"><Sparkles className="size-4" /> Créer une publication avec l'IA</Button>} />
          </>
        }
      />

      <Tabs defaultValue="calendrier">
        <TabsList className="flex-wrap">
          <TabsTrigger value="calendrier">Calendrier</TabsTrigger>
          <TabsTrigger value="idees">Idées IA</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="brouillons">Brouillons</TabsTrigger>
          <TabsTrigger value="perf">Performances</TabsTrigger>
        </TabsList>

        <TabsContent value="calendrier" className="mt-4">
          <CalendrierPosts posts={posts} />
        </TabsContent>

        <TabsContent value="idees" className="mt-4">
          <SectionCard titre="Idées proposées par l'agent IA">
            <ul className="space-y-2">
              {parStatut("Idée").map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <span>
                    <span className="block text-sm font-medium">{p.sujet}</span>
                    <span className="block text-xs text-muted-foreground">{p.plateforme} · {p.objectif} · {fmtDate(p.date)}</span>
                  </span>
                  <span className="flex gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => { updatePost(p.id, { statut: "Brouillon" }); toast.success("Brouillon créé"); }}>Rédiger</Button>
                    <Button size="sm" variant="ghost" onClick={() => { removePost(p.id); toast.success("Idée supprimée"); }}><Trash2 className="size-4 text-destructive" /></Button>
                  </span>
                </li>
              ))}
              {!parStatut("Idée").length ? <p className="text-sm text-muted-foreground">Aucune idée en attente.</p> : null}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="publications" className="mt-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {posts.filter((p) => ["Validé", "Planifié", "Publié"].includes(p.statut)).map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="brouillons" className="mt-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {posts.filter((p) => ["Brouillon", "À valider"].includes(p.statut)).map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="perf" className="mt-4">
          <SectionCard titre="Performances des publications">
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Publications publiées" value={state.posts.filter((p) => p.statut === "Publié").length} />
              <Stat label="Vues cumulées" value={state.posts.reduce((s, p) => s + (p.vues ?? 0), 0).toLocaleString("fr-FR")} />
              <Stat label="Interactions" value={state.posts.reduce((s, p) => s + (p.interactions ?? 0), 0).toLocaleString("fr-FR")} />
            </div>
            <ul className="mt-4 divide-y divide-border">
              {state.posts.filter((p) => p.statut === "Publié").map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span>{p.sujet} <span className="text-xs text-muted-foreground">· {p.plateforme}</span></span>
                  <span className="text-xs text-muted-foreground tabular-nums">{p.vues ?? 0} vues · {p.interactions ?? 0} interactions</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/50 p-4">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function PostCard({ post }: { post: SocialPost }) {
  const { updatePost, removePost } = useGeo();
  return (
    <div className="card-elev flex flex-col rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-primary uppercase">{post.plateforme}</span>
        <StatusBadge statut={post.statut} />
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">{post.sujet}</p>
      <p className="mt-1 text-xs text-muted-foreground">{fmtDate(post.date)} · {post.objectif} · {post.ton}</p>
      <p className="mt-2 line-clamp-4 text-xs text-muted-foreground">{post.corps}</p>
      <p className="mt-2 text-xs text-primary">{post.hashtags.join(" ")}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Select value={post.statut} onValueChange={(v) => { updatePost(post.id, { statut: v as SocialPost["statut"] }); toast.success(`Statut : ${v}`); }}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{POST_STATUTS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
        </Select>
        <Button size="sm" variant="ghost" onClick={() => { removePost(post.id); toast.success("Publication supprimée"); }}><Trash2 className="size-4 text-destructive" /></Button>
      </div>
    </div>
  );
}
