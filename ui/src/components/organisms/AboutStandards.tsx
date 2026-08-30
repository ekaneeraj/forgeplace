import { PLATFORM_FEATURES } from "@/config/standards";
import { FeatureCard } from "@/components/molecules/StandardCard";

export function AboutStandards() {
  return (
    <section id="about" className="border-t border-zinc-800 px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          One platform, every tool
        </h2>
        <p className="mt-3 max-w-lg text-muted">
          Launch, trade, stake, swap, auction and track — all from a single
          dashboard. No switching apps.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
