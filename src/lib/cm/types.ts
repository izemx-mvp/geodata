export type SocialPlatform = "LinkedIn" | "Facebook" | "Instagram" | "YouTube";

export type PostMedia = {
  id: string;
  url: string;
  alt?: string | undefined;
  legende?: string | undefined;
  description?: string | undefined;
  reference?: string | undefined;
  prompt?: string | undefined;
};

export type PostPlatformConfig = Record<string, unknown>;

export type CmPostStatut = "Brouillon" | "Planifié" | "Publié";

export type SocialPost = {
  id: string;
  titre: string;
  caption: string;
  hashtags: string[];
  media: PostMedia[];
  platforms: SocialPlatform[];
  platformConfig: Partial<Record<SocialPlatform, PostPlatformConfig>>;
  statut: CmPostStatut;
  date: string; // YYYY-MM-DD
  heure?: string | undefined; // HH:MM
  auteur: "IA" | "Manuel";
  langue: string;
  ton: string;
};

export type PostIdea = {
  id: string;
  titre: string;
  description: string;
  suggestedCaption: string;
  mediaConcept: string;
  hashtags: string[];
  platforms: SocialPlatform[];
  suggestedDate: string;
  image?: string | undefined;
  saved?: boolean | undefined;
};

export type CmPlatform = SocialPlatform;

export type CmPlatformConfig = {
  id: string;
  platform: CmPlatform;
  settings: Record<string, unknown>;
};

export type EditorialConfig = {
  thematiques: string[];
  topicsAvoid: string[];
};

/** Couleurs mappées sur les tokens du design system GEODATA. */
export const PLATFORM_META: Record<SocialPlatform, { color: string; bg: string; border: string; ring: string }> = {
  LinkedIn: {
    color: "text-info",
    bg: "bg-info/10",
    border: "border-info/30",
    ring: "ring-info/50",
  },
  Facebook: {
    color: "text-brand-deep",
    bg: "bg-accent/60",
    border: "border-primary/30",
    ring: "ring-primary/50",
  },
  Instagram: {
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    ring: "ring-destructive/50",
  },
  YouTube: {
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
    ring: "ring-success/50",
  },
};

export const POST_IMAGES = [
  "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=70",
];

export const STOCK_IMAGES = [
  ...POST_IMAGES,
  "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=70",
];

export const LANGUES = ["Français", "English", "العربية", "Español"];
export const TONS = ["Professionnel", "Chaleureux", "Expert", "Inspirationnel", "Humoristique", "Direct"];
