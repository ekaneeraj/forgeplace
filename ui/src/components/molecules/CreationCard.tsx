import Link from "next/link";
import { KindBadge, StandardBadge } from "@/components/atoms/Badge";
import { Thumb } from "@/components/atoms/Thumb";
import { routes } from "@/config/site";
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

function subText(creation: Creation) {
  switch (creation.kind) {
    case "token":
      return creation.symbol;
    case "collection":
      return `${creation.standard.toUpperCase()} collection`;
    case "item":
      return `#${creation.tokenId}`;
  }
}

interface CreationCardProps {
  creation: Creation;
}

export function CreationCard({ creation }: CreationCardProps) {
  return (
    <Link
      href={detailHref(creation)}
      className="flex w-full items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 transition-colors hover:border-zinc-600"
    >
      <Thumb
        seed={creation.id}
        name={creation.name}
        className="size-12 rounded-lg"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-100">
          {creation.name}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <KindBadge kind={creation.kind} />
          {creation.kind !== "token" && (
            <StandardBadge standard={creation.standard} />
          )}
          <span className="truncate text-xs text-muted">
            {subText(creation)}
          </span>
        </div>
      </div>
    </Link>
  );
}
