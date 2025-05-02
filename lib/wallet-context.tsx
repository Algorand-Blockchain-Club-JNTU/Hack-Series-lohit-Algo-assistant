"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define wallet info type
export interface WalletInfo {
  connected: boolean
  address?: string
  algo_balance?: number
  network?: string
  assets?: Array<{
    id: number
    name: string
    amount: number
    decimals: number
  }>
}

// Define context type
interface WalletContextType {
  walletInfo: WalletInfo | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isConnecting: boolean
  error: string | null
}

// Create context with default values
const WalletContext = createContext<WalletContextType>({
  walletInfo: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isConnecting: false,
  error: null,
})

// Provider component
export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for existing wallet connection on mount
  useEffect(() => {
    const savedWalletInfo = localStorage.getItem("algorand-wallet-info")
    if (savedWalletInfo) {
      try {
        setWalletInfo(JSON.parse(savedWalletInfo))
      } catch (err) {
        console.error("Failed to parse saved wallet info:", err)
        localStorage.removeItem("algorand-wallet-info")
      }
    }
  }, [])

  // Connect wallet function
  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // In a real implementation, this would connect to MyAlgo, AlgoSigner, WalletConnect, etc.
      // For now, we'll simulate a successful connection with mock data

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockWalletInfo: WalletInfo = {
        connected: true,
        address: "ALGO" + Math.random().toString(36).substring(2, 15).toUpperCase(),
        algo_balance: (Math.floor(Math.random() * 10000 * 1000000) / 1000000) * 1000000, // Random balance in microAlgos
        network: Math.random() > 0.5 ? "MainNet" : "TestNet",
        assets: [
          {
            id: 1,
            name: "Algo",
            amount: (Math.floor(Math.random() * 10000 * 1000000) / 1000000) * 1000000,
            decimals: 6,
          },
          {
            id: 123456,
            name: "TestToken",
            amount: Math.floor(Math.random() * 10000),
            decimals: 0,
          },
          {
            id: 789012,
            name: "AlgoNFT",
            amount: 1,
            decimals: 0,
          },
          {
            id: 345678,
            name: "USDC",
            amount: Math.floor(Math.random() * 5000 * 1000000),
            decimals: 6,
          },
        ],
      }

      setWalletInfo(mockWalletInfo)
      localStorage.setItem("algorand-wallet-info", JSON.stringify(mockWalletInfo))
    } catch (err) {
      console.error("Failed to connect wallet:", err)
      setError("Failed to connect wallet. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet function
  const disconnectWallet = () => {
    setWalletInfo(null)
    localStorage.removeItem("algorand-wallet-info")
  }

  return (
    <WalletContext.Provider
      value={{
        walletInfo,
        connectWallet,
        disconnectWallet,
        isConnecting,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

// Custom hook for using the wallet context
export function useWallet() {
  return useContext(WalletContext)
}
