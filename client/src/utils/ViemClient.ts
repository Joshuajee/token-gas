"use client";
import { createPublicClient, http, createWalletClient, custom } from "viem";
import { localhost, polygonMumbai, polygon } from "viem/chains";

export const publicClient = createPublicClient({
  chain: localhost,
  transport: http(),
});

export const walletClient = createWalletClient({
  chain: localhost,
  //@ts-ignore
  transport: custom(window.ethereum),
});

// JSON-RPC Account
export const [account] = await walletClient.getAddresses();
