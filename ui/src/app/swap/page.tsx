import type { Metadata } from "next";
import { SwapPage } from "@/components/organisms/SwapPage";

export const metadata: Metadata = {
  title: "Swap | ForgePlace",
  description: "Search and swap ERC-20 tokens on ForgePlace.",
};

export default function SwapRoute() {
  return <SwapPage />;
}