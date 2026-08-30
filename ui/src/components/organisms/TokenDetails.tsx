"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChainBadge, StandardBadge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
  ArrowLeftIcon,
  CoinIcon,
  LayersIcon,
  WalletIcon,
  ZapIcon,
} from "@/components/atoms/icons";
import { CandleChart } from "@/components/molecules/CandleChart";
import { SwapPanel } from "@/components/molecules/SwapPanel";
import { routes } from "@/config/site";
import { useCreations } from "@/hooks/use-creations";
import {
  formatAmount,
  formatDate,
  shortAddress,
  timeAgo,
} from "@/lib/format";
import {
  recentTransactions,
  topHolders,
} from "@/lib/token-stats";
import type { TokenCreation } from "@/lib/types";

interface TokenDetailsProps {
  id: string;
}

type TabId = "details" | "holders" | "transactions";

export function TokenDetails({ id }: TokenDetailsProps) {
  const creations = useCreations();
  const [active, setActive] = useState<TabId>("details");
  const token = creations.find(
    (creation): creation is TokenCreation =>
      creation.kind === "token" && creation.id === id
  );

  const holders = useMemo(() => (token ? topHolders(token) : []), [token]);
  const txs = useMemo(() => (token ? recentTransactions(token) : []), [token]);

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-14 text-center">
          <p className="text-sm font-medium text-zinc-100">Token not found</p>
          <p className="mt-2 text-sm text-muted">
            This token doesn&apos;t exist or isn&apos;t available on this device.
          </p>
          <Button href={routes.explore} variant="outline" className="mt-6">
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  const supply = Number(token.initialSupply);
  const marketCap = Number(token.priceUsd) * supply;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-12">
      <nav className="flex items-center text-sm text-muted">
        <Link
          href={routes.explore}
          className="inline-flex items-center gap-1.5 transition-colors hover:text-zinc-100"
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </Link>
      </nav>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-8 lg:flex-nowrap">
            <div className="flex min-w-0 items-start gap-6">
              <div className="relative size-28 shrink-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 lg:size-36">
                {token.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={token.imageUrl}
                    alt={token.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                    <CoinIcon className="size-12 text-zinc-600 lg:size-16" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wide text-muted">
                  {token.symbol}
                </p>
                <h1 className="mt-1 text-balance text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
                  {token.name}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <StandardBadge standard={token.standard} />
                  <ChainBadge chain={token.chain} />
                  <span className="rounded-full border border-zinc-800 bg-zinc-950/60 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                    ${token.priceUsd} / token
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full min-w-[15rem] max-w-md flex-1 sm:flex-none sm:w-72">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-4">
                <p className="text-[11px] uppercase tracking-wide text-muted">
                  Price
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-zinc-50">
                  ${token.priceUsd}
                </p>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Stat label="Supply" value={formatAmount(supply)} />
                <Stat
                  label="Market cap"
                  value={`$${formatMarketCap(marketCap)}`}
                />
              </div>
            </div>
          </div>

          {token.description && (
            <p className="mt-6 max-w-2xl text-sm leading-7 text-muted">
              {token.description}
            </p>
          )}

          <div className="mt-6 max-w-2xl">
            <CandleChart token={token} />
          </div>

          <div className="mt-10 max-w-2xl">
            <div className="flex gap-1 border-b border-zinc-800">
              <TabButton
                active={active === "details"}
                onClick={() => setActive("details")}
              >
                <LayersIcon className="size-3.5" />
                Details
              </TabButton>
              <TabButton
                active={active === "holders"}
                onClick={() => setActive("holders")}
              >
                <WalletIcon className="size-3.5" />
                Top holders
                <span className="ml-1.5 rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                  {holders.length}
                </span>
              </TabButton>
              <TabButton
                active={active === "transactions"}
                onClick={() => setActive("transactions")}
              >
                <ZapIcon className="size-3.5" />
                Transactions
                <span className="ml-1.5 rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                  {txs.length}
                </span>
              </TabButton>
            </div>

            <div className="py-6">
              {active === "details" && (
                <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <DetailItem label="Standard" value="ERC-20" />
                  <DetailItem label="Chain" value={token.chain} />
                  <DetailItem
                    label="Initial supply"
                    value={formatAmount(supply)}
                  />
                  <DetailItem label="Decimals" value={String(token.decimals)} />
                  <DetailItem label="Price / token" value={`$${token.priceUsd}`} />
                  <DetailItem label="Market cap" value={`$${formatMarketCap(marketCap)}`} />
                  <DetailItem label="Created" value={formatDate(token.createdAt)} />
                  <DetailItem
                    label="Creator"
                    value={shortAddress(token.creatorAddress)}
                    mono
                  />
                  <DetailItem
                    label="Contract"
                    value={shortAddress(token.contractAddress)}
                    mono
                  />
                  <DetailItem
                    label="Launch TX"
                    value={shortAddress(token.txHash)}
                    mono
                  />
                </dl>
              )}

              {active === "holders" && (
                <ol className="divide-y divide-zinc-800/70">
                  {holders.map((holder) => (
                    <li
                      key={`${holder.rank}-${holder.address}`}
                      className="flex items-center gap-3 py-2.5"
                    >
                      <span className="w-5 text-sm font-semibold text-muted">
                        {holder.rank}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono text-sm text-zinc-200">
                          {shortAddress(holder.address)}
                        </span>
                        <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-zinc-800">
                          <span
                            className="block h-full rounded-full bg-brand"
                            style={{ width: `${holder.share}%` }}
                          />
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block text-sm font-semibold text-zinc-100">
                          {formatAmount(Math.round(holder.amount))}
                        </span>
                        <span className="block text-xs text-muted">
                          {holder.share.toFixed(2)}%
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}

              {active === "transactions" && (
                <ol className="divide-y divide-zinc-800/70">
                  {txs.map((tx) => (
                    <li
                      key={tx.id}
                      className="flex items-center gap-3 py-2.5"
                    >
                      <span
                        className={`rounded-lg px-2 py-1 text-[11px] font-semibold uppercase ${
                          tx.type === "Swap"
                            ? "bg-brand/10 text-brand"
                            : tx.type === "Mint"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : tx.type === "Burn"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {tx.type}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono text-xs text-zinc-300">
                          {shortAddress(tx.address)}
                        </span>
                        <span className="block text-[11px] text-muted">
                          {timeAgo(tx.timestamp)}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block text-sm font-semibold text-zinc-100">
                          {formatAmount(Math.round(tx.amount))}
                        </span>
                        <span className="block font-mono text-[11px] text-muted">
                          {shortAddress(tx.txHash)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <SwapPanel token={token} />
        </div>
      </div>
    </div>
  );
}

function TabButton({
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
      className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "border-brand text-zinc-50"
          : "border-transparent text-muted hover:text-zinc-100"
      }`}
    >
      {children}
    </button>
  );
}

function formatMarketCap(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-zinc-100">
        {value}
      </p>
    </div>
  );
}

function DetailItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2.5">
      <dt className="text-[11px] uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd
        className={`mt-0.5 truncate text-sm font-medium text-zinc-100 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}