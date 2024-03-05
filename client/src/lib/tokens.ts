type Tokens = {
  usdc?: string | undefined;
  dai?: string | undefined;
  busd?: string | undefined;
};
export const tokens: Tokens = {
  usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS,
  dai: process.env.NEXT_PUBLIC_DAI_ADDRESS,
  busd: "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee",
};
