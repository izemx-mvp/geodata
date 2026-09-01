import { CalendarDays, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { PLATFORM_ICONS, postToneFor } from "./shared";
import { StatusBadge } from "@/components/geodata/ui-bits";
import { Button } from "@/components/ui/button";
import { startOfWeek, toKey, useStore, postsStore } from "@/lib/cm/store";
import { PLATFORM_META, type SocialPost } from "@/lib/cm/types";
import { cn } from "@/lib/utils";

type Vue = "Année" | "Mois" | "Semaine" | "Jour" | "Agenda";
const VUES: Vue[] = ["Année", "Mois", "Semaine", "Jour", "Agenda"];
const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function sameDay(a: Date, b: Date) {
  return toKey(a) === toKey(b);
}

export function CalendarTab({ onPostClick }: { onPostClick: (p: SocialPost) => void }) {
  const posts = useStore(postsStore);
  const [vue, setVue] = useState<Vue>("Mois");
  const [curseur, setCurseur] = useState(new Date("2026-09-01T00:00:00"));
  const today = new Date();

  const postsByDay = useMemo(() => {
    const m = new Map<string, SocialPost[]>();
    posts.forEach((p) => {
      const arr = m.get(p.date) ?? [];
      arr.push(p);
      m.set(p.date, arr);
    });
    return m;
  }, [posts]);

  function shift(dir: number) {
    const d = new Date(curseur);
    if (vue === "Année") d.setFullYear(d.getFullYear() + dir);
    else if (vue === "Mois") d.setMonth(d.getMonth() + dir);
    else if (vue === "Semaine") d.setDate(d.getDate() + 7 * dir);
    else d.setDate(d.getDate() + dir);
    setCurseur(d);
  }

  const semaine = startOfWeek(curseur);
  const finSemaine = new Date(semaine);
  finSemaine.setDate(finSemaine.getDate() + 6);

  const label =
    vue === "Année"
      ? `${curseur.getFullYear()}`
      : vue === "Mois"
        ? `${MOIS[curseur.getMonth()]} ${curseur.getFullYear()}`
        : vue === "Semaine"
          ? `Semaine du ${semaine.getDate()} ${MOIS[semaine.getMonth()]?.toLowerCase()} – ${finSemaine.getDate()} ${MOIS[finSemaine.getMonth()]?.toLowerCase()} ${finSemaine.getFullYear()}`
          : vue === "Jour"
            ? `Jour ${curseur.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}`
            : "Agenda";

  return (
    <div className="surface-card overflow-hidden">
      <div className="flex flex-wrap items-start gap-3 p-4">
        <div>
          <h3 className="text-sm font-semibold">Calendrier des publications sociales</h3>
          <p className="text-xs text-muted-foreground">Vos posts programmés et publiés — cliquez un événement pour ouvrir ses détails.</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-full border border-border p-0.5">
            {VUES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVue(v)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs transition-colors",
                  vue === v ? "bg-secondary font-semibold text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v}
              </button>
            ))}
          </div>
          {vue !== "Agenda" ? (
            <div className="inline-flex items-center gap-1">
              <Button size="sm" variant="outline" onClick={() => setCurseur(new Date())}>
                Aujourd'hui
              </Button>
              <Button size="icon" variant="ghost" aria-label="Précédent" onClick={() => shift(-1)}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button size="icon" variant="ghost" aria-label="Suivant" onClick={() => shift(1)}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          ) : null}
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <p className="text-sm font-semibold">{label}</p>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-success" /> Publié</span>
            <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-info" /> Planifié</span>
            <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-muted-foreground" /> Brouillon</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border p-4">
        {vue === "Année" ? (
          <YearView
            annee={curseur.getFullYear()}
            postsByDay={postsByDay}
            onMonth={(m) => {
              setCurseur(new Date(curseur.getFullYear(), m, 1));
              setVue("Mois");
            }}
          />
        ) : null}
        {vue === "Mois" ? (
          <MonthView
            curseur={curseur}
            today={today}
            postsByDay={postsByDay}
            onDay={(d) => {
              setCurseur(d);
              setVue("Jour");
            }}
            onPostClick={onPostClick}
          />
        ) : null}
        {vue === "Semaine" ? <WeekView debut={semaine} today={today} postsByDay={postsByDay} onPostClick={onPostClick} /> : null}
        {vue === "Jour" ? <DayView jour={curseur} postsByDay={postsByDay} onPostClick={onPostClick} /> : null}
        {vue === "Agenda" ? <AgendaView posts={posts} onPostClick={onPostClick} /> : null}
      </div>
    </div>
  );
}

