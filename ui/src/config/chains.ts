export const CHAINS = [
  { id: "ethereum", label: "Ethereum", short: "ETH" },
  { id: "base", label: "Base", short: "BASE" },
  { id: "polygon", label: "Polygon", short: "POL" },
  { id: "arbitrum", label: "Arbitrum", short: "ARB" },
  { id: "optimism", label: "Optimism", short: "OP" },
] as const;

export type ChainId = (typeof CHAINS)[number]["id"];

export function getChain(id: string) {
  return CHAINS.find((chain) => chain.id === id);
}