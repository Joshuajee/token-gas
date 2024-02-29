type Paymaster = {
  usdc?: string | undefined;
  dai?: string | undefined;
};
export const paymaster: Paymaster = {
  usdc: process.env.NEXT_PUBLIC_USDC_PAYMASTER,
  dai: process.env.NEXT_PUBLIC_DAI_PAYMASTER,
};
