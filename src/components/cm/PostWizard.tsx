import { Check, ChevronLeft, Clock, FileText, GripVertical, ImageIcon, Save, Send, Sparkles, Wand2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ScheduleDialog } from "./ScheduleDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { burstConfetti, platformSettings, postsStore, uid } from "@/lib/cm/store";
import { LANGUES, PLATFORM_META, STOCK_IMAGES, TONS, type CmPostStatut, type SocialPlatform, type SocialPost } from "@/lib/cm/types";
import { PLATFORM_ICONS } from "@/components/cm/shared";
import { cn } from "@/lib/utils";

const STEP_LABELS = ["Médias & contenu", "Aperçu IA", "Plateformes & publication"];
const PLATFORMS: SocialPlatform[] = ["LinkedIn", "Facebook", "Instagram", "YouTube"];

function emptyPost(): SocialPost {
  return {
    id: uid(),
    titre: "",
    caption: "",
    hashtags: [],
    media: [],
    platforms: [],
    platformConfig: {},
    statut: "Brouillon",
    date: "2026-09-15",
    heure: "09:00",
    auteur: "IA",
    langue: "Français",
    ton: "Professionnel",
  };
}

export function PostWizard({
  open,
  onOpenChange,
  editing,
  prefill,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing?: SocialPost | null | undefined;
  prefill?: (Partial<SocialPost> & { idea?: string }) | undefined;
}) {
  const [post, setPost] = useState<SocialPost>(emptyPost());
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [idea, setIdea] = useState("");
  const [keywords, setKeywords] = useState("");
  const [generating, setGenerating] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setKeywords("");
    if (editing) {
      setPost({ ...editing });
      setIdea("");
    } else {
      setPost({ ...emptyPost(), ...prefill });
      setIdea(prefill?.idea ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function addImage() {
    const url = STOCK_IMAGES[post.media.length % STOCK_IMAGES.length]!;
    setPost((p) => ({ ...p, media: [...p.media, { id: uid(), url, description: "", legende: "" }] }));
  }

  function moveMedia(from: number, to: number) {
    setPost((p) => {
      const m = [...p.media];
      const [it] = m.splice(from, 1);
      if (it) m.splice(to, 0, it);
      return { ...p, media: m };
    });
  }

  function generer() {
    setGenerating(true);
    setTimeout(() => {
      const kws = keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
        .map((k) => `#${k.replace(/[^\p{L}\p{N}]/gu, "")}`);
      const tags = [...kws, "#GEODATA", "#Géomatique", "#Maroc"].slice(0, 6);
      const descriptions = post.media.map((m) => m.description).filter(Boolean).join(" · ");
      setPost((p) => ({
        ...p,
        titre: p.titre || idea || "Post généré par l'IA",
        caption: `${idea || "GEODATA accompagne vos projets d'aménagement avec des données géospatiales fiables."}${
          descriptions ? `\n\n${descriptions}` : ""
        }\n\nContactez-nous pour en savoir plus 👉`,
        hashtags: tags,
        media: p.media.length ? p.media : [{ id: uid(), url: STOCK_IMAGES[0]!, description: "Visuel généré", legende: "" }],
        auteur: "IA",
      }));
      setGenerating(false);
      setStep(2);
      toast.success("Post généré par l'IA");
    }, 900);
  }

  function togglePlatform(p: SocialPlatform) {
    setPost((prev) => {
      const active = prev.platforms.includes(p);
      const platforms = active ? prev.platforms.filter((x) => x !== p) : [...prev.platforms, p];
      const platformConfig = { ...prev.platformConfig };
      if (active) delete platformConfig[p];
      else platformConfig[p] = platformSettings(p);
      return { ...prev, platforms, platformConfig };
    });
  }

  function save(statut: CmPostStatut, date?: string, heure?: string) {
    if (!post.titre.trim()) {
      toast.error("Titre requis.");
      return;
    }
    if (statut !== "Brouillon" && !post.platforms.length) {
      toast.error("Sélectionnez au moins une plateforme.");
      return;
    }
    const next: SocialPost = { ...post, statut, date: date ?? post.date, heure: heure ?? post.heure };
    if (editing) {
      postsStore.update(post.id, next);
      toast.success("Post mis à jour");
    } else {
      postsStore.add(next);
      if (statut === "Publié") toast.success("Post publié");
      else if (statut === "Planifié") toast.success(`Post planifié pour le ${next.date} à ${next.heure}`);
      else toast.success("Brouillon enregistré");
    }
    if (statut === "Publié") burstConfetti();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cm-scroll max-h-[92vh] overflow-y-auto p-0 sm:max-w-4xl">
        <div className="bg-gradient-to-r from-primary to-brand-soft px-5 py-4 text-primary-foreground">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="size-4" /> {editing ? "Modifier le post" : "Nouveau post"}
            <span className="font-normal opacity-80">— Community Manager IA</span>
          </DialogTitle>
          <div className="mt-3 flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <span key={s} className={cn("h-1.5 flex-1 rounded-full", s <= step ? "bg-primary-foreground" : "bg-primary-foreground/30")} />
            ))}
          </div>
          <p className="mt-1.5 text-xs opacity-90">
            Étape {step} / 3 — {STEP_LABELS[step - 1]}
          </p>
        </div>

        <div className="space-y-4 px-5 pb-2">
          {step === 1 ? (
            <>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">Médias du post</p>
                  <p className="text-xs text-muted-foreground">L'ordre définit la séquence carrousel. Glissez pour réorganiser.</p>
                </div>
                <Button size="sm" variant="outline" onClick={addImage}>
                  <ImageIcon className="size-4" /> + Image
                </Button>
              </div>

              {!post.media.length ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Aucun média. Ajoutez des images — chacune aura sa propre description IA.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {post.media.map((m, i) => (
                    <div
                      key={m.id}
                      draggable
                      onDragStart={() => setDragIdx(i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragIdx !== null && dragIdx !== i) moveMedia(dragIdx, i);
                        setDragIdx(null);
                      }}
                      className="overflow-hidden rounded-xl border border-border bg-card"
                    >
                      <div className="relative aspect-video">
                        <img src={m.url} alt={m.alt ?? ""} className="size-full object-cover" />
                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold">
                          <GripVertical className="size-3" /> #{i + 1}
                        </span>
                        <button
                          type="button"
                          aria-label="Supprimer le média"
                          onClick={() => setPost((p) => ({ ...p, media: p.media.filter((x) => x.id !== m.id) }))}
                          className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-background/80 text-destructive"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                      <div className="space-y-2 p-3">
                        <div>
                          <Label className="text-xs">Description (utilisée par l'IA)</Label>
                          <Input
                            className="h-8"
                            value={m.description ?? ""}
                            onChange={(e) =>
                              setPost((p) => ({
                                ...p,
                                media: p.media.map((x) => (x.id === m.id ? { ...x, description: e.target.value } : x)),
                              }))
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Référence / inspiration</Label>
                            <Input
                              className="h-8"
                              value={m.reference ?? ""}
                              onChange={(e) =>
                                setPost((p) => ({
                                  ...p,
                                  media: p.media.map((x) => (x.id === m.id ? { ...x, reference: e.target.value } : x)),
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Prompt visuel</Label>
                            <Input
                              className="h-8"
                              value={m.prompt ?? ""}
                              onChange={(e) =>
                                setPost((p) => ({
                                  ...p,
                                  media: p.media.map((x) => (x.id === m.id ? { ...x, prompt: e.target.value } : x)),
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 border-t border-border pt-3">
                <div>
                  <Label className="text-xs">Idée générale</Label>
                  <Textarea
                    rows={2}
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Ex : annonce d'un nouveau levé LIDAR / d'un webinaire / d'une référence projet"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Langue</Label>
                    <Select value={post.langue} onValueChange={(v) => setPost((p) => ({ ...p, langue: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUES.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Ton</Label>
                    <Select value={post.ton} onValueChange={(v) => setPost((p) => ({ ...p, ton: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TONS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Mots-clés (virgules)</Label>
                  <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="LIDAR, drone, cubature" />
                </div>
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="rounded-lg border border-primary/25 bg-gradient-to-r from-accent/70 to-transparent p-3 text-xs text-foreground">
                L'IA a rédigé le contenu à partir de votre brief. Éditez librement.
              </div>
              <div>
                <Label className="text-xs">Titre interne</Label>
                <Input value={post.titre} onChange={(e) => setPost((p) => ({ ...p, titre: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Caption</Label>
                <Textarea rows={6} value={post.caption} onChange={(e) => setPost((p) => ({ ...p, caption: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Hashtags (virgules)</Label>
                <Input
                  value={post.hashtags.join(", ")}
                  onChange={(e) =>
                    setPost((p) => ({ ...p, hashtags: e.target.value.split(",").map((h) => h.trim()).filter(Boolean) }))
                  }
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {post.hashtags.map((h) => (
                    <span key={h} className="rounded-full bg-accent/60 px-2 py-0.5 text-[11px] font-medium text-primary">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Ordre des médias — glissez pour réorganiser</Label>
                <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
                  {post.media.map((m, i) => (
                    <div
                      key={m.id}
                      draggable
                      onDragStart={() => setDragIdx(i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragIdx !== null && dragIdx !== i) moveMedia(dragIdx, i);
                        setDragIdx(null);
                      }}
                      className="relative aspect-video overflow-hidden rounded-lg border border-border"
                    >
                      <img src={m.url} alt="" className="size-full object-cover" />
                      <span className="absolute top-1 left-1 rounded bg-background/80 px-1 text-[10px] font-semibold">#{i + 1}</span>
                      <button
                        type="button"
                        aria-label="Retirer"
                        onClick={() => setPost((p) => ({ ...p, media: p.media.filter((x) => x.id !== m.id) }))}
                        className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-background/80 text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImage}
                    className="grid aspect-video place-items-center rounded-lg border border-dashed border-border text-muted-foreground"
                  >
                    +
                  </button>
                </div>
              </div>
              <Button variant="outline" onClick={() => toast.success("Contenu régénéré par l'IA")}>
                <Wand2 className="size-4" /> Régénérer avec l'IA
              </Button>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <div>
                <Label className="text-xs">Plateformes de publication</Label>
                <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
                  {PLATFORMS.map((p) => {
                    const Icon = PLATFORM_ICONS[p];
                    const active = post.platforms.includes(p);
                    const meta = PLATFORM_META[p];
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePlatform(p)}
                        className={cn(
                          "relative flex flex-col items-center gap-1.5 rounded-xl border p-4 text-xs transition-colors",
                          active ? cn("ring-2", meta.ring, meta.bg, meta.border) : "border-border hover:bg-secondary",
                        )}
                      >
                        <Icon className={cn("size-5", meta.color)} />
                        {p}
                        {active ? (
                          <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-2.5" />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Sparkles className="size-3" /> Les paramètres IA sont hérités automatiquement depuis la configuration de chaque plateforme.
                </p>
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  <FileText className="size-4" /> Récapitulatif
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>Titre : {post.titre || "—"}</li>
                  <li>Médias : {post.media.length} ({post.media.length} image(s))</li>
                  <li>Plateformes : {post.platforms.join(", ") || "—"}</li>
                  <li>Hashtags : {post.hashtags.length}</li>
                </ul>
              </div>
            </>
          ) : null}
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-border bg-secondary/40 px-5 py-3">
          <Button variant="outline" onClick={() => (step === 1 ? onOpenChange(false) : setStep((s) => (s - 1) as 1 | 2 | 3))}>
            {step === 1 ? "Annuler" : (<><ChevronLeft className="size-4" /> Précédent</>)}
          </Button>
          <div className="ml-auto flex flex-wrap gap-2">
            {step === 1 ? (
              <Button onClick={generer}>
                <Sparkles className={cn("size-4", generating && "animate-spin")} /> Générer le post
              </Button>
            ) : null}
            {step === 2 ? (
              <>
                <Button variant="outline" onClick={() => save("Brouillon")}>
                  <Save className="size-4" /> Save Brouillon
                </Button>
                <Button onClick={() => setStep(3)}>Suivant →</Button>
              </>
            ) : null}
            {step === 3 ? (
              <>
                <Button variant="outline" onClick={() => save("Brouillon")}>
                  <Save className="size-4" /> Brouillon
                </Button>
                <Button variant="outline" onClick={() => setScheduleOpen(true)}>
                  <Clock className="size-4" /> Planifier
                </Button>
                <Button onClick={() => save("Publié")}>
                  <Send className="size-4" /> Publier maintenant
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <ScheduleDialog
          open={scheduleOpen}
          onOpenChange={setScheduleOpen}
          initialDate={post.date}
          initialTime={post.heure}
          onConfirm={({ date, time }) => save("Planifié", date, time)}
        />
      </DialogContent>
    </Dialog>
  );
}
