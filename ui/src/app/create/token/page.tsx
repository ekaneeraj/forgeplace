import type { Metadata } from "next";
import { CreateNav } from "@/components/molecules/CreateNav";
import { TokenForm } from "@/components/organisms/TokenForm";

export const metadata: Metadata = {
  title: "Launch an ERC-20 token | ForgePlace",
  description:
    "Create a fungible ERC-20 token with name, symbol, decimals and initial supply.",
};

export default function CreateTokenPage() {
  return (
    <div className="w-full">
      <CreateNav />
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
          Launch an ERC-20 token
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Fungible tokens with a fixed supply — the standard for currencies,
          points and governance.
        </p>
        <div className="mt-8">
          <TokenForm />
        </div>
      </div>
    </div>
  );
}
