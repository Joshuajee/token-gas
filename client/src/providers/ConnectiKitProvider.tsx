
"use client"
import { WagmiProvider, createConfig, http } from "wagmi";
import { bscTestnet, localhost } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { fallback } from "viem";
import { useEffect, useState } from "react";

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [localhost],
    transports: {

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



export const Web3Provider = ({ children }: { children: React.ReactNode }) => {

  const [cli, setCli] = useState<QueryClient>(new QueryClient())

  useEffect(() => {
    setCli(new QueryClient)

  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={cli}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );

};