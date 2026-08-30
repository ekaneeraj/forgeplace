import type { ChainId } from "@/config/chains";

export type NftStandard = "erc721" | "erc1155";

export type CreationKind = "token" | "collection" | "item";

export type ListingStatus = "mintable" | "buy" | "auction" | "sold" | "new";

export interface Trait {
  traitType: string;
  value: string;
}

interface BaseCreation {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt: number;
  txHash: string;
  contractAddress: string;
  creatorAddress: string;
  chain: ChainId;
}

export interface TokenCreation extends BaseCreation {
  kind: "token";
  standard: "erc20";
  symbol: string;
  decimals: number;
  initialSupply: string;
  priceUsd: string;
}

export interface CollectionCreation extends BaseCreation {
  kind: "collection";
  standard: NftStandard;
  symbol: string;
  volumeEth: string;
  floorPriceEth: string;
  profileImageUrl?: string;
}

export interface ItemCreation extends BaseCreation {
  kind: "item";
  standard: NftStandard;
  collectionId: string;
  tokenId: number;
  traits: Trait[];
  supply: number;
  mintPriceEth: string;
  category: string;
  listingStatus: ListingStatus;
  mintEnabled?: boolean;
  buyPriceEth?: string;
  auctionBaseEth?: string;
  highestBidEth?: string;
  highestBidder?: string;
  lastSoldEth?: string;
}

export type Creation = TokenCreation | CollectionCreation | ItemCreation;

export interface Erc20Input {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string;
  priceUsd: string;
  description?: string;
  chain?: ChainId;
}

export interface CollectionInput {
  standard: NftStandard;
  name: string;
  symbol: string;
  description?: string;
  imageUrl?: string;
  profileImageUrl?: string;
  chain?: ChainId;
}

export interface ItemInput {
  standard: NftStandard;
  collectionId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  traits: Trait[];
  supply: number;
  mintPriceEth: string;
  chain?: ChainId;
  category?: string;
  listingStatus?: ListingStatus;
  buyPriceEth?: string;
  auctionBaseEth?: string;
  highestBidEth?: string;
  lastSoldEth?: string;
}
