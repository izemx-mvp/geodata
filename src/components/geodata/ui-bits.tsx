import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function PageHeader({
  titre,
  sousTitre,
  actions,
}: {
  titre: string;
  sousTitre?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{titre}</h1>
        {sousTitre ? <p className="mt-1 text-sm text-muted-foreground">{sousTitre}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

const TONE: Record<string, string> = {
  neutre: "bg-secondary text-secondary-foreground border-border",
  orange: "bg-accent text-accent-foreground border-primary/25",
  vert: "bg-success/12 text-success border-success/25",
  rouge: "bg-destructive/10 text-destructive border-destructive/25",
  bleu: "bg-info/10 text-info border-info/25",
  jaune: "bg-warning/20 text-warning-foreground border-warning/40",
};

export function statutTone(s: string): keyof typeof TONE {
  const v = s.toLowerCase();
  if (/(gagné|validé|validée|publié|accepté|terminé|clôturée|livrée client|prêt à facturer|go\b)/.test(v)) return "vert";
  if (/(perdu|rejet|refusé|no-go|retard|correction demandée|critique)/.test(v)) return "rouge";
  if (/(nouveau|détecté|idée|à faire|à planifier|brouillon)/.test(v)) return "neutre";
  if (/(validation|à valider|contrôle|en attente|relance)/.test(v)) return "jaune";
  if (/(en cours|en exécution|planifié|planifiée|en préparation|déposé|envoyé)/.test(v)) return "bleu";
  return "orange";
}

export function StatusBadge({ statut, tone }: { statut: string; tone?: keyof typeof TONE }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE[tone ?? statutTone(statut)],
      )}
    >
      {statut}
    </span>
  );
}

export function ScoreIA({ score, label = "Score IA" }: { score: number; label?: string }) {
  const tone = score >= 85 ? "text-success" : score >= 70 ? "text-primary" : "text-muted-foreground";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full", score >= 85 ? "bg-success" : score >= 70 ? "bg-primary" : "bg-muted-foreground")}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={cn("text-xs font-semibold tabular-nums", tone)} title={label}>
        {score}%
      </span>
    </div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  tone = "neutre",
  icon,
  onClick,
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "neutre" | "orange" | "rouge" | "vert";
  icon?: ReactNode;
  onClick?: () => void;
}) {
  const accents: Record<string, string> = {
    neutre: "border-border",
    orange: "border-primary/30 bg-accent/40",
    rouge: "border-destructive/30 bg-destructive/5",
    vert: "border-success/30 bg-success/5",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "card-elev group flex flex-col items-start rounded-xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50",
        accents[tone],
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
        {icon ? <span className="text-primary">{icon}</span> : null}
      </div>
      <span className="mt-2 text-3xl font-semibold tabular-nums text-foreground">{value}</span>
      {hint ? <span className="mt-1 text-xs text-muted-foreground">{hint}</span> : null}
    </button>
  );
}

export function SectionCard({
  titre,
  description,
  actions,
  children,
  className,
}: {
  titre?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card-elev rounded-xl border border-border bg-card", className)}>
      {titre ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">{titre}</h2>
            {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium break-words text-foreground">{value ?? "—"}</dd>
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className={cn("h-full rounded-full transition-all", value >= 100 ? "bg-success" : "bg-primary")}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function EmptyState({ titre, description }: { titre: string; description?: string }) {
  return (
    <div className="grid-surface rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <p className="text-sm font-medium text-foreground">{titre}</p>
      {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function Timeline({ items }: { items: { date: string; evenement: string }[] }) {
  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {items.map((it, i) => (
        <li key={i} className="relative">
          <span className="absolute top-1.5 -left-[23px] h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
          <p className="text-xs font-semibold text-muted-foreground">{it.date}</p>
          <p className="text-sm text-foreground">{it.evenement}</p>
        </li>
      ))}
    </ol>
  );
}
