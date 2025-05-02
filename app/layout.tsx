import type React from "react"
import { WalletProvider } from "@/lib/wallet-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>AlgoAssist - Algorand Development Assistant</title>
        <meta name="description" content="AI-powered assistant for Algorand blockchain development" />
      </head>
      <body className="bg-[#010A14] text-[#E6F1FF]">
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
          <WalletProvider>
            {children}
            <Toaster />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
