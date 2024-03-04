type Tokens = {
  usdc?: string | undefined;
  dai?: string | undefined;
  busd?: string | undefined;
};
export const tokens: Tokens = {
  usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS,
  dai: process.env.NEXT_PUBLIC_DAI_ADDRESS,
  busd: "0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee",
};
