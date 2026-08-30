"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Field, Input, Select } from "@/components/atoms/FormControls";
import { CheckIcon, CoinIcon, LayersIcon } from "@/components/atoms/icons";
import { ExploreCard } from "@/components/molecules/ExploreCard";
import { FilterGroup } from "@/components/molecules/FilterGroup";
import { Pagination } from "@/components/molecules/Pagination";
import { CHAINS } from "@/config/chains";
import { useCreations } from "@/hooks/use-creations";
import { itemPriceValue } from "@/lib/format";
import type {
  CollectionCreation,
  Creation,
  CreationKind,
} from "@/lib/types";

type TabId = CreationKind;
type SortId = "newest" | "price-low" | "price-high" | "name";

interface TabOption {
  id: TabId;
  label: string;
  icon: typeof LayersIcon;
}

const TABS: TabOption[] = [
  { id: "item", label: "NFTs", icon: LayersIcon },
  { id: "collection", label: "Collections", icon: LayersIcon },
  { id: "token", label: "Tokens", icon: CoinIcon },
];

const SORTS: Record<TabId, { id: SortId; label: string }[]> = {
  item: [
    { id: "newest", label: "Newest" },
    { id: "price-low", label: "Price: Low to High" },
    { id: "price-high", label: "Price: High to Low" },
    { id: "name", label: "Name A–Z" },
  ],
  collection: [
    { id: "newest", label: "Newest" },
    { id: "price-low", label: "Floor: Low to High" },
    { id: "price-high", label: "Floor: High to Low" },
    { id: "name", label: "Name A–Z" },
  ],
  token: [
    { id: "price-low", label: "Price: Low to High" },
    { id: "price-high", label: "Price: High to Low" },
    { id: "name", label: "Name A–Z" },
    { id: "newest", label: "Newest" },
  ],
};

const STATUS_OPTIONS = [
  { id: "all", label: "All statuses" },
  { id: "buy", label: "Buy now", helper: "Fixed price for sale" },
  { id: "auction", label: "In auction", helper: "Open for bids" },
  { id: "mintable", label: "Mint available", helper: "Open to mint" },
  { id: "new", label: "New", helper: "Recently launched" },
  { id: "sold", label: "Sold", helper: "Already purchased" },
];

const EDITION_OPTIONS = [
  { id: "all", label: "All editions" },
  { id: "erc721", label: "Single edition", helper: "ERC-721" },
  { id: "erc1155", label: "Multi-edition", helper: "ERC-1155" },
];

const PAGE_SIZE = 9;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function priceValue(creation: Creation) {
  switch (creation.kind) {
    case "item":
      return itemPriceValue(creation);
    case "token":
      return Number(creation.priceUsd);
    case "collection":
      return Number(creation.floorPriceEth);
  }
}

function compareCreations(a: Creation, b: Creation, sortId: SortId) {
  switch (sortId) {
    case "name":
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    case "price-low":
      return priceValue(a) - priceValue(b);
    case "price-high":
      return priceValue(b) - priceValue(a);
    default:
      return b.createdAt - a.createdAt;
  }
}

interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
}

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted"
      >
        {label}
      </label>
      <Select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

