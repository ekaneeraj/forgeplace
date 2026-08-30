"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/atoms/icons";
import { Button } from "@/components/atoms/Button";
import { CreationCard } from "@/components/molecules/CreationCard";
import { ConnectPrompt } from "@/components/molecules/ConnectPrompt";
import { routes } from "@/config/site";
import { useWallet } from "@/context/wallet-context";
import { useCreations } from "@/hooks/use-creations";

const MAX_ITEMS = 8;

export function RecentLaunches() {
  const { connected } = useWallet();
  const creations = useCreations();

  return (
    <section className="border-t border-zinc-800 px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Your creations
            </h2>
            <p className="mt-3 max-w-lg text-muted">
              Tokens, collections and NFTs you&apos;ve launched — newest
              first.
            </p>
          </div>
          {connected && (
            <Link
              href={routes.explore}
              className="hidden shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-brand transition-colors hover:text-violet-400 sm:inline-flex"
            >
              View all
              <ArrowRightIcon className="size-4" />
            </Link>
          )}
        </div>

        {!connected ? (
          <div className="mt-10 max-w-xl">
            <ConnectPrompt
              title="Connect to see your assets"
              description="Link your wallet to view tokens, NFTs and collections you've launched on ForgePlace."
            />
          </div>
        ) : creations.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 px-6 py-12 text-center">
            <h3 className="font-semibold text-zinc-100">No assets yet</h3>
            <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted">
              Deploy your first token, NFT or collection and it will appear here
              instantly.
            </p>
            <Button size="sm" href={routes.create} className="mt-4">
              Launch your first asset
            </Button>
          </div>
        ) : (
          <div className="mt-10 flex gap-3 overflow-x-auto pb-2">
            {creations.slice(0, MAX_ITEMS).map((creation) => (
              <div key={creation.id} className="w-[300px] shrink-0">
                <CreationCard creation={creation} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
