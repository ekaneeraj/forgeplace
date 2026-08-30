"use client";

import { Button } from "@/components/atoms/Button";
import { CreationCard } from "@/components/molecules/CreationCard";
import type { Creation } from "@/lib/types";

interface CreationGridProps {
  creations: Creation[];
  emptyTitle: string;
  emptyDescription?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function CreationGrid({
  creations,
  emptyTitle,
  emptyDescription,
  ctaLabel,
  ctaHref,
}: CreationGridProps) {
  if (creations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center">
        <p className="text-sm font-medium text-zinc-300">{emptyTitle}</p>
        {emptyDescription && (
          <p className="mt-1 text-sm text-muted">{emptyDescription}</p>
        )}
        {ctaLabel && ctaHref && (
          <Button variant="outline" size="sm" href={ctaHref} className="mt-4">
            {ctaLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {creations.map((creation) => (
        <CreationCard key={creation.id} creation={creation} />
      ))}
    </div>
  );
}