export function ExploreSection() {
  const creations = useCreations();
  const [tab, setTab] = useState<TabId>("item");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [edition, setEdition] = useState<string>("all");
  const [collectionId, setCollectionId] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [chain, setChain] = useState<string>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortId, setSortId] = useState<SortId>("newest");
  const [page, setPage] = useState(1);
  const [sortOpen, setSortOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef({ page, tab });

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = { page, tab };
    if (prev.page === page && prev.tab === tab) return;

    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    const sectionTop = sectionRef.current?.getBoundingClientRect().top ?? 64;
    window.scrollTo({
      top: Math.max(0, window.scrollY + sectionTop - 64),
      behavior: "smooth",
    });
  }, [page, tab]);

  const counts = useMemo(() => {
    const count: Record<TabId, number> = { token: 0, collection: 0, item: 0 };
    creations.forEach((creation) => {
      count[creation.kind] += 1;
    });
    return count;
  }, [creations]);

  const collections = useMemo(
    () =>
      creations
        .filter(
          (creation): creation is CollectionCreation =>
            creation.kind === "collection"
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [creations]
  );

  const collectionNames = useMemo(() => {
    const map: Record<string, string> = {};
    creations.forEach((creation) => {
      if (creation.kind === "collection") map[creation.id] = creation.name;
    });
    return map;
  }, [creations]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    creations.forEach((creation) => {
      if (creation.kind === "item") set.add(creation.category);
    });
    return [...set].sort();
  }, [creations]);

  const filtered = useMemo(() => {
    const needle = normalize(query);
    return creations
      .filter((creation) => {
        if (creation.kind !== tab) return false;
        if (chain !== "all" && creation.chain !== chain) return false;

        if (needle) {
          const inName = normalize(creation.name).includes(needle);
          if (creation.kind === "item") {
            if (!inName) return false;
          } else if (!inName && !normalize(creation.symbol).includes(needle)) {
            return false;
          }
        }

        const minP = minPrice === "" ? -Infinity : Number(minPrice);
        const maxP = maxPrice === "" ? Infinity : Number(maxPrice);

        if (creation.kind === "item") {
          if (status !== "all" && creation.listingStatus !== status)
            return false;
          if (edition === "erc721") return creation.standard === "erc721";
          if (edition === "erc1155") return creation.standard === "erc1155";
          if (
            collectionId !== "all" &&
            creation.collectionId !== collectionId
          )
            return false;
          if (category !== "all" && creation.category !== category)
            return false;
          const value = itemPriceValue(creation);
          if (value < minP || value > maxP) return false;
        }

        if (creation.kind === "token") {
          const value = Number(creation.priceUsd);
          if (value < minP || value > maxP) return false;
        }

        if (creation.kind === "collection") {
          if (edition === "erc721") return creation.standard === "erc721";
          if (edition === "erc1155") return creation.standard === "erc1155";
        }

        return true;
      })
      .sort((a, b) => compareCreations(a, b, sortId));
  }, [creations, tab, query, status, edition, collectionId, category, chain, minPrice, maxPrice, sortId]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const sortOptions = SORTS[tab];
  const hasActiveFilters =
    query !== "" ||
    status !== "all" ||
    edition !== "all" ||
    collectionId !== "all" ||
    category !== "all" ||
    chain !== "all" ||
    minPrice !== "" ||
    maxPrice !== "";

  function selectTab(nextTab: TabId) {
    setTab(nextTab);
    setStatus("all");
    setEdition("all");
    setCollectionId("all");
    setCategory("all");
    setChain("all");
    setMinPrice("");
    setMaxPrice("");
    setSortId(SORTS[nextTab][0].id);
    setPage(1);
  }

  function resetFilters() {
    setQuery("");
    setStatus("all");
    setEdition("all");
    setCollectionId("all");
    setCategory("all");
    setChain("all");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  }

  const chainOptions = [
    { id: "all", label: "All chains" },
    ...CHAINS.map((chainInfo) => ({
      id: chainInfo.id,
      label: chainInfo.label,
    })),
  ];

  const collectionOptions = [
    { id: "all", label: "All collections" },
    ...collections.map((collection) => ({
      id: collection.id,
      label: collection.name,
    })),
  ];

  const categoryOptions = [
    { id: "all", label: "All categories" },
    ...categories.map((name) => ({ id: name, label: name })),
  ];

  return (
    <div ref={sectionRef}>
      <div className="flex flex-wrap items-center justify-between gap-4 lg:sticky lg:top-16 lg:z-30 lg:-mx-4 lg:border-b lg:border-zinc-800/70 lg:bg-background/95 lg:px-4 lg:py-3 lg:backdrop-blur">
        <div className="inline-flex rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
          {TABS.map((option) => {
            const Icon = option.icon;
            const active = tab === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => selectTab(option.id)}
                aria-pressed={active}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors sm:px-4 ${
                  active
                    ? "bg-brand text-white shadow-sm shadow-brand/30"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{option.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-zinc-400"
                  }`}
                >
                  {counts[option.id]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen((open) => !open)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
            aria-expanded={sortOpen}
          >
            {sortOptions.find((s) => s.id === sortId)?.label}
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full z-10 mt-2 w-52 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/40">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setSortId(option.id);
                    setSortOpen(false);
                    setPage(1);
                  }}
                  className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-white/5 ${
                    sortId === option.id ? "text-brand" : "text-zinc-300"
                  }`}
                >
                  {option.label}
                  {sortId === option.id && (
                    <span className="size-1.5 rounded-full bg-brand" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-6">
        <aside className="w-full shrink-0 lg:sticky lg:top-32 lg:w-64 lg:self-start">
          <div className="flex flex-col gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div>
            <label
              htmlFor="explore-search"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted"
            >
              Search
            </label>
            <input
              id="explore-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder={
                tab === "item"
                  ? "Search by name…"
                  : "Search by name or symbol…"
              }
              aria-label="Search"
              className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand focus:outline-none"
            />
          </div>

          {tab === "item" && (
            <FilterGroup
              label="Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            />
          )}

          {(tab === "item" || tab === "collection") && (
            <FilterGroup
              label="Edition"
              options={EDITION_OPTIONS}
              value={edition}
              onChange={(value) => {
                setEdition(value);
                setPage(1);
              }}
            />
          )}

          {tab === "item" && (
            <FilterSelect
              id="explore-collection"
              label="Collection"
              value={collectionId}
              options={collectionOptions}
              onChange={(value) => {
                setCollectionId(value);
                setPage(1);
              }}
            />
          )}

          <FilterSelect
            id="explore-chain"
            label="Chain"
            value={chain}
            options={chainOptions}
            onChange={(value) => {
              setChain(value);
              setPage(1);
            }}
          />

          {tab === "item" && (
            <FilterSelect
              id="explore-category"
              label="Category"
              value={category}
              options={categoryOptions}
              onChange={(value) => {
                setCategory(value);
                setPage(1);
              }}
            />
          )}

          {(tab === "item" || tab === "token") && (
            <Field label={tab === "token" ? "Price (USD)" : "Price (ETH)"}>
              <div className="flex items-center gap-2">
                <Input
                  id="explore-min-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={minPrice}
                  onChange={(event) => {
                    setMinPrice(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Min"
                  aria-label="Minimum price"
                />
                <span className="text-zinc-500">–</span>
                <Input
                  id="explore-max-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={maxPrice}
                  onChange={(event) => {
                    setMaxPrice(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Max"
                  aria-label="Maximum price"
                />
              </div>
            </Field>
          )}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-400"
              onClick={resetFilters}
            >
              <CheckIcon className="size-3.5" />
              Reset filters
            </Button>
          )}
        </div>
      </aside>

      <div
          ref={listRef}
          className="min-w-0 flex-1 lg:max-h-[calc(100dvh-11rem)] lg:overflow-y-auto lg:overflow-x-hidden lg:pr-1"
        >
        <p className="text-xs text-muted">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </p>

        <div className="mt-4">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-800 px-6 py-16 text-center">
              <p className="font-medium text-zinc-300">No results found</p>
              <p className="mt-1.5 max-w-sm text-sm text-muted">
                Try adjusting your search, filters or tab selection.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={resetFilters}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((creation) => (
                <ExploreCard
                  key={creation.id}
                  creation={creation}
                  collectionName={
                    creation.kind === "item"
                      ? collectionNames[creation.collectionId]
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>

        {visible.length > 0 && (
          <Pagination
            current={safePage}
            total={totalPages}
            onChange={setPage}
          />
        )}
      </div>
      </div>
    </div>
  );
}