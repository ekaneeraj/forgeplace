"use client";

import { useState } from "react";
import Link from "next/link";
import { ChainBadge, StandardBadge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { ArrowLeftIcon } from "@/components/atoms/icons";
import { Thumb } from "@/components/atoms/Thumb";
import { ItemCard } from "@/components/molecules/ItemCard";
import { Pagination } from "@/components/molecules/Pagination";
import { routes } from "@/config/site";
import { useWallet } from "@/context/wallet-context";
import { useCreations } from "@/hooks/use-creations";
import { formatAmount, formatDate, itemPriceValue, shortAddress } from "@/lib/format";
import type { CollectionCreation, ItemCreation } from "@/lib/types";

const PAGE_SIZE = 12;

interface CollectionDetailsProps {
  id: string;
}

function floorFromItems(items: { price: number }[]): number {
  const priced = items.filter((item) => item.price > 0);
  if (priced.length === 0) return 0;
  return Math.min(...priced.map((item) => item.price));
}

export function CollectionDetails({ id }: CollectionDetailsProps) {
  const creations = useCreations();
  const { connected, address } = useWallet();
  const [page, setPage] = useState(1);
  const collection = creations.find(
    (creation): creation is CollectionCreation =>
      creation.kind === "collection" && creation.id === id
  );

  if (!collection) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-14 text-center">
          <p className="text-sm font-medium text-zinc-100">
            Collection not found
          </p>
          <p className="mt-2 text-sm text-muted">
            This collection doesn&apos;t exist or isn&apos;t available on this
            device.
          </p>
          <Button href={routes.explore} variant="outline" className="mt-6">
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  const items = creations.filter(
    (creation): creation is ItemCreation =>
      creation.kind === "item" && creation.collectionId === collection.id
  );
  const listed = items.filter(
    (item) => item.listingStatus !== "sold"
  );
  const liveItems = items.filter(
    (item) => item.listingStatus === "buy" || item.listingStatus === "auction"
  );
  const floor =
    liveItems.length > 0
      ? floorFromItems(liveItems.map((item) => ({ price: itemPriceValue(item) })))
      : Number(collection.floorPriceEth);

  const isOwner = connected && address === collection.creatorAddress;
  const cover = collection.imageUrl;
  const profile = collection.profileImageUrl;

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const effectivePage = Math.min(page, totalPages);
  const visibleItems = items.slice(
    (effectivePage - 1) * PAGE_SIZE,
    effectivePage * PAGE_SIZE
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-12">
      <nav className="flex items-center gap-2 text-sm text-muted">
        <Link
          href={routes.explore}
          className="inline-flex items-center gap-1.5 transition-colors hover:text-zinc-100"
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </Link>
      </nav>

      {cover && (
        <div className="relative mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={`${collection.name} cover`}
            className="aspect-[3/1] w-full object-cover sm:aspect-[4/1]"
          />
        </div>
      )}

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="shrink-0">
          <div
            className={`overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 ${
              cover ? "-mt-24 size-28 lg:-mt-28 lg:size-36" : "size-28 lg:size-36"
            }`}
          >
            {profile ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile}
                alt={`${collection.name} profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              <Thumb
                seed={collection.id}
                name={collection.name}
                className="h-full w-full rounded-none text-3xl"
              />
            )}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <StandardBadge standard={collection.standard} />
            <ChainBadge chain={collection.chain} />
            {isOwner && (
              <span className="rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-[11px] font-medium text-brand">
                Owned by you
              </span>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-muted">
                {collection.symbol}
              </p>
              <h1 className="mt-1 text-balance text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
                {collection.name}
              </h1>
            </div>
            <Button href={routes.createNft()} variant="outline">
              Create NFT
            </Button>
          </div>

          {collection.description && (
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
              {collection.description}
            </p>
          )}

          <div className="mt-6 grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Items" value={formatAmount(items.length)} />
            <Stat
              label="Floor"
              value={`${floor > 0 ? floor.toFixed(2) : collection.floorPriceEth} ETH`}
            />
            <Stat label="Volume" value={`${collection.volumeEth} ETH`} />
            <Stat label="Listed" value={`${listed.length}`} />
          </div>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <dt className="text-muted">Creator</dt>
              <dd className="font-mono text-zinc-300">
                {shortAddress(collection.creatorAddress)}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-muted">Contract</dt>
              <dd className="font-mono text-zinc-300">
                {shortAddress(collection.contractAddress)}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-muted">Created</dt>
              <dd className="text-zinc-300">{formatDate(collection.createdAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="mt-14 border-t border-zinc-800/70 pt-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="flex items-baseline gap-2 text-lg font-semibold text-zinc-50">
            Items
            <span className="text-sm font-normal text-muted">
              {formatAmount(items.length)}
            </span>
          </h2>
        </div>

        {items.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {visibleItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-14 text-center">
            <p className="text-sm font-medium text-zinc-100">
              No items in this collection yet
            </p>
            <p className="mt-1 text-sm text-muted">
              Be the first to mint an NFT here.
            </p>
            <Button href={routes.createNft()} variant="outline" className="mt-5">
              Create NFT
            </Button>
          </div>
        )}

        {items.length > 0 && (
          <Pagination
            current={effectivePage}
            total={totalPages}
            onChange={setPage}
          />
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-zinc-100">
        {value}
      </p>
    </div>
  );
}