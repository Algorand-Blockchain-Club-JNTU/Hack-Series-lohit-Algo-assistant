"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Info, Database, Wallet, FileCode, Coins, BookOpen, Code } from "lucide-react"
import { AMCPContextType } from "@/lib/amcp-client"

interface AMCPContextDisplayProps {
  contexts: any[]
  isVisible: boolean
  onToggleVisibility: () => void
}

export default function AMCPContextDisplay({ contexts, isVisible, onToggleVisibility }: AMCPContextDisplayProps) {
  const [expandedContext, setExpandedContext] = useState<string | null>(null)

  if (!contexts || contexts.length === 0) {
    return null
  }

  const getContextIcon = (type: string) => {
    switch (type) {
      case AMCPContextType.BLOCKCHAIN_STATE:
        return <Database className="h-4 w-4" />
      case AMCPContextType.ACCOUNT_INFO:
        return <Wallet className="h-4 w-4" />
      case AMCPContextType.SMART_CONTRACT:
        return <FileCode className="h-4 w-4" />
      case AMCPContextType.SMART_CONTRACT_TEMPLATE:
        return <Code className="h-4 w-4" />
      case AMCPContextType.ASA_INFO:
        return <Coins className="h-4 w-4" />
      case AMCPContextType.DEVELOPER_DOCS:
        return <BookOpen className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getContextTitle = (type: string) => {
    switch (type) {
      case AMCPContextType.BLOCKCHAIN_STATE:
        return "Blockchain State"
      case AMCPContextType.ACCOUNT_INFO:
        return "Account Information"
      case AMCPContextType.SMART_CONTRACT:
        return "Smart Contract Context"
      case AMCPContextType.SMART_CONTRACT_TEMPLATE:
        return "Smart Contract Template"
      case AMCPContextType.ASA_INFO:
        return "Asset Information"
      case AMCPContextType.DEVELOPER_DOCS:
        return "Developer Documentation"
      case AMCPContextType.TRANSACTION_HISTORY:
        return "Transaction History"
      default:
        return "Context Information"
    }
  }

  const renderContextContent = (context: any) => {
    switch (context.type) {
      case AMCPContextType.BLOCKCHAIN_STATE:
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[#8892B0]">Current Round:</span>
              <span className="text-[#E6F1FF] font-mono">{context.data.currentRound.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8892B0]">Last Block:</span>
              <span className="text-[#E6F1FF] font-mono">{new Date(context.data.lastBlock).toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8892B0]">Total Transactions:</span>
              <span className="text-[#E6F1FF] font-mono">{context.data.totalTransactions.toLocaleString()}</span>
            </div>
          </div>
        )
      case AMCPContextType.ACCOUNT_INFO:
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[#8892B0]">Address:</span>
              <span className="text-[#E6F1FF] font-mono truncate max-w-[200px]">{context.data.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8892B0]">Balance:</span>
              <span className="text-[#E6F1FF] font-mono">{(context.data.balance / 1000000).toFixed(2)} ALGO</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8892B0]">Network:</span>
              <span className="text-[#E6F1FF] font-mono">{context.data.network}</span>
            </div>
          </div>
        )
      case AMCPContextType.SMART_CONTRACT:
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[#8892B0]">Latest TEAL Version:</span>
              <span className="text-[#E6F1FF] font-mono">{context.data.latestTEALVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8892B0]">PyTeal Version:</span>
              <span className="text-[#E6F1FF] font-mono">{context.data.recommendedPyTealVersion}</span>
            </div>
            <div className="mt-2">
              <span className="text-[#8892B0]">Best Practices:</span>
              <ul className="list-disc pl-5 mt-1 text-[#E6F1FF] text-sm">
                {context.data.bestPractices.slice(0, 3).map((practice: string, index: number) => (
                  <li key={index}>{practice}</li>
                ))}
              </ul>
            </div>
            {context.data.stateManagement && (
              <div className="mt-2">
                <span className="text-[#8892B0]">State Management:</span>
                <ul className="list-disc pl-5 mt-1 text-[#E6F1FF] text-sm">
                  <li>Global: {context.data.stateManagement.global.maxSize}</li>
                  <li>Local: {context.data.stateManagement.local.maxSize}</li>
                </ul>
              </div>
            )}
          </div>
        )
      case AMCPContextType.SMART_CONTRACT_TEMPLATE:
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[#8892B0]">Template:</span>
              <span className="text-[#E6F1FF] font-mono">{context.data.templateName}</span>
            </div>
            <div className="mt-1">
              <span className="text-[#8892B0]">Description:</span>
              <p className="text-[#E6F1FF] text-sm mt-1">{context.data.description}</p>
            </div>
            <div className="mt-2">
              <span className="text-[#8892B0]">Key Features:</span>
              <ul className="list-disc pl-5 mt-1 text-[#E6F1FF] text-sm">
                {context.data.keyFeatures &&
                  context.data.keyFeatures
                    .slice(0, 3)
                    .map((feature: string, index: number) => <li key={index}>{feature}</li>)}
              </ul>
            </div>
            <div className="mt-2">
              <span className="text-[#8892B0]">Best Practices:</span>
              <ul className="list-disc pl-5 mt-1 text-[#E6F1FF] text-sm">
                {context.data.bestPractices &&
                  context.data.bestPractices
                    .slice(0, 2)
                    .map((practice: string, index: number) => <li key={index}>{practice}</li>)}
              </ul>
            </div>
          </div>
        )
      case AMCPContextType.ASA_INFO:
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1 mb-2">
              {context.data.latestStandards.map((standard: string, index: number) => (
                <Badge key={index} className="bg-[rgba(0,201,201,0.1)] text-[#00C9C9] border-[rgba(0,201,201,0.3)]">
                  {standard}
                </Badge>
              ))}
            </div>
            <div className="mt-2">
              <span className="text-[#8892B0]">Best Practices:</span>
              <ul className="list-disc pl-5 mt-1 text-[#E6F1FF] text-sm">
                {context.data.bestPractices.slice(0, 2).map((practice: string, index: number) => (
                  <li key={index}>{practice}</li>
                ))}
              </ul>
            </div>
            {context.data.asaParameters && (
              <div className="mt-2">
                <span className="text-[#8892B0]">Key Parameters:</span>
                <ul className="list-disc pl-5 mt-1 text-[#E6F1FF] text-sm">
                  <li>total: {context.data.asaParameters.total}</li>
                  <li>decimals: {context.data.asaParameters.decimals}</li>
                  <li>unitName: {context.data.asaParameters.unitName}</li>
                </ul>
              </div>
            )}
          </div>
        )
      case AMCPContextType.DEVELOPER_DOCS:
        return (
          <div className="space-y-2">
            <div className="mb-2">
              <span className="text-[#8892B0]">SDKs:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {context.data.sdks.slice(0, 3).map((sdk: any, index: number) => (
                  <Badge key={index} className="bg-[rgba(0,201,201,0.1)] text-[#00C9C9] border-[rgba(0,201,201,0.3)]">
                    {sdk.name} v{sdk.version}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mb-2">
              <span className="text-[#8892B0]">Tools:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {context.data.tools.slice(0, 2).map((tool: any, index: number) => (
                  <Badge key={index} className="bg-[rgba(0,201,201,0.1)] text-[#00C9C9] border-[rgba(0,201,201,0.3)]">
                    {tool.name}
                  </Badge>
                ))}
              </div>
            </div>
            {context.data.documentation && (
              <div className="mt-2">
                <span className="text-[#8892B0]">Documentation:</span>
                <ul className="list-disc pl-5 mt-1 text-[#E6F1FF] text-sm">
                  <li>Developer Portal: {context.data.documentation.developer_portal}</li>
                  <li>PyTeal Docs: {context.data.documentation.pyteal_docs}</li>
                </ul>
              </div>
            )}
          </div>
        )
      default:
        return <div className="text-[#8892B0]">No detailed information available</div>
    }
  }

  return (
    <Collapsible open={isVisible} onOpenChange={onToggleVisibility} className="w-full">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center justify-between w-full text-[#8892B0] hover:text-[#E6F1FF] hover:bg-[rgba(0,201,201,0.05)]"
        >
          <span className="flex items-center">
            <Info className="h-4 w-4 mr-2" />
            Algorand Model Context ({contexts.length})
          </span>
          {isVisible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {contexts.map((context, index) => (
            <Card
              key={index}
              className="bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)] hover:border-[rgba(0,201,201,0.4)] transition-all"
            >
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium flex items-center text-[#00C9C9]">
                  {getContextIcon(context.type)}
                  <span className="ml-2">{getContextTitle(context.type)}</span>
                </CardTitle>
                <CardDescription className="text-xs text-[#8892B0]">
                  Source: {context.source || "Algorand Network"}
                </CardDescription>
              </CardHeader>
              <CardContent className="py-2 px-4 text-sm">{renderContextContent(context)}</CardContent>
            </Card>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
