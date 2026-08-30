import type { StandardInfo } from "./standards";

export type StandardId = StandardInfo["id"];

const DEFAULT_FEES_ETH: Record<StandardId, string> = {
  erc20: "0.05",
  erc721: "0.08",
  erc1155: "0.06",
};

const ENV_FEES: Record<StandardId, string | undefined> = {
  erc20: process.env.NEXT_PUBLIC_LAUNCH_FEE_ERC20,
  erc721: process.env.NEXT_PUBLIC_LAUNCH_FEE_ERC721,
  erc1155: process.env.NEXT_PUBLIC_LAUNCH_FEE_ERC1155,
};

export function launchFeeEth(standard: StandardId): string {
  return ENV_FEES[standard] ?? DEFAULT_FEES_ETH[standard];
}
