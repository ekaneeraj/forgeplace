"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Nft3DViewerProps {
  src: string;
  alt: string;
}

export function Nft3DViewer({ src, alt }: Nft3DViewerProps) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const spin = useRef(0);
  const tilt = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);
  const [auto, setAuto] = useState(true);

  const apply = useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.transform = `rotateX(${tilt.current.x}deg) rotateY(${
      spin.current + tilt.current.y
    }deg)`;
  }, []);

  useEffect(() => {
    apply();
    if (!auto) return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      spin.current = (spin.current + dt * 0.03) % 360;
      apply();
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [auto, apply]);

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    tilt.current.x = -((py - 0.5) * 26);
    tilt.current.y = (px - 0.5) * 26;
    apply();
  }

  function handleLeave() {
    tilt.current = { x: 0, y: 0 };
    apply();
  }

  return (
    <div
      className="relative h-full w-full cursor-grab active:cursor-grabbing [perspective:1200px]"
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      role="img"
      aria-label={`${alt} — 3D viewer`}
    >
      <div
        ref={innerRef}
        className="relative h-full w-full will-change-transform [transform-style:preserve-3d]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="h-full w-full object-cover"
          style={{ transform: "translateZ(0)" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/40" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
      </div>

      <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
        3D
      </span>

      <button
        type="button"
        onClick={() => setAuto((a) => !a)}
        className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1 text-[11px] font-medium text-zinc-200 backdrop-blur transition-colors hover:bg-black/70 hover:text-white"
      >
        <span
          className={`size-1.5 rounded-full ${
            auto ? "bg-emerald-400" : "bg-zinc-500"
          }`}
        />
        {auto ? "Auto-rotating" : "Auto-rotate"}
      </button>
    </div>
  );
}