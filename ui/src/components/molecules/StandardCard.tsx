import type { ComponentType, SVGProps } from "react";
import {
  CheckIcon,
  RocketIcon,
  CoinIcon,
  ShieldIcon,
  SwapIcon,
  AuctionIcon,
  TrendingIcon,
} from "@/components/atoms/icons";
import type { FeatureInfo } from "@/config/standards";

const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  launchpad: RocketIcon,
  trade: CoinIcon,
  stake: ShieldIcon,
  swap: SwapIcon,
  auction: AuctionIcon,
  track: TrendingIcon,
};

export function FeatureCard({ feature }: { feature: FeatureInfo }) {
  const Icon = ICONS[feature.id] ?? RocketIcon;

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-700">
      <div className="flex items-center justify-between">
        <span className="flex size-11 items-center justify-center rounded-xl bg-brand/15 text-brand">
          <Icon className="size-5" />
        </span>
        <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-300">
          {feature.label}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-zinc-100">
        {feature.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted">
        {feature.description}
      </p>

      <ul className="mt-4 space-y-2">
        {feature.points.map((point) => (
          <li
            key={point}
            className="flex items-center gap-2 text-sm text-zinc-300"
          >
            <CheckIcon className="size-4 shrink-0 text-emerald-400" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
