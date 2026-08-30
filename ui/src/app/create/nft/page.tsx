import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/atoms/Spinner";
import { CreateNav } from "@/components/molecules/CreateNav";
import { NftForm } from "@/components/organisms/NftForm";

export const metadata: Metadata = {
  title: "Create NFT | ForgePlace",
  description:
    "Mint a unique ERC-721 item or an ERC-1155 edition into one of your collections.",
};

function FormFallback() {
  return (
    <div className="flex h-[520px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50">
      <Spinner className="size-6 text-zinc-500" />
    </div>
  );
}

export default function CreateNftPage() {
  return (
    <div className="w-full">
      <CreateNav />
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
          Create an NFT
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Pick the standard that fits — one-of-one items or limited editions.
        </p>
        <div className="mt-8">
          <Suspense fallback={<FormFallback />}>
            <NftForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
