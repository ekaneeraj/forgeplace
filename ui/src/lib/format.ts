import type { ItemCreation } from "./types";

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function timeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function formatAmount(value: string | number) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return String(value);
  return amount.toLocaleString("en-US");
}

export interface ItemPriceInfo {
  label: string;
  value: string;
}

export function itemPriceInfo(item: ItemCreation): ItemPriceInfo {
  switch (item.listingStatus) {
    case "mintable":
      return { label: "Mint price", value: `${item.mintPriceEth} ETH` };
    case "buy":
      return {
        label: "Buy now",
        value: `${item.buyPriceEth ?? item.mintPriceEth} ETH`,
      };
    case "auction": {
      const hasBid = Boolean(item.highestBidEth && Number(item.highestBidEth) > 0);
      return {
        label: hasBid ? "Highest bid" : "Base price",
        value: `${
          hasBid ? item.highestBidEth : item.auctionBaseEth ?? item.mintPriceEth
        } ETH`,
      };
    }
    case "sold":
      return {
        label: "Last sold",
        value: `${item.lastSoldEth ?? item.mintPriceEth} ETH`,
      };
    case "new":
      return item.lastSoldEth
        ? { label: "Last sold", value: `${item.lastSoldEth} ETH` }
        : { label: "Mint price", value: `${item.mintPriceEth} ETH` };
  }
}

export function itemPriceValue(item: ItemCreation) {
  switch (item.listingStatus) {
    case "mintable":
      return Number(item.mintPriceEth);
    case "buy":
      return Number(item.buyPriceEth ?? item.mintPriceEth);
    case "auction": {
      const bid = Number(item.highestBidEth ?? 0);
      return bid > 0
        ? bid
        : Number(item.auctionBaseEth ?? item.mintPriceEth);
    }
    case "sold":
      return Number(item.lastSoldEth ?? item.mintPriceEth);
    case "new":
      return item.lastSoldEth
        ? Number(item.lastSoldEth)
        : Number(item.mintPriceEth);
  }
}
