import type { Metadata } from "next";
import { ItemDetails } from "@/components/organisms/ItemDetails";
import { getCreation } from "@/lib/data";

interface ItemPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ItemPageProps): Promise<Metadata> {
  const { id } = await params;
  const creation = getCreation(id);
  if (creation?.kind !== "item") {
    return { title: "Item not found | ForgePlace" };
  }
  return {
    title: `${creation.name} | ForgePlace`,
    description: creation.description ?? `A ${creation.standard.toUpperCase()} collectible on ForgePlace.`,
  };
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;
  return <ItemDetails id={id} />;
}