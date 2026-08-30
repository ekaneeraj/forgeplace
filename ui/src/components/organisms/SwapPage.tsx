"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CoinIcon,
  SearchIcon,
  SwapIcon,
} from "@/components/atoms/icons";
import { SwapPanel } from "@/components/molecules/SwapPanel";
import { getChain } from "@/config/chains";
import { routes } from "@/config/site";
import { useCreations } from "@/hooks/use-creations";
import type { TokenCreation } from "@/lib/types";

const PAGE_SIZE = 8;

export function SwapPage() {
  const creations = useCreations();
  const tokens = useMemo(
    () => creations.filter((c): c is TokenCreation => c.kind === "token"),
    [creations]
  );

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const selected = tokens.find((t) => t.id === selectedId) ?? tokens[0] ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.symbol.toLowerCase().includes(q) ||
        t.chain.toLowerCase().includes(q)
    );
  }, [tokens, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const effectivePage = Math.min(page, totalPages);
  const pageTokens = filtered.slice(
    (effectivePage - 1) * PAGE_SIZE,
    effectivePage * PAGE_SIZE
  );

  if (tokens.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-14 text-center">
          <SwapIcon className="size-8 text-brand" />
          <p className="mt-4 text-sm font-medium text-zinc-100">
            No tokens yet
          </p>
          <p className="mt-2 text-sm text-muted">
            Launch an ERC-20 token and it will appear here for swapping.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-12">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white">
          <SwapIcon className="size-4.5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            Swap
          </h1>
          <p className="text-sm text-muted">
            Search any token and swap it for USDC instantly.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <div className="min-w-0">
          <label className="relative block">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, symbol or chain"
              className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 pl-10 pr-4 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-brand/60"
            />
          </label>

          <ul className="mt-4 divide-y divide-zinc-800/70 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/50">
            {pageTokens.map((token) => {
              const active = selected?.id === token.id;
              const chain = getChain(token.chain);
              return (
                <li key={token.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(token.id)}
                    aria-current={active ? "true" : undefined}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                      active ? "bg-brand/10" : "hover:bg-zinc-900/70"
                    }`}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-800 to-zinc-900">
                      <CoinIcon className="size-5 text-zinc-400" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-zinc-100">
                        {token.name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted">
                        {token.symbol} · {chain?.label ?? token.chain}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-sm font-semibold text-zinc-100">
                        ${token.priceUsd}
                      </span>
                      <span className="block text-xs text-muted">/ token</span>
                    </span>
                  </button>
                </li>
              );
            })}
            {pageTokens.length === 0 && (
              <li className="flex flex-col items-center px-6 py-12 text-center">
                <p className="text-sm font-medium text-zinc-100">
                  No tokens found
                </p>
                <p className="mt-1 text-xs text-muted">
                  Try a different name, symbol or chain.
                </p>
              </li>
            )}
          </ul>

          {filtered.length > 0 && (
            <nav
              aria-label="Pagination"
              className="mt-4 flex flex-wrap items-center justify-between gap-3"
            >
              <p className="text-xs text-muted">
                {filtered.length} token{filtered.length === 1 ? "" : "s"} ·
                Page {effectivePage} of {totalPages}
              </p>

              <div className="flex items-center gap-1">
                <PageButton
                  aria-label="Previous page"
                  disabled={effectivePage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ArrowLeftIcon className="size-4" />
                </PageButton>

                {pageItems(totalPages, effectivePage).map((item, i) =>
                  item === "…" ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-1.5 text-sm text-muted"
                    >
                      …
                    </span>
                  ) : (
                    <PageButton
                      key={item}
                      active={item === effectivePage}
                      onClick={() => setPage(item)}
                    >
                      {item}
                    </PageButton>
                  )
                )}

                <PageButton
                  aria-label="Next page"
                  disabled={effectivePage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ArrowRightIcon className="size-4" />
                </PageButton>
              </div>
            </nav>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-800 to-zinc-900">
                  <CoinIcon className="size-5 text-zinc-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-100">
                    {selected.name}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {selected.symbol} ·{" "}
                    {getChain(selected.chain)?.label ?? selected.chain}
                  </p>
                </div>
                <Link
                  href={routes.tokenDetail(selected.id)}
                  className="shrink-0 text-xs font-medium text-brand transition-colors hover:text-brand/80"
                >
                  View details
                </Link>
              </div>

              <SwapPanel token={selected} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function pageItems(total: number, current: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("…");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("…");
  items.push(total);
  return items;
}

function PageButton({
  active = false,
  disabled = false,
  onClick,
  children,
  "aria-label": ariaLabel,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={`flex size-8 items-center justify-center rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-brand text-white"
          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
      }`}
    >
      {children}
    </button>
  );
}