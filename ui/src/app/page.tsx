import { AboutStandards } from "@/components/organisms/AboutStandards";
import { Hero } from "@/components/organisms/Hero";
import { HowItWorks } from "@/components/organisms/HowItWorks";
import { RecentLaunches } from "@/components/organisms/RecentLaunches";
import { WhyForgePlace } from "@/components/organisms/WhyForgePlace";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutStandards />
      <HowItWorks />
      <WhyForgePlace />
      <RecentLaunches />
    </>
  );
}
