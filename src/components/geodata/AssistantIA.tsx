import { Link } from "@tanstack/react-router";
import { ArrowRight, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtMAD, joursRestants, useGeo } from "@/lib/geodata/store";

interface Reponse {
  titre: string;
  corps: string[];
  liens?: { label: string; to: string }[];
}

const SUGGESTIONS = [
  "Montre-moi les appels d'offres qui expirent cette semaine.",
  "Quels devis doivent être relancés aujourd'hui ?",
  "Quels projets sont en retard ?",
  "Prépare le lancement du projet GEO-2026-041.",
];

export function AssistantIA({ contexte }: { contexte?: string }) {
  const { state, userById } = useGeo();
  const [q, setQ] = useState("");
  const [reponse, setReponse] = useState<Reponse | null>(null);

  function repondre(question: string) {
    const v = question.toLowerCase();
    if (/appel|ao|expire/.test(v)) {
      const urgents = state.appelsOffres
        .filter((a) => joursRestants(a.dateLimite) >= 0 && joursRestants(a.dateLimite) <= 10)
        .sort((a, b) => joursRestants(a.dateLimite) - joursRestants(b.dateLimite));
      setReponse({
        titre: `${urgents.length} appel(s) d'offres arrivent à échéance`,
        corps: urgents.map(
          (a) => `${a.reference} — ${a.objet} · ${a.organisme} · J-${joursRestants(a.dateLimite)} · score ${a.scoreIA}%`,
        ),
        liens: [{ label: "Ouvrir les appels d'offres", to: "/appels-offres" }],
      });
      return;
    }
    if (/devis|relanc/.test(v)) {
      const envoyes = state.devis.filter((d) => d.statut === "Envoyé");
      setReponse({
        titre: `${envoyes.length} devis envoyés à relancer`,
        corps: envoyes.map((d) => {
          const total = d.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);
          return `${d.reference} — ${d.objet} · ${fmtMAD(total)} · envoyé le ${d.dateEnvoi}`;
        }),
        liens: [{ label: "Ouvrir les devis", to: "/devis" }],
      });
      return;
    }
    if (/retard|bloqu/.test(v)) {
      const enRetard = state.affaires.filter((a) => a.progression < 60 && a.statut === "En exécution");
      setReponse({
        titre: `${enRetard.length} affaire(s) présentent un risque de retard`,
        corps: [
          ...enRetard.map(
            (a) => `${a.reference} — ${a.titre} · progression ${a.progression}% · chef de projet ${userById(a.chefDeProjetId)?.nom}`,
          ),
          "Cause principale identifiée : la tâche « Traitement photogrammétrique » accuse 3 jours de retard.",
          "Recommandation : réaffecter une partie du traitement à Salma Bouhlal.",
        ],
        liens: [{ label: "Voir les affaires", to: "/affaires" }],
      });
      return;
    }
    if (/lancement|lancer|projet/.test(v)) {
      setReponse({
        titre: "Préparation du lancement de projet",
        corps: [
          "Toutes les informations commerciales (client, offre, montants, délais, livrables) seront transférées automatiquement vers le module Projet.",
          "L'agent IA propose ensuite un découpage en commandes puis en commandes internes.",
        ],
        liens: [
          { label: "Ouvrir les opportunités gagnées", to: "/opportunites" },
          { label: "Voir les affaires", to: "/affaires" },
        ],
      });
      return;
    }
    if (/disponible|équipe|equipe|qui/.test(v)) {
      const dispo = state.users.filter((u) => u.role === "TECHNICIEN" && (u.chargePct ?? 0) < 70);
      setReponse({
        titre: `${dispo.length} technicien(s) disponibles cette semaine`,
        corps: dispo.map((u) => `${u.nom} — ${u.specialite} · charge ${u.chargePct}%`),
        liens: [{ label: "Voir les équipes", to: "/equipes" }],
      });
      return;
    }
    if (/validation|valider/.test(v)) {
      const enAttente = state.taches.filter((t) => t.statut === "En attente de validation");
      setReponse({
        titre: `${enAttente.length} tâche(s) en attente de validation`,
        corps: enAttente.slice(0, 8).map((t) => `${t.libelle} — ${userById(t.responsableId)?.nom} · 100%`),
        liens: [{ label: "Ouvrir les validations", to: "/validation" }],
      });
      return;
    }
    setReponse({
      titre: "Synthèse GEODATA",
      corps: [
        `${state.opportunites.filter((o) => !["Gagné", "Perdu"].includes(o.stage)).length} opportunités commerciales en cours.`,
        `${state.appelsOffres.filter((a) => !["Gagné", "Perdu"].includes(a.statut)).length} appels d'offres suivis.`,
        `${state.affaires.filter((a) => a.statut !== "Clôturée").length} affaires actives.`,
        `${state.taches.filter((t) => t.statut === "En attente de validation").length} tâches en attente de validation.`,
      ],
      liens: [{ label: "Voir la vue globale", to: "/" }],
    });
  }

  return (
    <div className="card-elev overflow-hidden rounded-xl border border-primary/25 bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-accent/50 px-5 py-3">
        <Sparkles className="size-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">
          {contexte ? `Assistant IA — ${contexte}` : "Assistant IA GEODATA"}
        </span>
      </div>
      <div className="p-5">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!q.trim()) return;
            repondre(q);
          }}
        >
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Que souhaitez-vous faire ?"
            className="h-11"
          />
          <Button type="submit" className="h-11">
            <Send className="size-4" />
            Demander
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setQ(s);
                repondre(s);
              }}
              className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
        {reponse ? (
          <div className="mt-5 rounded-lg border border-border bg-secondary/60 p-4">
            <p className="text-sm font-semibold text-foreground">{reponse.titre}</p>
            <ul className="mt-2 space-y-1.5">
              {reponse.corps.map((c, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            {reponse.liens?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {reponse.liens.map((l) => (
                  <Button key={l.to} asChild size="sm" variant="outline">
                    <Link to={l.to}>
                      {l.label}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
