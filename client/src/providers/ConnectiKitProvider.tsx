
"use client"
import { WagmiProvider, createConfig, http } from "wagmi";
import { bscTestnet, localhost } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { fallback } from "viem";

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [localhost, bscTestnet],
    transports: {
      // RPC URL for each chain
      [bscTestnet.id]: fallback([
        http(
          `https://bsc-testnet.public.blastapi.io`,
        ),
      ]),
      [localhost.id]: fallback([
        http(
          `http://127.0.0.1:8545`,
        )
      ])
    },

    // Required API Keys
    walletConnectProjectId: `${process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}`,

    // Required App Info
    appName: "Your App Name",

    // Optional App Info
    appDescription: "Your App Description",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};