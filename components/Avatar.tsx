"use client";

/** Round profile picture with an online (green) / offline (grey) dot. */
export function Avatar({ name, photo, online, size = 36 }: { name?: string; photo?: string; online?: boolean; size?: number }) {
  const initials = (name || "?")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={name ?? ""} className="h-full w-full rounded-full object-cover ring-2 ring-white shadow-md" />
      ) : (
        <span
          className="grid h-full w-full place-items-center rounded-full bg-linear-to-br from-sky-400 to-fuchsia-500 text-white font-black ring-2 ring-white shadow-md"
          style={{ fontSize: size * 0.38 }}
        >
          {initials}
        </span>
      )}
      {online !== undefined && (
        <span
          title={online ? "Online" : "Offline"}
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-white ${online ? "bg-emerald-500" : "bg-slate-400"}`}
          style={{ width: size * 0.3, height: size * 0.3 }}
        />
      )}
    </span>
  );
}
