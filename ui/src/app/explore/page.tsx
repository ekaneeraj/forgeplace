import type { Metadata } from "next";
import { SparklesIcon } from "@/components/atoms/icons";
import { ExploreSection } from "@/components/organisms/ExploreSection";

export const metadata: Metadata = {
  title: "Explore | ForgePlace",
  description:
    "Discover tokens, collections and NFTs launched through ForgePlace.",
};

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-brand-soft via-background to-background px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand/20 blur-3xl" />
        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
          <SparklesIcon className="size-3.5 text-brand" />
          ForgePlace Marketplace
        </span>
        <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Explore the{" "}
          <span className="bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">
            Forge
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted">
          Browse every token, collection and NFT launched through ForgePlace —
          search, filter and discover your next asset.
        </p>
      </div>

      <div className="mt-8">
        <ExploreSection />
      </div>
    </div>
  );
}
