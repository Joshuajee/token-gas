import { Web3Provider } from "@/providers/ConnectiKitProvider";
import { ThemeProvider } from "@/providers/ShadcnProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ReactQueryClientProvider } from '@/providers/ReackQueryProvider'
import { Inter } from "next/font/google";


const inter = Inter({ subsets: ["latin"] });

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
