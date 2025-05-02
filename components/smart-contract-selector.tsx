"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileCode, Vote, Coins, Gem, Lock, ArrowRightLeft } from "lucide-react"
import { CopyButton } from "@/components/ui/copy-button"
import { useState } from "react"
import { getAlgorandExample } from "@/lib/algorand-examples"

interface SmartContractSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (contractType: string) => void
}

export default function SmartContractSelector({ isOpen, onClose, onSelect }: SmartContractSelectorProps) {
  const [previewCode, setPreviewCode] = useState<{ id: string; code: string } | null>(null)

  const handleSelect = (contractType: string) => {
    onSelect(contractType)
    onClose()
  }

  const handlePreview = (contractId: string) => {
    const example = getAlgorandExample(contractId)
    if (example) {
      setPreviewCode({
        id: contractId,
        code: example.code.slice(0, 200) + "...", // Show just a preview
      })
    }
  }

  const contractTypes = [
    {
      id: "voting",
      title: "Voting Contract",
      description: "Create a decentralized voting system",
      icon: <Vote className="h-6 w-6 text-[#00C9C9]" />,
    },
    {
      id: "token",
      title: "Token (ASA)",
      description: "Create an Algorand Standard Asset",
      icon: <Coins className="h-6 w-6 text-[#00C9C9]" />,
    },
    {
      id: "nft",
      title: "NFT",
      description: "Create a non-fungible token",
      icon: <Gem className="h-6 w-6 text-[#00C9C9]" />,
    },
    {
      id: "escrow",
      title: "Escrow",
      description: "Create a secure escrow contract",
      icon: <Lock className="h-6 w-6 text-[#00C9C9]" />,
    },
    {
      id: "atomic",
      title: "Atomic Transfers",
      description: "Group transactions atomically",
      icon: <ArrowRightLeft className="h-6 w-6 text-[#00C9C9]" />,
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-[#020D19] border border-[rgba(0,201,201,0.2)] text-[#E6F1FF]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#00C9C9] flex items-center gap-2">
            <FileCode className="h-6 w-6" />
            Algorand Smart Contract Templates
          </DialogTitle>
          <DialogDescription className="text-[#8892B0]">
            Select a template to get started with Algorand smart contracts
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {contractTypes.map((contract) => (
            <Card
              key={contract.id}
              className="bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)] hover:border-[#00C9C9] transition-all cursor-pointer group"
              onClick={() => handleSelect(contract.id)}
              onMouseEnter={() => handlePreview(contract.id)}
            >
              <CardHeader>
                <CardTitle className="text-[#00C9C9] flex items-center gap-2">
                  {contract.icon}
                  {contract.title}
                </CardTitle>
                <CardDescription className="text-[#8892B0]">{contract.description}</CardDescription>
              </CardHeader>

              {previewCode && previewCode.id === contract.id && (
                <div className="px-4 pb-2">
                  <div className="bg-[rgba(2,13,25,0.7)] rounded-md p-3 relative group">
                    <div className="absolute top-2 right-2">
                      <CopyButton
                        text={getAlgorandExample(contract.id)?.code || ""}
                        size="icon"
                        className="h-6 w-6 rounded-full bg-[rgba(2,13,25,0.7)] text-[#00C9C9] opacity-0 group-hover:opacity-100 transition-opacity"
                        tooltipText="Copy full code"
                      />
                    </div>
                    <pre className="text-xs overflow-x-auto font-mono text-[#E6F1FF] max-h-20 overflow-y-auto">
                      <code>{previewCode.code}</code>
                    </pre>
                  </div>
                </div>
              )}

              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full border-[rgba(0,201,201,0.3)] text-[#00C9C9] hover:bg-[rgba(0,201,201,0.1)]"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelect(contract.id)
                  }}
                >
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
