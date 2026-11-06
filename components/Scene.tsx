import type { Scene as SceneT } from "@/lib/types";

/** An illustrated picture scene made of layered emoji over a sky + ground. */
export function Scene({ scene, label, className = "" }: { scene: SceneT; label?: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={label ?? "Picture scene"}
      className={`relative overflow-hidden rounded-3xl shadow-lg aspect-[16/9] select-none ${className}`}
      style={{ background: `linear-gradient(180deg, ${scene.sky[0]}, ${scene.sky[1]})` }}
    >
      <div
        className="absolute inset-x-0 bottom-0 h-[34%]"
        style={{
          background: `linear-gradient(180deg, ${scene.ground}, color-mix(in srgb, ${scene.ground} 70%, black))`,
          borderTopLeftRadius: "50% 18%",
          borderTopRightRadius: "50% 18%",
        }}
      />
      {scene.items.map((it, i) => (
        <span
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 drop-shadow-md animate-float"
          style={{
            left: `${it.x}%`,
            top: `${it.y}%`,
            fontSize: `clamp(1rem, ${(it.s ?? 3) * 1.6}vw, ${(it.s ?? 3) * 0.95}rem)`,
            animationDelay: `${(i * 0.7) % 3}s`,
          }}
        >
          {it.e}
        </span>
      ))}
    </div>
  );
}
