import { ChainBadge, StandardBadge } from "@/components/atoms/Badge";
import { Thumb } from "@/components/atoms/Thumb";
import { shortAddress } from "@/lib/format";

interface TokenPreviewProps {
  name: string;
  symbol: string;
  decimals: string;
  supply: string;
  description: string;
  address?: string | null;
}

export function TokenPreview({
  name,
  symbol,
  decimals,
  supply,
  description,
  address = "0x0000000000000000000000000000000000000000",
}: TokenPreviewProps) {
  const displayName = name.trim() || "Token name";
  const displaySymbol = symbol.trim() || "SYM";
  const displaySupply = supply.trim() || "0";
  const seed = `${displayName}-${displaySymbol}-erc20`;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Thumb seed={seed} name={displayName} className="h-full w-full rounded-none text-3xl" />
        <div className="absolute left-3 top-3 flex gap-2">
          <StandardBadge standard="erc20" />
        </div>
        <div className="absolute right-3 top-3">
          <ChainBadge chain="ethereum" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="truncate text-lg font-semibold text-zinc-50">
            {displayName}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted">{displaySymbol}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Initial supply
            </p>
            <p className="truncate text-sm font-semibold text-zinc-100">
              {Number(displaySupply).toLocaleString("en-US")}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Decimals
            </p>
            <p className="text-sm font-semibold text-zinc-100">{decimals || "18"}</p>
          </div>
        </div>

        {description && (
          <p className="line-clamp-3 text-sm leading-6 text-muted">{description}</p>
        )}

        <div className="mt-auto flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Price / token
            </p>
            <p className="text-sm font-semibold text-zinc-100">$0.00</p>
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