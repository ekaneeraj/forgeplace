import type { ReactNode } from "react";
import { getChain } from "@/config/chains";
import type { ChainId } from "@/config/chains";
import type { ListingStatus, NftStandard } from "@/lib/types";

type Variant = "neutral" | "erc20" | NftStandard;

const VARIANTS: Record<Variant, string> = {
  neutral: "border-zinc-700 bg-white/5 text-zinc-300",
  erc20: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  erc721: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  erc1155: "border-amber-500/30 bg-amber-500/10 text-amber-300",
};

const CHAIN_VARIANTS: Record<ChainId, string> = {
  ethereum: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  base: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  polygon: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  arbitrum: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
  optimism: "border-red-500/30 bg-red-500/10 text-red-300",
};

const LISTING_VARIANTS: Record<ListingStatus, string> = {
  mintable: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  buy: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  auction: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  sold: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  new: "border-amber-500/30 bg-amber-500/10 text-amber-300",
};

const LISTING_LABELS: Record<ListingStatus, string> = {
  mintable: "Mint",
  buy: "Buy now",
  auction: "In auction",
  sold: "Sold",
  new: "New",
};

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
}

export function Badge({ variant = "neutral", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  );
}

export function StandardBadge({ standard }: { standard: Variant }) {
  const label = standard === "neutral" ? "N/A" : standard.replace("erc", "ERC-");
  return <Badge variant={standard}>{label}</Badge>;
}

export function ChainBadge({ chain }: { chain: ChainId }) {
  const info = getChain(chain);
  if (!info) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${CHAIN_VARIANTS[chain]}`}
    >
      {info.label}
    </span>
  );
}

export function ListingBadge({
  status,
  className = "",
}: {
  status: ListingStatus;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${LISTING_VARIANTS[status]} ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {LISTING_LABELS[status]}
    </span>
  );
}

const KIND_LABELS = {
  token: "Token",
  collection: "Collection",
  item: "NFT",
} as const;

export function KindBadge({ kind }: { kind: keyof typeof KIND_LABELS }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
      {KIND_LABELS[kind]}
    </span>
  );
}
