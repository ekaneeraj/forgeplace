import type { Metadata } from "next";
import { TokenDetails } from "@/components/organisms/TokenDetails";
import { getCreation } from "@/lib/data";

interface TokenPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TokenPageProps): Promise<Metadata> {
  const { id } = await params;
  const creation = getCreation(id);
  if (creation?.kind !== "token") {
    return { title: "Token not found | ForgePlace" };
  }
  return {
    title: `${creation.name} | ForgePlace`,
    description:
      creation.description ??
      `${creation.symbol} — an ERC-20 token on ForgePlace.`,
  };
}

export default async function TokenPage({ params }: TokenPageProps) {
  const { id } = await params;
  return <TokenDetails id={id} />;
}