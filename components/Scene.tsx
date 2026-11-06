"use client";

import { useState } from "react";
import type { Scene as SceneT } from "@/lib/types";
import { usePhoto, type PhotoInfo } from "@/lib/photos";

/** Short credit line, e.g. "Jane Doe / Wikimedia · CC BY-SA 4.0". */
export function photoCredit(p: PhotoInfo) {
  const name = p.photographer.length > 28 ? p.photographer.slice(0, 26) + "…" : p.photographer;
  return p.source === "commons" ? `${name} / Wikimedia${p.license ? ` · ${p.license}` : ""}` : `${name} / Pexels`;
}

/**
 * A picture for a lesson. Shows a REAL photo when one is available (photoKey),
 * otherwise (or offline) the drawn emoji scene.
 */
export function Scene({ scene, label, className = "", photoKey }: { scene: SceneT; label?: string; className?: string; photoKey?: string }) {
  const photo = usePhoto(photoKey);
  const [broken, setBroken] = useState(false);

  if (photo && !broken) {
    return (
      <figure className={`relative overflow-hidden rounded-3xl shadow-lg aspect-[16/9] bg-slate-200 dark:bg-slate-800 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.alt || label || ""}
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <figcaption className="absolute top-1.5 right-2 max-w-[70%] truncate rounded-full bg-black/40 px-2 py-0.5 text-[9px] text-white/85 backdrop-blur">

          📷{" "}
          <a href={photo.pageUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
            {photoCredit(photo)}
          </a>
        </figcaption>
      </figure>
    );
  }

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
