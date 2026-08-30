"use client";

import { useEffect, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import {
  CoinIcon,
  ImageIcon,
  LayersIcon,
} from "@/components/atoms/icons";

type ShowcaseIcon = ComponentType<SVGProps<SVGSVGElement>>;

const SHOWCASE_ITEMS: {
  id: string;
  badge: string;
  title: string;
  desc: string;
  icon: ShowcaseIcon;
  gradient: string;
}[] = [
  {
    id: "token",
    badge: "ERC-20",
    title: "Launch a fungible token",
    desc: "Set the name, symbol and supply — deployed through your own factory.",
    icon: CoinIcon,
    gradient:
      "from-violet-500/40 via-fuchsia-500/20 to-sky-500/30",
  },
  {
    id: "nft",
    badge: "ERC-721",
    title: "Mint one-of-one NFTs",
    desc: "Create a collection and mint unique items with onchain traits.",
    icon: ImageIcon,
    gradient:
      "from-emerald-500/30 via-teal-500/20 to-cyan-500/30",
  },
  {
    id: "editions",
    badge: "ERC-1155",
    title: "Drop multi-editions",
    desc: "Launch semi-fungible editions with per-id supply in a single contract.",
    icon: LayersIcon,
    gradient:
      "from-amber-500/30 via-orange-500/20 to-rose-500/30",
  },
];

const ROTATE_INTERVAL_MS = 4000;

export function HeroShowcase() {
  const [active, setActive] = useState(0);
  const item = SHOWCASE_ITEMS[active];
  const Icon = item.icon;

  useEffect(() => {
    const timer = setInterval(
      () => setActive((i) => (i + 1) % SHOWCASE_ITEMS.length),
      ROTATE_INTERVAL_MS
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="relative">
        <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-brand/20 blur-2xl" />
        <div
          key={item.id}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur"
        >
          <div
            className={`relative flex aspect-[4/3] items-center justify-center rounded-t-2xl bg-gradient-to-br ${item.gradient}`}
          >
            <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-xs font-medium text-zinc-200">
              {item.badge}
            </span>
            <span className="absolute right-3 top-3 rounded-full border border-white/10 bg-white/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/80">
              Create
            </span>
            <div className="flex size-24 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur">
              <Icon className="size-10 text-white/90" />
            </div>
          </div>
          <div className="p-5">
            <p className="font-medium text-zinc-100">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{item.desc}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-2" role="tablist">
        {SHOWCASE_ITEMS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Show ${s.badge}`}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all ${
              i === active ? "w-6 bg-brand" : "w-2 bg-zinc-700 hover:bg-zinc-500"
            }`}
          />
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-zinc-500">
        Everything launches from your own connected wallet.
      </p>
    </div>
  );
}
