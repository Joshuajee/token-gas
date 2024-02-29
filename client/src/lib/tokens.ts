type Tokens = {
  usdc?: string | undefined;
  dai?: string | undefined;
};
export const tokens: Tokens = {
  usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS,
  dai: process.env.NEXT_PUBLIC_DAI_ADDRESS,
};
