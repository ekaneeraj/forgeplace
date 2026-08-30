"use client";

import { useMemo } from "react";
import { CreationGrid } from "@/components/organisms/CreationGrid";
import { useCreations } from "@/hooks/use-creations";
import type { CreationKind } from "@/lib/types";

const EMPTY_COPY: Record<CreationKind, { title: string; description: string }> =
  {
    token: {
      title: "No tokens yet",
      description: "ERC-20 launches will appear here.",
    },
    item: {
      title: "No NFTs yet",
      description: "Unique items and editions will appear here.",
    },
    collection: {
      title: "No collections yet",
      description: "ERC-721 and ERC-1155 collections will appear here.",
    },
  };

export function BrowseSection({ kind }: { kind: CreationKind }) {
  const creations = useCreations();
  const filtered = useMemo(
    () => creations.filter((creation) => creation.kind === kind),
    [creations, kind]
  );
  const copy = EMPTY_COPY[kind];

  return (
    <CreationGrid
      creations={filtered}
      emptyTitle={copy.title}
      emptyDescription={copy.description}
    />
  );
}
