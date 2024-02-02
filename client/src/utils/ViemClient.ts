"use client";
import { createPublicClient, http, createWalletClient, custom } from "viem";
import { localhost, polygonMumbai, polygon } from "viem/chains";

export const publicClient = createPublicClient({
  chain: polygonMumbai,
  transport: http(),
});

export const walletClient = createWalletClient({
  chain: polygonMumbai,
  //@ts-ignore
  transport: custom(window.ethereum),
});
