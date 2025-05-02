"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, ExternalLink, LogOut, AlertTriangle, Loader2, ChevronDown } from "lucide-react"
import { useWallet } from "@/lib/wallet-context"
import { CopyButton } from "@/components/ui/copy-button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function WalletConnection() {
  const { walletInfo, connectWallet, disconnectWallet, isConnecting, error } = useWallet()
  const [showDetails, setShowDetails] = useState(false)

  // Format Algo balance with commas and 2 decimal places
  const formatAlgoBalance = (microAlgos?: number) => {
    if (!microAlgos && microAlgos !== 0) return "0.00"
    const algos = microAlgos / 1000000
    return algos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Format asset amount based on decimals
  const formatAssetAmount = (amount: number, decimals: number) => {
    if (decimals === 0) return amount.toLocaleString()
    const divisor = Math.pow(10, decimals)
    const formattedAmount = (amount / divisor).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    })
    return formattedAmount
  }

  // Get wallet icon based on address
  const getWalletIcon = (address?: string) => {
    if (!address) return "W"
    return address.substring(0, 2)
  }

  // Get explorer URL based on network
  const getExplorerUrl = (address?: string) => {
    if (!address) return "#"
    const network = walletInfo?.network?.toLowerCase() || "mainnet"
    if (network === "testnet") {
      return `https://testnet.algoexplorer.io/address/${address}`
    }
    return `https://algoexplorer.io/address/${address}`
  }

  if (!walletInfo?.connected) {
    return (
      <div className="pb-4">
        <Button
          variant="outline"
          className="w-full border-[rgba(0,201,201,0.3)] bg-[rgba(0,201,201,0.05)] text-[#E6F1FF] hover:bg-[rgba(0,201,201,0.1)] flex items-center justify-center"
          onClick={connectWallet}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>
        {error && (
          <div className="mt-2 text-sm text-red-400 flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="pb-4 bg-[rgba(0,201,201,0.05)] rounded-md p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback className="bg-[rgba(0,201,201,0.2)] text-[#00C9C9]">
              {getWalletIcon(walletInfo.address)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <p className="text-sm font-medium text-[#E6F1FF] truncate mr-1">
                {walletInfo.address?.substring(0, 6)}...
                {walletInfo.address?.substring(walletInfo.address.length - 4)}
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="ml-1 bg-[rgba(0,201,201,0.1)] text-[#00C9C9] border-[rgba(0,201,201,0.3)] text-xs"
                    >
                      {walletInfo.network || "MainNet"}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Network</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-[#8892B0]">{formatAlgoBalance(walletInfo.algo_balance)} ALGO</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[#8892B0] hover:text-[#E6F1FF] hover:bg-[rgba(0,201,201,0.1)]"
                  onClick={() => window.open(getExplorerUrl(walletInfo.address), "_blank")}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View in Explorer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-[#8892B0] hover:text-[#E6F1FF] hover:bg-[rgba(0,201,201,0.1)]"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0A1A2F] border-[rgba(0,201,201,0.2)] text-[#E6F1FF]">
              <DropdownMenuItem
                className="hover:bg-[rgba(0,201,201,0.1)] cursor-pointer flex items-center"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-[rgba(0,201,201,0.1)] cursor-pointer flex items-center text-red-400"
                onClick={disconnectWallet}
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {walletInfo.address && (
        <div className="mt-1 flex items-center">
          <p className="text-xs text-[#8892B0] truncate mr-1 flex-1">{walletInfo.address}</p>
          <CopyButton
            text={walletInfo.address}
            size="sm"
            variant="ghost"
            className="h-6 text-xs text-[#8892B0] hover:text-[#E6F1FF]"
            tooltipText="Copy address"
          />
        </div>
      )}

      {showDetails && walletInfo.assets && walletInfo.assets.length > 0 && (
        <Card className="mt-3 bg-[rgba(0,201,201,0.05)] border-[rgba(0,201,201,0.2)]">
          <CardContent className="p-3">
            <h4 className="text-xs font-medium text-[#00C9C9] mb-2">Assets</h4>
            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
              {walletInfo.assets.map((asset) => (
                <div key={asset.id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[rgba(0,201,201,0.1)] flex items-center justify-center mr-2">
                      <span className="text-xs text-[#00C9C9]">{asset.name.substring(0, 1)}</span>
                    </div>
                    <span className="text-xs text-[#E6F1FF]">{asset.name}</span>
                  </div>
                  <span className="text-xs text-[#8892B0]">{formatAssetAmount(asset.amount, asset.decimals)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
