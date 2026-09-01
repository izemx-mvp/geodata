import { cn } from "@/lib/utils";

/**
 * Animated GEODATA visual language: topographic contours, cartographic grid,
 * LIDAR-style point cloud and a slow survey scan line. Pure CSS/SVG, no JS
 * animation loop, so it stays cheap on every screen it is used on.
 */
export function GeoBackground({
  className,
  intensity = "subtle",
}: {
  className?: string;
  intensity?: "subtle" | "strong";
}) {
  const strong = intensity === "strong";
  const points = [
    [8, 22],
    [17, 61],
    [26, 34],
    [33, 78],
    [41, 18],
    [49, 52],
    [57, 27],
    [64, 70],
    [72, 39],
    [80, 63],
    [88, 25],
    [94, 55],
  ];

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className={cn("absolute inset-0 geo-grid-live", strong ? "opacity-100" : "opacity-60")} />

      <svg
        className={cn("absolute inset-0 size-full", strong ? "opacity-80" : "opacity-40")}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Topographic contour lines */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={i}
            d={`M -5 ${18 + i * 13} C 18 ${8 + i * 13}, 34 ${30 + i * 13}, 52 ${20 + i * 13} S 86 ${
              6 + i * 13
            }, 105 ${22 + i * 13}`}
            fill="none"
            stroke="var(--brand)"
            strokeOpacity={0.18 - i * 0.015}
            strokeWidth={0.28}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {/* Geodetic network links */}
        {points.slice(0, -1).map(([x, y], i) => {
          const next = points[i + 1]!;
          return (
            <line
              key={`l-${i}`}
              x1={x}
              y1={y}
              x2={next[0]}
              y2={next[1]}
              stroke="var(--brand)"
              strokeOpacity={0.16}
              strokeWidth={0.2}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      {/* LIDAR-style survey points */}
      {points.map(([x, y], i) => (
        <span
          key={`p-${i}`}
          className="absolute size-1 rounded-full bg-brand"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            animation: `geo-pulse ${2.6 + (i % 5) * 0.45}s ease-in-out ${i * 0.24}s infinite`,
          }}
        />
      ))}

      {/* Scan line */}
      <span
        className="absolute inset-x-0 h-24 animate-geo-scan"
        style={{
          background:
            "linear-gradient(to bottom, transparent, oklch(0.769 0.168 68.3 / 0.10), transparent)",
        }}
      />
    </div>
  );
}
