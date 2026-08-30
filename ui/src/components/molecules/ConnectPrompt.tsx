"use client";

import { Button } from "@/components/atoms/Button";
import { WalletIcon } from "@/components/atoms/icons";
import { useWallet } from "@/context/wallet-context";

interface ConnectPromptProps {
  title?: string;
  description?: string;
}

export function ConnectPrompt({
  title = "Connect your wallet",
  description = "ForgePlace shows what your connected wallet created through its factory.",
}: ConnectPromptProps) {
  const { connect } = useWallet();

  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-brand/15 text-brand">
        <WalletIcon className="size-6" />
      </span>
      <h3 className="mt-4 font-semibold text-zinc-100">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted">
        {description}
      </p>
      <Button onClick={connect} size="md" className="mt-5">
        Connect Wallet
      </Button>
    </div>
  );
}
