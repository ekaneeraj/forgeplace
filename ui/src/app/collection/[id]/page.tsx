import type { Metadata } from "next";
import { CollectionDetails } from "@/components/organisms/CollectionDetails";
import { getCreation } from "@/lib/data";

interface CollectionPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { id } = await params;
  const creation = getCreation(id);
  if (creation?.kind !== "collection") {
    return { title: "Collection not found | ForgePlace" };
  }
  return {
    title: `${creation.name} | ForgePlace`,
    description: creation.description ?? `A ${creation.standard.toUpperCase()} collection on ForgePlace.`,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { id } = await params;
  return <CollectionDetails id={id} />;
}