function YearView({
  annee,
  postsByDay,
  onMonth,
}: {
  annee: number;
  postsByDay: Map<string, SocialPost[]>;
  onMonth: (m: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {MOIS.map((nom, m) => {
        const nb = [...postsByDay.entries()].filter(([k]) => k.startsWith(`${annee}-${String(m + 1).padStart(2, "0")}`)).reduce((s, [, v]) => s + v.length, 0);
        const premier = new Date(annee, m, 1);
        const decalage = (premier.getDay() + 6) % 7;
        const nbJours = new Date(annee, m + 1, 0).getDate();
        return (
          <button key={nom} type="button" onClick={() => onMonth(m)} className="rounded-xl border border-border p-3 text-left hover:bg-secondary/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">{nom}</span>
              <span className="rounded-full bg-accent/60 px-1.5 text-[10px] font-semibold text-primary tabular-nums">{nb}</span>
            </div>
            <div className="mt-2 grid grid-cols-7 gap-0.5">
              {["L", "M", "M", "J", "V", "S", "D"].map((j, i) => (
                <span key={i} className="text-center text-[8px] text-muted-foreground">{j}</span>
              ))}
              {Array.from({ length: decalage }, (_, i) => <span key={`e${i}`} />)}
              {Array.from({ length: nbJours }, (_, i) => {
                const key = `${annee}-${String(m + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
                return <span key={key} className={cn("aspect-square rounded-[2px]", postsByDay.get(key) ? "bg-primary/60" : "bg-secondary")} />;
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MonthView({
  curseur,
  today,
  postsByDay,
  onDay,
  onPostClick,
}: {
  curseur: Date;
  today: Date;
  postsByDay: Map<string, SocialPost[]>;
  onDay: (d: Date) => void;
  onPostClick: (p: SocialPost) => void;
}) {
  const annee = curseur.getFullYear();
  const mois = curseur.getMonth();
  const decalage = (new Date(annee, mois, 1).getDay() + 6) % 7;
  const nbJours = new Date(annee, mois + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: decalage }, () => null),
    ...Array.from({ length: nbJours }, (_, i) => new Date(annee, mois, i + 1)),
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="grid grid-cols-7 bg-secondary/60">
        {JOURS.map((j) => (
          <div key={j} className="px-2 py-1.5 text-center text-[11px] font-semibold text-muted-foreground">{j}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border">
        {cells.map((d, i) => {
          const key = d ? toKey(d) : "";
          const jourPosts = d ? (postsByDay.get(key) ?? []) : [];
          return (
            <div key={i} className="min-h-[130px] bg-card p-1.5">
              {d ? (
                <button
                  type="button"
                  onClick={() => onDay(d)}
                  className={cn(
                    "grid size-6 place-items-center rounded-full text-xs tabular-nums",
                    sameDay(d, today) ? "bg-primary font-semibold text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {d.getDate()}
                </button>
              ) : null}
              <div className="mt-1 space-y-1">
                {jourPosts.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onPostClick(p)}
                    className={cn("flex w-full items-center gap-1 rounded-md border px-1 py-0.5 text-left text-[10px]", postToneFor(p))}
                  >
                    <span className="flex -space-x-1">
                      {p.platforms.slice(0, 3).map((pl) => {
                        const Icon = PLATFORM_ICONS[pl];
                        return <Icon key={pl} className={cn("size-3", PLATFORM_META[pl].color)} />;
                      })}
                    </span>
                    <span className="tabular-nums opacity-70">{p.heure}</span>
                    <span className="truncate">{p.titre}</span>
                  </button>
                ))}
                {jourPosts.length > 3 && d ? (
                  <button type="button" onClick={() => onDay(d)} className="text-[10px] text-muted-foreground hover:underline">
                    +{jourPosts.length - 3} autres
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({
  debut,
  today,
  postsByDay,
  onPostClick,
}: {
  debut: Date;
  today: Date;
  postsByDay: Map<string, SocialPost[]>;
  onPostClick: (p: SocialPost) => void;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-7">
      {Array.from({ length: 7 }, (_, i) => {
        const d = new Date(debut);
        d.setDate(d.getDate() + i);
        const jourPosts = [...(postsByDay.get(toKey(d)) ?? [])].sort((a, b) => (a.heure ?? "").localeCompare(b.heure ?? ""));
        return (
          <div key={i} className="rounded-xl border border-border p-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold">{JOURS[i]}</span>
              <span className={cn("grid size-6 place-items-center rounded-full text-xs tabular-nums", sameDay(d, today) ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                {d.getDate()}
              </span>
            </div>
            <div className="space-y-1.5">
              {jourPosts.map((p) => (
                <button key={p.id} type="button" onClick={() => onPostClick(p)} className={cn("w-full rounded-lg border p-1.5 text-left", postToneFor(p))}>
                  <span className="block text-[10px] tabular-nums opacity-70">{p.heure}</span>
                  <span className="flex items-start gap-1 text-[11px] leading-tight">
                    <Send className="mt-0.5 size-3 shrink-0" />
                    <span className="line-clamp-2">{p.titre}</span>
                  </span>
                </button>
              ))}
              {!jourPosts.length ? <p className="text-[11px] italic text-muted-foreground">Aucune publication</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayView({ jour, postsByDay, onPostClick }: { jour: Date; postsByDay: Map<string, SocialPost[]>; onPostClick: (p: SocialPost) => void }) {
  const jourPosts = postsByDay.get(toKey(jour)) ?? [];
  if (!jourPosts.length) {
    return (
      <div className="py-14 text-center">
        <CalendarDays className="mx-auto size-10 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">Aucune publication ce jour.</p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {Array.from({ length: 12 }, (_, i) => 8 + i).map((h) => {
        const events = jourPosts.filter((p) => Number((p.heure ?? "09:00").slice(0, 2)) === h);
        return (
          <div key={h} className="grid grid-cols-[80px_1fr] border-b border-border last:border-b-0">
            <div className="bg-secondary/50 px-2 py-3 font-mono text-[11px] text-muted-foreground">{String(h).padStart(2, "0")}:00</div>
            <div className="space-y-1.5 p-2">
              {events.map((p) => (
                <button key={p.id} type="button" onClick={() => onPostClick(p)} className={cn("w-full rounded-lg border p-2 text-left", postToneFor(p))}>
                  <span className="flex flex-wrap items-center gap-2">
                    <Send className="size-3.5" />
                    <span className="font-mono text-[11px] opacity-70">{p.heure}</span>
                    <span className="text-sm font-semibold">{p.titre}</span>
                    <StatusBadge statut={p.statut} />
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {p.platforms.join(" · ")} · {p.auteur}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AgendaView({ posts, onPostClick }: { posts: SocialPost[]; onPostClick: (p: SocialPost) => void }) {
  const groupes = useMemo(() => {
    const m = new Map<string, SocialPost[]>();
    [...posts]
      .sort((a, b) => (a.date + (a.heure ?? "")).localeCompare(b.date + (b.heure ?? "")))
      .forEach((p) => m.set(p.date, [...(m.get(p.date) ?? []), p]));
    return [...m.entries()];
  }, [posts]);

  if (!groupes.length) {
    return <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">Aucun post planifié.</div>;
  }

  return (
    <div className="space-y-4">
      {groupes.map(([date, items]) => (
        <div key={date}>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground">{date}</p>
          <div className="space-y-1.5">
            {items.map((p) => (
              <button key={p.id} type="button" onClick={() => onPostClick(p)} className={cn("flex w-full items-center gap-3 rounded-lg border p-2 text-left", postToneFor(p))}>
                <Send className="size-3.5" />
                <span className="w-12 font-mono text-[11px] opacity-70">{p.heure}</span>
                <span className="flex-1 truncate text-sm">{p.titre}</span>
                <StatusBadge statut={p.statut} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
