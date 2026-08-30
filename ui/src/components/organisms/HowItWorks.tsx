import type { ComponentType, SVGProps } from "react";
import {
  RocketIcon,
  SparklesIcon,
  WalletIcon,
} from "@/components/atoms/icons";

const STEPS: {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  {
    title: "Connect your wallet",
    description:
      "Link any EVM wallet to ForgePlace. Your assets, your keys, your platform.",
    icon: WalletIcon,
  },
  {
    title: "Explore the marketplace",
    description:
      "Browse live auctions, trending tokens, staking pools and collection drops — all in one feed.",
    icon: SparklesIcon,
  },
  {
    title: "Launch, trade or stake",
    description:
      "Deploy new tokens, swap assets, place bids or lock for yield — every action settles onchain instantly.",
    icon: RocketIcon,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-zinc-800 bg-zinc-900/30 px-4 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          How it works
        </h2>
        <p className="mt-3 max-w-lg text-muted">
          From wallet connection to first trade in three simple steps.
        </p>

        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;

            return (
              <li
                key={step.title}
                className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-background p-6"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 -top-5 select-none text-7xl font-bold text-zinc-800/60"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand/15 text-brand">
                  <Icon className="size-5" />
                </span>
                <h3 className="relative mt-4 font-semibold text-zinc-100">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
