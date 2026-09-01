import {
  Clock,
  FileText,
  Hash,
  ImageIcon,
  Lightbulb,
  Pencil,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PostWizard } from "./PostWizard";
import { ScheduleDialog } from "./ScheduleDialog";
import { PLATFORM_ICONS, fallbackImg, postMediaFor } from "./shared";
import { StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { burstConfetti, platformSettings, postIdeasStore, postsStore, uid, useStore } from "@/lib/cm/store";
import { PLATFORM_META, POST_IMAGES, type PostIdea, type SocialPost } from "@/lib/cm/types";
import { cn } from "@/lib/utils";

function PlatformDots({ post }: { post: { platforms: SocialPost["platforms"] } }) {
  return (
    <div className="flex gap-1">
      {post.platforms.map((pl) => {
        const Icon = PLATFORM_ICONS[pl];
        return (
          <span key={pl} className="grid size-6 place-items-center rounded-full bg-background/75 backdrop-blur">
            <Icon className={cn("size-3.5", PLATFORM_META[pl].color)} />
          </span>
        );
      })}
    </div>
  );
}

export function PostsTab({
  detail,
  setDetail,
}: {
  detail: SocialPost | null;
  setDetail: (p: SocialPost | null) => void;
}) {
  const posts = useStore(postsStore);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editing, setEditing] = useState<SocialPost | null>(null);
  const [prefill, setPrefill] = useState<(Partial<SocialPost> & { idea?: string }) | undefined>(undefined);
  const [schedule, setSchedule] = useState<SocialPost | null>(null);
  const [confirm, setConfirm] = useState<SocialPost | null>(null);

  function openCreate() {
    setEditing(null);
    setPrefill(undefined);
    setWizardOpen(true);
  }

  function publish(p: SocialPost) {
    postsStore.update(p.id, { statut: "Publié" });
    burstConfetti();
    toast.success("Post publié");
    setDetail(null);
  }

  function toDraft(p: SocialPost) {
    postsStore.update(p.id, { statut: "Brouillon" });
    toast.success("Retour brouillon");
  }

  function remove(p: SocialPost) {
    postsStore.remove(p.id);
    toast.success("Post supprimé");
    setDetail(null);
  }

  const live = detail ? (posts.find((p) => p.id === detail.id) ?? null) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{posts.length} publication(s)</p>
        <Button onClick={openCreate}>
          <Sparkles className="size-4" /> + Nouveau post
        </Button>
      </div>

      <PostIdeasSection
        onEdit={(idea) => {
          setEditing(null);
          setPrefill({
            titre: idea.titre,
            caption: idea.suggestedCaption,
            hashtags: idea.hashtags,
            platforms: idea.platforms,
            idea: idea.description,
            date: idea.suggestedDate,
          });
          setWizardOpen(true);
        }}
      />

      <div>
        <h3 className="mb-3 text-sm font-semibold">Publications</h3>
        {!posts.length ? (
          <p className="text-sm text-muted-foreground">Aucun post pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <article key={p.id} className="group surface-card hover-lift flex flex-col overflow-hidden">
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={postMediaFor(p, i)}
                    alt={p.titre}
                    onError={fallbackImg}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2">
                    <PlatformDots post={p} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <button type="button" onClick={() => setDetail(p)} className="line-clamp-1 text-left text-sm font-semibold hover:text-primary">
                    {p.titre}
                  </button>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.caption}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.hashtags.slice(0, 3).map((h) => (
                      <span key={h} className="rounded-full bg-accent/60 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {h}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <StatusBadge statut={p.statut} />
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
                      <Clock className="size-3" /> {p.date} {p.heure}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1 border-t border-border px-2 py-1.5">
                  {p.statut === "Publié" ? (
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => setDetail(p)}>
                      <FileText className="size-3.5" /> Détails
                    </Button>
                  ) : (
                    <>
                      <Button size="sm" variant="ghost" className="h-7" onClick={() => publish(p)}>
                        <Send className="size-3.5" /> Publier
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7" onClick={() => setSchedule(p)}>
                        <Clock className="size-3.5" /> {p.statut === "Planifié" ? "Replanifier" : "Planifier"}
                      </Button>
                      {p.statut === "Planifié" ? (
                        <Button size="sm" variant="ghost" className="h-7" onClick={() => toDraft(p)} title="Repasser en brouillon">
                          <RefreshCw className="size-3.5" />
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7"
                        onClick={() => {
                          setEditing(p);
                          setPrefill(undefined);
                          setWizardOpen(true);
                        }}
                      >
                        <Pencil className="size-3.5" /> Modifier
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" className="ml-auto h-7" aria-label="Supprimer" onClick={() => setConfirm(p)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Sheet détail post */}
      <Sheet open={!!live} onOpenChange={(o) => (o ? null : setDetail(null))}>
        <SheetContent side="right" className="cm-scroll w-full overflow-y-auto sm:max-w-3xl">
          {live ? (
            <>
              <SheetHeader className="border-b border-border pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  {live.platforms.map((pl) => {
                    const Icon = PLATFORM_ICONS[pl];
                    return (
                      <span
                        key={pl}
                        className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", PLATFORM_META[pl].bg, PLATFORM_META[pl].color)}
                      >
                        <Icon className="size-3" /> {pl}
                      </span>
                    );
                  })}
                  <StatusBadge statut={live.statut} />
                </div>
                <SheetTitle className="mt-2 text-2xl">{live.titre}</SheetTitle>
                <p className="text-xs text-muted-foreground">
                  Publication : {live.date} · {live.heure ?? "—"} · Langue : {live.langue} · Ton : {live.ton}.
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Hash className="size-3 text-muted-foreground" />
                  {live.hashtags.map((h) => (
                    <span key={h} className="rounded-full bg-accent/60 px-2 py-0.5 text-[11px] font-medium text-primary">
                      {h}
                    </span>
                  ))}
                </div>
              </SheetHeader>

              <div className="space-y-5 px-4 py-4">
                {live.media.length ? (
                  <section>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Médias ({live.media.length})</h4>
                      <span className="text-xs text-muted-foreground">{live.media.length} image(s)</span>
                    </div>
                    <div className={cn("grid gap-3", live.media.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
                      {live.media.map((m) => (
                        <figure key={m.id} className="group overflow-hidden rounded-xl border border-border">
                          <div className="relative h-44 overflow-hidden">
                            <img
                              src={m.url}
                              alt={m.alt ?? ""}
                              onError={fallbackImg}
                              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <span className="absolute top-2 left-2 rounded-md bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold">Image</span>
                          </div>
                          <figcaption className="border-t border-border bg-secondary/50 px-3 py-2 text-[11px] text-muted-foreground">
                            Légende : {m.legende ?? m.description ?? "—"}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section>
                  <h4 className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Caption</h4>
                  <p className="text-sm whitespace-pre-wrap text-foreground">{live.caption}</p>
                </section>

                {live.platforms.length ? (
                  <section>
                    <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Paramètres IA par plateforme</h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {live.platforms.map((pl) => {
                        const conf = (live.platformConfig[pl] ?? platformSettings(pl)) as Record<string, unknown>;
                        const Icon = PLATFORM_ICONS[pl];
                        return (
                          <div key={pl} className={cn("rounded-xl border p-3", PLATFORM_META[pl].border)}>
                            <p className={cn("flex items-center gap-1.5 text-xs font-semibold", PLATFORM_META[pl].color)}>
                              <Icon className="size-3.5" /> {pl}
                            </p>
                            <ul className="mt-1.5 space-y-0.5 text-[11px] text-muted-foreground">
                              {Object.entries(conf).map(([k, v]) => (
                                <li key={k}>
                                  {k} : {String(v)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ) : null}
              </div>

              <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-border bg-background px-4 py-3">
                {live.statut === "Publié" ? (
                  <Button variant="outline" className="ml-auto text-destructive" onClick={() => setConfirm(live)}>
                    <Trash2 className="size-4" /> Supprimer
                  </Button>
                ) : (
                  <>
                    <Button className="flex-1" onClick={() => publish(live)}>
                      <Send className="size-4" /> {live.statut === "Planifié" ? "Publier maintenant" : "Publier"}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setSchedule(live)}>
                      <Clock className="size-4" /> {live.statut === "Planifié" ? "Replanifier" : "Planifier"}
                    </Button>
                    {live.statut === "Planifié" ? (
                      <Button variant="outline" onClick={() => toDraft(live)}>
                        <RefreshCw className="size-4" /> Retour brouillon
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(live);
                        setPrefill(undefined);
                        setDetail(null);
                        setWizardOpen(true);
                      }}
                    >
                      <Pencil className="size-4" /> Modifier
                    </Button>
                    <Button variant="outline" className="text-destructive" onClick={() => setConfirm(live)}>
                      <Trash2 className="size-4" /> Supprimer
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <PostWizard open={wizardOpen} onOpenChange={setWizardOpen} editing={editing} prefill={prefill} />

      <ScheduleDialog
        open={!!schedule}
        onOpenChange={(o) => (o ? null : setSchedule(null))}
        initialDate={schedule?.date}
        initialTime={schedule?.heure}
        onConfirm={({ date, time }) => {
          if (!schedule) return;
          postsStore.update(schedule.id, { statut: "Planifié", date, heure: time });
          toast.success(`Post planifié pour le ${date} à ${time}`);
          setSchedule(null);
        }}
      />

      <AlertDialog open={!!confirm} onOpenChange={(o) => (o ? null : setConfirm(null))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce post ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est définitive.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirm) remove(confirm);
                setConfirm(null);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ------------------------------ idées de posts ----------------------------- */

const THEMES = ["Références projets", "LIDAR & Scan 3D", "Vie d'entreprise", "SIG & cartographie", "BIM"];

function PostIdeasSection({ onEdit }: { onEdit: (idea: PostIdea) => void }) {
  const ideas = useStore(postIdeasStore);
  const [generating, setGenerating] = useState(false);
  const [detail, setDetail] = useState<PostIdea | null>(null);
  const [schedule, setSchedule] = useState<PostIdea | null>(null);

  function addPostFromIdea(idea: PostIdea, statut: SocialPost["statut"], date?: string, heure?: string) {
    postsStore.add({
      id: uid(),
      titre: idea.titre,
      caption: idea.suggestedCaption,
      hashtags: idea.hashtags,
      media: [{ id: uid(), url: idea.image ?? POST_IMAGES[0]!, legende: idea.mediaConcept, description: idea.mediaConcept }],
      platforms: idea.platforms,
      platformConfig: Object.fromEntries(idea.platforms.map((p) => [p, platformSettings(p)])),
      statut,
      date: date ?? idea.suggestedDate,
      heure: heure ?? "09:00",
      auteur: "IA",
      langue: "Français",
      ton: "Professionnel",
    });
    postIdeasStore.remove(idea.id);
    setDetail(null);
    if (statut === "Publié") {
      burstConfetti();
      toast.success("Post publié");
    } else {
      toast.success(`Post planifié pour le ${date ?? idea.suggestedDate} à ${heure ?? "09:00"}`);
    }
  }

  function generer() {
    setGenerating(true);
    setTimeout(() => {
      const theme = THEMES[Math.floor(Math.random() * THEMES.length)]!;
      postIdeasStore.add({
        id: uid(),
        titre: `${theme} : un angle inédit`,
        description: `Nouvelle idée générée par l'agent IA autour de la thématique « ${theme} ».`,
        suggestedCaption: `Zoom sur ${theme.toLowerCase()} chez GEODATA : méthodes, outils et bénéfices concrets pour vos projets.`,
        mediaConcept: `Visuel illustrant ${theme.toLowerCase()} sur le terrain.`,
        hashtags: ["#GEODATA", `#${theme.split(" ")[0]}`, "#Géomatique"],
        platforms: ["LinkedIn"],
        suggestedDate: "2026-09-28",
        image: POST_IMAGES[Math.floor(Math.random() * POST_IMAGES.length)]!,
      });
      setGenerating(false);
      toast.success("Nouvelle idée générée");
    }, 700);
  }

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2">
          <Lightbulb className="mt-0.5 size-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">Idées de posts générées par l'IA</h3>
            <p className="text-xs text-muted-foreground">Basées sur votre profil éditorial et vos thématiques.</p>
          </div>
        </div>
        <Button size="sm" onClick={generer}>
          <Sparkles className={cn("size-4", generating && "animate-spin")} /> Générer de nouvelles idées
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea) => (
          <article key={idea.id} className="group surface-card hover-lift flex flex-col overflow-hidden">
            <div className="relative h-40 overflow-hidden">
              <img
                src={idea.image ?? POST_IMAGES[0]!}
                alt={idea.titre}
                onError={fallbackImg}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-2 left-2">
                <PlatformDots post={{ platforms: idea.platforms }} />
              </div>
              <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                <Sparkles className="size-3" /> IA
              </span>
              <button
                type="button"
                aria-label="Supprimer l'idée"
                onClick={() => {
                  postIdeasStore.remove(idea.id);
                  toast.success("Idée supprimée");
                }}
                className="absolute right-2 bottom-2 grid size-6 place-items-center rounded-full bg-background/80 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>
              <div className="absolute inset-x-0 bottom-0 bg-background/70 px-2 py-1.5 backdrop-blur">
                <p className="line-clamp-2 text-[11px] italic text-muted-foreground">{idea.mediaConcept}</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <button type="button" onClick={() => setDetail(idea)} className="line-clamp-1 text-left text-sm font-semibold hover:text-primary">
                {idea.titre}
              </button>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{idea.suggestedCaption}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {idea.hashtags.slice(0, 3).map((h) => (
                  <span key={h} className="rounded-full bg-accent/60 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {h}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <StatusBadge statut="Brouillon" />
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
                  <Clock className="size-3" /> {idea.suggestedDate}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1 border-t border-border px-2 py-1.5">
              <Button size="sm" variant="ghost" className="h-7" onClick={() => addPostFromIdea(idea, "Publié")}>
                <Send className="size-3.5" /> Publier
              </Button>
              <Button size="sm" variant="ghost" className="h-7" onClick={() => setSchedule(idea)}>
                <Clock className="size-3.5" /> Planifier
              </Button>
              <Button size="sm" variant="ghost" className="h-7" onClick={() => onEdit(idea)}>
                <Pencil className="size-3.5" /> Modifier
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto h-7"
                aria-label="Supprimer l'idée"
                onClick={() => {
                  postIdeasStore.remove(idea.id);
                  toast.success("Idée supprimée");
                }}
              >
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Sheet open={!!detail} onOpenChange={(o) => (o ? null : setDetail(null))}>
        <SheetContent side="right" className="cm-scroll w-full overflow-y-auto sm:max-w-2xl">
          {detail ? (
            <>
              <SheetHeader className="border-b border-border pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  {detail.platforms.map((pl) => {
                    const Icon = PLATFORM_ICONS[pl];
                    return (
                      <span key={pl} className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]", PLATFORM_META[pl].bg, PLATFORM_META[pl].color)}>
                        <Icon className="size-3" /> {pl}
                      </span>
                    );
                  })}
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                    <Sparkles className="size-3" /> Idée IA
                  </span>
                  <StatusBadge statut="Brouillon" />
                </div>
                <SheetTitle className="mt-2 text-2xl">{detail.titre}</SheetTitle>
                <p className="text-xs text-muted-foreground">Date suggérée : {detail.suggestedDate}</p>
              </SheetHeader>
              <div className="space-y-5 px-4 py-4">
                <img src={detail.image ?? POST_IMAGES[0]!} alt="" onError={fallbackImg} className="h-56 w-full rounded-xl object-cover" />
                <section>
                  <h4 className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Description</h4>
                  <p className="text-sm">{detail.description}</p>
                </section>
                <section>
                  <h4 className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Média suggéré</h4>
                  <div className="flex items-start gap-2 rounded-xl border border-border bg-secondary/50 p-3">
                    <ImageIcon className="mt-0.5 size-4 text-primary" />
                    <p className="text-sm italic text-muted-foreground">{detail.mediaConcept}</p>
                  </div>
                </section>
                <section>
                  <h4 className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Caption proposée</h4>
                  <p className="rounded-xl border border-border p-3 text-sm whitespace-pre-wrap">{detail.suggestedCaption}</p>
                </section>
                <section>
                  <h4 className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Hashtags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.hashtags.map((h) => (
                      <span key={h} className="rounded-full bg-accent/60 px-2 py-0.5 text-[11px] font-medium text-primary">
                        {h}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
              <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-border bg-background px-4 py-3">
                <Button className="flex-1" onClick={() => addPostFromIdea(detail, "Publié")}>
                  <Send className="size-4" /> Publier
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setSchedule(detail)}>
                  <Clock className="size-4" /> Planifier
                </Button>
                <Button variant="outline" onClick={() => { onEdit(detail); setDetail(null); }}>
                  <Pencil className="size-4" /> Modifier
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive"
                  onClick={() => {
                    postIdeasStore.remove(detail.id);
                    setDetail(null);
                    toast.success("Idée supprimée");
                  }}
                >
                  <Trash2 className="size-4" /> Supprimer
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <ScheduleDialog
        open={!!schedule}
        onOpenChange={(o) => (o ? null : setSchedule(null))}
        initialDate={schedule?.suggestedDate}
        onConfirm={({ date, time }) => {
          if (schedule) addPostFromIdea(schedule, "Planifié", date, time);
          setSchedule(null);
        }}
      />
    </section>
  );
}
