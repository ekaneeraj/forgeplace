import { ChainBadge, StandardBadge } from "@/components/atoms/Badge";
import { Thumb } from "@/components/atoms/Thumb";
import { shortAddress } from "@/lib/format";
import type { NftStandard } from "@/lib/types";

interface CollectionPreviewProps {
  standard: NftStandard;
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  profileImageUrl: string;
  address?: string | null;
}

export function CollectionPreview({
  standard,
  name,
  symbol,
  description,
  imageUrl,
  profileImageUrl,
  address = "0x0000000000000000000000000000000000000000",
}: CollectionPreviewProps) {
  const displayName = name.trim() || "Collection name";
  const displaySymbol = symbol.trim() || "SYM";
  const seed = `${displayName}-${displaySymbol}-${standard}`;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
      <div className="relative aspect-[4/3] overflow-hidden">
        {imageUrl.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl.trim()}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <Thumb seed={seed} name={displayName} className="h-full w-full rounded-none text-3xl" />
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <StandardBadge standard={standard} />
        </div>
        <div className="absolute right-3 top-3">
          <ChainBadge chain="ethereum" />
        </div>
        {profileImageUrl.trim() && (
          <div className="absolute -bottom-5 left-4 size-16 overflow-hidden rounded-2xl border-4 border-zinc-900 bg-zinc-800 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profileImageUrl.trim()}
              alt={`${displayName} profile`}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>

      <div className={`flex flex-1 flex-col gap-3 p-4 ${profileImageUrl.trim() ? "pt-7" : ""}`}>
        <div>
          <p className="truncate text-lg font-semibold text-zinc-50">
            {displayName}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted">{displaySymbol}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-muted">Floor</p>
            <p className="text-sm font-semibold text-zinc-100">0.00 ETH</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-muted">Volume</p>
            <p className="text-sm font-semibold text-zinc-100">0.00 ETH</p>
          </div>
        </div>

        {description && (
          <p className="line-clamp-3 text-sm leading-6 text-muted">{description}</p>
        )}

        <div className="mt-auto flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Items</p>
            <p className="text-sm font-semibold text-zinc-100">
              {standard === "erc721" ? "1-of-1" : "Editions"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Creator
            </p>
            <p className="font-mono text-xs text-zinc-300">
              {shortAddress(address ?? "0x0000000000000000000000000000000000000000")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}