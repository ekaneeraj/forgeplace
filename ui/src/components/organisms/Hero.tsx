import { Button } from "@/components/atoms/Button";
import { SparklesIcon } from "@/components/atoms/icons";
import { HeroShowcase } from "@/components/molecules/HeroShowcase";
import { routes } from "@/config/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-soft to-background px-4 pb-24 pt-28 sm:pt-36">
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
            <SparklesIcon className="size-3.5 text-brand" />
            Mint · Trade · Manage — no code
          </span>
          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
            Your all-in-one platform for{" "}
            <span className="bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">
              digital assets
            </span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted">
            Launch tokens, NFTs and collections in minutes — then mint, swap,
            stake and trade in one unified ecosystem.
          </p>
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
            <Button size="lg" href={routes.create}>
              Start creating
            </Button>
            <Button variant="outline" size="lg" href="#how-it-works">
              See how it works
            </Button>
          </div>
        </div>

        <HeroShowcase />
      </div>
    </section>
  );
}
