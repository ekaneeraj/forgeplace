import Link from "next/link";
import { ListingBadge, StandardBadge } from "@/components/atoms/Badge";
import { Thumb } from "@/components/atoms/Thumb";
import { routes } from "@/config/site";
import { itemPriceInfo } from "@/lib/format";
import type { ItemCreation } from "@/lib/types";

interface ItemCardProps {
  item: ItemCreation;
}

export function ItemCard({ item }: ItemCardProps) {
  const price = itemPriceInfo(item);

  return (
    <Link
      href={routes.itemDetail(item.id)}
      className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition-all hover:-translate-y-0.5 hover:border-zinc-600"
    >
      <div className="relative aspect-square overflow-hidden">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <Thumb
            seed={`${item.name}-${item.id}`}
            name={item.name}
            className="h-full w-full rounded-none text-2xl"
          />
        )}
        <div className="absolute left-2 top-2">
          <StandardBadge standard={item.standard} />
        </div>
        <div className="absolute bottom-2 left-2">
          <ListingBadge
            status={item.listingStatus}
            className="bg-background/80 backdrop-blur"
          />
        </div>
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-zinc-100">
          {item.name}
        </p>
        <p className="mt-1 truncate text-xs text-muted">
          {price.label} · {price.value}
        </p>
      </div>
    </Link>
  );
}