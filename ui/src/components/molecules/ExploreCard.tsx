import Link from "next/link";
import {
  ChainBadge,
  ListingBadge,
  StandardBadge,
} from "@/components/atoms/Badge";
import { Thumb } from "@/components/atoms/Thumb";
import { routes } from "@/config/site";
import { itemPriceInfo } from "@/lib/format";
import type { Creation } from "@/lib/types";

function detailHref(creation: Creation) {
  switch (creation.kind) {
    case "token":
      return routes.tokenDetail(creation.id);
    case "collection":
      return routes.collectionDetail(creation.id);
    case "item":
      return routes.itemDetail(creation.id);
  }
}

function formatAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formattedPrice(creation: Creation) {
  switch (creation.kind) {
    case "item":
      return itemPriceInfo(creation);
    case "collection":
      return { label: "Floor", value: `${creation.floorPriceEth} ETH` };
    case "token":
      return { label: "Price / token", value: `$${creation.priceUsd}` };
  }
}

function metaLine(creation: Creation, collectionName?: string) {
  switch (creation.kind) {
    case "token":
      return { title: creation.symbol, sub: `${creation.initialSupply} supply` };
    case "collection":
      return {
        title: `${creation.standard.toUpperCase()} · ${creation.volumeEth} ETH volume`,
        sub: collectionName ?? "",
      };
    case "item":
      return {
        title: collectionName ?? creation.collectionId,
        sub: `#${creation.tokenId} · ${creation.category}`,
      };
  }
}

interface ExploreCardProps {
  creation: Creation;
  collectionName?: string;
}

export function ExploreCard({ creation, collectionName }: ExploreCardProps) {
  const price = formattedPrice(creation);
  const meta = metaLine(creation, collectionName);

  return (
    <Link
      href={detailHref(creation)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition-all hover:-translate-y-1 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Thumb
          seed={creation.id}
          name={creation.name}
          className="h-full w-full rounded-none text-3xl transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <StandardBadge standard={creation.standard} />
        </div>
        <div className="absolute right-3 top-3">
          <ChainBadge chain={creation.chain} />
        </div>
        {creation.kind === "item" && (
          <div className="absolute bottom-3 left-3">
            <ListingBadge
              status={creation.listingStatus}
              className="bg-background/80 backdrop-blur"
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="truncate text-sm font-semibold text-zinc-50">
            {creation.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted">
            {meta.title}
            {meta.sub ? ` · ${meta.sub}` : ""}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              {price.label}
            </p>
            <p className="text-sm font-semibold text-zinc-100">{price.value}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Creator
            </p>
            <p className="font-mono text-xs text-zinc-300">
              {formatAddress(creation.creatorAddress)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}