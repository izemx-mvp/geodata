import { Facebook, Instagram, Linkedin, Youtube, type LucideIcon } from "lucide-react";
import type { SocialPlatform, SocialPost } from "@/lib/cm/types";
import { POST_IMAGES } from "@/lib/cm/types";

export const PLATFORM_ICONS: Record<SocialPlatform, LucideIcon> = {
  LinkedIn: Linkedin,
  Facebook: Facebook,
  Instagram: Instagram,
  YouTube: Youtube,
};

export function postMediaFor(p: SocialPost, i: number) {
  return p.media[0]?.url ?? POST_IMAGES[i % POST_IMAGES.length]!;
}

export function postToneFor(p: SocialPost) {
  if (p.statut === "Publié") return "border-success/35 bg-success/10 text-success";
  if (p.statut === "Planifié") return "border-info/35 bg-info/10 text-info";
  return "border-border bg-secondary text-muted-foreground";
}

export function fallbackImg(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.src = POST_IMAGES[0]!;
}
