export const siteConfig = {
  name: "ForgePlace",
  description:
    "Your all-in-one platform for digital assets. Launch, trade, stake, swap, auction and track — all from a single dashboard.",
  title: "Your all-in-one platform for digital assets",
} as const;

export interface NavLink {
  label: string;
  href?: string;
  requiresWallet?: boolean;
}

export const navLinks: NavLink[] = [
  { href: "/explore", label: "Explore" },
  { href: "/swap", label: "Swap" },
  { href: "/create", label: "Launchpad" },
  { href: "/profile", label: "Profile", requiresWallet: true },
];

export const storageKeys = {
  wallet: "forgeplace.wallet.v1",
  creations: "forgeplace.creations.v1",
  profile: "forgeplace.profile.v1",
} as const;

export const routes = {
  home: "/",
  create: "/create",
  explore: "/explore",
  swap: "/swap",
  collections: "/collections",
  tokens: "/tokens",
  nfts: "/nfts",
  profile: "/profile",
  createToken: "/create/token",
  createNft: (type?: "erc721" | "erc1155") =>
    type ? `/create/nft?type=${type}` : "/create/nft",
  newCollection: (type: "erc721" | "erc1155", returnTo?: string) => {
    const params = new URLSearchParams({ type });
    if (returnTo) params.set("return", returnTo);
    return `/collections/new?${params.toString()}`;
  },
  tokenDetail: (id: string) => `/token/${id}`,
  collectionDetail: (id: string) => `/collection/${id}`,
  itemDetail: (id: string) => `/item/${id}`,
};
