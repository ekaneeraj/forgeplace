"use client";

import { Button } from "@/components/atoms/Button";
import { useWallet } from "@/context/wallet-context";
import { shortAddress } from "@/lib/format";

export function ConnectWalletButton() {
  const { address, connected, connect, disconnect } = useWallet();

  if (!connected) {
    return (
      <Button onClick={connect} size="md">
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-800 bg-white/5 px-3 text-sm text-zinc-200">
        <span className="size-1.5 rounded-full bg-emerald-400" />
        {shortAddress(address ?? "")}
      </span>
      <Button variant="ghost" size="sm" onClick={disconnect}>
        Disconnect
      </Button>
    </div>
  );
}
