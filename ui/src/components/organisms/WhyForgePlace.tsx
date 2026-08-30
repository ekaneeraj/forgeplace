import type { ComponentType, SVGProps } from "react";
import {
  AuctionIcon,
  LayersIcon,
  ShieldIcon,
  SparklesIcon,
  SwapIcon,
  TrendingIcon,
} from "@/components/atoms/icons";

const BENEFITS: {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  {
    title: "No code required",
    description:
      "Guided forms handle everything — deploy tokens, list items or start auctions without writing a single line of code.",
    icon: SparklesIcon,
  },
  {
    title: "One platform, all actions",
    description:
      "Launch, trade, stake, swap, auction and track — everything you need in a single dashboard.",
    icon: LayersIcon,
  },
  {
    title: "All token standards",
    description:
      "ERC-20 fungible tokens, ERC-721 one-of-one NFTs and ERC-1155 multi-edition collections all supported.",
    icon: SwapIcon,
  },
  {
    title: "Live auctions",
    description:
      "Run timed or open auctions for high-value collectibles with onchain bidding and escrow.",
    icon: AuctionIcon,
  },
  {
    title: "Portfolio tracking",
    description:
      "Monitor holdings, PnL and collection performance across chains with real-time price alerts.",
    icon: TrendingIcon,
  },
  {
    title: "Non-custodial & secure",
    description:
      "Your keys, your assets. Every transaction settles onchain through audited factory contracts.",
    icon: ShieldIcon,
  },
];

export function WhyForgePlace() {
  return (
    <section className="border-t border-zinc-800 px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Why ForgePlace
        </h2>
        <p className="mt-3 max-w-lg text-muted">
          Everything you need to launch, trade and manage digital assets — no
          switching apps.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-brand/15 text-brand">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-3.5 font-semibold text-zinc-100">
                  {benefit.title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-muted">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
