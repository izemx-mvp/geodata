import { AlertTriangle, Plus, Tag, Wand2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PLATFORM_ICONS } from "./shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cmConfigStore, editorialConfigStore, useStore } from "@/lib/cm/store";
import { PLATFORM_META, type CmPlatform } from "@/lib/cm/types";
import { cn } from "@/lib/utils";

const PLATFORMS: CmPlatform[] = ["Facebook", "Instagram", "LinkedIn", "YouTube"];

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input className="h-9" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="text-xs font-semibold tabular-nums text-muted-foreground">{value}</span>
      </div>
      <Slider className="mt-3" value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0] ?? min)} />
    </div>
  );
}

function SwitchField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <Label className="text-xs">{label}</Label>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

export function ConfigTab() {
  const editorial = useStore(editorialConfigStore);
  const configs = useStore(cmConfigStore);
  const [plat, setPlat] = useState<CmPlatform>("Facebook");
  const [theme, setTheme] = useState("");
  const [avoid, setAvoid] = useState("");

  const current = configs.find((c) => c.platform === plat)!;
  const s = current.settings as Record<string, never>;
  const set = (key: string, value: unknown) => cmConfigStore.update(current.id, { settings: { ...current.settings, [key]: value } });
  const str = (k: string, d = "") => (typeof s[k] === "string" ? (s[k] as string) : d);
  const num = (k: string, d = 0) => (typeof s[k] === "number" ? (s[k] as number) : d);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface-card p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-accent/60 text-primary">
              <Tag className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold">Thématiques éditoriales</h3>
              <p className="text-xs text-muted-foreground">Utilisées pour classer et générer les posts.</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {editorial.thematiques.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs">
                {t}
                <button
                  type="button"
                  aria-label={`Retirer ${t}`}
                  onClick={() => editorialConfigStore.update({ thematiques: editorial.thematiques.filter((x) => x !== t) })}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              className="h-9"
              placeholder="Nouvelle thématique..."
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && theme.trim()) {
                  editorialConfigStore.update({ thematiques: [...editorial.thematiques, theme.trim()] });
                  setTheme("");
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                if (!theme.trim()) return;
                editorialConfigStore.update({ thematiques: [...editorial.thematiques, theme.trim()] });
                setTheme("");
              }}
            >
              <Plus className="size-4" /> Ajouter
            </Button>
          </div>
        </section>

        <section className="surface-card border-destructive/40 p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold">Sujets à éviter</h3>
              <p className="text-xs text-muted-foreground">L'agent n'abordera jamais ces thèmes.</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {editorial.topicsAvoid.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full border border-destructive/25 bg-destructive/10 px-2.5 py-1 text-xs text-destructive">
                {t}
                <button type="button" aria-label={`Retirer ${t}`} onClick={() => editorialConfigStore.update({ topicsAvoid: editorial.topicsAvoid.filter((x) => x !== t) })}>
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              className="h-9"
              placeholder="Sujet à exclure..."
              value={avoid}
              onChange={(e) => setAvoid(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && avoid.trim()) {
                  editorialConfigStore.update({ topicsAvoid: [...editorial.topicsAvoid, avoid.trim()] });
                  setAvoid("");
                }
              }}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (!avoid.trim()) return;
                editorialConfigStore.update({ topicsAvoid: [...editorial.topicsAvoid, avoid.trim()] });
                setAvoid("");
              }}
            >
              Exclure
            </Button>
          </div>
        </section>
      </div>

      <section className="surface-card p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <Wand2 className="size-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">Paramètres IA par plateforme</h3>
            <p className="text-xs text-muted-foreground">Chaque plateforme dispose de sa propre configuration indépendante.</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {PLATFORMS.map((p) => {
            const Icon = PLATFORM_ICONS[p];
            const meta = PLATFORM_META[p];
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPlat(p)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                  plat === p ? cn("font-semibold ring-2", meta.ring, meta.bg, meta.border) : "border-border hover:bg-secondary",
                )}
              >
                <Icon className={cn("size-3.5", meta.color)} /> {p}
              </button>
            );
          })}
        </div>

        <div className={cn("mt-4 grid gap-4", plat === "YouTube" ? "md:grid-cols-2" : "md:grid-cols-3")}>
          {plat === "Facebook" ? (
            <>
              <SliderField label="Longueur caption (car.)" value={num("captionLength", 200)} min={50} max={500} step={10} onChange={(v) => set("captionLength", v)} />
              <SelectField label="Utilisation des émojis" value={str("emojiUsage", "Moyenne")} options={["Aucun", "Faible", "Moyenne", "Élevée"]} onChange={(v) => set("emojiUsage", v)} />
              <SliderField label="Nombre de hashtags" value={num("hashtagCount", 5)} min={0} max={15} onChange={(v) => set("hashtagCount", v)} />
              <SelectField label="Style de CTA" value={str("ctaStyle", "Invitation")} options={["Interrogatif", "Impératif", "Invitation", "Aucun"]} onChange={(v) => set("ctaStyle", v)} />
              <SelectField label="Ton conversationnel" value={str("tone", "Conversationnel")} options={["Conversationnel", "Informatif", "Professionnel", "Humoristique"]} onChange={(v) => set("tone", v)} />
              <SelectField label="Niveau de storytelling" value={str("storytelling", "Moyen")} options={["Faible", "Moyen", "Élevé"]} onChange={(v) => set("storytelling", v)} />
            </>
          ) : null}
          {plat === "Instagram" ? (
            <>
              <SliderField label="Longueur caption (car.)" value={num("captionLength", 150)} min={50} max={300} step={10} onChange={(v) => set("captionLength", v)} />
              <SliderField label="Nombre de hashtags" value={num("hashtagCount", 12)} min={0} max={30} onChange={(v) => set("hashtagCount", v)} />
              <SelectField label="Densité émojis" value={str("emojiDensity", "Moyenne")} options={["Faible", "Moyenne", "Élevée"]} onChange={(v) => set("emojiDensity", v)} />
              <SelectField label="Ton" value={str("tone", "Inspirationnel")} options={["Chaleureux", "Inspirationnel", "Professionnel", "Fun"]} onChange={(v) => set("tone", v)} />
              <InputField label="CTA" value={str("cta")} onChange={(v) => set("cta", v)} />
              <SwitchField label="Image-first (visuel prioritaire)" value={s["imageFirst"] === true} onChange={(v) => set("imageFirst", v)} />
            </>
          ) : null}
          {plat === "LinkedIn" ? (
            <>
              <SelectField label="Ton professionnel" value={str("tone", "Expert")} options={["Professionnel", "Expert", "Inspirationnel", "Analytique"]} onChange={(v) => set("tone", v)} />
              <SelectField label="Formatage des paragraphes" value={str("paragraphFormat", "Moyen")} options={["Court 1-2 lignes", "Moyen", "Long storytelling"]} onChange={(v) => set("paragraphFormat", v)} />
              <InputField label="CTA" value={str("cta")} onChange={(v) => set("cta", v)} />
              <InputField label="Stratégie hashtags" value={str("hashtagStrategy")} onChange={(v) => set("hashtagStrategy", v)} />
              <InputField label="Type d'audience" value={str("audience")} onChange={(v) => set("audience", v)} />
            </>
          ) : null}
          {plat === "YouTube" ? (
            <>
              <SelectField label="Style du titre" value={str("titleStyle", "Descriptif")} options={["Accrocheur", "Descriptif", "Question", "Chiffré"]} onChange={(v) => set("titleStyle", v)} />
              <SelectField label="Longueur de description" value={str("descriptionLength", "Moyen")} options={["Court", "Moyen", "Long"]} onChange={(v) => set("descriptionLength", v)} />
              <InputField label="Tags (virgules)" value={str("tags")} onChange={(v) => set("tags", v)} />
              <InputField label="Prompt miniature" value={str("thumbnailPrompt")} onChange={(v) => set("thumbnailPrompt", v)} />
              <SelectField label="Placement du CTA" value={str("ctaPlacement", "Fin")} options={["Début", "Milieu", "Fin", "Début & fin"]} onChange={(v) => set("ctaPlacement", v)} />
            </>
          ) : null}
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={() => toast.success(`Configuration ${plat} enregistrée`)}>Enregistrer</Button>
        </div>
      </section>
    </div>
  );
}
