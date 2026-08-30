import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { Badge } from "@/components/atoms/Badge";
import {
  ArrowRightIcon,
  CoinIcon,
  ImageIcon,
  LayersIcon,
} from "@/components/atoms/icons";
import { routes } from "@/config/site";

export const metadata: Metadata = {
  title: "Create | ForgePlace",
};

interface CreateOption {
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  badges: ("erc20" | "erc721" | "erc1155")[];
  note?: string;
}

const OPTIONS: CreateOption[] = [
  {
    href: routes.createToken,
    icon: CoinIcon,
    title: "Token",
    description:
      "Fungible ERC-20 for currencies, points and governance — pick name, symbol and supply.",
    badges: ["erc20"],
  },
  {
    href: routes.newCollection("erc721"),
    icon: LayersIcon,
    title: "Collection",
    description:
      "Its own contract on-chain. Groups your ERC-721 or ERC-1155 items under one roof.",
    badges: ["erc721", "erc1155"],
  },
  {
    href: routes.createNft(),
    icon: ImageIcon,
    title: "NFT",
    description:
      "Mint one-of-one items or limited editions into one of your collections.",
    badges: ["erc721", "erc1155"],
    note: "Needs a collection first",
  },
];

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
      <div className="text-center">
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          What do you want to create?
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Pick an entity, fill a short form and launch — manage everything
          afterwards from your profile.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {OPTIONS.map((option) => {
          const Icon = option.icon;

          return (
            <Link
              key={option.title}
              href={option.href}
              className="group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-brand/60"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-brand/15 text-brand">
                <Icon className="size-6" />
              </span>
              <h2 className="mt-4 text-xl font-semibold text-zinc-100">
                {option.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                {option.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {option.badges.map((badge) => (
                  <Badge key={badge} variant={badge}>
                    {badge.replace("erc", "ERC-")}
                  </Badge>
                ))}
              </div>
              {option.note && (
                <p className="mt-3 text-xs text-zinc-500">{option.note}</p>
              )}
              <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-brand">
                Get started
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
