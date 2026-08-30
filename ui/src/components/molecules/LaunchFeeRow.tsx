import env from "@/config/env";
import type { StandardInfo } from "@/config/standards";

const FEES: Record<StandardInfo["id"], string> = {
  erc20: env.LAUNCH_FEE_ERC20,
  erc721: env.LAUNCH_FEE_ERC721,
  erc1155: env.LAUNCH_FEE_ERC1155,
};

interface LaunchFeeRowProps {
  standard: StandardInfo["id"];
}

export function LaunchFeeRow({ standard }: LaunchFeeRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-white/[0.03] px-3.5 py-3 text-sm">
      <span className="text-muted">Platform launch fee</span>
      <span className="font-medium text-zinc-100">
        {FEES[standard]} ETH
      </span>
    </div>
  );
}
