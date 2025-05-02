"use client"

import WalletConnection from "@/components/wallet-connection"

interface AlgorandResourcesProps {
  query: string
  isVisible: boolean
  onToggleVisibility: () => void
}

// Update the AlgorandResources component to only include the WalletConnection component
export default function AlgorandResources({ query, isVisible, onToggleVisibility }: AlgorandResourcesProps) {
  return <WalletConnection />
}
