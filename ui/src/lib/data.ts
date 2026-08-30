import { storageKeys } from "@/config/site";
import type { ChainId } from "@/config/chains";
import {
  MOCK_ADDRESS,
  newId,
  randomAddress,
  randomTxHash,
  SEED_CREATIONS,
} from "./mock-data";
import type {
  CollectionCreation,
  CollectionInput,
  Creation,
  Erc20Input,
  ItemCreation,
  ItemInput,
  NftStandard,
  TokenCreation,
} from "./types";

const DEFAULT_CHAIN: ChainId = "ethereum";

function readStored(): Creation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKeys.creations);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Creation[]) : [];
  } catch {
    return [];
  }
}

function sortDesc(a: Creation, b: Creation) {
  return b.createdAt - a.createdAt;
}

const SORTED_SEEDS = [...SEED_CREATIONS].sort(sortDesc);

const listeners = new Set<() => void>();
let cache: Creation[] | null = null;

export function subscribeCreations(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCreationsSnapshot(): Creation[] {
  if (typeof window === "undefined") return SORTED_SEEDS;
  if (cache === null) {
    cache = mergeWithSeeds(readStored());
  }
  return cache;
}

function mergeWithSeeds(stored: Creation[]): Creation[] {
  const byId = new Map<string, Creation>();
  for (const creation of SORTED_SEEDS) byId.set(creation.id, creation);
  for (const creation of stored) byId.set(creation.id, creation);
  return [...byId.values()].sort(sortDesc);
}

export function getCreationsServerSnapshot(): Creation[] {
  return SORTED_SEEDS;
}

export function listCreations(): Creation[] {
  return getCreationsSnapshot();
}

function writeStored(creations: Creation[]) {
  window.localStorage.setItem(storageKeys.creations, JSON.stringify(creations));
  cache = mergeWithSeeds(creations);
  listeners.forEach((listener) => listener());
}

export function getCreation(id: string): Creation | undefined {
  return listCreations().find((creation) => creation.id === id);
}

export function listCollections(standard?: NftStandard): CollectionCreation[] {
  return listCreations().filter(
    (creation): creation is CollectionCreation =>
      creation.kind === "collection" &&
      (!standard || creation.standard === standard)
  );
}

export function getCollection(id: string): CollectionCreation | undefined {
  const found = getCreation(id);
  return found && found.kind === "collection" ? found : undefined;
}

export function listItems(collectionId?: string): ItemCreation[] {
  return listCreations().filter(
    (creation): creation is ItemCreation =>
      creation.kind === "item" &&
      (!collectionId || creation.collectionId === collectionId)
  );
}

function baseFields(creator: string) {
  return {
    createdAt: Date.now(),
    txHash: randomTxHash(),
    contractAddress: randomAddress(),
    creatorAddress: creator || MOCK_ADDRESS,
  };
}

export function createToken(
  input: Erc20Input,
  creator: string
): TokenCreation {
  const token = {
    kind: "token",
    standard: "erc20",
    id: newId("tok"),
    chain: input.chain ?? DEFAULT_CHAIN,
    ...baseFields(creator),
    ...input,
  } satisfies TokenCreation;

  writeStored([token]);
  return token;
}

export function createCollection(
  input: CollectionInput,
  creator: string
): CollectionCreation {
  const collection = {
    kind: "collection",
    id: newId("col"),
    volumeEth: "0.00",
    floorPriceEth: "0.00",
    chain: input.chain ?? DEFAULT_CHAIN,
    ...baseFields(creator),
    ...input,
  } satisfies CollectionCreation;

  writeStored([collection]);
  return collection;
}

export function updateItem(
  id: string,
  patch: Partial<ItemCreation>
): ItemCreation | undefined {
  const current = getCreation(id);
  if (!current || current.kind !== "item") return undefined;
  const updated: ItemCreation = { ...current, ...patch, kind: "item" };
  const stored = readStored().filter((creation) => creation.id !== id);
  writeStored([...stored, updated]);
  return updated;
}

export function createItem(input: ItemInput, creator: string): ItemCreation {
  const item = {
    kind: "item",
    id: newId("itm"),
    tokenId: Math.floor(Math.random() * 100000),
    category: input.category ?? "Collectibles",
    listingStatus: input.listingStatus ?? "mintable",
    mintEnabled: false,
    chain: input.chain ?? DEFAULT_CHAIN,
    ...baseFields(creator),
    ...input,
  } satisfies ItemCreation;

  writeStored([item]);
  return item;
}
