import logoWhite from "@/assets/geodata-logo-white.png";
import logoDark from "@/assets/geodata-logo-dark.png";
import mark from "@/assets/geodata-mark.png";
import { cn } from "@/lib/utils";

/**
 * Official GEODATA Maroc logo (geodata.ma). Never distorted: width auto,
 * fixed height only.
 */
export function BrandLogo({
  variant = "white",
  className,
}: {
  variant?: "white" | "dark";
  className?: string;
}) {
  return (
    <img
      src={variant === "white" ? logoWhite : logoDark}
      alt="GEODATA Maroc — L'ingénierie de l'aménagement du territoire"
      className={cn("h-9 w-auto object-contain", className)}
      draggable={false}
    />
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={mark}
      alt=""
      aria-hidden
      className={cn("size-8 object-contain", className)}
      draggable={false}
    />
  );
}
