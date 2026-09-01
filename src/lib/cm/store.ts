import { useSyncExternalStore } from "react";
import type {
  CmPlatformConfig,
  EditorialConfig,
  PostIdea,
  SocialPost,
  SocialPlatform,
} from "./types";
import { POST_IMAGES } from "./types";

/* ---------------------------------- store --------------------------------- */

function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(next: T) {
      state = next;
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

function createListStore<T extends { id: string }>(initial: T[]) {
  const s = createStore<T[]>(initial);
  return {
    ...s,
    add(item: T) {
      s.set([item, ...s.get()]);
    },
    update(id: string, patch: Partial<T>) {
      s.set(s.get().map((it) => (it.id === id ? { ...it, ...patch } : it)));
    },
    remove(id: string) {
      s.set(s.get().filter((it) => it.id !== id));
    },
  };
}

export function useStore<T>(store: { get: () => T; subscribe: (l: () => void) => () => void }): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

export const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------------------------------- seeds --------------------------------- */

const SEED_POSTS: SocialPost[] = [
  {
    id: "cmp1",
    titre: "Levé LIDAR autoroute A7",
    caption:
      "Nos équipes ont finalisé le levé LIDAR mobile de 42 km d'infrastructure autoroutière.\n\nPrécision centimétrique, nuage de points classifié et livrables SIG exploitables immédiatement par les bureaux d'études.\n\nContactez-nous pour en savoir plus 👉",
    hashtags: ["#GEODATA", "#LIDAR", "#MobileMapping", "#Géomatique"],
    media: [
      { id: "m1", url: POST_IMAGES[0]!, legende: "Acquisition LIDAR mobile de nuit", description: "Véhicule de mobile mapping en acquisition" },
      { id: "m2", url: POST_IMAGES[1]!, legende: "Nuage de points classifié", description: "Extrait du nuage de points colorisé" },
    ],
    platforms: ["LinkedIn", "Facebook"],
    platformConfig: { LinkedIn: { ton: "Expert", cta: "Découvrez nos références" } },
    statut: "Publié",
    date: "2026-08-24",
    heure: "09:30",
    auteur: "IA",
    langue: "Français",
    ton: "Expert",
  },
  {
    id: "cmp2",
    titre: "Photogrammétrie par drone — carrière de Benslimane",
    caption:
      "Calcul de cubatures par photogrammétrie drone : 3 heures de terrain, un modèle 3D complet et un rapport de volumes livré en 48 h.\n\nUne méthode plus sûre, plus rapide et plus précise que les mesures traditionnelles.",
    hashtags: ["#Photogrammétrie", "#Drone", "#GEODATA", "#Topographie"],
    media: [{ id: "m3", url: POST_IMAGES[2]!, legende: "Vol drone au-dessus de la carrière", description: "Prise de vue aérienne du site" }],
    platforms: ["LinkedIn", "Instagram"],
    platformConfig: {},
    statut: "Planifié",
    date: "2026-09-08",
    heure: "11:00",
    auteur: "IA",
    langue: "Français",
    ton: "Professionnel",
  },
  {
    id: "cmp3",
    titre: "Coulisses : la cellule SIG GEODATA",
    caption:
      "Derrière chaque carte, une équipe. Zoom sur notre cellule SIG à Casablanca : structuration de données, contrôle qualité et diffusion web.",
    hashtags: ["#SIG", "#GEODATA", "#Cartographie"],
    media: [{ id: "m4", url: POST_IMAGES[3]!, legende: "Notre cellule SIG au travail", description: "Bureau SIG, écrans de cartographie" }],
    platforms: ["Instagram", "Facebook"],
    platformConfig: {},
    statut: "Brouillon",
    date: "2026-09-15",
    heure: "16:00",
    auteur: "Manuel",
    langue: "Français",
    ton: "Chaleureux",
  },
];

const SEED_IDEAS: PostIdea[] = [
  {
    id: "cmi1",
    titre: "Coulisses d'une mission de terrain",
    description: "Une journée type d'une équipe topographie : préparation, acquisition GNSS, contrôle et retour bureau.",
    suggestedCaption:
      "5h30. Le matériel est calibré, l'équipe part sur site. Découvrez une journée type de nos topographes sur le terrain.",
    mediaConcept: "Série de 3 photos terrain à l'aube, station totale en premier plan.",
    hashtags: ["#GEODATA", "#Topographie", "#Terrain", "#Métiers"],
    platforms: ["Instagram", "Facebook"],
    suggestedDate: "2026-09-10",
    image: POST_IMAGES[0]!,
  },
  {
    id: "cmi2",
    titre: "Étude : le coût caché d'un mauvais levé",
    description: "Chiffres à l'appui, l'impact d'un levé imprécis sur les délais et budgets de chantier.",
    suggestedCaption: "Une erreur de 5 cm sur un levé peut coûter plusieurs semaines de chantier. Voici pourquoi.",
    mediaConcept: "Infographie sobre avec 3 chiffres clés.",
    hashtags: ["#Géomatique", "#GEODATA", "#BTP"],
    platforms: ["LinkedIn"],
    suggestedDate: "2026-09-12",
    image: POST_IMAGES[1]!,
  },
  {
    id: "cmi3",
    titre: "Interview : notre responsable photogrammétrie",
    description: "Format question/réponse sur l'évolution des techniques d'acquisition aérienne au Maroc.",
    suggestedCaption: "« En 10 ans, nos délais de traitement ont été divisés par quatre. » Rencontre avec notre responsable photogrammétrie.",
    mediaConcept: "Portrait en lumière naturelle, fond atelier.",
    hashtags: ["#Interview", "#Photogrammétrie", "#GEODATA"],
    platforms: ["LinkedIn", "YouTube"],
    suggestedDate: "2026-09-17",
    image: POST_IMAGES[2]!,
  },
  {
    id: "cmi4",
    titre: "Webinaire : BIM & données géospatiales",
    description: "Annonce d'un webinaire sur l'intégration des données topographiques dans les maquettes BIM.",
    suggestedCaption: "Comment faire dialoguer scan 3D et maquette BIM ? Rendez-vous le 24 septembre pour notre webinaire.",
    mediaConcept: "Visuel maquette BIM superposée à un nuage de points.",
    hashtags: ["#BIM", "#Scan3D", "#GEODATA", "#Webinaire"],
    platforms: ["LinkedIn", "Facebook"],
    suggestedDate: "2026-09-18",
    image: POST_IMAGES[3]!,
  },
  {
    id: "cmi5",
    titre: "47 ans de géomatique au Maroc",
    description: "Post anniversaire avec les chiffres clés de l'entreprise.",
    suggestedCaption: "47 ans, 2 400 projets, 1 cap : donner le bon cap à vos projets.",
    mediaConcept: "Frise chronologique illustrée.",
    hashtags: ["#GEODATA", "#Maroc", "#Anniversaire"],
    platforms: ["LinkedIn", "Facebook", "Instagram"],
    suggestedDate: "2026-09-22",
    image: POST_IMAGES[0]!,
  },
  {
    id: "cmi6",
    titre: "Recrutement : ingénieur SIG",
    description: "Annonce de poste avec présentation de l'environnement de travail.",
    suggestedCaption: "Nous recrutons un(e) ingénieur(e) SIG à Casablanca. Rejoignez une équipe qui cartographie le Maroc depuis 1979.",
    mediaConcept: "Photo d'équipe en open space.",
    hashtags: ["#Recrutement", "#SIG", "#GEODATA"],
    platforms: ["LinkedIn"],
    suggestedDate: "2026-09-25",
    image: POST_IMAGES[1]!,
  },
];

const SEED_CONFIG: CmPlatformConfig[] = [
  {
    id: "cfg-fb",
    platform: "Facebook",
    settings: {
      captionLength: 220,
      emojiUsage: "Moyenne",
      hashtagCount: 5,
      ctaStyle: "Invitation",
      tone: "Conversationnel",
      storytelling: "Moyen",
    },
  },
  {
    id: "cfg-ig",
    platform: "Instagram",
    settings: {
      captionLength: 150,
      hashtagCount: 12,
      emojiDensity: "Moyenne",
      tone: "Inspirationnel",
      cta: "Écrivez-nous en message privé",
      imageFirst: true,
    },
  },
  {
    id: "cfg-li",
    platform: "LinkedIn",
    settings: {
      tone: "Expert",
      paragraphFormat: "Moyen",
      cta: "Contactez nos équipes",
      hashtagStrategy: "3 hashtags métier + 1 marque",
      audience: "Maîtres d'ouvrage, BET, collectivités",
    },
  },
  {
    id: "cfg-yt",
    platform: "YouTube",
    settings: {
      titleStyle: "Descriptif",
      descriptionLength: "Moyen",
      tags: "topographie, LIDAR, SIG, Maroc",
      thumbnailPrompt: "Vue drone d'un chantier avec titre en surimpression",
      ctaPlacement: "Fin",
    },
  },
];

/* ---------------------------------- stores -------------------------------- */

export const postsStore = createListStore<SocialPost>(SEED_POSTS);
export const postIdeasStore = createListStore<PostIdea>(SEED_IDEAS);
export const cmConfigStore = createListStore<CmPlatformConfig>(SEED_CONFIG);

const editorial = createStore<EditorialConfig>({
  thematiques: ["Topographie", "LIDAR & Scan 3D", "SIG & cartographie", "BIM", "Références projets", "Vie d'entreprise"],
  topicsAvoid: ["Politique", "Prix des concurrents", "Litiges clients"],
});

export const editorialConfigStore = {
  ...editorial,
  update(patch: Partial<EditorialConfig>) {
    editorial.set({ ...editorial.get(), ...patch });
  },
};

/* --------------------------------- helpers -------------------------------- */

export function platformSettings(platform: SocialPlatform) {
  return cmConfigStore.get().find((c) => c.platform === platform)?.settings ?? {};
}

export function burstConfetti() {
  if (typeof document === "undefined") return;
  const colors = ["var(--brand)", "var(--brand-soft)", "var(--success)", "var(--info)"];
  const root = document.createElement("div");
  root.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden";
  document.body.appendChild(root);
  for (let i = 0; i < 60; i++) {
    const p = document.createElement("span");
    const size = 6 + Math.random() * 6;
    p.style.cssText = `position:absolute;top:-10px;left:${Math.random() * 100}%;width:${size}px;height:${size * 0.5}px;background:${
      colors[i % colors.length]
    };opacity:.9;border-radius:2px;transform:rotate(${Math.random() * 360}deg)`;
    p.animate(
      [
        { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
        { transform: `translateY(${window.innerHeight + 40}px) rotate(${540 + Math.random() * 360}deg)`, opacity: 0.2 },
      ],
      { duration: 1600 + Math.random() * 1200, easing: "cubic-bezier(.2,.6,.4,1)", delay: Math.random() * 250, fill: "forwards" },
    );
    root.appendChild(p);
  }
  setTimeout(() => root.remove(), 3200);
}

export function fmtJour(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
}

export function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function startOfWeek(d: Date) {
  const c = new Date(d);
  const shift = (c.getDay() + 6) % 7;
  c.setDate(c.getDate() - shift);
  c.setHours(0, 0, 0, 0);
  return c;
}
