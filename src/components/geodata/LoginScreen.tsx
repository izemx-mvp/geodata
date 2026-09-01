import { useState } from "react";
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { GeoBackground } from "./GeoBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const DEMO_EMAIL = "admin@geodata.ma";
export const DEMO_PASSWORD = "Geodata2026!";

export function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [statut, setStatut] = useState<"idle" | "loading" | "error" | "success">("idle");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (statut === "loading") return;
    setStatut("loading");
    window.setTimeout(() => {
      if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        setStatut("success");
        window.setTimeout(onSuccess, 550);
      } else {
        setStatut("error");
      }
    }, 750);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-anthracite px-4 py-10">
      <GeoBackground intensity="strong" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, oklch(0.769 0.168 68.3 / 0.14), transparent 58%)",
        }}
      />

      <div className="relative grid w-full max-w-5xl gap-10 lg:grid-cols-[1.1fr_minmax(0,380px)] lg:items-center">
        <div className="page-reveal hidden lg:block">
          <BrandLogo className="h-14" />
          <h1 className="mt-8 text-4xl leading-tight font-semibold text-white">
            Plateforme IA <span className="text-brand">Business &amp; Projets</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65">
            Topographie · Géodésie · Photogrammétrie · LIDAR &amp; 3D Mapping · Mobile Mapping · SIG ·
            Cartographie · BIM. Pilotage commercial, appels d'offres et affaires dans un seul poste de
            commande.
          </p>
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
            {[
              ["47", "ans d'expertise"],
              ["3", "agents IA intégrés"],
              ["8", "villes couvertes"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <dt className="text-2xl font-semibold text-brand">{v}</dt>
                <dd className="text-[11px] tracking-wide text-white/55 uppercase">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="page-reveal rounded-xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-xl sm:p-8">
          <div className="mb-6 lg:hidden">
            <BrandLogo className="h-10" />
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-1.5 animate-geo-pulse rounded-full bg-brand" />
            <span className="text-[10px] font-medium tracking-[0.2em] text-white/60 uppercase">
              Mode démonstration
            </span>
          </div>
          <h2 className="mt-3 text-xl font-semibold text-white">Connexion à la plateforme</h2>
          <p className="mt-1 text-xs text-white/55">
            Identifiants de démonstration déjà renseignés — cliquez simplement sur « Se connecter ».
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login-email" className="text-xs text-white/70">
                Adresse e-mail
              </Label>
              <Input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-white/15 bg-white/5 text-white placeholder:text-white/35 focus-visible:border-brand"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login-password" className="text-xs text-white/70">
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={show ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-white/15 bg-white/5 pr-10 text-white placeholder:text-white/35 focus-visible:border-brand"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute inset-y-0 right-0 grid w-10 place-items-center text-white/55 transition-colors hover:text-brand"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(v === true)}
                className="border-white/25 data-[state=checked]:bg-brand data-[state=checked]:text-anthracite"
              />
              <Label htmlFor="remember" className="text-xs font-normal text-white/65">
                Se souvenir de moi
              </Label>
            </div>

            {statut === "error" ? (
              <p className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/15 px-3 py-2 text-xs text-white">
                <AlertTriangle className="size-4 shrink-0" />
                Identifiants incorrects. Utilisez les identifiants de démonstration.
              </p>
            ) : null}
            {statut === "success" ? (
              <p className="flex items-center gap-2 rounded-md border border-success/40 bg-success/15 px-3 py-2 text-xs text-white">
                <CheckCircle2 className="size-4 shrink-0" />
                Authentification réussie — ouverture du poste de commande…
              </p>
            ) : null}

            <Button
              type="submit"
              size="lg"
              disabled={statut === "loading" || statut === "success"}
              className="w-full font-semibold shadow-[var(--shadow-brand)]"
            >
              {statut === "loading" ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Connexion…
                </>
              ) : (
                <>
                  <LogIn className="size-4" /> Se connecter
                </>
              )}
            </Button>
          </form>

          <p className="mt-5 text-[11px] leading-relaxed text-white/40">
            GEODATA Maroc · L'ingénierie de l'aménagement du territoire
          </p>
        </div>
      </div>
    </div>
  );
}
