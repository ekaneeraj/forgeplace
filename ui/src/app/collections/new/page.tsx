import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/atoms/Spinner";
import { CreateNav } from "@/components/molecules/CreateNav";
import { CollectionForm } from "@/components/organisms/CollectionForm";

export const metadata: Metadata = {
  title: "New collection | ForgePlace",
  description:
    "Create an ERC-721 or ERC-1155 collection to group and mint your items.",
};

function FormFallback() {
  return (
    <div className="flex h-[420px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50">
      <Spinner className="size-6 text-zinc-500" />
    </div>
  );
}

export default function NewCollectionPage() {
  return (
    <div className="w-full">
      <CreateNav />
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
          New collection
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Collections group your items — deploy once, then mint into it.
        </p>
        <div className="mt-8">
          <Suspense fallback={<FormFallback />}>
            <CollectionForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
