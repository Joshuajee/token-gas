"use client"
//import { Web3Provider } from "@/providers/ConnectiKitProvider";
import { ThemeProvider } from "@/providers/ShadcnProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ReactQueryClientProvider } from '@/providers/ReackQueryProvider'

import dynamic from 'next/dynamic'
 
const Web3Provider = dynamic(() =>
  import('./../providers/ConnectiKitProvider').then((mod) => mod.Web3Provider),
  { ssr: false  }
)


export default function App({ Component, pageProps }: AppProps) {
  return (
    <ReactQueryClientProvider>
      <Web3Provider>
        <ThemeProvider
          // forcedTheme="dark"
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Component {...pageProps} />
        </ThemeProvider>
      </Web3Provider>
    </ReactQueryClientProvider>
  )
}
