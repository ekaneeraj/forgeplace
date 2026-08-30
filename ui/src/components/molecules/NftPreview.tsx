import { ChainBadge, ListingBadge, StandardBadge } from "@/components/atoms/Badge";
import { Thumb } from "@/components/atoms/Thumb";
import { shortAddress } from "@/lib/format";
import type { NftStandard, Trait } from "@/lib/types";

interface NftPreviewProps {
  standard: NftStandard;
  name: string;
  collectionName: string;
  description: string;
  imageUrl: string;
  mintPrice: string;
  supply: string;
  traits: Trait[];
  address?: string | null;
}

export function NftPreview({
  standard,
  name,
  collectionName,
  description,
  imageUrl,
  mintPrice,
  supply,
  traits,
  address = "0x0000000000000000000000000000000000000000",
}: NftPreviewProps) {
  const displayName = name.trim() || (standard === "erc721" ? "Item #0001" : "Item name");
  const displayCollection = collectionName.trim() || "Collection";
  const displaySupply = standard === "erc721" ? "1" : supply.trim() || "0";
  const seed = `${displayName}-${displayCollection}-${standard}`;

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
        <div className="absolute bottom-3 left-3">
          <ListingBadge status="mintable" className="bg-background/80 backdrop-blur" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="truncate text-lg font-semibold text-zinc-50">
            {displayName}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted">{displayCollection}</p>
        </div>

        {traits.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {traits.map((trait) => (
              <span
                key={`${trait.traitType}-${trait.value}`}
                className="inline-flex rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-1 text-[11px] text-zinc-300"
              >
                <span className="text-zinc-500">{trait.traitType}: </span>
                {trait.value}
              </span>
            ))}
          </div>
        )}

        {description && (
          <p className="line-clamp-3 text-sm leading-6 text-muted">{description}</p>
        )}

        <div className="mt-auto flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              {standard === "erc1155" ? "Edition size" : "Mint price"}
            </p>
            <p className="text-sm font-semibold text-zinc-100">
              {standard === "erc1155"
                ? Number(displaySupply).toLocaleString("en-US")
                : `${mintPrice || "0"} ETH`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-muted">
              {standard === "erc1155" ? "Mint price" : "Creator"}
            </p>
            <p
              className={
                standard === "erc1155"
                  ? "text-sm font-semibold text-zinc-100"
                  : "font-mono text-xs text-zinc-300"
              }
            >
              {standard === "erc1155"
                ? `${mintPrice || "0"} ETH`
                : shortAddress(address ?? "0x0000000000000000000000000000000000000000")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}