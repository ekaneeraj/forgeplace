const env = {
  LAUNCH_FEE_ERC20: process.env.NEXT_PUBLIC_LAUNCH_FEE_ERC20 ?? "0.05",
  LAUNCH_FEE_ERC721: process.env.NEXT_PUBLIC_LAUNCH_FEE_ERC721 ?? "0.08",
  LAUNCH_FEE_ERC1155: process.env.NEXT_PUBLIC_LAUNCH_FEE_ERC1155 ?? "0.06",
};

export default env;
