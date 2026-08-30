export interface StandardInfo {
  id: "erc20" | "erc721" | "erc1155";
  label: string;
  blurb: string;
  title: string;
  description: string;
  points: string[];
}

export interface FeatureInfo {
  id: string;
  label: string;
  title: string;
  description: string;
  points: string[];
}

export const TOKEN_STANDARDS: StandardInfo[] = [
  {
    id: "erc20",
    label: "ERC-20",
    blurb: "Fungible tokens",
    title: "Fungible tokens",
    description:
      "Classic crypto assets where every unit is interchangeable — ideal for currencies, rewards and community points.",
    points: ["Custom name & symbol", "Adjustable decimals", "Fixed initial supply"],
  },
  {
    id: "erc721",
    label: "ERC-721",
    blurb: "One-of-one NFTs",
    title: "One-of-one NFTs",
    description:
      "Unique, indivisible collectibles where every token id exists exactly once — art, memberships and game items.",
    points: ["Unique token ids", "Onchain traits", "Per-collection supply"],
  },
  {
    id: "erc1155",
    label: "ERC-1155",
    blurb: "Multi-editions",
    title: "Multi-edition drops",
    description:
      "Semi-fungible tokens bundling many editions into a single contract — built for game assets and limited runs.",
    points: ["Edition supply per id", "Batch minting friendly", "Single contract cost"],
  },
];

export const PLATFORM_FEATURES: FeatureInfo[] = [
  {
    id: "launchpad",
    label: "Launch",
    title: "Token & NFT Launchpad",
    description:
      "Deploy ERC-20 tokens, ERC-721 collectibles and ERC-1155 editions in minutes — no smart contract skills needed.",
    points: ["No-code token creation", "Custom branding & metadata", "Instant deployment"],
  },
  {
    id: "trade",
    label: "Trade",
    title: "Buy & Sell",
    description:
      "List assets on a decentralized marketplace with real-time pricing, offers and instant settlement.",
    points: ["Fixed-price & bulk listings", "Offer & counter-offer system", "Zero hidden fees"],
  },
  {
    id: "stake",
    label: "Stake",
    title: "Staking & Rewards",
    description:
      "Lock tokens to earn yield, secure the network and unlock exclusive platform perks.",
    points: ["Flexible lock periods", "Auto-compounding rewards", "Real-time dashboard"],
  },
  {
    id: "swap",
    label: "Swap",
    title: "Token Swaps",
    description:
      "Exchange any token pair instantly through integrated liquidity pools with best-rate routing.",
    points: ["Aggregated liquidity", "Slippage protection", "Multi-hop routing"],
  },
  {
    id: "auction",
    label: "Auction",
    title: "Live Auctions",
    description:
      "Run timed or open auctions for high-value collectibles with onchain bidding and escrow.",
    points: ["Timed & open formats", "Reserve price support", "Onchain bid history"],
  },
  {
    id: "track",
    label: "Track",
    title: "Portfolio Tracking",
    description:
      "Monitor holdings, PnL and collection performance across chains in one unified dashboard.",
    points: ["Multi-chain overview", "Profit & loss tracking", "Price alerts & watchlists"],
  },
];

export function getStandard(id: string) {
  return TOKEN_STANDARDS.find((standard) => standard.id === id);
}

export function getFeature(id: string) {
  return PLATFORM_FEATURES.find((feature) => feature.id === id);
}
