import { Address } from "viem";

export const EXECUTOR_PRIVATE_KEY = String(process.env.PRIVATE_KEY) as Address

export const GAS_PRICE = (process.env.NEXT_PUBLIC_GAS_PRICE || 10000000000n) as BigInt