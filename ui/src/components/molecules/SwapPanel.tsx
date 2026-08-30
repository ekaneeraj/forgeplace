"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { ArrowRightIcon, CoinIcon, SwapIcon } from "@/components/atoms/icons";
import { useProfile } from "@/context/profile-context";
import { randomTxHash } from "@/lib/mock-data";
import { delay, LAUNCH_DELAY_MS } from "@/lib/simulation";
import { txSuccess } from "@/lib/toasts";
import type { TokenCreation } from "@/lib/types";

const SLIPPAGE = 0.005;

const NO_SPINNERS =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

export function SwapPanel({ token }: { token: TokenCreation }) {
  const { addOwnedToken } = useProfile();
  const [mode, setMode] = useState<"sell" | "buy">("sell");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const rate = Number(token.priceUsd);

  const paySymbol = mode === "sell" ? token.symbol : "USDC";
  const receiveSymbol = mode === "sell" ? "USDC" : token.symbol;

  const input = Number(amount || "0");
  const output =
    mode === "sell"
      ? input * rate * (1 - SLIPPAGE)
      : (input / rate) * (1 - SLIPPAGE);

  const worth = mode === "sell" ? input * rate : input;

  const actionLabel =
    mode === "sell"
      ? `Sell ${token.symbol}`
      : `Buy ${token.symbol}`;

  async function execute() {
    setBusy(true);
    await delay(LAUNCH_DELAY_MS);
    setBusy(false);
    addOwnedToken(token.id);
    txSuccess(
      actionLabel,
      randomTxHash(),
      `${actionLabel} — ${amount} ${paySymbol} swapped for ${receiveSymbol}, simulated on ${token.chain}.`
    );
  }

  const isValid = input > 0 && output > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/70 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-zinc-50">
          <SwapIcon className="size-4 text-brand" />
          Swap
        </p>
        <div className="flex gap-1 rounded-xl border border-zinc-800 bg-zinc-950/70 p-1">
          <DirectionButton
            active={mode === "sell"}
            onClick={() => setMode("sell")}
          >
            <ArrowRightIcon className="size-3.5 rotate-180" />
            Sell
          </DirectionButton>
          <DirectionButton
            active={mode === "buy"}
            onClick={() => setMode("buy")}
          >
            Buy
            <ArrowRightIcon className="size-3.5" />
          </DirectionButton>
        </div>
      </div>

      <div className="p-4">
        <SwapTokenField
          label="You pay"
          amount={amount}
          onAmountChange={setAmount}
          symbol={paySymbol}
          worth={`≈ $${(worth || 0).toFixed(2)}`}
          editable
        />

        <div className="relative z-10 -my-3 flex justify-center">
          <button
            type="button"
            onClick={() => setMode((m) => (m === "sell" ? "buy" : "sell"))}
            className="flex size-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 shadow-lg shadow-black/40 transition-all hover:rotate-180 hover:border-brand hover:text-brand"
            aria-label="Swap direction"
          >
            <SwapIcon className="size-4" />
          </button>
        </div>

        <SwapTokenField
          label="You receive"
          amount={isValid ? output.toFixed(4) : ""}
          symbol={receiveSymbol}
          worth={isValid ? `≈ $${(output * (mode === "sell" ? rate : 1)).toFixed(2)}` : "≈ $0.00"}
        />

        <div className="mt-3 flex items-center justify-between text-xs text-muted">
          <span>Slippage tolerance</span>
          <span className="font-mono text-zinc-300">
            {(SLIPPAGE * 100).toFixed(1)}%
          </span>
        </div>

        <Button
          className="mt-3 w-full"
          size="lg"
          loading={busy}
          disabled={!isValid}
          onClick={execute}
        >
          {isValid ? actionLabel : `Enter ${mode === "sell" ? paySymbol : receiveSymbol} amount`}
        </Button>
        <p className="mt-2 text-center text-[11px] text-muted">
          Simulated on {token.chain} — no real funds are moved.
        </p>
      </div>
    </div>
  );
}

function DirectionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "bg-brand text-white"
          : "text-zinc-400 hover:text-zinc-100"
      }`}
    >
      {children}
    </button>
  );
}

function SwapTokenField({
  label,
  amount,
  onAmountChange,
  symbol,
  worth,
  editable = false,
}: {
  label: string;
  amount: string;
  onAmountChange?: (value: string) => void;
  symbol: string;
  worth: string;
  editable?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3.5 transition-colors ${
        editable ? "focus-within:border-brand/60" : "cursor-not-allowed"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide text-muted">
          {label}
        </span>
        <span className="text-xs text-muted">{worth}</span>
      </div>

      <div className="mt-1.5 flex items-center gap-3">
        <input
          type="number"
          min={0}
          step="any"
          value={amount}
          readOnly={!editable}
          onChange={(e) => onAmountChange?.(e.target.value)}
          placeholder="0.0"
          className={`w-full min-w-0 bg-transparent text-2xl font-semibold text-zinc-100 outline-none placeholder:text-zinc-600 ${NO_SPINNERS} ${
            editable ? "" : "cursor-not-allowed"
          }`}
        />
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 py-1.5 pl-2 pr-3 text-sm font-semibold text-zinc-100">
          <CoinIcon className="size-4 text-zinc-400" />
          {symbol}
        </span>
      </div>
    </div>
  );
}