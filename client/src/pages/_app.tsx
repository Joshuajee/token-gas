import { Web3Provider } from "@/providers/ConnectiKitProvider";
import { ThemeProvider } from "@/providers/ShadcnProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider>
      <ThemeProvider
        // forcedTheme="dark"
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Component {...pageProps} />
      </ThemeProvider>
    </Web3Provider>
  )
}
