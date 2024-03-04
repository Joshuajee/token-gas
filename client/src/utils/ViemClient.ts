"use client";
import { getChain } from "@/lib/utils";
import { createPublicClient, http, createWalletClient, custom } from "viem";
import { localhost, polygonMumbai, polygon } from "viem/chains";

export const publicClient = createPublicClient({
  chain: getChain(),
  transport: http(),
});

export const walletClient = createWalletClient({
  chain: getChain(),
  //@ts-ignore
  transport: custom(window.ethereum),
});

// JSON-RPC Account
export const [account] = await walletClient.getAddresses();
